import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TurDurumu {
  /** Tur bir kez bitirildi ya da atlandı mı (bir daha kendiliğinden açılmaz) */
  tamamlandi: boolean;
  acik: boolean;
  adim: number;
  baslat: () => void;
  git: (adim: number) => void;
  kapat: () => void;
}

/** Tanıtım turu durumu; yalnızca arayüz tercihi (kişisel veri yok). */
export const useTurStore = create<TurDurumu>()(
  persist(
    (set) => ({
      tamamlandi: false,
      acik: false,
      adim: 0,
      baslat: () => set({ acik: true, adim: 0 }),
      git: (adim) => set({ adim }),
      kapat: () => set({ acik: false, adim: 0, tamamlandi: true }),
    }),
    { name: 'korteks.tur', storage: createJSONStorage(() => localStorage), partialize: (s) => ({ tamamlandi: s.tamamlandi }) },
  ),
);
