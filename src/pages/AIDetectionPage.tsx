import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Zap, Camera, CheckCircle, AlertTriangle, RefreshCw, Cpu, Trash2, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import Navbar from '../components/shared/Navbar';
import CameraFeed from '../components/shared/CameraFeed';
import ProgressBar from '../components/shared/ProgressBar';
import { detectFromImage, detectFromStream, setStreamUrl, extractTopDetection, checkHealth } from '../services/api';
import { classifyWaste, loadAIModel, getWasteColor, getWasteLabel } from '../services/aiModel';
import { mockDepositWaste } from '../services/mockData';
import type { HybridClassificationResult } from '../types';

const LANG_MAP: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN', ml: 'ml-IN', mr: 'mr-IN', bn: 'bn-IN' };

const BIN_MAP: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  plastic: { label: 'dry_bin',       icon: '🔵', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  organic: { label: 'wet_bin',       icon: '🟢', color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  metal:   { label: 'recyclable_bin',icon: '🟡', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  paper:   { label: 'paper_bin',     icon: '🟣', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
};

const POINTS_MAP: Record<string, number> = { plastic: 15, organic: 10, metal: 20, paper: 8 };

// ── Confetti component ───────────────────────────────────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#22c55e','#3b82f6','#f59e0b','#a855f7','#ec4899','#14b8a6'][i % 6],
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1,
    size: 6 + Math.random() * 8,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ left: `${p.x}%`, top: '-10px', width: p.size, height: p.size, backgroundColor: p.color }}
          animate={{ y: ['0vh','110vh'], rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)], opacity: [1,1,0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

// ── Smart bin fill visualization ─────────────────────────────────────────────
function BinVisual({ type, fillLevel, animating, t }: { type: string; fillLevel: number; animating: boolean; t: any }) {
  const info = BIN_MAP[type];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative w-16 h-24 rounded-b-xl border-2 overflow-hidden flex flex-col justify-end"
           style={{ borderColor: info.color, backgroundColor: 'rgba(0,0,0,0.3)' }}>
        <motion.div
          className="w-full rounded-b-lg"
          style={{ backgroundColor: info.color + '80' }}
          initial={{ height: '0%' }}
          animate={{ height: `${fillLevel}%` }}
          transition={{ duration: animating ? 1.2 : 0.5, ease: 'easeOut' }}
        />
        {animating && (
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{ background: `radial-gradient(circle, ${info.color}, transparent)` }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
        )}
      </div>
      <span className="text-xs font-bold" style={{ color: info.color }}>{t('detection.' + info.label)}</span>
      <span className="text-xs text-[var(--color-text-secondary)]">{fillLevel}%</span>
    </motion.div>
  );
}

// ── Demo items ───────────────────────────────────────────────────────────────
const DEMO_ITEMS = [
  { label: 'Water Bottle',  emoji: '🍶', type: 'plastic', confidence: 91 },
  { label: 'Food Scraps',   emoji: '🥑', type: 'organic', confidence: 88 },
  { label: 'Aluminium Can', emoji: '🥫', type: 'metal',   confidence: 94 },
  { label: 'Newspaper',     emoji: '📰', type: 'paper',   confidence: 85 },
];

// ── Main page ────────────────────────────────────────────────────────────────
type Step = 'idle' | 'scanning' | 'result' | 'depositing' | 'done';

export default function AIDetectionPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const { bins, refreshLeaderboard } = useData();

  const [step, setStep]     = useState<Step>('idle');
  const [result, setResult] = useState<HybridClassificationResult | null>(null);
  const [earnedPts, setEarnedPts] = useState(0);
  const [newPoints, setNewPoints] = useState(user?.points || 0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [modelStatus, setModelStatus] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Correction Flow States
  const [needsCorrection, setNeedsCorrection] = useState(false);
  const [smartPrompt, setSmartPrompt] = useState<'bottle' | 'cup' | null>(null);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  // Voice Assistant State
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const speak = useCallback((textKey: string, params?: Record<string, any>, fallbackText?: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    let text = t(textKey);
    if (text === textKey && fallbackText) text = fallbackText;
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.split(`{${k}}`).join(String(v));
      });
    }

    // Wrap in setTimeout to bypass a notorious Chromium bug where cancel() kills the next utterance
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = LANG_MAP[lang] || 'en-IN';
      utterance.lang = targetLang;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Attempt to pick a matching voice if available
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith(targetLang) || v.lang.startsWith(lang));
      if (voice) {
        utterance.voice = voice;
      }

      window.speechSynthesis.speak(utterance);
    }, 50);
  }, [voiceEnabled, lang, t]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const userBin = bins.find(b => b.id === user?.binId);

  // Check backend health on mount + load AI fallback model
  useEffect(() => {
    checkHealth().then(h => setBackendOnline(h?.status === 'ok'));
    loadAIModel(msg => setModelStatus(msg));

    // Voice Greeting
    const tId = setTimeout(() => {
      speak('detection.voice_greeting', { name: user?.name?.split(' ')[0] || 'User' }, `Hi ${user?.name?.split(' ')[0] || 'User'}. Please place your waste item for scanning.`);
    }, 800);
    return () => clearTimeout(tId);
  }, [speak, user?.name]);

  // ── Demo scan (no camera needed) ─────────────────────────────────────────
  const runDemoScan = useCallback(async (item: typeof DEMO_ITEMS[0]) => {
    setStep('scanning');
    speak('detection.voice_scanning', undefined, "Scanning in progress. Please hold the item steady.");
    setError(null);
    setResult(null);
    await new Promise(r => setTimeout(r, 1200)); // simulate AI delay
    const dist: Record<string,number> = { plastic: 0, organic: 0, metal: 0, paper: 0 };
    dist[item.type] = item.confidence;
    const remaining = 100 - item.confidence;
    const others = Object.keys(dist).filter(k => k !== item.type);
    others.forEach((k, i) => { dist[k] = i === others.length - 1 ? parseFloat((remaining / 3).toFixed(1)) : parseFloat((remaining / 3).toFixed(1)); });
    setResult({
      rawLabel: item.label,
      mappedCategory: item.type as any,
      confidence: item.confidence,
      distribution: dist as any,
      source: 'demo mock',
    });
    setStep('result');
  }, []);

  // ── Core detection logic ──────────────────────────────────────────────────
  const runDetection = useCallback(async (blob: Blob | null, streamUrl?: string) => {
    setStep('scanning');
    speak('detection.voice_scanning', undefined, "Scanning in progress. Please hold the item steady.");
    setError(null);
    setResult(null);
    setUploadPreview(null); // CRITICAL: Clear upload preview so old images don't linger
    
    if (blob) {
      if (capturedImage) URL.revokeObjectURL(capturedImage);
      setCapturedImage(URL.createObjectURL(blob));
    } else {
      setCapturedImage(null);
    }

    let classification: HybridClassificationResult;

    // If using DroidCam, tell backend to fetch frame directly
    let resp;
    if (streamUrl) {
      console.log("Sending stream URL to API...");
      await setStreamUrl(streamUrl);
      resp = await detectFromStream();
      console.log("Response:", resp);
    } else if (blob) {
      console.log("Captured blob:", blob);
      console.log("Sending to API...");
      resp = await detectFromImage(blob);
      console.log("Response:", resp);
    } else {
      setError('No image source provided.');
      setStep('idle');
      return;
    }

    const top = extractTopDetection(resp);
    if (!top) {
      if (blob) {
        try {
          const imgUrl = URL.createObjectURL(blob);
          const img = new Image();
          img.src = imgUrl;
          await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
          classification = await classifyWaste(img, false);
          URL.revokeObjectURL(imgUrl);
        } catch (err) {
          setError('Backend error or no data returned.');
          setStep('idle');
          return;
        }
      } else {
        setError('Backend error or no data returned.');
        setStep('idle');
        return;
      }
    } else {
      classification = {
        rawLabel: top.rawLabel,
        mappedCategory: top.wasteType as any,
        confidence: top.confidence,
        distribution: { plastic: 0, organic: 0, metal: 0, paper: 0, [top.wasteType]: top.confidence } as any,
        source: streamUrl ? 'ai + mapping (stream)' : 'ai + mapping',
      };
    }

    setResult(classification);
    
    // Check for required corrections
    setNeedsCorrection(classification.confidence < 50);
    setShowCategorySelector(false);

    setStep('result');
  }, [isDemoMode, capturedImage]);

  // Smart Prompts & Voice Announcement for ambiguous items
  useEffect(() => {
    if (result && result.source !== 'user corrected') {
      const isLowConfidence = result.confidence < 50;
      const label = result.rawLabel.toLowerCase();
      
      if (isLowConfidence) {
        speak('detection.voice_low_confidence', undefined, "I am not fully sure. Please confirm the waste category.");
      } else {
        const catLabel = t(`detection.${BIN_MAP[result.mappedCategory === 'unknown' ? 'plastic' : result.mappedCategory]?.label}`) || result.mappedCategory;
        speak('detection.voice_result', { category: catLabel, confidence: Math.round(result.confidence) }, `This appears to be ${catLabel} waste with ${Math.round(result.confidence)} percent confidence. Please dispose it in the correct bin.`);
      }

      if (isLowConfidence && label.includes('bottle')) {
        setSmartPrompt('bottle');
        setNeedsCorrection(true);
      } else if (isLowConfidence && label.includes('cup')) {
        setSmartPrompt('cup');
        setNeedsCorrection(true);
      } else {
        setSmartPrompt(null);
        setNeedsCorrection(isLowConfidence);
      }
    }
  }, [result, speak, t]);

  // ── File upload handler ────────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setUploadPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    runDetection(file);
  };

  // ── Deposit waste ─────────────────────────────────────────────────────────
  const handleDeposit = async () => {
    if (!result) return;
    const cat = result.mappedCategory === 'unknown' ? 'plastic' : result.mappedCategory;
    setStep('depositing');
    
    try {
      // If user has a bin, run the actual deposit logic. 
      // Otherwise (Admin mode), just simulate a successful API call for the demo.
      if (user && user.binId && bins.find(b => b.id === user.binId)) {
        await mockDepositWaste(user.id, user.binId, cat, result.confidence);
        refreshLeaderboard();
      } else {
        await new Promise(r => setTimeout(r, 600)); // Simulate network delay
      }
      
      setStep('done');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    } catch {
      setError('Deposit failed. Try again.');
      setStep('result');
    }
  };

  const reset = () => {
    setStep('idle');
    setResult(null);
    setError(null);
    setUploadPreview(null);
    setCapturedImage(null);
    setNeedsCorrection(false);
    setSmartPrompt(null);
    setShowCategorySelector(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const overrideCategory = (cat: 'plastic' | 'organic' | 'metal' | 'paper') => {
    if (!result) return;
    setResult({
      ...result,
      mappedCategory: cat,
      confidence: 100, // Explicit user override
      source: 'user corrected'
    });
    setNeedsCorrection(false);
    setSmartPrompt(null);
    setShowCategorySelector(false);
  };

  const binInfo = result?.mappedCategory && result.mappedCategory !== 'unknown'
    ? BIN_MAP[result.mappedCategory]
    : null;

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] grid-bg">
      <Navbar />
      {showConfetti && <Confetti />}

      <div className="max-w-6xl mx-auto px-4 pt-20 pb-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-[var(--color-text-primary)] font-[Space_Grotesk,sans-serif]">
                🤖 {t('detection.title')} <span className="text-gradient-eco">{t('detection.title_highlight')}</span>
              </h1>
              <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                {t('detection.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {/* Backend status badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${
                backendOnline === null ? 'border-slate-600 text-slate-400' :
                backendOnline ? 'border-eco-500/40 bg-eco-500/10 text-eco-400' :
                'border-amber-500/40 bg-amber-500/10 text-amber-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  backendOnline === null ? 'bg-slate-400' :
                  backendOnline ? 'bg-eco-400 animate-pulse' : 'bg-amber-400'
                }`} />
                {backendOnline === null ? t('detection.checking') : backendOnline ? t('detection.yolov8_online') : t('detection.ai_fallback')}
              </div>
              {/* Voice toggle */}
              <button
                onClick={() => {
                  if (voiceEnabled) window.speechSynthesis.cancel();
                  setVoiceEnabled(v => !v);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  voiceEnabled
                    ? 'border-sky-500/40 bg-sky-500/10 text-sky-400'
                    : 'border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]'
                }`}
                title="Voice Assistant"
              >
                {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span>{voiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
              </button>
              {/* Demo toggle */}
              <button
                onClick={() => setIsDemoMode(d => !d)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  isDemoMode
                    ? 'border-purple-500/40 bg-purple-500/10 text-purple-400'
                    : 'border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]'
                }`}
              >
                {isDemoMode ? t('detection.demo_on') : t('detection.demo_mode')}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── LEFT: Camera + Upload ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Camera feed */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-5 border border-[var(--color-border-subtle)]">
              <h2 className="font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2 font-[Space_Grotesk,sans-serif]">
                <Camera size={16} className="text-eco-400" /> {t('detection.live_camera')}
              </h2>
              <CameraFeed
                onCapture={runDetection}
                isScanning={step === 'scanning'}
                disabled={step === 'scanning' || step === 'depositing'}
              />
            </motion.div>

            {/* Upload image */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-5 border border-[var(--color-border-subtle)]">
              <h2 className="font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2 font-[Space_Grotesk,sans-serif]">
                <Upload size={16} className="text-sky-400" /> {t('detection.upload_image')}
              </h2>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="waste-upload" />
              <label htmlFor="waste-upload"
                className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-[var(--color-border-subtle)] hover:border-eco-500/50 hover:bg-eco-500/5 transition-all cursor-pointer group">
                {uploadPreview
                  ? <img src={uploadPreview} alt="preview" className="max-h-32 rounded-lg object-contain" />
                  : <>
                      <motion.div animate={{ y: [0,-6,0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-4xl">📁</motion.div>
                      <p className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                        {t('detection.click_upload')}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{t('detection.formats')}</p>
                    </>
                }
              </label>
            </motion.div>
          </div>

          {/* ── RIGHT: Result + Bin Simulation ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* AI Result card */}
            <AnimatePresence mode="wait">
              {step === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="glass rounded-2xl p-5 border border-[var(--color-border-subtle)] space-y-4">
                  <div className="flex flex-col items-center text-center pt-2">
                    <motion.div animate={{ rotate: [0,10,-10,0] }} transition={{ repeat: Infinity, duration: 4 }} className="text-4xl mb-2">🗑️</motion.div>
                    <p className="text-[var(--color-text-secondary)] text-sm">{t('detection.scan_prompt')}</p>
                    {modelStatus && <p className="text-xs text-eco-400 mt-1">{modelStatus}</p>}
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                      <p className="text-red-400 text-xs font-semibold">{error}</p>
                    </div>
                  )}

                  {/* Quick demo buttons */}
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider mb-2">{t('detection.no_camera')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {DEMO_ITEMS.map(item => (
                        <motion.button
                          key={item.type}
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                          onClick={() => runDemoScan(item)}
                          className="flex items-center gap-2 p-2.5 rounded-xl border border-[var(--color-border-subtle)] hover:border-eco-500/40 hover:bg-eco-500/5 transition-all text-left"
                        >
                          <span className="text-2xl">{item.emoji}</span>
                          <div>
                            <p className="text-xs font-bold text-[var(--color-text-primary)]">{item.label}</p>
                            <p className="text-[10px] text-[var(--color-text-secondary)] capitalize">{item.type}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'scanning' && (
                <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="glass rounded-2xl p-6 border border-eco-500/30 flex flex-col items-center justify-center text-center min-h-[200px] relative overflow-hidden">
                  
                  {/* Flash effect on capture */}
                  <motion.div className="absolute inset-0 bg-white z-10 pointer-events-none"
                    initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} />
                    
                  <motion.div className="text-5xl mb-4" animate={{ scale: [1,1.2,1] }} transition={{ repeat: Infinity, duration: 0.8 }}>🔍</motion.div>
                  <p className="text-eco-400 font-semibold mb-2">{t('detection.analyzing')}</p>
                  <div className="w-32 h-1 bg-[var(--color-bg-surface)] rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-eco-500 to-sky-500"
                      animate={{ x: ['-100%','100%'] }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} />
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-3">
                    {backendOnline ? t('detection.yolov8_detecting') : t('detection.mobilenet_classifying')}
                  </p>
                </motion.div>
              )}

              {(step === 'result' || step === 'depositing') && result && (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="glass rounded-2xl p-6 border border-[var(--color-border-subtle)] space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu size={15} className="text-eco-400" />
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">{t('detection.detection_result')}</span>
                    <span className="ml-auto text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)] px-2 py-0.5 rounded-full">{result.source}</span>
                  </div>

                  {/* Main result */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* Image Preview */}
                    {(capturedImage || uploadPreview) && (
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-[var(--color-border-subtle)] flex-shrink-0 bg-black/20">
                        <img src={capturedImage || uploadPreview || ''} alt="Analyzed waste" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 border-[3px] rounded-xl pointer-events-none" style={{ borderColor: binInfo?.color || '#cbd5e1', opacity: 0.6 }} />
                      </div>
                    )}
                    
                    {binInfo ? (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl p-4 text-center flex-1 w-full"
                        style={{ background: binInfo.bg, border: `1px solid ${binInfo.color}40` }}>
                        <div className="text-4xl mb-1">{binInfo.icon}</div>
                        <p className="text-xl font-black capitalize font-[Space_Grotesk,sans-serif]" style={{ color: binInfo.color }}>
                          {result.mappedCategory}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)]">{t('detection.' + binInfo.label)}</p>
                        <div className="flex items-center justify-center gap-1 mt-2 text-xs">
                          <span className="text-[var(--color-text-secondary)]">{t('detection.confidence')}</span>
                          <span className="font-bold" style={{ color: result.confidence >= 75 ? '#10b981' : result.confidence >= 50 ? '#f59e0b' : '#ef4444' }}>
                            {result.confidence.toFixed(1)}%
                          </span>
                        </div>
                        <div className="mt-2 text-xs font-medium">
                          {result.confidence >= 75 ? (
                            <span className="text-emerald-400">{t('detection.detected')} <span className="capitalize">{result.mappedCategory}</span> ({t('detection.high_confidence')})</span>
                          ) : result.confidence >= 50 ? (
                            <span className="text-amber-400">{t('detection.likely')} <span className="capitalize">{result.mappedCategory}</span> ({t('detection.medium_confidence')})</span>
                          ) : (
                            <span className="text-red-400">{t('detection.probably')} <span className="capitalize">{result.mappedCategory}</span> ({t('detection.low_confidence')}) {t('detection.please_confirm')}</span>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl p-4 text-center flex-1 w-full bg-slate-500/10 border border-slate-500/30">
                        <div className="text-4xl mb-1">❓</div>
                        <p className="text-xl font-black capitalize font-[Space_Grotesk,sans-serif] text-slate-300">
                          {t('detection.unrecognized')}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)]">{t('detection.manual_sort')}</p>
                        <div className="flex items-center justify-center gap-1 mt-2 text-xs">
                          <span className="text-[var(--color-text-secondary)]">{t('detection.confidence')}</span>
                          <span className="font-bold text-slate-400">0%</span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Distribution */}
                  <div className="space-y-2">
                    {(Object.entries(result.distribution) as [string,number][])
                      .sort(([,a],[,b]) => b - a)
                      .map(([type, pct]) => (
                        <div key={type}>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs capitalize text-[var(--color-text-secondary)]">{getWasteLabel(type)}</span>
                            <span className="text-xs font-bold" style={{ color: getWasteColor(type) }}>{pct.toFixed(1)}%</span>
                          </div>
                          <ProgressBar value={pct} gradientFrom={getWasteColor(type)} gradientTo={getWasteColor(type)} height={5} />
                        </div>
                    ))}
                  </div>

                  {/* UI Step 9: Gamification points removed for admin page */}

                  {error && <p className="text-red-400 text-xs">{error}</p>}

                  {/* Correction / Action Area */}
                  <div className="bg-[var(--color-bg-surface-hover)] p-4 rounded-xl border border-[var(--color-border-subtle)]">
                    
                    {/* Smart Prompt: Bottle */}
                    {smartPrompt === 'bottle' && needsCorrection && !showCategorySelector && (
                      <div className="text-center space-y-3">
                        <p className="text-sm font-semibold text-amber-400">{t('detection.bottle_prompt')}</p>
                        <div className="flex gap-2">
                          <button onClick={() => overrideCategory('plastic')} className="flex-1 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-bold">Plastic</button>
                          <button onClick={() => overrideCategory('metal')} className="flex-1 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-all text-sm font-bold">Metal</button>
                        </div>
                      </div>
                    )}

                    {/* Smart Prompt: Cup */}
                    {smartPrompt === 'cup' && needsCorrection && !showCategorySelector && (
                      <div className="text-center space-y-3">
                        <p className="text-sm font-semibold text-amber-400">{t('detection.cup_prompt')}</p>
                        <div className="flex gap-2">
                          <button onClick={() => overrideCategory('plastic')} className="flex-1 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-bold">Plastic</button>
                          <button onClick={() => overrideCategory('paper')} className="flex-1 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-all text-sm font-bold">Paper</button>
                        </div>
                      </div>
                    )}

                    {/* Low Confidence Prompt */}
                    {!smartPrompt && needsCorrection && !showCategorySelector && (
                      <div className="text-center space-y-3">
                        <p className="text-sm font-semibold text-amber-400">
                          {t('detection.low_conf_prompt')}
                        </p>
                        {result.mappedCategory !== 'unknown' && (
                          <p className="text-xs text-slate-400">{t('detection.hint_steady')}</p>
                        )}
                        <div className="flex gap-2">
                          <button onClick={() => setNeedsCorrection(false)} className="flex-1 py-2 bg-eco-500/20 text-eco-400 border border-eco-500/30 rounded-lg hover:bg-eco-500/30 transition-all text-sm font-bold flex items-center justify-center gap-1"><CheckCircle size={14}/> {t('detection.confirm')}</button>
                          <button onClick={() => setShowCategorySelector(true)} className="flex-1 py-2 bg-slate-500/20 text-slate-300 border border-slate-500/30 rounded-lg hover:bg-slate-500/30 transition-all text-sm font-bold flex items-center justify-center gap-1"><RefreshCw size={14}/> {t('detection.change_category')}</button>
                        </div>
                      </div>
                    )}

                    {/* Manual Category Selector */}
                    {showCategorySelector && (
                      <div className="text-center space-y-3">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{t('detection.select_category')}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {(['plastic','organic','metal','paper'] as const).map(cat => (
                            <button key={cat} onClick={() => overrideCategory(cat)} className="py-2 px-3 border border-[var(--color-border-subtle)] rounded-lg hover:bg-[var(--color-bg-surface)] transition-all flex items-center justify-center gap-2 text-sm font-bold capitalize">
                              <span style={{color: BIN_MAP[cat].color}}>{BIN_MAP[cat].icon}</span> {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Standard Deposit Actions (Only shown if no correction needed) */}
                    {!needsCorrection && !showCategorySelector && (
                      <div className="flex gap-2">
                        <button onClick={reset}
                          className="flex items-center gap-1.5 px-3 py-2.5 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] rounded-xl text-sm hover:bg-white/5 transition-all">
                          <RefreshCw size={13} /> {t('detection.rescan')}
                        </button>
                        {!user ? (
                          <button disabled className="flex-1 py-2.5 bg-slate-600/50 text-slate-400 rounded-xl text-sm cursor-not-allowed">{t('detection.login_to_deposit')}</button>
                        ) : (
                          <button onClick={handleDeposit} disabled={step === 'depositing'}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-eco-500 to-sky-500 text-white font-bold rounded-xl text-sm shadow-lg hover:brightness-110 transition-all disabled:opacity-60">
                            <Trash2 size={14} />
                            {step === 'depositing' ? t('detection.depositing') : t('detection.confirm_deposit')}
                          </button>
                        )}
                        <button onClick={() => setShowCategorySelector(true)} className="px-3 py-2.5 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] rounded-xl text-sm hover:bg-white/5 transition-all" title="Wrong Category?">
                           {t('detection.fix')}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 'done' && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="glass rounded-2xl p-6 border border-eco-500/40 flex flex-col items-center text-center space-y-4">
                  <motion.div animate={{ rotate: [0,15,-15,0], scale: [1,1.3,1] }} transition={{ duration: 0.6 }} className="text-5xl">🎉</motion.div>
                  <h3 className="text-xl font-black text-[var(--color-text-primary)] font-[Space_Grotesk,sans-serif]">{t('detection.waste_deposited')}</h3>
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6, delay: 0.2 }}
                    className="flex items-center gap-2 px-6 py-3 bg-eco-500/20 border border-eco-500/40 rounded-2xl">
                    <Zap size={20} className="text-eco-400" />
                    <span className="text-2xl font-black text-eco-400">+{earnedPts} pts</span>
                  </motion.div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {t('detection.total_points')} <span className="font-bold text-[var(--color-text-primary)]">{newPoints.toLocaleString()}</span>
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{t('detection.thank_you_recycling')}</p>
                  <button onClick={reset}
                    className="w-full py-2.5 bg-eco-500 hover:bg-eco-400 text-white font-bold rounded-xl text-sm transition-colors">
                    {t('detection.scan_another')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Smart Bin Simulation */}
            {userBin && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-5 border border-[var(--color-border-subtle)]">
                <h2 className="font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2 font-[Space_Grotesk,sans-serif] text-sm">
                  <Trash2 size={14} className="text-amber-400" /> {t('detection.smart_bin_label')} {userBin.name}
                </h2>
                <div className="flex justify-around items-end gap-3">
                  {(['plastic','organic','metal','paper'] as const).map(type => {
                    const level = userBin[`${type}Level` as keyof typeof userBin] as number;
                    const isActive = result?.mappedCategory === type && step === 'done';
                    return <BinVisual key={type} type={type} fillLevel={level} animating={isActive} t={t} />;
                  })}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    userBin.status === 'full' ? 'bg-red-400' :
                    userBin.status === 'medium' ? 'bg-amber-400' : 'bg-eco-400'
                  }`} />
                  <span className="text-xs text-[var(--color-text-secondary)] capitalize">
                    {t('detection.status')} <span className="font-medium text-[var(--color-text-primary)]">{t('common.' + userBin.status)}</span>
                  </span>
                  {userBin.status === 'full' && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-red-400 font-medium">
                      <AlertTriangle size={11} /> {t('detection.collection_needed')}
                    </span>
                  )}
                  {userBin.status !== 'full' && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-eco-400">
                      <CheckCircle size={11} /> {t('detection.operational')}
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Not logged in notice */}
            {!user && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass rounded-2xl p-5 border border-amber-500/30 bg-amber-500/5 text-center">
                <p className="text-amber-400 text-sm font-medium">{t('detection.login_deposit_notice')}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
