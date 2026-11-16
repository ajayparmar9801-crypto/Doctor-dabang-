import { useState, type FormEvent } from 'react';
import { CheckCircle2, CreditCard, Edit3, Phone, Save } from 'lucide-react';
import type { MedicalID } from '../types';
import type { TranslationBundle } from '../i18n/translations';

interface MedicalIdCardProps {
  medicalId: MedicalID;
  onSave: (updated: MedicalID) => void;
  t: TranslationBundle;
}

export function MedicalIdCard({ medicalId, onSave, t }: MedicalIdCardProps) {
  const hasSavedInfo = Boolean(
    medicalId.name.trim() ||
      medicalId.bloodGroup.trim() ||
      medicalId.emergencyContact.trim() ||
      medicalId.allergies.trim()
  );

  const [isEditing, setIsEditing] = useState(!hasSavedInfo);
  const [draft, setDraft] = useState<MedicalID>(medicalId);
  const [savedToast, setSavedToast] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned: MedicalID = {
      name: draft.name.trim(),
      bloodGroup: draft.bloodGroup.trim(),
      emergencyContact: draft.emergencyContact.trim(),
      allergies: draft.allergies.trim(),
      updatedAt: new Date().toISOString(),
    };
    onSave(cleaned);
    setIsEditing(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <section
      id="medical-id-section"
      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-red-600 shrink-0" aria-hidden="true" />
            <span>{t.medicalIdTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">{t.medicalIdOfflineNote}</p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setDraft(medicalId);
              setIsEditing(true);
            }}
            className="min-h-[40px] px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.editBtn}</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {t.nameLabel}
              </label>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder={t.namePlaceholder}
                className="w-full min-h-[44px] border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {t.bloodLabel}
              </label>
              <input
                type="text"
                value={draft.bloodGroup}
                onChange={(e) => setDraft({ ...draft, bloodGroup: e.target.value })}
                placeholder={t.bloodPlaceholder}
                className="w-full min-h-[44px] border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {t.contactLabel}
              </label>
              <input
                type="tel"
                value={draft.emergencyContact}
                onChange={(e) =>
                  setDraft({ ...draft, emergencyContact: e.target.value })
                }
                placeholder={t.contactPlaceholder}
                className="w-full min-h-[44px] border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono tabular-nums text-slate-900 bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {t.allergyLabel}
              </label>
              <input
                type="text"
                value={draft.allergies}
                onChange={(e) => setDraft({ ...draft, allergies: e.target.value })}
                placeholder={t.allergyPlaceholder}
                className="w-full min-h-[44px] border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            <span>{t.saveBtn}</span>
          </button>
        </form>
      ) : (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-slate-500">{t.nameLabel}</p>
              <p className="font-semibold text-slate-900 mt-0.5">
                {medicalId.name || t.notProvided}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{t.bloodLabel}</p>
              <p className="font-mono font-bold text-red-700 mt-0.5 tabular-nums">
                {medicalId.bloodGroup || t.notProvided}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-slate-500">{t.contactLabel}</p>
              {medicalId.emergencyContact ? (
                <a
                  href={`tel:${medicalId.emergencyContact}`}
                  className="inline-flex items-center gap-1.5 font-mono font-semibold text-blue-700 hover:underline mt-0.5 tabular-nums"
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{medicalId.emergencyContact}</span>
                </a>
              ) : (
                <p className="font-medium text-slate-700 mt-0.5">{t.notProvided}</p>
              )}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-slate-500">{t.allergyLabel}</p>
              <p className="font-medium text-slate-900 mt-0.5">
                {medicalId.allergies || t.notProvided}
              </p>
            </div>
          </div>
        </div>
      )}

      {savedToast && (
        <p className="mt-3 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{t.saveToast}</span>
        </p>
      )}
    </section>
  );
}
