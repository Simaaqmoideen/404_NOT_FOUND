export type WasteType = 'plastic' | 'organic' | 'metal' | 'paper';

export type UserRole = 'user' | 'admin';

export type BinStatus = 'empty' | 'medium' | 'full';

export type Language =
  | 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'ml' | 'mr' | 'bn';

export interface User {
  id: string;
  name: string;
  email: string;
  residentId: string;
  binId: string;
  points: number;
  role: UserRole;
  location?: string;
  avatar?: string;
  createdAt: number;
}

export interface Bin {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  address: string;
  plasticLevel: number;   // 0-100
  organicLevel: number;
  metalLevel: number;
  paperLevel: number;
  status: BinStatus;
  residents: string[];    // user IDs
  lastUpdated: number;
}

export interface Transaction {
  id: string;
  userId: string;
  binId: string;
  wasteType: WasteType;
  pointsAwarded: number;
  timestamp: number;
  confidence?: number;
}

export interface Alert {
  id: string;
  binId: string;
  binName: string;
  message: string;
  status: 'pending' | 'assigned' | 'resolved';
  createdAt: number;
}

export interface WasteClassification {
  plastic: number;
  organic: number;
  metal: number;
  paper: number;
}

export interface HybridClassificationResult {
  rawLabel: string;
  mappedCategory: WasteType | 'unknown';
  confidence: number;
  distribution: WasteClassification;
  source: 'ai + mapping' | 'ai + mapping (stream)' | 'fallback' | 'demo mock' | 'user override' | 'user corrected';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredPoints: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  icon: string;
}

export const BADGES: Badge[] = [
  { id: 'newcomer', name: 'Eco Newcomer', description: 'First waste deposit', icon: '🌱', requiredPoints: 0 },
  { id: 'bronze', name: 'Bronze Sorter', description: 'Earn 100 points', icon: '🥉', requiredPoints: 100 },
  { id: 'silver', name: 'Silver Guardian', description: 'Earn 500 points', icon: '🥈', requiredPoints: 500 },
  { id: 'gold', name: 'Gold Champion', description: 'Earn 1000 points', icon: '🥇', requiredPoints: 1000 },
  { id: 'platinum', name: 'Eco Warrior', description: 'Earn 2500 points', icon: '💎', requiredPoints: 2500 },
];

export const REWARDS: Reward[] = [
  { id: 'bus_pass', name: 'Free Bus Pass', description: '1-day BMTC bus pass', icon: '🚌', pointsCost: 200 },
  { id: 'grocery', name: 'Grocery Voucher', description: '₹50 discount voucher', icon: '🛒', pointsCost: 500 },
  { id: 'plant', name: 'Sapling Kit', description: 'Free plant sapling', icon: '🌿', pointsCost: 300 },
  { id: 'bill', name: 'Utility Discount', description: '5% off electricity bill', icon: '💡', pointsCost: 1000 },
];
