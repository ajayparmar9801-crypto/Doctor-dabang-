import { AlertCircle, MapPin, ShieldCheck, Stethoscope } from 'lucide-react';
import type { TranslationBundle } from '../i18n/translations';

interface MobileBottomBarProps {
  activeView: 'home' | 'admin';
  onNavigateView: (view: 'home' | 'admin', sectionId?: string) => void;
  t: TranslationBundle;
}

export function MobileBottomBar({
  activeView,
  onNavigateView,
  t,
}: MobileBottomBarProps) {
  return (
    <nav
      aria-label="Mobile Quick Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-4 items-center px-1"
    >
      <button
        type="button"
        onClick={() => onNavigateView('home', 'sos-section')}
        className={`flex flex-col items-center justify-center h-full cursor-pointer ${
          activeView === 'home' ? 'text-red-700 font-semibold' : 'text-slate-600'
        }`}
      >
        <AlertCircle className="w-5 h-5" aria-hidden="true" />
        <span className="text-[11px] mt-0.5 whitespace-nowrap">{t.mobileNavSos}</span>
      </button>
      <button
        type="button"
        onClick={() => onNavigateView('home', 'hospitals-section')}
        className="flex flex-col items-center justify-center h-full text-emerald-700 font-semibold cursor-pointer"
      >
        <MapPin className="w-5 h-5" aria-hidden="true" />
        <span className="text-[11px] mt-0.5 whitespace-nowrap">{t.mobileNavMap}</span>
      </button>
      <button
        type="button"
        onClick={() => onNavigateView('home', 'doctor-section')}
        className="flex flex-col items-center justify-center h-full text-blue-700 font-semibold cursor-pointer"
      >
        <Stethoscope className="w-5 h-5" aria-hidden="true" />
        <span className="text-[11px] mt-0.5 whitespace-nowrap">{t.mobileNavDoctor}</span>
      </button>
      <button
        type="button"
        onClick={() => onNavigateView('admin')}
        className={`flex flex-col items-center justify-center h-full cursor-pointer ${
          activeView === 'admin' ? 'text-indigo-700 font-semibold' : 'text-slate-700 font-medium'
        }`}
      >
        <ShieldCheck className="w-5 h-5" aria-hidden="true" />
        <span className="text-[11px] mt-0.5 whitespace-nowrap">{t.mobileNavAdmin}</span>
      </button>
    </nav>
  );
}
