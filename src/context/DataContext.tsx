import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Bin, Alert, User } from '../types';
import { subscribeToBins, subscribeToAlerts, mockGetLeaderboard, mockGetAllBinsData } from '../services/mockData';

interface DataContextType {
  bins: Bin[];
  alerts: Alert[];
  leaderboard: User[];
  refreshLeaderboard: () => void;
}

const DataContext = createContext<DataContextType>({
  bins: [], alerts: [], leaderboard: [],
  refreshLeaderboard: () => {},
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [bins, setBins] = useState<Bin[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);

  useEffect(() => {
    const unsubBins = subscribeToBins(setBins);
    const unsubAlerts = subscribeToAlerts(setAlerts);
    mockGetLeaderboard().then(setLeaderboard);
    return () => { unsubBins(); unsubAlerts(); };
  }, []);

  const refreshLeaderboard = () => {
    mockGetLeaderboard().then(setLeaderboard);
  };

  return (
    <DataContext.Provider value={{ bins, alerts, leaderboard, refreshLeaderboard }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
