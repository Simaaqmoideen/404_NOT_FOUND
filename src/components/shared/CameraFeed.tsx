import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Wifi, RefreshCw, Video, VideoOff, Smartphone, AlertCircle } from 'lucide-react';

interface CameraFeedProps {
  onCapture: (blob: Blob | null, streamUrl?: string) => void;
  isScanning?: boolean;
  disabled?: boolean;
}

export default function CameraFeed({ onCapture, isScanning = false, disabled = false }: CameraFeedProps) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const imgRef    = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode]               = useState<'webcam' | 'droidcam' | 'none'>('none');
  const [droidcamUrl, setDroidcamUrl] = useState('http://192.168.1.100:4747/mjpegfeed');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isMirrored, setIsMirrored]   = useState(false);
  const [imgError, setImgError]       = useState(false);
  const [connecting, setConnecting]   = useState(false);
  const [isAutoScan, setIsAutoScan]   = useState(false);

  // Bind the stream to the video element whenever the mode or stream changes
  useEffect(() => {
    if (mode === 'webcam' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [mode]);

  // ── Stop webcam stream ───────────────────────────────────────────────────
  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
    }
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  // ── Start native webcam ──────────────────────────────────────────────────
  const startWebcam = async () => {
    if (mode === 'webcam') { stopStream(); setMode('none'); return; }
    stopStream();
    setImgError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setMode('webcam');
      setIsMirrored(true);
    } catch (err: any) {
      alert('Camera permission denied: ' + (err.message || err));
      setMode('none');
    }
  };

  // ── Connect DroidCam (MJPEG via <img>) ───────────────────────────────────
  // Browsers render MJPEG just fine in an <img> tag.
  // The URL to use: http://IP:4747/mjpegfeed   (or /video on some versions)
  const connectDroidCam = () => {
    stopStream();
    setImgError(false);
    setConnecting(true);
    setMode('droidcam');
    setShowUrlInput(false);
    // Small delay to let state propagate before img tries to load
    setTimeout(() => setConnecting(false), 500);
  };

  // ── Capture current frame → Blob ─────────────────────────────────────────
  const captureFrame = useCallback(() => {
    if (mode === 'webcam' && videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      // Step 1: Ensure exact resolution match, cap at 640 max width for performance
      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;
      const scale = vw > 640 ? 640 / vw : 1;
      canvas.width = vw * scale;
      canvas.height = vh * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (isMirrored) { 
        ctx.translate(canvas.width, 0); 
        ctx.scale(-1, 1); 
      }
      
      // Step 2: Image preprocessing (brightness/contrast)
      ctx.filter = "contrast(1.2) brightness(1.1)";
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        onCapture(blob, undefined);
      }, 'image/jpeg', 0.92);
    } else if (mode === 'droidcam' && imgRef.current) {
      // For DroidCam, we will try to capture the img element directly to a blob
      // Note: This may fail if the stream doesn't support CORS.
      try {
        const img = imgRef.current;
        const canvas = document.createElement('canvas');
        // Step 1: Ensure exact resolution match. Fallback to standard 640x480 if stream hasn't reported natural size.
        const vw = img.naturalWidth || 640;
        const vh = img.naturalHeight || 480;
        const scale = vw > 640 ? 640 / vw : 1;
        canvas.width = vw * scale;
        canvas.height = vh * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (isMirrored) { 
          ctx.translate(canvas.width, 0); 
          ctx.scale(-1, 1); 
        }
        
        // Step 2: Image preprocessing (brightness/contrast)
        ctx.filter = "contrast(1.2) brightness(1.1)";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          if (!blob) {
            onCapture(null, droidcamUrl);
            return;
          }
          onCapture(blob, undefined); // Send blob to backend just like upload
        }, 'image/jpeg', 0.92);
      } catch (e) {
        console.warn("CORS Error capturing DroidCam frame, falling back to backend stream fetch:", e);
        onCapture(null, droidcamUrl);
      }
    }
  }, [mode, onCapture, isMirrored, droidcamUrl]);

  const hasStream = mode !== 'none';

  // ── Auto-scan interval ───────────────────────────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAutoScan && hasStream && !isScanning && !disabled && !imgError && !connecting) {
      interval = setInterval(() => {
        captureFrame();
      }, 2500); // capture every 2.5 seconds
    }
    return () => clearInterval(interval);
  }, [isAutoScan, hasStream, isScanning, disabled, imgError, connecting, captureFrame]);

  // Build the MJPEG img src without cache-busting (DroidCam's server sometimes rejects query params)
  const mjpegSrc = mode === 'droidcam' && !connecting ? droidcamUrl : undefined;

  return (
    <div className="flex flex-col gap-4">

      {/* ── Video / image viewport ── */}
      <div className="relative rounded-2xl overflow-hidden bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] aspect-video min-h-[260px] flex items-center justify-center">

        {/* Native webcam (always mounted but hidden if not in use so ref is available) */}
        <video
          ref={videoRef}
          autoPlay playsInline muted
          className={`w-full h-full object-cover ${mode === 'webcam' ? 'block' : 'hidden'}`}
          style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
        />

        {/* DroidCam MJPEG via <img> */}
        {mode === 'droidcam' && !connecting && (
          <img
            ref={imgRef}
            src={mjpegSrc}
            crossOrigin="anonymous"
            alt="DroidCam feed"
            className="w-full h-full object-cover"
            style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
            onError={() => setImgError(true)}
            onLoad={() => setImgError(false)}
          />
        )}

        {/* Idle placeholder */}
        {mode === 'none' && (
          <div className="text-center px-6 py-4">
            <motion.div animate={{ y: [0,-8,0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-5xl mb-3">📷</motion.div>
            <p className="text-[var(--color-text-secondary)] text-sm">Start your webcam or connect via DroidCam</p>
          </div>
        )}

        {/* Connecting spinner */}
        {connecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="flex flex-col items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" />
              <p className="text-sky-400 text-sm font-medium">Connecting...</p>
            </div>
          </div>
        )}

        {/* DroidCam error */}
        {mode === 'droidcam' && imgError && !connecting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 px-4 text-center">
            <AlertCircle size={28} className="text-red-400" />
            <p className="text-red-400 font-semibold text-sm">Cannot reach DroidCam stream</p>
            <ul className="text-[var(--color-text-secondary)] text-xs space-y-1 text-left max-w-xs mt-2">
              <li>• Did you replace <code className="text-red-400">192.168.1.100</code> with YOUR phone's IP?</li>
              <li>• Phone &amp; laptop on same Wi-Fi?</li>
              <li>• Try URL: <code className="text-sky-400">http://[phone-ip]:4747/video</code></li>
            </ul>
            <button onClick={() => { setImgError(false); setMode('none'); }}
              className="text-xs text-sky-400 underline mt-1">Dismiss &amp; try again</button>
          </div>
        )}

        {/* Scanning overlay */}
        <AnimatePresence>
          {isScanning && hasStream && (
            <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
              <div className="absolute inset-0 bg-black/20" />
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-eco-400 to-transparent"
                style={{ boxShadow: '0 0 12px rgba(34,197,94,0.8)' }}
                animate={{ top: ['5%','95%','5%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              />
              {['top-3 left-3 border-t-2 border-l-2','top-3 right-3 border-t-2 border-r-2',
                'bottom-3 left-3 border-b-2 border-l-2','bottom-3 right-3 border-b-2 border-r-2',
              ].map((cls, i) => <div key={i} className={`absolute w-6 h-6 border-eco-400 ${cls}`} />)}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-eco-500/30">
                  <span className="w-2 h-2 rounded-full bg-eco-400 animate-pulse" />
                  <span className="text-eco-300 text-xs font-medium">AI Analyzing...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-wrap gap-2">
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          onClick={startWebcam} disabled={disabled}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
            mode === 'webcam'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-eco-500/20 text-eco-400 border border-eco-500/30 hover:bg-eco-500/30'
          }`}>
          {mode === 'webcam' ? <VideoOff size={15} /> : <Video size={15} />}
          {mode === 'webcam' ? 'Stop Webcam' : 'Use Webcam'}
        </motion.button>

        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          onClick={() => setShowUrlInput(v => !v)} disabled={disabled}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
            mode === 'droidcam' && !imgError
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]'
          }`}>
          <Smartphone size={15} />
          {mode === 'droidcam' && !imgError ? 'DroidCam ✓' : 'DroidCam'}
        </motion.button>

        {hasStream && (
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            onClick={() => setIsMirrored(m => !m)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] transition-all">
            <RefreshCw size={14} /> {isMirrored ? 'Mirrored' : 'Normal'}
          </motion.button>
        )}

        {hasStream && (
          <div className="flex items-center gap-2 ml-auto">
            <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mr-2 cursor-pointer">
              <input type="checkbox" checked={isAutoScan} onChange={e => setIsAutoScan(e.target.checked)} className="rounded border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] text-eco-500 focus:ring-eco-500" />
              Auto-Scan
            </label>
            <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              onClick={captureFrame} disabled={disabled || isScanning || isAutoScan}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-eco-500 to-sky-500 text-white shadow-lg hover:shadow-eco-500/30 transition-all disabled:opacity-50">
              <Camera size={15} /> {isScanning ? 'Scanning...' : 'Capture & Scan'}
            </motion.button>
          </div>
        )}
      </div>

      {/* ── DroidCam URL input ── */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className="overflow-hidden">
            <div className="p-4 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-subtle)] space-y-3">
              <div className="flex items-start gap-2">
                <Wifi size={15} className="text-sky-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-0.5">DroidCam Stream URL</p>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">
                    Open DroidCam app on your phone → note the WiFi IP → paste below
                  </p>
                </div>
              </div>

              {/* URL presets */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '/mjpegfeed', suffix: '/mjpegfeed' },
                  { label: '/video',     suffix: '/video' },
                ].map(p => (
                  <button key={p.label} onClick={() => {
                    const base = droidcamUrl.replace(/\/(mjpegfeed|video).*$/, '');
                    setDroidcamUrl(base + p.suffix);
                  }}
                    className="px-2 py-1 text-[10px] rounded-md border border-[var(--color-border-subtle)] text-sky-400 hover:bg-sky-500/10 transition-colors font-mono">
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={droidcamUrl}
                  onChange={e => setDroidcamUrl(e.target.value)}
                  placeholder="http://192.168.x.x:4747/mjpegfeed"
                  className="flex-1 bg-[var(--color-bg-surface-hover)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-slate-500 focus:border-sky-500/50 outline-none font-mono"
                />
                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  onClick={connectDroidCam}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap">
                  Connect
                </motion.button>
              </div>

              {/* Step-by-step instructions */}
              <div className="bg-[var(--color-bg-surface-hover)] rounded-lg p-3 space-y-1">
                <p className="text-[11px] font-semibold text-[var(--color-text-primary)] mb-1.5">📱 Setup Steps:</p>
                {[
                  '1. Install DroidCam app on your Android/iOS phone',
                  '2. Connect phone & laptop to the SAME Wi-Fi network',
                  '3. Open DroidCam → note the WiFi IP (e.g. 192.168.1.105)',
                  '4. Replace the IP above and click Connect',
                  '5. Try /mjpegfeed first, then /video if it fails',
                ].map((step, i) => (
                  <p key={i} className="text-[11px] text-[var(--color-text-secondary)]">{step}</p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
