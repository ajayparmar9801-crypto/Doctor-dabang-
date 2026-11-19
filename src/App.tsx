import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  handleFirestoreError,
  OperationType,
} from './firebase';
import { Header } from './components/Header';
import { AllFeaturesGrid, type FeatureActionId } from './components/AllFeaturesGrid';
import { EmergencySosPanel } from './components/EmergencySosPanel';
import { DoctorDubangAssistant } from './components/DoctorDubangAssistant';
import { MedicalIdCard } from './components/MedicalIdCard';
import { GoogleHospitalsMap } from './components/GoogleHospitalsMap';
import { AdminPanel } from './components/AdminPanel';
import { MobileBottomBar } from './components/MobileBottomBar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TRANSLATIONS } from './i18n/translations';
import { initGoogleAnalytics, trackEvent, trackPageView } from './utils/analytics';
import type { GeoLocationState, HospitalItem, Language, MedicalID } from './types';

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
  const [activeView, setActiveView] = useState<'home' | 'admin'>('home');
  const [autoInformTriggerCount, setAutoInformTriggerCount] = useState(0);

  // Firebase Auth & RBAC state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin-verified hospitals from Firestore
  const [verifiedHospitals, setVerifiedHospitals] = useState<HospitalItem[]>([]);

  // Google Maps Platform Demo Key Quota Banner State (Case A)
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  useEffect(() => {
    initGoogleAnalytics();
    trackPageView('home', language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Ignore storage error
    }
  }, [language]);

  // Firebase Auth listener & User/Admin synchronization
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user || !user.emailVerified) {
        setIsAdmin(false);
        return;
      }

      const isBootstrapped = user.email === BOOTSTRAPPED_ADMIN_EMAIL;
      let hasAdminDoc = false;
      try {
        const adminSnap = await getDoc(doc(db, 'admins', user.uid));
        hasAdminDoc = adminSnap.exists();
      } catch {
        hasAdminDoc = false;
      }

      setIsAdmin(isBootstrapped || hasAdminDoc);

      const userPath = `users/${user.uid}`;
      try {
        const userRef = doc(db, 'users', user.uid);
        const existingSnap = await getDoc(userRef);
        if (!existingSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: (user.email || '').slice(0, 256),
            displayName: (user.displayName || 'User').slice(0, 120),
            role: isBootstrapped ? 'admin' : 'user',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.WRITE, userPath);
        } catch (formattedErr) {
          setAppError(
            formattedErr instanceof Error
              ? formattedErr.message
              : 'Unable to sync user profile.'
          );
        }
      }
    });

    return () => unsub();
  }, []);

  // Verified hospitals listener (public read when verified == true)
  useEffect(() => {
    const q = query(
      collection(db, 'hospitals'),
      where('verified', '==', true)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: HospitalItem[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as Omit<HospitalItem, 'source'>;
          list.push({ ...data, source: 'admin' });
        });
        setVerifiedHospitals(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'hospitals');
        } catch {
          setAppError(
            'Unable to load verified clinic directory from cloud database. Live GPS & emergency tools remain active.'
          );
        }
      }
    );

    return () => unsub();
  }, []);

  const handleSaveMedicalId = (updated: MedicalID) => {
    setMedicalId(updated);
    try {
      localStorage.setItem(MEDICAL_ID_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage error
    }
  };

  const handleLanguageChange = (nextLang: Language) => {
    trackEvent('language_changed', {
      from_language: language,
      to_language: nextLang,
    });
    setLanguage(nextLang);
  };

  const handleTriggerSOS = () => {
    trackEvent('sos_triggered', { app_language: language });
    if (!('geolocation' in navigator)) {
      trackEvent('sos_location_error', { reason: 'unsupported' });
      setLocation({
        status: 'error',
        errorMessage: t.gpsErrorUnavailable,
      });
      return;
    }

    setLocation({ status: 'fetching' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const acc = pos.coords.accuracy;
        trackEvent('sos_location_resolved', {
          accuracy_bucket: acc <= 50 ? 'high' : acc <= 200 ? 'medium' : 'low',
        });
        setLocation({
          status: 'ready',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: acc,
          timestamp: new Date().toISOString(),
        });
      },
      (err) => {
        const reason =
          err.code === err.PERMISSION_DENIED ? 'permission_denied' : 'unavailable';
        trackEvent('sos_location_error', { reason });
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

  const navigateView = (view: 'home' | 'admin', sectionId?: string) => {
    setActiveView(view);
    trackPageView(view, language, sectionId);
    if (view === 'home' && sectionId) {
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectFeature = (id: FeatureActionId) => {
    trackEvent('feature_tile_clicked', {
      feature_id: id,
      app_language: language,
    });
    if (id === 'admin') {
      navigateView('admin');
      return;
    }
    if (id === 'sos') {
      handleTriggerSOS();
      navigateView('home', 'sos-section');
      return;
    }
    if (id === 'doctor') {
      navigateView('home', 'doctor-section');
      return;
    }
    if (id === 'hospitals') {
      if (location.status === 'idle') handleTriggerSOS();
      navigateView('home', 'hospitals-section');
      return;
    }
    if (id === 'ai-inform') {
      if (location.status === 'idle') handleTriggerSOS();
      setAutoInformTriggerCount((c) => c + 1);
      navigateView('home', 'hospitals-section');
      return;
    }
    if (id === 'medical-id') {
      navigateView('home', 'medical-id-section');
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-20 md:pb-8">
        {mapsQuotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        <Header
          language={language}
          onLanguageChange={handleLanguageChange}
          activeView={activeView}
          onNavigateView={navigateView}
          t={t}
        />

        {appError && (
          <div
            role="alert"
            className="bg-red-50 border-b border-red-200 text-red-900 px-4 py-2.5 text-xs sm:text-sm"
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
                <span className="truncate">{appError}</span>
              </div>
              <button
                type="button"
                onClick={() => setAppError(null)}
                className="text-red-700 font-bold hover:underline shrink-0 cursor-pointer"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
          {activeView === 'admin' ? (
            <AdminPanel
              currentUser={currentUser}
              isAdmin={isAdmin}
              language={language}
              onBackHome={() => navigateView('home')}
              t={t}
            />
          ) : (
            <>
              <div className="mb-5 sm:mb-6">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
                  Doctor Dubang
                </h1>
                <p className="text-sm text-slate-600 mt-1">{t.subtitle}</p>
              </div>

              <AllFeaturesGrid t={t} onSelectFeature={handleSelectFeature} />

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
                </div>
              </div>

              <div className="mt-6">
                <GoogleHospitalsMap
                  language={language}
                  location={location}
                  onRequestGps={handleTriggerSOS}
                  medicalId={medicalId}
                  verifiedHospitals={verifiedHospitals}
                  currentUser={currentUser}
                  autoInformTriggerCount={autoInformTriggerCount}
                  t={t}
                />
              </div>

              <footer className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 text-xs text-amber-950 leading-relaxed">
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
            </>
          )}
        </main>

        <MobileBottomBar
          activeView={activeView}
          onNavigateView={navigateView}
          t={t}
        />
      </div>
    </ErrorBoundary>
  );
}
