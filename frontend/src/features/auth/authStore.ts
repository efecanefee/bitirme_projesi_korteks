import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Kullanici } from '@/api/types';

interface AuthState {
  token: string | null;
  expiresAt: number | null;
  kullanici: Kullanici | null;
  setSession: (token: string, expiresInSec: number, kullanici: Kullanici) => void;
  setKullanici: (kullanici: Kullanici) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

/**
 * Oturum bilgisi sessionStorage'da tutulur: sekme kapanınca silinir (KVKK, paylaşılan
 * bilgisayarlar). Sunucu HttpOnly yenileme çerezine geçerse yalnızca bu dosya değişir.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      expiresAt: null,
      kullanici: null,
      setSession: (token, expiresInSec, kullanici) =>
        set({ token, kullanici, expiresAt: Date.now() + expiresInSec * 1000 }),
      setKullanici: (kullanici) => set({ kullanici }),
      logout: () => set({ token: null, expiresAt: null, kullanici: null }),
      isAuthenticated: () => {
        const { token, expiresAt } = get();
        return Boolean(token && expiresAt && expiresAt > Date.now());
      },
    }),
    { name: 'korteks-oturum', storage: createJSONStorage(() => sessionStorage) },
  ),
);
