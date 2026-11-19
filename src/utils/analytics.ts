import type { Language } from '../types';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown> | unknown[]>;
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = (
  import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined
)?.trim();

let gaInitialized = false;

export function initGoogleAnalytics(): void {
  if (typeof window === 'undefined' || gaInitialized) return;
  gaInitialized = true;

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  }

  if (GA_MEASUREMENT_ID && /^G-[A-Z0-9]+$/i.test(GA_MEASUREMENT_ID)) {
    const existingScript = document.querySelector(
      `script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`
    );
    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
        GA_MEASUREMENT_ID
      )}`;
      document.head.appendChild(script);
    }

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false,
      anonymize_ip: true,
    });
  }
}

export function trackPageView(
  view: 'home' | 'admin',
  language: Language,
  sectionId?: string
): void {
  if (typeof window === 'undefined') return;
  initGoogleAnalytics();

  const pagePath =
    view === 'admin'
      ? '/admin'
      : sectionId
        ? `/#${sectionId}`
        : '/';
  const pageTitle =
    view === 'admin'
      ? 'Doctor Dubang - Admin Console'
      : 'Doctor Dubang - Medical SOS & AI First-Aid';

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'page_view',
    page_path: pagePath,
    page_title: pageTitle,
    app_language: language,
    app_view: view,
  });

  if (GA_MEASUREMENT_ID && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
      app_language: language,
      app_view: view,
    });
  }
}

export function trackEvent(
  eventName: string,
  params: Record<string, string | number | boolean | undefined> = {}
): void {
  if (typeof window === 'undefined') return;
  initGoogleAnalytics();

  const cleanParams: Record<string, string | number | boolean> = {};
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== '') {
      cleanParams[key] = val;
    }
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...cleanParams,
    event_timestamp: new Date().toISOString(),
  });

  if (GA_MEASUREMENT_ID && typeof window.gtag === 'function') {
    window.gtag('event', eventName, cleanParams);
  }
}
