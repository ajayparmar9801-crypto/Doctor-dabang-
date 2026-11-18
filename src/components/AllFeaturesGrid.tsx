import {
  AlertCircle,
  CreditCard,
  MapPin,
  Mic,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import type { TranslationBundle } from '../i18n/translations';

export type FeatureActionId =
  | 'sos'
  | 'doctor'
  | 'hospitals'
  | 'ai-inform'
  | 'medical-id'
  | 'admin';

interface AllFeaturesGridProps {
  t: TranslationBundle;
  onSelectFeature: (id: FeatureActionId) => void;
}

export function AllFeaturesGrid({ t, onSelectFeature }: AllFeaturesGridProps) {
  const items: Array<{
    id: FeatureActionId;
    title: string;
    desc: string;
    icon: typeof AlertCircle;
    iconBg: string;
    iconText: string;
  }> = [
    {
      id: 'sos',
      title: t.featureSosTitle,
      desc: t.featureSosDesc,
      icon: AlertCircle,
      iconBg: 'bg-red-50 border-red-200',
      iconText: 'text-red-700',
    },
    {
      id: 'doctor',
      title: t.featureDoctorTitle,
      desc: t.featureDoctorDesc,
      icon: Mic,
      iconBg: 'bg-blue-50 border-blue-200',
      iconText: 'text-blue-700',
    },
    {
      id: 'hospitals',
      title: t.featureMapTitle,
      desc: t.featureMapDesc,
      icon: MapPin,
      iconBg: 'bg-emerald-50 border-emerald-200',
      iconText: 'text-emerald-700',
    },
    {
      id: 'ai-inform',
      title: t.featureAiInformTitle,
      desc: t.featureAiInformDesc,
      icon: Radio,
      iconBg: 'bg-amber-50 border-amber-200',
      iconText: 'text-amber-700',
    },
    {
      id: 'medical-id',
      title: t.featureMedIdTitle,
      desc: t.featureMedIdDesc,
      icon: CreditCard,
      iconBg: 'bg-slate-100 border-slate-200',
      iconText: 'text-slate-800',
    },
    {
      id: 'admin',
      title: t.featureAdminTitle,
      desc: t.featureAdminDesc,
      icon: ShieldCheck,
      iconBg: 'bg-indigo-50 border-indigo-200',
      iconText: 'text-indigo-700',
    },
  ];

  return (
    <section aria-label={t.featuresGridTitle} className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-sm font-bold text-slate-800">
          {t.featuresGridTitle}
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectFeature(item.id)}
              className="min-h-[84px] bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-3.5 text-left flex flex-col justify-between gap-2.5 shadow-xs active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <span
                className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconText}`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-display font-bold text-xs sm:text-sm text-slate-900 truncate">
                  {item.title}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
