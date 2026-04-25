import type { User, Bin, Transaction, Alert, BinStatus } from '../types';

// Bangalore city bins
const initialBins: Bin[] = [
  {
    id: 'bin-001',
    name: 'Koramangala Hub',
    location: { lat: 12.9352, lng: 77.6245 },
    address: '5th Block, Koramangala, Bengaluru',
    plasticLevel: 65,
    organicLevel: 40,
    metalLevel: 20,
    paperLevel: 55,
    status: 'medium',
    residents: ['user-001', 'user-002', 'user-003'],
    lastUpdated: Date.now(),
  },
  {
    id: 'bin-002',
    name: 'Indiranagar Station',
    location: { lat: 12.9784, lng: 77.6408 },
    address: '100 Feet Road, Indiranagar, Bengaluru',
    plasticLevel: 88,
    organicLevel: 75,
    metalLevel: 60,
    paperLevel: 82,
    status: 'full',
    residents: ['user-004', 'user-005'],
    lastUpdated: Date.now(),
  },
  {
    id: 'bin-003',
    name: 'Jayanagar Market',
    location: { lat: 12.9256, lng: 77.5927 },
    address: '4th T Block, Jayanagar, Bengaluru',
    plasticLevel: 15,
    organicLevel: 30,
    metalLevel: 10,
    paperLevel: 20,
    status: 'empty',
    residents: ['user-006', 'user-007'],
    lastUpdated: Date.now(),
  },
  {
    id: 'bin-004',
    name: 'HSR Layout Sector',
    location: { lat: 12.9116, lng: 77.6741 },
    address: 'Sector 7, HSR Layout, Bengaluru',
    plasticLevel: 50,
    organicLevel: 45,
    metalLevel: 35,
    paperLevel: 48,
    status: 'medium',
    residents: ['user-008', 'user-009'],
    lastUpdated: Date.now(),
  },
  {
    id: 'bin-005',
    name: 'Whitefield IT Park',
    location: { lat: 12.9698, lng: 77.7499 },
    address: 'EPIP Zone, Whitefield, Bengaluru',
    plasticLevel: 92,
    organicLevel: 85,
    metalLevel: 78,
    paperLevel: 90,
    status: 'full',
    residents: ['user-010'],
    lastUpdated: Date.now(),
  },
  {
    id: 'bin-006',
    name: 'Rajajinagar Block',
    location: { lat: 12.9944, lng: 77.5540 },
    address: '2nd Block, Rajajinagar, Bengaluru',
    plasticLevel: 25,
    organicLevel: 20,
    metalLevel: 15,
    paperLevel: 30,
    status: 'empty',
    residents: [],
    lastUpdated: Date.now(),
  },
];

const initialUsers: User[] = [
  { id: 'user-001', name: 'Priya Sharma', email: 'priya@example.com', residentId: 'RES-2024-0001', binId: 'bin-001', points: 1250, role: 'user', location: 'Koramangala', createdAt: Date.now() - 86400000 * 30 },
  { id: 'user-002', name: 'Rahul Kumar', email: 'rahul@example.com', residentId: 'RES-2024-0002', binId: 'bin-001', points: 980, role: 'user', location: 'Koramangala', createdAt: Date.now() - 86400000 * 25 },
  { id: 'user-003', name: 'Ananya Reddy', email: 'ananya@example.com', residentId: 'RES-2024-0003', binId: 'bin-001', points: 745, role: 'user', location: 'Koramangala', createdAt: Date.now() - 86400000 * 20 },
  { id: 'user-004', name: 'Vikram Nair', email: 'vikram@example.com', residentId: 'RES-2024-0004', binId: 'bin-002', points: 2100, role: 'user', location: 'Indiranagar', createdAt: Date.now() - 86400000 * 45 },
  { id: 'user-005', name: 'Deepa Iyer', email: 'deepa@example.com', residentId: 'RES-2024-0005', binId: 'bin-002', points: 560, role: 'user', location: 'Indiranagar', createdAt: Date.now() - 86400000 * 15 },
  { id: 'user-006', name: 'Suresh Gowda', email: 'suresh@example.com', residentId: 'RES-2024-0006', binId: 'bin-003', points: 320, role: 'user', location: 'Jayanagar', createdAt: Date.now() - 86400000 * 10 },
  { id: 'user-007', name: 'Kavitha Rao', email: 'kavitha@example.com', residentId: 'RES-2024-0007', binId: 'bin-003', points: 1800, role: 'user', location: 'Jayanagar', createdAt: Date.now() - 86400000 * 60 },
  { id: 'user-008', name: 'Arjun Patel', email: 'arjun@example.com', residentId: 'RES-2024-0008', binId: 'bin-004', points: 890, role: 'user', location: 'HSR Layout', createdAt: Date.now() - 86400000 * 18 },
  { id: 'user-009', name: 'Meera Krishnan', email: 'meera@example.com', residentId: 'RES-2024-0009', binId: 'bin-004', points: 430, role: 'user', location: 'HSR Layout', createdAt: Date.now() - 86400000 * 8 },
  { id: 'user-010', name: 'Aditya Singh', email: 'aditya@example.com', residentId: 'RES-2024-0010', binId: 'bin-005', points: 3200, role: 'user', location: 'Whitefield', createdAt: Date.now() - 86400000 * 90 },
  { id: 'admin-001', name: 'BBMP Admin', email: 'admin@bbmp.gov.in', residentId: 'ADMIN-001', binId: '', points: 0, role: 'admin', location: 'Bengaluru', createdAt: Date.now() - 86400000 * 365 },
];

const initialAlerts: Alert[] = [
  { id: 'alert-001', binId: 'bin-002', binName: 'Indiranagar Station', message: 'Bin is 88% full — collection required immediately', status: 'pending', createdAt: Date.now() - 3600000 },
  { id: 'alert-002', binId: 'bin-005', binName: 'Whitefield IT Park', message: 'Bin is 92% full — critical overflow risk', status: 'pending', createdAt: Date.now() - 7200000 },
  { id: 'alert-003', binId: 'bin-001', binName: 'Koramangala Hub', message: 'Plastic compartment at 65% — schedule collection', status: 'assigned', createdAt: Date.now() - 86400000 },
];

const initialTransactions: Transaction[] = [
  { id: 'tx-001', userId: 'user-001', binId: 'bin-001', wasteType: 'plastic', pointsAwarded: 15, timestamp: Date.now() - 3600000, confidence: 82 },
  { id: 'tx-002', userId: 'user-004', binId: 'bin-002', wasteType: 'organic', pointsAwarded: 10, timestamp: Date.now() - 7200000, confidence: 91 },
  { id: 'tx-003', userId: 'user-010', binId: 'bin-005', wasteType: 'metal', pointsAwarded: 20, timestamp: Date.now() - 10800000, confidence: 75 },
  { id: 'tx-004', userId: 'user-007', binId: 'bin-003', wasteType: 'paper', pointsAwarded: 8, timestamp: Date.now() - 14400000, confidence: 88 },
  { id: 'tx-005', userId: 'user-001', binId: 'bin-001', wasteType: 'organic', pointsAwarded: 10, timestamp: Date.now() - 18000000, confidence: 79 },
];

// In-memory state
let bins = [...initialBins];
let users = [...initialUsers];
let alerts = [...initialAlerts];
let transactions = [...initialTransactions];
let currentUser: User | null = null;

// Listeners (React subscriptions)
type Listener<T> = (data: T) => void;
const binListeners: Listener<Bin[]>[] = [];
const alertListeners: Listener<Alert[]>[] = [];

function notifyBins() { binListeners.forEach(l => l([...bins])); }
function notifyAlerts() { alertListeners.forEach(l => l([...alerts])); }

function getBinStatus(b: Bin): BinStatus {
  const max = Math.max(b.plasticLevel, b.organicLevel, b.metalLevel, b.paperLevel);
  if (max >= 80) return 'full';
  if (max >= 40) return 'medium';
  return 'empty';
}

// ---- AUTH ----
export async function mockLogin(residentId: string): Promise<User> {
  await delay(800);
  const user = users.find(u => u.residentId.toLowerCase() === residentId.toLowerCase());
  if (!user) throw new Error('Resident ID not found. Please register first.');
  currentUser = user;
  localStorage.setItem('binwise_user', JSON.stringify(user));
  return user;
}

export async function mockGoogleLogin(name: string, email: string): Promise<User> {
  await delay(1000);
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // Create new user for google auth
    const id = `user-${String(users.length + 1).padStart(3, '0')}`;
    const residentId = `RES-2024-${String(users.length + 1).padStart(4, '0')}`;
    const binId = bins.length > 0 ? bins[0].id : ''; // Assign to first bin by default
    
    user = {
      id, name, email, residentId,
      binId, points: 0, role: 'user',
      location: 'Bengaluru', createdAt: Date.now(),
    };
    users.push(user);
    if (binId) {
      const bin = bins.find(b => b.id === binId);
      if (bin) { bin.residents.push(id); notifyBins(); }
    }
  }
  currentUser = user;
  localStorage.setItem('binwise_user', JSON.stringify(user));
  return user;
}

export async function mockAdminLogin(email: string, password: string): Promise<User> {
  await delay(800);
  if (email === 'admin@bbmp.gov.in' && password === 'admin123') {
    const admin = users.find(u => u.role === 'admin')!;
    currentUser = admin;
    localStorage.setItem('binwise_user', JSON.stringify(admin));
    return admin;
  }
  throw new Error('Invalid admin credentials.');
}

export async function mockRegister(data: {
  name: string; email: string; location: string; binId: string;
}): Promise<User> {
  await delay(1000);
  const existing = users.find(u => u.email === data.email);
  if (existing) throw new Error('Email already registered.');
  const id = `user-${String(users.length + 1).padStart(3, '0')}`;
  const residentId = `RES-2024-${String(users.length + 1).padStart(4, '0')}`;
  const newUser: User = {
    id, name: data.name, email: data.email, residentId,
    binId: data.binId, points: 0, role: 'user',
    location: data.location, createdAt: Date.now(),
  };
  users.push(newUser);
  currentUser = newUser;
  localStorage.setItem('binwise_user', JSON.stringify(newUser));
  // Add to bin residents
  const bin = bins.find(b => b.id === data.binId);
  if (bin) { bin.residents.push(id); notifyBins(); }
  return newUser;
}

export function mockLogout() {
  currentUser = null;
  localStorage.removeItem('binwise_user');
}

export function mockGetCurrentUser(): User | null {
  if (currentUser) return currentUser;
  const stored = localStorage.getItem('binwise_user');
  if (stored) {
    currentUser = JSON.parse(stored);
    return currentUser;
  }
  return null;
}

// ---- BINS ----
export function subscribeToBins(listener: Listener<Bin[]>): () => void {
  binListeners.push(listener);
  listener([...bins]);
  return () => {
    const i = binListeners.indexOf(listener);
    if (i >= 0) binListeners.splice(i, 1);
  };
}

export async function mockGetBins(): Promise<Bin[]> {
  await delay(300);
  return [...bins];
}

export async function mockGetBin(id: string): Promise<Bin | null> {
  await delay(200);
  return bins.find(b => b.id === id) || null;
}

export async function mockResetBin(binId: string): Promise<void> {
  await delay(500);
  const bin = bins.find(b => b.id === binId);
  if (bin) {
    bin.plasticLevel = 0;
    bin.organicLevel = 0;
    bin.metalLevel = 0;
    bin.paperLevel = 0;
    bin.status = 'empty';
    bin.lastUpdated = Date.now();
    // Resolve related alerts
    alerts = alerts.map(a =>
      a.binId === binId ? { ...a, status: 'resolved' as const } : a
    );
    notifyBins();
    notifyAlerts();
  }
}

export async function mockAddBin(bin: Omit<Bin, 'id' | 'residents' | 'status' | 'lastUpdated'>): Promise<Bin> {
  await delay(600);
  const newBin: Bin = {
    ...bin,
    id: `bin-${String(bins.length + 1).padStart(3, '0')}`,
    residents: [],
    status: 'empty',
    lastUpdated: Date.now(),
  };
  bins.push(newBin);
  notifyBins();
  return newBin;
}

// ---- WASTE DEPOSIT ----
export async function mockDepositWaste(
  userId: string, binId: string, wasteType: string, confidence: number
): Promise<{ transaction: Transaction; newPoints: number }> {
  await delay(700);
  const pointsMap: Record<string, number> = { plastic: 15, organic: 10, metal: 20, paper: 8 };
  const pts = pointsMap[wasteType] || 10;

  const tx: Transaction = {
    id: `tx-${Date.now()}`,
    userId, binId,
    wasteType: wasteType as Transaction['wasteType'],
    pointsAwarded: pts,
    timestamp: Date.now(),
    confidence,
  };
  transactions.unshift(tx);

  // Update user points
  const user = users.find(u => u.id === userId);
  if (user) user.points += pts;

  // Update bin level
  const bin = bins.find(b => b.id === binId);
  if (bin) {
    const increment = Math.floor(Math.random() * 5) + 3;
    if (wasteType === 'plastic') bin.plasticLevel = Math.min(100, bin.plasticLevel + increment);
    if (wasteType === 'organic') bin.organicLevel = Math.min(100, bin.organicLevel + increment);
    if (wasteType === 'metal') bin.metalLevel = Math.min(100, bin.metalLevel + increment);
    if (wasteType === 'paper') bin.paperLevel = Math.min(100, bin.paperLevel + increment);
    bin.status = getBinStatus(bin);
    bin.lastUpdated = Date.now();

    // Trigger alert if any level > 80
    const max = Math.max(bin.plasticLevel, bin.organicLevel, bin.metalLevel, bin.paperLevel);
    if (max >= 80) {
      const existingAlert = alerts.find(a => a.binId === binId && a.status === 'pending');
      if (!existingAlert) {
        const alert: Alert = {
          id: `alert-${Date.now()}`,
          binId,
          binName: bin.name,
          message: `${bin.name} is ${max}% full — collection required`,
          status: 'pending',
          createdAt: Date.now(),
        };
        alerts.unshift(alert);
        notifyAlerts();
      }
    }
    notifyBins();
  }

  const updatedUser = users.find(u => u.id === userId);
  return { transaction: tx, newPoints: updatedUser?.points || pts };
}

// ---- USERS ----
export async function mockGetLeaderboard(): Promise<User[]> {
  await delay(300);
  return [...users].filter(u => u.role === 'user').sort((a, b) => b.points - a.points);
}

export async function mockGetUser(id: string): Promise<User | null> {
  await delay(200);
  return users.find(u => u.id === id) || null;
}

export async function mockGetUserByResidentId(residentId: string): Promise<User | null> {
  await delay(200);
  return users.find(u => u.residentId === residentId) || null;
}

export async function mockGetUserTransactions(userId: string): Promise<Transaction[]> {
  await delay(300);
  return transactions.filter(t => t.userId === userId).slice(0, 20);
}

export async function mockGetAllUsers(): Promise<User[]> {
  await delay(300);
  return users.filter(u => u.role === 'user');
}

// ---- ALERTS ----
export function subscribeToAlerts(listener: Listener<Alert[]>): () => void {
  alertListeners.push(listener);
  listener([...alerts]);
  return () => {
    const i = alertListeners.indexOf(listener);
    if (i >= 0) alertListeners.splice(i, 1);
  };
}

export async function mockAssignTruck(alertId: string): Promise<void> {
  await delay(500);
  alerts = alerts.map(a =>
    a.id === alertId ? { ...a, status: 'assigned' as const } : a
  );
  notifyAlerts();
}

export async function mockGetAllBinsData() {
  return { bins: [...bins], users: users.filter(u => u.role === 'user'), alerts: [...alerts] };
}

// ---- HELPERS ----
export function getAllBins() { return [...bins]; }
export function getAllUsers() { return users.filter(u => u.role === 'user'); }
export function getAllAlerts() { return [...alerts]; }

function delay(ms: number) { return new Promise(res => setTimeout(res, ms)); }
