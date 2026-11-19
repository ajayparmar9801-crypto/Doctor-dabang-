import { useState } from 'react';
import {
  Ambulance,
  Check,
  Copy,
  ExternalLink,
  Hospital,
  MapPin,
  MessageSquare,
  PhoneCall,
  Share2,
} from 'lucide-react';
import type { GeoLocationState, MedicalID } from '../types';
import type { TranslationBundle } from '../i18n/translations';
import { trackEvent } from '../utils/analytics';

interface EmergencySosPanelProps {
  location: GeoLocationState;
  onTriggerSOS: () => void;
  medicalId: MedicalID;
  t: TranslationBundle;
}

export function EmergencySosPanel({
  location,
  onTriggerSOS,
  medicalId,
  t,
}: EmergencySosPanelProps) {
  const [showHospitalPanel, setShowHospitalPanel] = useState(false);
  const [copied, setCopied] = useState(false);

  const buildSosMessage = () => {
    const mapUrl =
      location.status === 'ready' &&
      location.lat !== undefined &&
      location.lng !== undefined
        ? `https://www.google.com/maps?q=${location.lat.toFixed(6)},${location.lng.toFixed(6)}`
        : t.sosLocationUnavailable;

    const medParts: string[] = [];
    if (medicalId.name.trim()) medParts.push(`${t.nameLabel}: ${medicalId.name.trim()}`);
    if (medicalId.bloodGroup.trim())
      medParts.push(`${t.bloodLabel}: ${medicalId.bloodGroup.trim()}`);
    if (medicalId.allergies.trim())
      medParts.push(`${t.allergyLabel}: ${medicalId.allergies.trim()}`);
    if (medicalId.emergencyContact.trim())
      medParts.push(`${t.contactLabel}: ${medicalId.emergencyContact.trim()}`);

    const medBlock =
      medParts.length > 0 ? `\n\n${t.sosMedicalHeader}\n${medParts.join('\n')}` : '';

    return `${t.sosMessagePrefix}\n${mapUrl}${medBlock}`;
  };

  const sosText = buildSosMessage();
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(sosText)}`;
  const smsUrl = `sms:?body=${encodeURIComponent(sosText)}`;

  const hasCoords =
    location.status === 'ready' &&
    location.lat !== undefined &&
    location.lng !== undefined;

  const nearestHospitalUrl = hasCoords
    ? `https://www.google.com/maps/search/emergency+hospital/@${location.lat},${location.lng},14z`
    : 'https://www.google.com/maps/search/emergency+hospital+near+me';

  const nearestAmbulanceUrl = hasCoords
    ? `https://www.google.com/maps/search/ambulance+service/@${location.lat},${location.lng},14z`
    : 'https://www.google.com/maps/search/ambulance+service+near+me';

  const handleCopySos = async () => {
    try {
      await navigator.clipboard.writeText(sosText);
      trackEvent('sos_shared', { channel: 'copy', has_gps: hasCoords });
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback ignored if clipboard restricted
    }
  };

  const handleFindHospitals = () => {
    if (location.status === 'idle') {
      onTriggerSOS();
    }
    trackEvent('sos_hospital_drawer_toggled', { has_gps: hasCoords });
    setShowHospitalPanel((prev) => !prev);
  };

  const showShareDrawer = location.status !== 'idle';

  return (
    <section id="sos-section" className="space-y-4">
      {/* Quick Emergency Dial Bar */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href="tel:108"
          onClick={() => trackEvent('emergency_call_clicked', { target: '108_ambulance' })}
          className="min-h-[52px] flex items-center justify-center gap-2.5 bg-white hover:bg-red-50 border border-red-200 text-red-700 font-semibold text-sm px-4 py-3 rounded-2xl shadow-sm active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-red-600"
        >
          <Ambulance className="w-5 h-5 shrink-0 text-red-600" aria-hidden="true" />
          <span className="truncate font-mono tabular-nums">{t.callAmbulance}</span>
        </a>
        <a
          href="tel:112"
          onClick={() => trackEvent('emergency_call_clicked', { target: '112_national' })}
          className="min-h-[52px] flex items-center justify-center gap-2.5 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-sm px-4 py-3 rounded-2xl shadow-sm active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <PhoneCall className="w-5 h-5 shrink-0 text-blue-600" aria-hidden="true" />
          <span className="truncate font-mono tabular-nums">{t.callNational}</span>
        </a>
      </div>

      {/* Primary SOS Trigger Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
        <h2 className="font-display text-lg font-bold text-slate-900">{t.sosTitle}</h2>
        <p className="text-sm text-slate-600 mt-1.5 max-w-md mx-auto leading-relaxed">
          {t.sosInstruction}
        </p>

        <div className="my-6 flex justify-center">
          <button
            type="button"
            onClick={onTriggerSOS}
            className="sos-pulse-ring w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-lg shadow-red-600/25 flex flex-col items-center justify-center transition-all cursor-pointer focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-red-600"
          >
            <span className="font-display font-extrabold text-4xl tracking-tight leading-none">
              SOS
            </span>
            <span className="text-xs font-medium mt-2 px-3 text-red-100 leading-tight">
              {t.tapHelp}
            </span>
          </button>
        </div>

        {/* Live GPS & Instant Share Panel */}
        {showShareDrawer && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-3">
            <div className="flex items-start gap-2.5">
              <MapPin
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  location.status === 'error'
                    ? 'text-amber-600'
                    : location.status === 'ready'
                      ? 'text-emerald-600'
                      : 'text-red-600'
                }`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {location.status === 'fetching' && t.gpsFetching}
                  {location.status === 'ready' && t.gpsReady}
                  {location.status === 'error' &&
                    (location.errorMessage || t.gpsErrorUnavailable)}
                </p>
                {hasCoords && (
                  <p className="text-xs text-slate-600 font-mono tabular-nums mt-1">
                    {location.lat!.toFixed(5)}, {location.lng!.toFixed(5)}
                    {location.accuracy ? (
                      <>
                        {' · '}
                        {t.gpsAccuracy}: ±{Math.round(location.accuracy)}m
                      </>
                    ) : null}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('sos_shared', { channel: 'whatsapp', has_gps: hasCoords })}
                className="min-h-[44px] bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Share2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t.whatsappSos}</span>
              </a>
              <a
                href={smsUrl}
                onClick={() => trackEvent('sos_shared', { channel: 'sms', has_gps: hasCoords })}
                className="min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t.smsAlert}</span>
              </a>
            </div>

            <button
              type="button"
              onClick={handleCopySos}
              className="w-full min-h-[40px] bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  <span className="text-emerald-700">{t.copiedToast}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.copySos}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Find Nearest Hospital & Ambulance */}
        <button
          type="button"
          onClick={handleFindHospitals}
          className="mt-4 w-full min-h-[48px] bg-blue-700 hover:bg-blue-800 active:scale-[0.99] text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <Hospital className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>{t.findHospital}</span>
        </button>

        {showHospitalPanel && (
          <div className="mt-3 p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-left space-y-2.5">
            <p className="text-xs font-semibold text-blue-900">{t.hospitalHelperTitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={nearestHospitalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('external_maps_opened', { search_type: 'emergency_hospital' })}
                className="min-h-[44px] bg-white hover:bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold px-3 py-2.5 rounded-lg flex items-center justify-between gap-2 transition-colors"
              >
                <span className="truncate">{t.openMapsHospitals}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </a>
              <a
                href={nearestAmbulanceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('external_maps_opened', { search_type: 'ambulance_service' })}
                className="min-h-[44px] bg-white hover:bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold px-3 py-2.5 rounded-lg flex items-center justify-between gap-2 transition-colors"
              >
                <span className="truncate">{t.openMapsAmbulance}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
