import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, User, ShieldCheck, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/shared/Navbar';
import AnimatedButton from '../components/shared/AnimatedButton';

const GOOGLE_ICON = (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Login() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<'resident'|'admin'>(searchParams.get('tab') === 'admin' ? 'admin' : 'resident');
  const [residentId, setResidentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle, adminLogin, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate(user.role === 'admin' ? '/admin' : '/dashboard'); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (tab === 'resident') { await login(residentId); navigate('/dashboard'); }
      else { await adminLogin(email, password); navigate('/admin'); }
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setError(''); setGoogleLoading(true);
    try { await loginWithGoogle(); navigate('/dashboard'); }
    catch (err: any) { setError(err.message); }
    finally { setGoogleLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] grid-bg flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-10">
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div whileHover={{ rotate:10, scale:1.1 }}
              className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-eco-500 to-sky-500 items-center justify-center mb-4 shadow-[0_8px_30px_rgba(34,197,94,0.4)]">
              <Leaf size={28} className="text-white" />
            </motion.div>
            <h1 className="text-2xl font-black text-[var(--color-text-primary)] font-[Space_Grotesk,sans-serif]">{t('auth.login_title')}</h1>
            <p className="text-[var(--color-text-secondary)] text-sm mt-1">{t('auth.bbmp_initiative')}</p>
          </div>

          <div className="glass rounded-2xl p-6 border border-[var(--color-border-subtle)]">
            {/* Tabs */}
            <div className="flex bg-[var(--color-bg-surface-hover)] rounded-xl p-1 mb-6">
              {(['resident','admin'] as const).map(t_ => (
                <button key={t_} onClick={() => { setTab(t_); setError(''); }}
                  className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    tab === t_ ? 'text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}>
                  {tab === t_ && <motion.div layoutId="login-tab" className="absolute inset-0 bg-gradient-eco rounded-lg" />}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {t_ === 'resident' ? <User size={14}/> : <ShieldCheck size={14}/>}
                    {t(`auth.${t_}_tab`)}
                  </span>
                </button>
              ))}
            </div>

            {/* Google Sign-in (resident only) */}
            {tab === 'resident' && (
              <div className="mb-6">
                <motion.button whileHover={{ scale:1.02, y:-2 }} whileTap={{ scale:0.98 }}
                  onClick={handleGoogleLogin} disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-md hover:shadow-lg disabled:opacity-60">
                  {GOOGLE_ICON} {googleLoading ? t('auth.signing_in') : t('auth.continue_google')}
                </motion.button>
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-[var(--color-border-subtle)]" />
                  <span className="text-xs text-[var(--color-text-secondary)] font-medium">{t('auth.or')}</span>
                  <div className="flex-1 h-px bg-[var(--color-border-subtle)]" />
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'resident' ? (
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">{t('auth.resident_id')}</label>
                  <input type="text" value={residentId} onChange={e => setResidentId(e.target.value)} placeholder={t('auth.resident_id_placeholder')}
                    required className="input-premium font-mono tracking-widest" />
                  <p className="text-[var(--color-text-secondary)] text-xs mt-1.5 opacity-60">{t('auth.demo_hint')}</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">{t('auth.email')}</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@bbmp.gov.in"
                      required className="input-premium" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide">{t('auth.password')}</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                        required className="input-premium pr-11" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                        {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {error && (
                <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
                  className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle size={14}/> {error}
                </motion.div>
              )}

              <AnimatedButton type="submit" loading={loading} variant="eco" iconRight={ArrowRight} className="w-full py-3 text-base">
                {t('auth.login_btn')}
              </AnimatedButton>
            </form>

            <p className="text-center text-[var(--color-text-secondary)] text-sm mt-5">
              {t('auth.no_account')}{' '}
              <Link to="/register" className="text-eco-400 hover:text-eco-300 font-semibold transition-colors">{t('auth.register_btn')}</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
