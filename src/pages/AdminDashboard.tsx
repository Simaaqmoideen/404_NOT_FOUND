import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Users, Trash2, MapPin, RefreshCw, Plus, X, BarChart3, Zap, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import Navbar from '../components/shared/Navbar';
import BinCard from '../components/Dashboard/BinCard';
import AlertPanel from '../components/Dashboard/AlertPanel';
import StatWidget from '../components/shared/StatWidget';
import AnimatedButton from '../components/shared/AnimatedButton';
import { mockGetAllUsers, mockAddBin } from '../services/mockData';
import type { User, Bin } from '../types';

// Lazy load map
const BinMap = lazy(() => import('../components/MapView/BinMap'));

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { bins, alerts } = useData();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeView, setActiveView] = useState<'overview' | 'map' | 'bins' | 'alerts' | 'residents'>('overview');
  const [showAddBin, setShowAddBin] = useState(false);
  const [newBin, setNewBin] = useState({ name: '', address: '', lat: '12.9352', lng: '77.6245' });
  const [addingBin, setAddingBin] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/dashboard'); return; }
    mockGetAllUsers().then(setAllUsers);
  }, [user]);

  if (!user) return null;

  const fullBins = bins.filter(b => b.status === 'full');
  const pendingAlerts = alerts.filter(a => a.status === 'pending');

  const handleAddBin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingBin(true);
    await mockAddBin({
      name: newBin.name,
      address: newBin.address,
      location: { lat: parseFloat(newBin.lat), lng: parseFloat(newBin.lng) },
      plasticLevel: 0, organicLevel: 0, metalLevel: 0, paperLevel: 0,
    });
    setAddingBin(false);
    setShowAddBin(false);
    setNewBin({ name: '', address: '', lat: '12.9352', lng: '77.6245' });
  };

  const navItems = [
    { key: 'overview', label: t('admin.overview') || 'Overview', icon: BarChart3 },
    { key: 'map', label: t('admin.map_view'), icon: MapPin },
    { key: 'bins', label: t('admin.bin_management'), icon: Trash2 },
    { key: 'alerts', label: t('admin.alerts_panel'), icon: AlertTriangle },
    { key: 'residents', label: t('admin.residents'), icon: Users },
  ] as const;

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] grid-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-10">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
          className="relative rounded-3xl p-6 mb-8 overflow-hidden"
          style={{ background:'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(14,165,233,0.08) 100%)' }}>
          <div className="absolute inset-0 border border-eco-500/20 rounded-3xl pointer-events-none" />
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-eco-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-eco-500 to-sky-500 flex items-center justify-center shadow-[0_4px_20px_rgba(34,197,94,0.3)]">
                <Shield size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[var(--color-text-primary)] font-[Space_Grotesk,sans-serif]">
                  {t('admin.title')}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="status-dot-eco" />
                  <p className="text-[var(--color-text-secondary)] text-sm">{t('nav.subtitle') || 'BBMP Smart Waste Management System'}</p>
                </div>
              </div>
            </div>
            <AnimatedButton onClick={() => setShowAddBin(true)} variant="eco" icon={Plus}>
              {t('admin.add_bin')}
            </AnimatedButton>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatWidget title={t('admin.total_bins')} value={bins.length} icon={Trash2} color="#22c55e" gradient="from-eco-500/20 to-eco-900/5" />
          <StatWidget title={t('admin.active_alerts')} value={pendingAlerts.length} icon={AlertTriangle} color="#ef4444" gradient="from-red-500/20 to-red-900/5" />
          <StatWidget title={t('admin.total_residents')} value={allUsers.length} icon={Users} color="#3b82f6" gradient="from-blue-500/20 to-blue-900/5" />
          <StatWidget title={t('admin.bins_full')} value={fullBins.length} icon={RefreshCw} color="#f59e0b" gradient="from-amber-500/20 to-amber-900/5" />
        </div>

        {/* Sub-nav */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveView(key)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeView === key ? 'text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5'
              }`}>
              {activeView === key && <motion.div layoutId="admin-tab" className="absolute inset-0 bg-eco-500/20 border border-eco-500/40 rounded-xl" />}
              <span className="relative z-10 flex items-center gap-2"><Icon size={14}/>{label}</span>
              {key === 'alerts' && pendingAlerts.length > 0 && (
                <span className="relative z-10 ml-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingAlerts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alert summary */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-5 border border-[var(--color-border-subtle)]">
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" /> {t('admin.alerts_panel')}
              </h3>
              <AlertPanel alerts={alerts} />
            </motion.div>
            {/* Bin status summary */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-5 border border-[var(--color-border-subtle)]">
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                <Trash2 size={16} className="text-eco-400" /> {t('admin.bin_status_summary') || 'Bin Status Summary'}
              </h3>
              <div className="space-y-2">
                {bins.slice(0, 5).map(bin => (
                  <div key={bin.id} className="flex items-center gap-3 p-3 bg-[var(--color-bg-surface-hover)]/50 rounded-xl">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      bin.status === 'full' ? 'bg-red-400' :
                      bin.status === 'medium' ? 'bg-amber-400' : 'bg-eco-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--color-text-primary)] truncate">{bin.name}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{bin.residents.length} {t('admin.residents') || 'residents'}</p>
                    </div>
                    <div className="flex gap-1">
                      {(['plastic', 'organic', 'metal', 'paper'] as const).map(type => {
                        const level = bin[`${type}Level` as keyof Bin] as number;
                        return (
                          <div key={type} className="text-center">
                            <div
                              className="w-6 rounded-sm overflow-hidden bg-[var(--color-border-strong)]"
                              style={{ height: '20px' }}
                            >
                              <div
                                className="w-full rounded-sm"
                                style={{
                                  height: `${level}%`,
                                  backgroundColor: type === 'plastic' ? '#3b82f6' : type === 'organic' ? '#22c55e' : type === 'metal' ? '#f59e0b' : '#a855f7',
                                  marginTop: `${100 - level}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <span className={`text-xs font-medium ${
                      bin.status === 'full' ? 'text-red-400' : bin.status === 'medium' ? 'text-amber-400' : 'text-eco-400'
                    }`}>
                      {t(`common.${bin.status}`) || bin.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeView === 'map' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl overflow-hidden border border-[var(--color-border-subtle)]" style={{ height: 520 }}>
            <Suspense fallback={<div className="flex items-center justify-center h-full text-[var(--color-text-secondary)]">{t('admin.loading_map')}</div>}>
              <BinMap bins={bins} />
            </Suspense>
          </motion.div>
        )}

        {activeView === 'bins' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bins.map(bin => (
                <BinCard key={bin.id} bin={bin} showReset />
              ))}
            </div>
          </motion.div>
        )}

        {activeView === 'alerts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 border border-[var(--color-border-subtle)]">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">{t('admin.alerts_panel')}</h3>
            <AlertPanel alerts={alerts} />
          </motion.div>
        )}

        {activeView === 'residents' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden">
            <div className="p-5 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
              <h3 className="font-bold text-[var(--color-text-primary)] font-[Space_Grotesk,sans-serif]">{t('admin.residents')} <span className="text-[var(--color-text-secondary)] font-normal">({allUsers.length})</span></h3>
              <div className="flex items-center gap-2">
                <span className="status-dot-eco" />
                <span className="text-eco-400 text-xs font-medium">{t('admin.live')}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)]">
                    {[
                      { key: 'Name', label: t('admin.table_name') },
                      { key: 'Resident ID', label: t('admin.table_resident_id') },
                      { key: 'Location', label: t('admin.table_location') },
                      { key: 'Bin', label: t('admin.table_bin') },
                      { key: 'Points', label: t('admin.table_points') },
                      { key: 'Status', label: t('admin.table_status') }
                    ].map(h => (
                      <th key={h.key} className="text-left px-5 py-3 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">{h.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u, i) => (
                    <motion.tr key={u.id} initial={{ opacity:0, x:-15 }} animate={{ opacity:1, x:0 }}
                      transition={{ delay: i*0.04 }} className="border-b border-[var(--color-border-subtle)]/30 hover:bg-[var(--glass-bg)] transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-eco-500/30 to-sky-500/30 flex items-center justify-center text-xs font-bold text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]">
                            {u.name.charAt(0)}
                          </div>
                          <span className="text-[var(--color-text-primary)] text-sm font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[var(--color-text-secondary)] text-xs font-mono tracking-wider">{u.residentId}</td>
                      <td className="px-5 py-3.5 text-[var(--color-text-secondary)] text-sm">{u.location}</td>
                      <td className="px-5 py-3.5 text-[var(--color-text-secondary)] text-sm">{bins.find(b => b.id === u.binId)?.name || '–'}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 text-eco-400">
                          <Zap size={11}/>
                          <span className="text-sm font-bold">{u.points.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${
                          u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-eco-500/20 text-eco-400'
                        }`}>
                          <span className={u.role === 'admin' ? 'status-dot-warn' : 'status-dot-eco'} />
                          {u.role}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Bin Modal */}
      {showAddBin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddBin(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative glass-strong rounded-2xl p-6 border border-[var(--color-border-subtle)] w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[var(--color-text-primary)] font-[Space_Grotesk,sans-serif]">{t('admin.add_bin')}</h3>
              <button onClick={() => setShowAddBin(false)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddBin} className="space-y-4">
              {[
                { name: 'name', label: t('admin.bin_name'), placeholder: 'MG Road Junction' },
                { name: 'address', label: t('admin.address'), placeholder: '1st Main, MG Road, Bengaluru' },
                { name: 'lat', label: t('admin.latitude'), placeholder: '12.9758' },
                { name: 'lng', label: t('admin.longitude'), placeholder: '77.6062' },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{field.label}</label>
                  <input
                    name={field.name}
                    value={newBin[field.name as keyof typeof newBin]}
                    onChange={e => setNewBin(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    placeholder={field.placeholder}
                    required
                    className="w-full bg-[var(--color-bg-surface-hover)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-2.5 text-[var(--color-text-primary)] placeholder-slate-500 focus:border-eco-500/50 text-sm"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddBin(false)}
                  className="flex-1 py-2.5 border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] rounded-xl text-sm hover:bg-white/5 transition-all">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={addingBin}
                  className="flex-1 py-2.5 bg-eco-500 hover:bg-eco-400 text-[var(--color-text-primary)] font-medium rounded-xl text-sm transition-all disabled:opacity-50">
                  {addingBin ? t('admin.adding') : t('admin.add_bin')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
