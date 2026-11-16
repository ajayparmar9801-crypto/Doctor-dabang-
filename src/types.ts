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
