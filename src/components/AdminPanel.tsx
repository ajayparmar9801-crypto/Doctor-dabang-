import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Hospital,
  LogIn,
  LogOut,
  Plus,
  Radio,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import type {
  DispatchStatus,
  EmergencyDispatchRecord,
  HospitalCategory,
  HospitalItem,
  Language,
} from '../types';
import type { TranslationBundle } from '../i18n/translations';
import { trackEvent } from '../utils/analytics';

interface AdminPanelProps {
  currentUser: User | null;
  isAdmin: boolean;
  language: Language;
  onBackHome: () => void;
  t: TranslationBundle;
}

interface HospitalFormState {
  id: string;
  placeId: string;
  name: string;
  category: HospitalCategory;
  address: string;
  phone: string;
  lat: string;
  lng: string;
  icuBedsAvailable: string;
  emergency24x7: boolean;
  ambulanceAvailable: boolean;
  verified: boolean;
  googleMapsUri: string;
}

const EMPTY_FORM: HospitalFormState = {
  id: '',
  placeId: '',
  name: '',
  category: 'hospital',
  address: '',
  phone: '',
  lat: '23.0225',
  lng: '72.5714',
  icuBedsAvailable: '10',
  emergency24x7: true,
  ambulanceAvailable: true,
  verified: true,
  googleMapsUri: '',
};

export function AdminPanel({
  currentUser,
  isAdmin,
  language,
  onBackHome,
  t,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dispatches' | 'hospitals'>('dispatches');
  const [dispatches, setDispatches] = useState<EmergencyDispatchRecord[]>([]);
  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Google Places Import search inside Admin Panel
  const [googleSearch, setGoogleSearch] = useState('');
  const [googleResults, setGoogleResults] = useState<HospitalItem[]>([]);
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);

  // Manual Add / Edit Hospital Form
  const [form, setForm] = useState<HospitalFormState>(EMPTY_FORM);
  const [isSavingHospital, setIsSavingHospital] = useState(false);

  useEffect(() => {
    if (!currentUser || !isAdmin) {
      setDispatches([]);
      setHospitals([]);
      return;
    }

    const dispQuery = query(
      collection(db, 'emergencyDispatches'),
      orderBy('createdAt', 'desc')
    );
    const unsubDisp = onSnapshot(
      dispQuery,
      (snap) => {
        const list: EmergencyDispatchRecord[] = [];
        snap.forEach((docSnap) => {
          list.push(docSnap.data() as EmergencyDispatchRecord);
        });
        setDispatches(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'emergencyDispatches');
        } catch {
          setActionError('Permission denied or failed to load live emergency dispatches.');
        }
      }
    );

    const hospQuery = query(collection(db, 'hospitals'));
    const unsubHosp = onSnapshot(
      hospQuery,
      (snap) => {
        const list: HospitalItem[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as Omit<HospitalItem, 'source'>;
          list.push({ ...d, source: 'admin' });
        });
        setHospitals(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'hospitals');
        } catch {
          setActionError('Permission denied or failed to load hospital directory.');
        }
      }
    );

    return () => {
      unsubDisp();
      unsubHosp();
    };
  }, [currentUser, isAdmin]);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      trackEvent('admin_sign_in', { method: 'google' });
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google sign-in failed.');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleSearchGoogleForImport = async () => {
    const q = googleSearch.trim();
    if (!q) return;
    setIsSearchingGoogle(true);
    setActionMsg(null);
    setActionError(null);
    try {
      const res = await fetch('/api/hospitals/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, language }),
      });
      const data = (await res.json()) as {
        hospitals?: HospitalItem[];
        error?: string;
        quotaExceeded?: boolean;
      };
      if (res.status === 429 || data.quotaExceeded) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        throw new Error(data.error || 'Google Maps quota reached.');
      }
      if (!res.ok) throw new Error(data.error || 'Search failed.');
      setGoogleResults(data.hospitals || []);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Google search error.');
    } finally {
      setIsSearchingGoogle(false);
    }
  };

  const importGoogleHospital = async (item: HospitalItem) => {
    if (!currentUser) return;
    setActionError(null);
    const safeId = `hosp_${(item.placeId || item.id)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 80)}`;
    const path = `hospitals/${safeId}`;
    try {
      await setDoc(doc(db, 'hospitals', safeId), {
        id: safeId,
        placeId: (item.placeId || '').slice(0, 256),
        name: item.name.slice(0, 160),
        category: item.category,
        address: item.address.slice(0, 300),
        phone: (item.phone || '').slice(0, 40),
        lat: Number(item.lat),
        lng: Number(item.lng),
        emergency24x7: Boolean(item.emergency24x7),
        ambulanceAvailable: Boolean(item.ambulanceAvailable),
        icuBedsAvailable: Math.max(0, Math.min(5000, Number(item.icuBedsAvailable) || 0)),
        verified: true,
        googleMapsUri: (item.googleMapsUri || '').slice(0, 500),
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setActionMsg(`Imported "${item.name}" to verified directory.`);
      trackEvent('admin_hospital_imported', { category: item.category });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, path);
      } catch {
        setActionError(`Failed to import "${item.name}". Verify admin permissions.`);
      }
    }
  };

  const handleSaveHospitalForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !form.name.trim() || !form.address.trim()) return;
    setIsSavingHospital(true);
    setActionMsg(null);
    setActionError(null);

    const isUpdate = Boolean(form.id);
    const targetId =
      form.id ||
      `hosp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const path = `hospitals/${targetId}`;

    const latVal = Number(form.lat);
    const lngVal = Number(form.lng);
    const icuVal = Math.max(0, Math.min(5000, parseInt(form.icuBedsAvailable, 10) || 0));

    try {
      if (isUpdate) {
        await updateDoc(doc(db, 'hospitals', targetId), {
          placeId: form.placeId.trim().slice(0, 256),
          name: form.name.trim().slice(0, 160),
          category: form.category,
          address: form.address.trim().slice(0, 300),
          phone: form.phone.trim().slice(0, 40),
          lat: Number.isFinite(latVal) ? latVal : 23.0225,
          lng: Number.isFinite(lngVal) ? lngVal : 72.5714,
          emergency24x7: form.emergency24x7,
          ambulanceAvailable: form.ambulanceAvailable,
          icuBedsAvailable: icuVal,
          verified: form.verified,
          googleMapsUri: form.googleMapsUri.trim().slice(0, 500),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(doc(db, 'hospitals', targetId), {
          id: targetId,
          placeId: form.placeId.trim().slice(0, 256),
          name: form.name.trim().slice(0, 160),
          category: form.category,
          address: form.address.trim().slice(0, 300),
          phone: form.phone.trim().slice(0, 40),
          lat: Number.isFinite(latVal) ? latVal : 23.0225,
          lng: Number.isFinite(lngVal) ? lngVal : 72.5714,
          emergency24x7: form.emergency24x7,
          ambulanceAvailable: form.ambulanceAvailable,
          icuBedsAvailable: icuVal,
          verified: form.verified,
          googleMapsUri: form.googleMapsUri.trim().slice(0, 500),
          createdBy: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setForm(EMPTY_FORM);
      setActionMsg(`Saved "${form.name.trim()}" successfully.`);
      trackEvent('admin_hospital_saved', {
        mode: isUpdate ? 'update' : 'create',
        category: form.category,
        verified: form.verified,
      });
    } catch (err) {
      try {
        handleFirestoreError(
          err,
          isUpdate ? OperationType.UPDATE : OperationType.CREATE,
          path
        );
      } catch {
        setActionError('Failed to save hospital. Check admin permissions and field values.');
      }
    } finally {
      setIsSavingHospital(false);
    }
  };

  const handleToggleVerified = async (h: HospitalItem) => {
    setActionError(null);
    const path = `hospitals/${h.id}`;
    try {
      await updateDoc(doc(db, 'hospitals', h.id), {
        verified: !h.verified,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, path);
      } catch {
        setActionError('Could not update verification status.');
      }
    }
  };

  const handleDeleteHospital = async (hospitalId: string) => {
    setActionError(null);
    const path = `hospitals/${hospitalId}`;
    try {
      await deleteDoc(doc(db, 'hospitals', hospitalId));
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, path);
      } catch {
        setActionError('Could not delete hospital record.');
      }
    }
  };

  const handleUpdateDispatchStatus = async (
    dispatchId: string,
    status: DispatchStatus
  ) => {
    setActionError(null);
    const path = `emergencyDispatches/${dispatchId}`;
    try {
      await updateDoc(doc(db, 'emergencyDispatches', dispatchId), {
        status,
        updatedAt: serverTimestamp(),
      });
      trackEvent('admin_dispatch_status_updated', { new_status: status });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, path);
      } catch {
        setActionError('Could not update dispatch status.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb / Action Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBackHome}
            className="text-xs font-semibold text-blue-700 hover:underline inline-flex items-center gap-1.5 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.backToHome}</span>
          </button>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-indigo-700 shrink-0" aria-hidden="true" />
            <span>{t.adminTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">{t.adminSubtitle}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] text-slate-500">{t.signedInAs}</p>
                <p className="text-xs font-semibold text-slate-900">
                  {currentUser.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>{t.signOutBtn}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void handleSignIn()}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>{t.signInGoogle}</span>
            </button>
          )}
        </div>
      </div>

      {authError && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-800"
        >
          {authError}
        </div>
      )}

      {/* Auth / Role Gate */}
      {!currentUser || !isAdmin ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            {t.adminAccessRequired}
          </h2>
          {currentUser && (
            <p className="text-xs text-slate-600">
              {t.signedInAs} <span className="font-semibold">{currentUser.email}</span>
            </p>
          )}
          {!currentUser && (
            <button
              type="button"
              onClick={() => void handleSignIn()}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>{t.signInGoogle}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Segmented Tabs */}
          <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('dispatches')}
              className={`min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'dispatches'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="w-4 h-4 text-red-600" aria-hidden="true" />
              <span>{t.tabDispatches}</span>
              <span className="font-mono tabular-nums text-xs text-slate-500">
                ({dispatches.length})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hospitals')}
              className={`min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'hospitals'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Hospital className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              <span>{t.tabHospitals}</span>
              <span className="font-mono tabular-nums text-xs text-slate-500">
                ({hospitals.length})
              </span>
            </button>
          </div>

          {actionError && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs font-semibold text-red-800 flex items-center justify-between gap-2"
            >
              <span>{actionError}</span>
              <button
                type="button"
                onClick={() => setActionError(null)}
                className="font-bold hover:underline cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          {actionMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs font-semibold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{actionMsg}</span>
            </div>
          )}

          {/* TAB 1: LIVE DISPATCHES */}
          {activeTab === 'dispatches' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {dispatches.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  {t.noDispatchesYet}
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {dispatches.map((d) => (
                    <div key={d.id} className="p-5 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-display font-bold text-base text-slate-900">
                            {d.patientName} ·{' '}
                            <span className="text-red-700 font-mono">
                              {d.bloodGroup || 'Unknown Blood'}
                            </span>
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            {d.hospitalName}
                            {d.hospitalPhone ? ` · ${d.hospitalPhone}` : ''}
                            {' · '}
                            <span className="font-mono tabular-nums">
                              {d.lat.toFixed(4)}, {d.lng.toFixed(4)}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-red-700">
                            {d.urgencyLevel}
                          </span>
                          <select
                            value={d.status}
                            onChange={(e) =>
                              void handleUpdateDispatchStatus(
                                d.id,
                                e.target.value as DispatchStatus
                              )
                            }
                            className="min-h-[36px] border border-slate-300 rounded-lg px-2.5 text-xs font-semibold bg-white text-slate-900 cursor-pointer"
                          >
                            <option value="sent">{t.statusSent}</option>
                            <option value="acknowledged">{t.statusAcknowledged}</option>
                            <option value="ambulance_dispatched">
                              {t.statusDispatched}
                            </option>
                            <option value="resolved">{t.statusResolved}</option>
                          </select>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 whitespace-pre-line">
                        {d.aiDispatchBrief}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HOSPITAL DIRECTORY & GOOGLE IMPORT */}
          {activeTab === 'hospitals' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Google Import + Manual Form */}
              <div className="lg:col-span-5 space-y-6">
                {/* Import from Google Maps */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <h2 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-700" aria-hidden="true" />
                    <span>{t.importFromGoogle}</span>
                  </h2>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={googleSearch}
                      onChange={(e) => setGoogleSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') void handleSearchGoogleForImport();
                      }}
                      placeholder={t.searchCityPlaceholder}
                      className="flex-1 min-h-[42px] border border-slate-300 rounded-xl px-3 text-xs sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => void handleSearchGoogleForImport()}
                      disabled={isSearchingGoogle}
                      className="min-h-[42px] px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer"
                    >
                      {t.searchHospitalsBtn}
                    </button>
                  </div>

                  {googleResults.length > 0 && (
                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-200 border border-slate-200 rounded-xl">
                      {googleResults.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 flex items-start justify-between gap-2 bg-white"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {item.address}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => void importGoogleHospital(item)}
                            className="min-h-[34px] px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold shrink-0 cursor-pointer inline-flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Import</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add / Edit Hospital Form */}
                <form
                  onSubmit={(e) => void handleSaveHospitalForm(e)}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3"
                >
                  <h2 className="font-display font-bold text-sm text-slate-900">
                    {t.addManualHospital}
                  </h2>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">
                        {t.hospitalNameLabel}
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full min-h-[40px] border border-slate-300 rounded-xl px-3 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-medium text-slate-600 mb-1">
                          {t.hospitalCategoryLabel}
                        </label>
                        <select
                          value={form.category}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              category: e.target.value as HospitalCategory,
                            })
                          }
                          className="w-full min-h-[40px] border border-slate-300 rounded-xl px-2.5 text-sm bg-white"
                        >
                          <option value="hospital">Hospital</option>
                          <option value="health_center">Health Center</option>
                          <option value="trauma_center">Trauma Center</option>
                          <option value="clinic">Clinic</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-medium text-slate-600 mb-1">
                          {t.icuBedsInputLabel}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={5000}
                          value={form.icuBedsAvailable}
                          onChange={(e) =>
                            setForm({ ...form, icuBedsAvailable: e.target.value })
                          }
                          className="w-full min-h-[40px] border border-slate-300 rounded-xl px-3 text-sm font-mono tabular-nums"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1">
                        {t.hospitalAddressLabel}
                      </label>
                      <input
                        type="text"
                        required
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="w-full min-h-[40px] border border-slate-300 rounded-xl px-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-600 mb-1">
                        {t.hospitalPhoneLabel}
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full min-h-[40px] border border-slate-300 rounded-xl px-3 text-sm font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-medium text-slate-600 mb-1">
                          {t.hospitalLatLabel}
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={form.lat}
                          onChange={(e) => setForm({ ...form, lat: e.target.value })}
                          className="w-full min-h-[40px] border border-slate-300 rounded-xl px-3 text-sm font-mono tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-600 mb-1">
                          {t.hospitalLngLabel}
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={form.lng}
                          onChange={(e) => setForm({ ...form, lng: e.target.value })}
                          className="w-full min-h-[40px] border border-slate-300 rounded-xl px-3 text-sm font-mono tabular-nums"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-1">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.emergency24x7}
                          onChange={(e) =>
                            setForm({ ...form, emergency24x7: e.target.checked })
                          }
                        />
                        <span>{t.emergency24x7Label}</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.ambulanceAvailable}
                          onChange={(e) =>
                            setForm({ ...form, ambulanceAvailable: e.target.checked })
                          }
                        />
                        <span>{t.ambulanceReadyLabel}</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.verified}
                          onChange={(e) =>
                            setForm({ ...form, verified: e.target.checked })
                          }
                        />
                        <span>{t.verifiedLabel}</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isSavingHospital}
                      className="flex-1 min-h-[42px] bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl cursor-pointer"
                    >
                      {t.saveHospitalBtn}
                    </button>
                    {form.id && (
                      <button
                        type="button"
                        onClick={() => setForm(EMPTY_FORM)}
                        className="min-h-[42px] px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right: Saved Verified Hospitals List */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    {t.tabHospitals}
                  </h3>
                  <span className="text-xs font-mono tabular-nums text-slate-500">
                    {hospitals.length}
                  </span>
                </div>

                {hospitals.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    {t.noHospitalsFound}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {hospitals.map((h) => (
                      <div
                        key={h.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-display font-bold text-sm text-slate-900">
                            {h.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {h.address}
                          </p>
                          <p className="text-xs text-slate-600 mt-1 font-mono tabular-nums">
                            {h.phone || '—'} · ICU: {h.icuBedsAvailable} ·{' '}
                            <span
                              className={
                                h.verified ? 'text-emerald-700 font-semibold' : 'text-amber-700'
                              }
                            >
                              {h.verified ? t.verifiedLabel : t.pendingLabel}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => void handleToggleVerified(h)}
                            className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-800 cursor-pointer"
                          >
                            {h.verified ? t.pendingLabel : t.verifiedLabel}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setForm({
                                id: h.id,
                                placeId: h.placeId || '',
                                name: h.name,
                                category: h.category,
                                address: h.address,
                                phone: h.phone,
                                lat: String(h.lat),
                                lng: String(h.lng),
                                icuBedsAvailable: String(h.icuBedsAvailable),
                                emergency24x7: h.emergency24x7,
                                ambulanceAvailable: h.ambulanceAvailable,
                                verified: h.verified,
                                googleMapsUri: h.googleMapsUri || '',
                              })
                            }
                            aria-label="Edit hospital"
                            className="min-h-[36px] min-w-[36px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteHospital(h.id)}
                            aria-label={t.deleteBtn}
                            className="min-h-[36px] min-w-[36px] rounded-lg bg-red-50 hover:bg-red-100 text-red-700 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
