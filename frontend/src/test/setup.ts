import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './server';
import { useAuthStore } from '@/features/auth/authStore';
import '@/lib/dayjs';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  useAuthStore.getState().logout();
  sessionStorage.clear();
});
afterAll(() => server.close());

// jsdom'da olmayan tarayıcı API'leri
window.matchMedia ??= ((query: string) => ({
  matches: query.includes('min-width:1200px') || query.includes('min-width:900px'),
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;
Element.prototype.scrollTo ??= function () {};
