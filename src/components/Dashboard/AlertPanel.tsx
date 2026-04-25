import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert } from '../../types';
import { AlertTriangle, Truck, CheckCircle, Bell } from 'lucide-react';
import { mockAssignTruck } from '../../services/mockData';
import { useLanguage } from '../../context/LanguageContext';

interface AlertPanelProps {
  alerts: Alert[];
}

export default function AlertPanel({ alerts }: AlertPanelProps) {
  const { t } = useLanguage();
  const [assigning, setAssigning] = useState<string | null>(null);
  const activeAlerts = alerts.filter(a => a.status !== 'resolved');

  const handleAssign = async (alertId: string) => {
    setAssigning(alertId);
    await mockAssignTruck(alertId);
    setAssigning(null);
  };

  if (activeAlerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-[var(--color-text-secondary)] gap-2">
        <CheckCircle size={32} className="text-eco-500/50" />
        <p className="text-sm">{t('admin.no_alerts')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {activeAlerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`p-4 rounded-xl border transition-all ${
              alert.status === 'pending'
                ? 'bg-red-500/5 border-red-500/20'
                : 'bg-amber-500/5 border-amber-500/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 p-1.5 rounded-lg ${
                alert.status === 'pending' ? 'bg-red-500/20' : 'bg-amber-500/20'
              }`}>
                {alert.status === 'pending'
                  ? <AlertTriangle size={14} className="text-red-400" />
                  : <Truck size={14} className="text-amber-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[var(--color-text-primary)] text-sm font-medium">{alert.binName}</p>
                <p className="text-[var(--color-text-secondary)] text-xs mt-0.5 leading-relaxed">{alert.message}</p>
                <p className="text-slate-600 text-xs mt-1">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
              {alert.status === 'pending' && (
                <button
                  onClick={() => handleAssign(alert.id)}
                  disabled={assigning === alert.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 text-xs font-medium rounded-lg transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  <Truck size={12} />
                  {assigning === alert.id ? '...' : t('admin.assign_truck')}
                </button>
              )}
              {alert.status === 'assigned' && (
                <span className="text-xs text-amber-400 font-medium flex items-center gap-1 whitespace-nowrap">
                  <Truck size={12} />
                  {t('admin.truck_assigned')}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
