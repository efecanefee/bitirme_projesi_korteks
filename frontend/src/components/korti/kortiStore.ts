import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { SohbetMesaji } from '@/api/types';
import type { KortiState } from './KortiMascot';

interface KortiArayuzState {
  /** Paneldeki Korti kartı küçültüldü mü */
  kartKapali: boolean;
  setKartKapali: (kapali: boolean) => void;
}

/**
 * Yalnızca arayüz tercihi tutulur (kişisel veri yok), bu yüzden localStorage'da kalır;
 * sayfa yenilense de kart aynı hâlde açılır.
 */
export const useKortiStore = create<KortiArayuzState>()(
  persist(
    (set) => ({
      kartKapali: false,
      setKartKapali: (kartKapali) => set({ kartKapali }),
    }),
    { name: 'korteks.korti', storage: createJSONStorage(() => localStorage) },
  ),
);

/**
 * Korti'nin ifadesi asistan yanıtındaki mevcut alanlardan çıkarılır; sözleşmeye yeni alan
 * eklenmez. `niyet=bulunamadi` sınıflandırıcıdan gelir (FG-08), diğer yanıtlar kaynaklıdır.
 */
export function kortiDurumu(mesaj: Pick<SohbetMesaji, 'niyet'> | undefined): KortiState {
  if (!mesaj) return 'idle';
  return mesaj.niyet === 'bulunamadi' ? 'sad' : 'found';
}

/** Asistan sayfasındaki soru kutusuna odaklanma isteği (Korti düğmesinden). */
export const SORU_ODAKLA_OLAYI = 'korteks:soru-odakla';
