export type ServiceCategory = 'food' | 'agriculture' | 'social';
export type UserRole = 'provider' | 'receiver';

export interface LocationCoords {
  lat: number;
  lng: number;
  villageOrTown: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  phone: string;
  category: ServiceCategory;
  subCategory: string; // e.g. "Cooked Meals Donor", "Tractor & Equipment Loan", "Volunteer Handyman"
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  availability: string; // e.g. "Immediate", "Morning 8am-12pm", "Weekends"
  capacityOrSpecs?: string; // e.g. "50 meal packs", "45 HP Mahindra Tractor", "Medical first-aid trained"
  description: string;
  status: 'active' | 'matched' | 'completed';
  createdAt: number;
}

export interface ServiceReceiver {
  id: string;
  name: string;
  phone: string;
  category: ServiceCategory;
  requirement: string; // e.g. "Urgent food for 15 workers", "Irrigation pump needed", "Elderly patient hospital ride"
  urgency: 'critical' | 'moderate' | 'flexible';
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  status: 'pending' | 'matched' | 'resolved';
  createdAt: number;
}

export interface MatchRecord {
  id: string;
  category: ServiceCategory;
  providerId: string;
  receiverId: string;
  providerName: string;
  providerPhone: string;
  receiverName: string;
  receiverPhone: string;
  location: string;
  distanceKm: number;
  providerOffer: string;
  receiverRequirement: string;
  matchedAt: number;
  status: 'connected' | 'in_progress' | 'completed';
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: number;
}

export interface NotificationItem {
  id: string;
  recipientRole: UserRole;
  recipientName: string;
  recipientPhone: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  matchId?: string;
  category: ServiceCategory;
}

export interface PlatformStats {
  totalProviders: number;
  totalReceivers: number;
  activeMatches: number;
  resolvedCases: number;
  byCategory: {
    food: { providers: number; receivers: number };
    agriculture: { providers: number; receivers: number };
    social: { providers: number; receivers: number };
  };
}
