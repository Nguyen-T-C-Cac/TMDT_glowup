import { useState, useEffect } from 'react';

let cachedScript: HTMLScriptElement | null = null;
let cachedLoaded = false;
let cachedError = false;
const listeners: Array<(ok: boolean) => void> = [];

function notifyAll(ok: boolean) {
  cachedLoaded = ok;
  cachedError = !ok;
  for (const fn of listeners) fn(ok);
  listeners.length = 0;
}

export function useGoogleMaps() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const [state, setState] = useState<{ isLoaded: boolean; loadError: boolean }>(() => ({
    isLoaded: cachedLoaded,
    loadError: cachedError,
  }));

  useEffect(() => {
    if (cachedLoaded || cachedError || !apiKey) {
      if (!apiKey) setState({ isLoaded: false, loadError: true });
      return;
    }

    if (cachedScript) {
      listeners.push((ok) => setState({ isLoaded: ok, loadError: !ok }));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsCallback`;
    script.async = true;
    script.defer = true;

    (window as any).initGoogleMapsCallback = () => {
      notifyAll(true);
    };

    script.onerror = () => {
      notifyAll(false);
    };

    cachedScript = script;
    document.head.appendChild(script);

    listeners.push((ok) => setState({ isLoaded: ok, loadError: !ok }));

    return () => {
      const idx = listeners.indexOf((ok) => setState({ isLoaded: ok, loadError: !ok }));
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }, [apiKey]);

  return { ...state, apiKey };
}
