import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Uyarı eşikleri (Yağız'ın 26.11.2026 kararı). Ayarlar sayfasından değiştirilebilir. */
export interface Esikler {
  /** Sınavdan kaç gün önce uyarılsın */
  sinavGun: number;
  /** Ödev tesliminden kaç gün önce uyarılsın */
  odevGun: number;
  /** Kaç devamsızlık hakkı kalınca uyarılsın (0 kalınca her zaman kritik) */
  devamHak: number;
}

export const VARSAYILAN_ESIKLER: Esikler = { sinavGun: 14, odevGun: 5, devamHak: 2 };

interface AyarlarState {
  esikler: Esikler;
  /** Tarayıcı bildirimi kullanıcı tarafından açıldı mı (izin ayrıca tarayıcıdadır) */
  tarayiciBildirimi: boolean;
  setEsikler: (e: Partial<Esikler>) => void;
  setTarayiciBildirimi: (acik: boolean) => void;
  sifirla: () => void;
}

/**
 * Yalnızca arayüz tercihleri tutulur (kişisel veri yok); bu yüzden localStorage'da kalır.
 */
export const useAyarlar = create<AyarlarState>()(
  persist(
    (set) => ({
      esikler: VARSAYILAN_ESIKLER,
      tarayiciBildirimi: false,
      setEsikler: (e) => set((s) => ({ esikler: { ...s.esikler, ...e } })),
      setTarayiciBildirimi: (tarayiciBildirimi) => set({ tarayiciBildirimi }),
      sifirla: () => set({ esikler: VARSAYILAN_ESIKLER }),
    }),
    { name: 'korteks.ayarlar', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);

export type DevamSeviye = 'yolunda' | 'sinirda' | 'doldu';

/** Kalan devam hakkının seviyesi; panel, ders sayfası ve bildirimler aynı kuralı kullanır. */
export function devamSeviyesi(kalan: number, esik: number): DevamSeviye {
  if (kalan <= 0) return 'doldu';
  if (kalan <= esik) return 'sinirda';
  return 'yolunda';
}
