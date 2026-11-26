import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import dayjs from '@/lib/dayjs';

export type ErteleSecenegi = '1s' | 'yarin' | '3g';

export const ERTELE_ETIKETI: Record<ErteleSecenegi, string> = {
  '1s': '1 saat sonra',
  yarin: 'Yarın 09.00',
  '3g': '3 gün sonra',
};

/** Erteleme bitiş zamanı: 1 saat, ertesi gün 09.00 veya 3 gün (26.11.2026 kararı). */
export function erteleBitisi(secenek: ErteleSecenegi, simdi = dayjs()): number {
  switch (secenek) {
    case '1s':
      return simdi.add(1, 'hour').valueOf();
    case 'yarin':
      return simdi.add(1, 'day').hour(9).minute(0).second(0).millisecond(0).valueOf();
    case '3g':
      return simdi.add(3, 'day').valueOf();
  }
}

interface BildirimDurumu {
  /** Bildirim kimliği → okunduğu andaki imza */
  okunan: Record<string, string>;
  /** Bildirim kimliği → kapatıldığı andaki imza; imza değişirse yeniden görünür */
  kapatilan: Record<string, string>;
  /** Bildirim kimliği → erteleme bitişi (ms) */
  ertelenen: Record<string, number>;
  /** Tarayıcı bildirimi olarak gösterilenler (aynı bildirim iki kez gönderilmez) */
  gonderilen: Record<string, string>;
  /** İlk girişteki bildirim izni penceresi gösterildi mi */
  izinSoruldu: boolean;
  okundu: (id: string, imza: string) => void;
  hepsiOkundu: (liste: { id: string; imza: string }[]) => void;
  kapat: (id: string, imza: string) => void;
  ertele: (id: string, secenek: ErteleSecenegi) => void;
  gonderildi: (id: string, imza: string) => void;
  setIzinSoruldu: (v: boolean) => void;
  temizle: () => void;
}

const BOS = { okunan: {}, kapatilan: {}, ertelenen: {}, gonderilen: {} };

/**
 * Yalnızca bildirim kimlikleri ve zamanlar tutulur (içerik yok). Çıkışta silinir.
 */
export const useBildirimStore = create<BildirimDurumu>()(
  persist(
    (set) => ({
      ...BOS,
      izinSoruldu: false,
      okundu: (id, imza) => set((s) => ({ okunan: { ...s.okunan, [id]: imza } })),
      hepsiOkundu: (liste) => set((s) => ({ okunan: { ...s.okunan, ...Object.fromEntries(liste.map((b) => [b.id, b.imza])) } })),
      kapat: (id, imza) => set((s) => ({ kapatilan: { ...s.kapatilan, [id]: imza } })),
      ertele: (id, secenek) => set((s) => ({ ertelenen: { ...s.ertelenen, [id]: erteleBitisi(secenek) } })),
      gonderildi: (id, imza) => set((s) => ({ gonderilen: { ...s.gonderilen, [id]: imza } })),
      setIzinSoruldu: (izinSoruldu) => set({ izinSoruldu }),
      temizle: () => set(BOS),
    }),
    { name: 'korteks.bildirimler', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);
