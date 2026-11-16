import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Header } from './components/Header';
import { EmergencySosPanel } from './components/EmergencySosPanel';
import { DoctorDubangAssistant } from './components/DoctorDubangAssistant';
import { MedicalIdCard } from './components/MedicalIdCard';
import { MobileBottomBar } from './components/MobileBottomBar';
import { TRANSLATIONS } from './i18n/translations';
import type { GeoLocationState, Language, MedicalID } from './types';

const MEDICAL_ID_STORAGE_KEY = 'doctor_dubang_medical_id_v1';
const LANGUAGE_STORAGE_KEY = 'doctor_dubang_lang_v1';

const DEFAULT_MEDICAL_ID: MedicalID = {
  name: '',
  bloodGroup: '',
  emergencyContact: '',
  allergies: '',
};

function loadInitialMedicalId(): MedicalID {
  try {
    const raw = localStorage.getItem(MEDICAL_ID_STORAGE_KEY);
    if (!raw) return DEFAULT_MEDICAL_ID;
    const parsed = JSON.parse(raw) as Partial<MedicalID>;
    return {
      name: parsed.name || '',
      bloodGroup: parsed.bloodGroup || '',
      emergencyContact: parsed.emergencyContact || '',
      allergies: parsed.allergies || '',
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return DEFAULT_MEDICAL_ID;
  }
}

function loadInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'gu' || saved === 'hi' || saved === 'en' || saved === 'es') {
      return saved;
    }
  } catch {
    // Ignore storage error
  }
  return 'gu';
}

export default function App() {
  const [language, setLanguage] = useState<Language>(loadInitialLanguage);
  const [medicalId, setMedicalId] = useState<MedicalID>(loadInitialMedicalId);
  const [location, setLocation] = useState<GeoLocationState>({ status: 'idle' });

  const t = TRANSLATIONS[language];

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Ignore storage error
    }
  }, [language]);

  const handleSaveMedicalId = (updated: MedicalID) => {
    setMedicalId(updated);
    try {
      localStorage.setItem(MEDICAL_ID_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage error
    }
  };

  const handleTriggerSOS = () => {
    if (!('geolocation' in navigator)) {
      setLocation({
        status: 'error',
        errorMessage: t.gpsErrorUnavailable,
      });
      return;
    }

    setLocation({ status: 'fetching' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          status: 'ready',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date().toISOString(),
        });
      },
      (err) => {
        setLocation({
          status: 'error',
          errorMessage:
            err.code === err.PERMISSION_DENIED
              ? t.gpsErrorDenied
              : t.gpsErrorUnavailable,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000,
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-20 md:pb-8">
      <Header language={language} onLanguageChange={setLanguage} t={t} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <div className="mb-5 sm:mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
            Doctor Dubang
          </h1>
          <p className="text-sm text-slate-600 mt-1">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-6">
            <EmergencySosPanel
              location={location}
              onTriggerSOS={handleTriggerSOS}
              medicalId={medicalId}
              t={t}
            />
            <MedicalIdCard
              medicalId={medicalId}
              onSave={handleSaveMedicalId}
              t={t}
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <DoctorDubangAssistant
              language={language}
              medicalId={medicalId}
              location={location}
              t={t}
            />

            <footer className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 text-xs text-amber-950 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <ShieldAlert
                  className="w-4 h-4 text-amber-700 mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-amber-900 mb-1">
                    {t.disclaimerTitle}
                  </p>
                  <p>{t.disclaimerBody}</p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </main>

      <MobileBottomBar t={t} />
    </div>
  );
}
