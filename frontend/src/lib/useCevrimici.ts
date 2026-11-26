import { useSyncExternalStore } from 'react';

function abone(geriCagir: () => void) {
  window.addEventListener('online', geriCagir);
  window.addEventListener('offline', geriCagir);
  return () => {
    window.removeEventListener('online', geriCagir);
    window.removeEventListener('offline', geriCagir);
  };
}

/** Tarayıcının bağlantı durumu (navigator.onLine). */
export function useCevrimici() {
  return useSyncExternalStore(abone, () => navigator.onLine, () => true);
}
