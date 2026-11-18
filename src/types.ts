export type Language = 'gu' | 'hi' | 'en' | 'es';

export interface MedicalID {
  name: string;
  bloodGroup: string;
  emergencyContact: string;
  allergies: string;
  updatedAt?: string;
}

export interface GeoLocationState {
  status: 'idle' | 'fetching' | 'ready' | 'error';
  lat?: number;
  lng?: number;
  accuracy?: number;
  timestamp?: string;
  errorMessage?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isVoiceTranscript?: boolean;
}

export interface QuickSymptom {
  id: string;
  prompt: string;
  labelKey:
    | 'symptomChestPain'
    | 'symptomBleeding'
    | 'symptomUnconscious'
    | 'symptomChoking'
    | 'symptomBurn';
}

export type HospitalCategory = 'hospital' | 'health_center' | 'trauma_center' | 'clinic';

export interface HospitalItem {
  id: string;
  placeId?: string;
  name: string;
  category: HospitalCategory;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  emergency24x7: boolean;
  ambulanceAvailable: boolean;
  icuBedsAvailable: number;
  verified: boolean;
  googleMapsUri?: string;
  source: 'google' | 'admin';
  distanceKm?: number;
  isOpenNow?: boolean;
}

export type DispatchStatus = 'sent' | 'acknowledged' | 'ambulance_dispatched' | 'resolved';
export type UrgencyLevel = 'critical' | 'high' | 'moderate';

export interface EmergencyDispatchRecord {
  id: string;
  userId: string;
  patientName: string;
  bloodGroup: string;
  allergies: string;
  emergencyContact: string;
  symptomSummary: string;
  aiDispatchBrief: string;
  urgencyLevel: UrgencyLevel;
  hospitalId: string;
  hospitalName: string;
  hospitalPhone: string;
  lat: number;
  lng: number;
  language: Language;
  status: DispatchStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}
