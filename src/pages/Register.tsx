import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, AlertCircle, CheckCircle, Copy, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/shared/Navbar';
import AnimatedButton from '../components/shared/AnimatedButton';
import { mockGetBins } from '../services/mockData';
import type { Bin } from '../types';

const GOOGLE_ICON = (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', location:'', binId:'' });
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ residentId: string }|null>(null);
  const { register, loginWithGoogle, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    mockGetBins().then(setBins);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!form.binId) { setError('Please select a smart bin'); return; }
    setLoading(true);
    try { const u = await register(form); setSuccess({ residentId: u.residentId }); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setError(''); setGoogleLoading(true);
    try { await loginWithGoogle(); navigate('/dashboard'); }
    catch (err: any) { setError(err.message); }
    finally { setGoogleLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-base)] grid-bg flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 pt-20">
          <motion.div initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} transition={{ type:'spring', bounce:0.4 }}
            className="w-full max-w-md">
            <div className="glass rounded-2xl p-8 border border-eco-500/30 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-eco-500/10 to-sky-500/5 pointer-events-none" />
              <motion.div initial={{ scale:0, rotate:-20 }} animate={{ scale:1, rotate:0 }} transition={{ type:'spring', bounce:0.6, delay:0.2 }}
                className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-eco-500 to-sky-500 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                <CheckCircle size={36} className="text-white" />
              </motion.div>
              <h2 className="text-2xl font-black text-[var(--color-text-primary)] mb-2 font-[Space_Grotesk,sans-serif]">
                {t('auth.welcome_success')}
              </h2>
              <p className="text-[var(--color-text-secondary)] text-sm mb-6">{t('auth.save_resident_id')}</p>
              <div className="bg-[var(--color-bg-surface-hover)] rounded-2xl p-5 mb-6 border border-eco-500/20">
                <p className="text-[var(--color-text-secondary)] text-xs mb-2 uppercase tracking-wide font-semibold">{t('auth.your_resident_id')}</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-black text-eco-400 font-[Space_Grotesk,sans-serif] tracking-wider">{success.residentId}</span>
                  <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                    onClick={() => navigator.clipboard.writeText(success!.residentId)}
                    className="p-2 rounded-lg bg-eco-500/10 text-eco-400 hover:bg-eco-500/20 transition-colors">
                    <Copy size={14}/>
                  </motion.button>
                </div>
              </div>
              <AnimatedButton onClick={() => navigate('/dashboard')} variant="eco" iconRight={ArrowRight} className="w-full py-3">
                {t('home.go_to_dashboard')}
              </AnimatedButton>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] grid-bg flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-10">
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <motion.div whileHover={{ rotate:10, scale:1.1 }}
              className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-eco-500 to-sky-500 items-center justify-center mb-4 shadow-[0_8px_30px_rgba(34,197,94,0.4)]">
              <Leaf size={28} className="text-white" />
            </motion.div>
            <h1 className="text-2xl font-black text-[var(--color-text-primary)] font-[Space_Grotesk,sans-serif]">{t('auth.register_title')}</h1>
            <p className="text-[var(--color-text-secondary)] text-sm mt-1">{t('auth.join_community')}</p>
          </div>

          <div className="glass rounded-2xl p-6 border border-[var(--color-border-subtle)]">
            {/* Google */}
            <div className="mb-6">
              <motion.button whileHover={{ scale:1.02, y:-2 }} whileTap={{ scale:0.98 }}
                onClick={handleGoogleLogin} disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-md hover:shadow-lg disabled:opacity-60">
                {GOOGLE_ICON} {googleLoading ? t('auth.signing_up') : t('auth.signup_google')}
              </motion.button>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[var(--color-border-subtle)]" />
                <span className="text-xs text-[var(--color-text-secondary)] font-medium">{t('auth.or_register')}</span>
                <div className="flex-1 h-px bg-[var(--color-border-subtle)]" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name:'name', label:t('auth.name'), type:'text', placeholder:'Priya Sharma' },
                { name:'email', label:t('auth.email'), type:'email', placeholder:'priya@example.com' },
                { name:'location', label:t('auth.location'), type:'text', placeholder:'Koramangala, Bengaluru' },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">{field.label}</label>
                  <input name={field.name} type={field.type} value={form[field.name as keyof typeof form]}
                    onChange={handleChange} placeholder={field.placeholder} required className="input-premium" />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">{t('auth.select_bin')}</label>
                <select name="binId" value={form.binId} onChange={handleChange} required
                  className="input-premium appearance-none cursor-pointer">
                  <option value="">{t('auth.select_bin_placeholder')}</option>
                  {bins.map(bin => <option key={bin.id} value={bin.id}>{bin.name} — {bin.address}</option>)}
                </select>
              </div>

              {error && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                  className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle size={14}/> {error}
                </motion.div>
              )}

              <AnimatedButton type="submit" loading={loading} variant="eco" iconRight={ArrowRight} className="w-full py-3 text-base">
                {t('auth.register_btn')}
              </AnimatedButton>
            </form>

            <p className="text-center text-[var(--color-text-secondary)] text-sm mt-5">
              {t('auth.have_account')}{' '}
              <Link to="/login" className="text-eco-400 hover:text-eco-300 font-semibold transition-colors">{t('auth.login_btn')}</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
