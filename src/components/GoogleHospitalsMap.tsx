import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import {
  Ambulance,
  CheckCircle2,
  ExternalLink,
  Hospital,
  LocateFixed,
  MessageSquare,
  PhoneCall,
  Radio,
  Search,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type {
  GeoLocationState,
  HospitalItem,
  Language,
  MedicalID,
  UrgencyLevel,
} from '../types';
import type { TranslationBundle } from '../i18n/translations';

interface GoogleHospitalsMapProps {
  language: Language;
  location: GeoLocationState;
  onRequestGps: () => void;
  medicalId: MedicalID;
  verifiedHospitals: HospitalItem[];
  currentUser: User | null;
  autoInformTriggerCount: number;
  t: TranslationBundle;
}

const DEFAULT_CENTER = { lat: 23.0225, lng: 72.5714 }; // Ahmedabad fallback center until user grants GPS or searches

function computeDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function HospitalMarker({
  hospital,
  isSelected,
  onSelect,
  onClose,
  onAiInform,
  t,
}: {
  hospital: HospitalItem;
  isSelected: boolean;
  onSelect: () => void;
  onClose: () => void;
  onAiInform: (h: HospitalItem) => void;
  t: TranslationBundle;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: hospital.lat, lng: hospital.lng }}
        onClick={onSelect}
        title={hospital.name}
      >
        <Pin
          background={hospital.source === 'admin' ? '#dc2626' : '#1d4ed8'}
          borderColor={hospital.source === 'admin' ? '#991b1b' : '#1e3a8a'}
          glyphColor="#ffffff"
          scale={isSelected ? 1.25 : 1}
        />
      </AdvancedMarker>
      {isSelected && marker && (
        <InfoWindow anchor={marker} onCloseClick={onClose} maxWidth={260}>
          <div className="p-1 text-slate-900 space-y-1.5">
            <p className="font-bold text-xs leading-snug">{hospital.name}</p>
            <p className="text-[11px] text-slate-600 leading-snug">{hospital.address}</p>
            {hospital.phone && (
              <a
                href={`tel:${hospital.phone}`}
                className="inline-block text-[11px] font-mono font-semibold text-blue-700 hover:underline"
              >
                {hospital.phone}
              </a>
            )}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onAiInform(hospital)}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer"
              >
                {t.aiInformBtn}
              </button>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export function GoogleHospitalsMap({
  language,
  location,
  onRequestGps,
  medicalId,
  verifiedHospitals,
  currentUser,
  autoInformTriggerCount,
  t,
}: GoogleHospitalsMapProps) {
  const envMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const [mapsApiKey, setMapsApiKey] = useState<string>(envMapsKey || '');
  const [googleHospitals, setGoogleHospitals] = useState<HospitalItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(DEFAULT_CENTER);

  // AI Self-Inform Hospital state
  const [symptomNote, setSymptomNote] = useState('');
  const [isInforming, setIsInforming] = useState(false);
  const [informResult, setInformResult] = useState<{
    hospital: HospitalItem;
    dispatchBrief: string;
    urgencyLevel: UrgencyLevel;
    savedToAdmin: boolean;
  } | null>(null);

  useEffect(() => {
    if (envMapsKey) return;
    fetch('/api/maps/config')
      .then((res) => res.json())
      .then((data: { mapsApiKey?: string }) => {
        if (data.mapsApiKey) setMapsApiKey(data.mapsApiKey);
      })
      .catch(() => {
        // Ignore config fallback failure
      });
  }, [envMapsKey]);

  const fetchNearbyGoogleHospitals = useCallback(
    async (lat: number, lng: number) => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch('/api/hospitals/nearby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng, radius: 10000, language }),
        });
        const data = (await res.json()) as {
          hospitals?: HospitalItem[];
          error?: string;
          quotaExceeded?: boolean;
        };
        if (res.status === 429 || data.quotaExceeded) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          throw new Error(data.error || 'Google Maps Platform quota reached.');
        }
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load Google hospital data.');
        }
        setGoogleHospitals(data.hospitals || []);
        setMapCenter({ lat, lng });
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : 'Unable to fetch nearby hospitals.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [language]
  );

  // Automatically fetch nearby Google hospitals when live GPS resolves
  useEffect(() => {
    if (
      location.status === 'ready' &&
      location.lat !== undefined &&
      location.lng !== undefined
    ) {
      void fetchNearbyGoogleHospitals(location.lat, location.lng);
    }
  }, [location.status, location.lat, location.lng, fetchNearbyGoogleHospitals]);

  const handleSearch = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/hospitals/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          lat: location.lat,
          lng: location.lng,
          language,
        }),
      });
      const data = (await res.json()) as {
        hospitals?: HospitalItem[];
        error?: string;
        quotaExceeded?: boolean;
      };
      if (res.status === 429 || data.quotaExceeded) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        throw new Error(data.error || 'Google Maps Platform quota reached.');
      }
      if (!res.ok) {
        throw new Error(data.error || 'Failed to search Google hospitals.');
      }
      const list = data.hospitals || [];
      setGoogleHospitals(list);
      if (list[0]) {
        setMapCenter({ lat: list[0].lat, lng: list[0].lng });
        setSelectedId(list[0].id);
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to search hospitals.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Merge Admin-verified Firestore hospitals + live Google Places hospitals
  const mergedHospitals = useMemo(() => {
    const refLat = location.lat ?? mapCenter.lat;
    const refLng = location.lng ?? mapCenter.lng;

    const seenPlaceIds: Record<string, boolean> = {};
    const combined: HospitalItem[] = [];

    for (const vh of verifiedHospitals) {
      if (vh.placeId) seenPlaceIds[vh.placeId] = true;
      combined.push({
        ...vh,
        distanceKm: computeDistanceKm(refLat, refLng, vh.lat, vh.lng),
      });
    }

    for (const gh of googleHospitals) {
      if (gh.placeId && seenPlaceIds[gh.placeId]) continue;
      combined.push({
        ...gh,
        distanceKm: computeDistanceKm(refLat, refLng, gh.lat, gh.lng),
      });
    }

    combined.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    return combined;
  }, [verifiedHospitals, googleHospitals, location.lat, location.lng, mapCenter]);

  const handleAiInformHospital = useCallback(
    async (target?: HospitalItem) => {
      const chosen = target || mergedHospitals[0];
      if (!chosen) {
        onRequestGps();
        return;
      }

      setIsInforming(true);
      setErrorMsg(null);
      setSelectedId(chosen.id);
      setMapCenter({ lat: chosen.lat, lng: chosen.lng });

      const symptoms =
        symptomNote.trim() || 'Urgent medical emergency — immediate triage needed';

      try {
        const res = await fetch('/api/emergency/ai-inform', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language,
            medicalId,
            location: {
              lat: location.lat ?? chosen.lat,
              lng: location.lng ?? chosen.lng,
            },
            symptomSummary: symptoms,
            targetHospital: {
              name: chosen.name,
              phone: chosen.phone,
              address: chosen.address,
            },
          }),
        });

        const data = (await res.json()) as {
          dispatchBrief?: string;
          urgencyLevel?: UrgencyLevel;
          error?: string;
        };

        if (!res.ok || !data.dispatchBrief) {
          throw new Error(data.error || 'AI could not prepare hospital alert.');
        }

        const urgency: UrgencyLevel =
          data.urgencyLevel === 'critical' ||
          data.urgencyLevel === 'high' ||
          data.urgencyLevel === 'moderate'
            ? data.urgencyLevel
            : 'critical';

        let savedToAdmin = false;
        if (currentUser && currentUser.emailVerified) {
          const dispatchId = `disp_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 8)}`;
          const path = `emergencyDispatches/${dispatchId}`;
          try {
            await setDoc(doc(db, 'emergencyDispatches', dispatchId), {
              id: dispatchId,
              userId: currentUser.uid,
              patientName: (medicalId.name || currentUser.displayName || 'Patient').slice(
                0,
                120
              ),
              bloodGroup: (medicalId.bloodGroup || '').slice(0, 16),
              allergies: (medicalId.allergies || '').slice(0, 300),
              emergencyContact: (medicalId.emergencyContact || '').slice(0, 40),
              symptomSummary: symptoms.slice(0, 500),
              aiDispatchBrief: data.dispatchBrief.slice(0, 2000),
              urgencyLevel: urgency,
              hospitalId: chosen.id.slice(0, 128),
              hospitalName: chosen.name.slice(0, 160),
              hospitalPhone: (chosen.phone || '').slice(0, 40),
              lat: location.lat ?? chosen.lat,
              lng: location.lng ?? chosen.lng,
              language,
              status: 'sent',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            savedToAdmin = true;
          } catch (fsErr) {
            handleFirestoreError(fsErr, OperationType.CREATE, path);
          }
        }

        setInformResult({
          hospital: chosen,
          dispatchBrief: data.dispatchBrief,
          urgencyLevel: urgency,
          savedToAdmin,
        });
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : 'Unable to prepare AI hospital alert.'
        );
      } finally {
        setIsInforming(false);
      }
    },
    [
      mergedHospitals,
      symptomNote,
      language,
      medicalId,
      location.lat,
      location.lng,
      currentUser,
      onRequestGps,
    ]
  );

  // Allow home page All Features "AI Self-Inform" tile to trigger nearest hospital alert
  useEffect(() => {
    if (autoInformTriggerCount > 0 && mergedHospitals.length > 0) {
      void handleAiInformHospital(mergedHospitals[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoInformTriggerCount]);

  const cleanPhoneForWa = (phone: string) => phone.replace(/[^0-9]/g, '');

  return (
    <section
      id="hospitals-section"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <Hospital className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
            <span>{t.hospitalsSectionTitle}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {t.hospitalsSectionDesc}
          </p>
        </div>

        <button
          type="button"
          onClick={onRequestGps}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-colors"
        >
          <LocateFixed className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{t.useMyGpsBtn}</span>
        </button>
      </div>

      {/* Search & AI Self-Inform Action Bar */}
      <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleSearch();
              }}
              placeholder={t.searchCityPlaceholder}
              className="w-full min-h-[44px] bg-white border border-slate-300 rounded-xl pl-3.5 pr-10 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
            />
            <Search
              className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={isLoading}
            className="min-h-[44px] px-5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors disabled:opacity-50 shrink-0"
          >
            {t.searchHospitalsBtn}
          </button>
        </div>

        {/* AI Self-Inform Emergency Dispatch Bar */}
        <div className="flex flex-col md:flex-row gap-2.5 pt-1">
          <input
            type="text"
            value={symptomNote}
            onChange={(e) => setSymptomNote(e.target.value)}
            placeholder={t.aiInformSymptomPlaceholder}
            className="flex-1 min-h-[44px] bg-white border border-red-200 rounded-xl px-3.5 text-sm text-slate-900 focus:outline-none focus:border-red-600"
          />
          <button
            type="button"
            onClick={() => void handleAiInformHospital()}
            disabled={isInforming || mergedHospitals.length === 0}
            className="min-h-[44px] px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            <Radio className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{isInforming ? t.aiInforming : t.aiInformNearestBtn}</span>
          </button>
        </div>

        {errorMsg && (
          <p role="alert" className="text-xs font-medium text-red-700">
            {errorMsg}
          </p>
        )}
      </div>

      {/* AI Generated Hospital Dispatch Alert Result */}
      {informResult && (
        <div className="m-4 sm:m-5 p-4 rounded-xl bg-red-50 border border-red-200 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2
                className="w-5 h-5 text-red-700 mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="font-display font-bold text-sm text-red-950">
                  {t.aiInformSuccess} · {informResult.hospital.name}
                </p>
                <p className="text-xs text-red-800 mt-0.5">
                  {informResult.savedToAdmin ? t.dispatchLogSaved : t.dispatchLocalOnly}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setInformResult(null)}
              className="text-xs font-semibold text-red-800 hover:underline cursor-pointer"
            >
              ×
            </button>
          </div>

          <div className="bg-white border border-red-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-900 whitespace-pre-line leading-relaxed">
            {informResult.dispatchBrief}
          </div>

          <div className="flex flex-wrap gap-2">
            {informResult.hospital.phone && (
              <a
                href={`tel:${informResult.hospital.phone}`}
                className="min-h-[40px] px-3.5 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {t.callHospitalBtn} ({informResult.hospital.phone})
                </span>
              </a>
            )}
            <a
              href={`https://wa.me/${
                informResult.hospital.phone
                  ? cleanPhoneForWa(informResult.hospital.phone)
                  : ''
              }?text=${encodeURIComponent(informResult.dispatchBrief)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[40px] px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.sendHospitalWhatsApp}</span>
            </a>
            <a
              href={`sms:${informResult.hospital.phone || ''}?body=${encodeURIComponent(
                informResult.dispatchBrief
              )}`}
              className="min-h-[40px] px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.sendHospitalSms}</span>
            </a>
          </div>
        </div>
      )}

      {/* Map + Live Hospital List Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 h-[340px] lg:h-[440px] bg-slate-100 relative">
          {mapsApiKey ? (
            <APIProvider
              apiKey={mapsApiKey}
              language={language}
              libraries={['marker']}
            >
              <GoogleMap
                defaultCenter={mapCenter}
                center={mapCenter}
                defaultZoom={13}
                mapId="DEMO_MAP_ID"
                gestureHandling="greedy"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
              >
                {location.status === 'ready' &&
                  location.lat !== undefined &&
                  location.lng !== undefined && (
                    <AdvancedMarker
                      position={{ lat: location.lat, lng: location.lng }}
                      title="Your Live GPS Location"
                    >
                      <Pin
                        background="#0f172a"
                        borderColor="#ffffff"
                        glyphColor="#ffffff"
                        scale={0.95}
                      />
                    </AdvancedMarker>
                  )}

                {mergedHospitals.map((hospital) => (
                  <HospitalMarker
                    key={hospital.id}
                    hospital={hospital}
                    isSelected={selectedId === hospital.id}
                    onSelect={() => {
                      setSelectedId(hospital.id);
                      setMapCenter({ lat: hospital.lat, lng: hospital.lng });
                    }}
                    onClose={() => setSelectedId(null)}
                    onAiInform={(h) => void handleAiInformHospital(h)}
                    t={t}
                  />
                ))}
              </GoogleMap>
            </APIProvider>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-600 space-y-2">
              <Hospital className="w-8 h-8 text-slate-400" aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-800">
                {t.loadingHospitals}
              </p>
            </div>
          )}
        </div>

        {/* Scrollable Hospital Results List */}
        <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-200 h-[360px] lg:h-[440px] overflow-y-auto divide-y divide-slate-200">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-slate-600">
              {t.loadingHospitals}
            </div>
          ) : mergedHospitals.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-600">
              {t.noHospitalsFound}
            </div>
          ) : (
            mergedHospitals.map((h) => {
              const selected = selectedId === h.id;
              const mapsLink =
                h.googleMapsUri ||
                `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`;

              return (
                <div
                  key={h.id}
                  className={`p-4 transition-colors ${
                    selected ? 'bg-blue-50/70' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(h.id);
                        setMapCenter({ lat: h.lat, lng: h.lng });
                      }}
                      className="text-left min-w-0 flex-1 cursor-pointer"
                    >
                      <p className="font-display font-bold text-sm text-slate-900 leading-snug">
                        {h.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                        {h.source === 'admin' ? (
                          <span className="inline-flex items-center gap-1 text-red-700 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                            {t.verifiedCenterLabel}
                          </span>
                        ) : (
                          <span className="text-blue-700 font-medium">
                            {t.googlePlacesLabel}
                          </span>
                        )}
                        {h.distanceKm !== undefined && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {h.distanceKm.toFixed(1)} km
                            </span>
                          </>
                        )}
                        {h.emergency24x7 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{t.emergency24x7Label}</span>
                          </>
                        )}
                        {h.icuBedsAvailable > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              {t.icuBedsLabel}: {h.icuBedsAvailable}
                            </span>
                          </>
                        )}
                      </p>
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {h.address}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => void handleAiInformHospital(h)}
                      disabled={isInforming}
                      className="min-h-[36px] px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Ambulance className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t.aiInformBtn}</span>
                    </button>

                    {h.phone && (
                      <a
                        href={`tel:${h.phone}`}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-semibold inline-flex items-center gap-1.5"
                      >
                        <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{h.phone}</span>
                      </a>
                    )}

                    <a
                      href={mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium inline-flex items-center gap-1"
                    >
                      <span>{t.directionsBtn}</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
