import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Gorev {
  id: string;
  metin: string;
}

export interface GorevKaydi {
  gorevId: string;
  gorev: string;
  sureMs: number;
  tiklama: number;
  sonuc: 'buldu' | 'yapamadi';
}

export type Asama = 'giris' | 'gorev' | 'sus' | 'sonuc';

interface CalismaDurumu {
  aktif: boolean;
  /** Rastgele katılımcı kodu: ad ve öğrenci numarası tutulmaz (KVKK, rapor R4) */
  katilimci: string;
  asama: Asama;
  gorevIndex: number;
  baslangic: number | null;
  tiklama: number;
  kayitlar: GorevKaydi[];
  susYanitlari: number[] | null;
  baslat: () => void;
  bitirCalisma: () => void;
  gorevBaslat: () => void;
  tikla: () => void;
  gorevBitir: (gorev: Gorev, sonuc: GorevKaydi['sonuc'], toplam: number) => void;
  susaGec: () => void;
  susKaydet: (yanitlar: number[]) => void;
}

export const katilimciKodu = () => `K-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const BASLANGIC = { asama: 'giris' as Asama, gorevIndex: 0, baslangic: null, tiklama: 0, kayitlar: [], susYanitlari: null };

/**
 * Kullanıcı çalışması (İP-8, FOG-08, H5) durumu. Yalnızca bu sekmede (sessionStorage) tutulur;
 * sunucuya bir şey gönderilmez, sonuç katılımcının kendisi tarafından CSV olarak indirilir.
 */
export const useCalismaStore = create<CalismaDurumu>()(
  persist(
    (set) => ({
      aktif: false,
      katilimci: '',
      ...BASLANGIC,
      baslat: () => set({ aktif: true, katilimci: katilimciKodu(), ...BASLANGIC }),
      bitirCalisma: () => set({ aktif: false, katilimci: '', ...BASLANGIC }),
      gorevBaslat: () => set({ asama: 'gorev', baslangic: Date.now(), tiklama: 0 }),
      tikla: () => set((s) => (s.asama === 'gorev' && s.baslangic ? { tiklama: s.tiklama + 1 } : s)),
      gorevBitir: (gorev, sonuc, toplam) =>
        set((s) => {
          const kayit: GorevKaydi = { gorevId: gorev.id, gorev: gorev.metin, sureMs: s.baslangic ? Date.now() - s.baslangic : 0, tiklama: s.tiklama, sonuc };
          const sonraki = s.gorevIndex + 1;
          return {
            kayitlar: [...s.kayitlar, kayit],
            gorevIndex: sonraki,
            baslangic: sonraki < toplam ? Date.now() : null,
            tiklama: 0,
            asama: sonraki < toplam ? 'gorev' : 'sus',
          };
        }),
      susaGec: () => set({ asama: 'sus', baslangic: null }),
      susKaydet: (susYanitlari) => set({ susYanitlari, asama: 'sonuc' }),
    }),
    { name: 'korteks.calisma', storage: createJSONStorage(() => sessionStorage) },
  ),
);

/**
 * SUS puanı (Brooke, 1996 [11]): tek numaralı maddelerde (yanıt − 1), çift numaralılarda (5 − yanıt);
 * toplam 2,5 ile çarpılır, sonuç 0–100 arasıdır. Rapordaki deterministik araçlardan bağımsız,
 * yalnızca değerlendirme için kullanılan bir hesaptır.
 */
export function susPuani(yanitlar: number[]): number {
  if (yanitlar.length !== 10 || yanitlar.some((y) => y < 1 || y > 5)) throw new Error('SUS için 1–5 arası 10 yanıt gerekir');
  const toplam = yanitlar.reduce((t, y, i) => t + (i % 2 === 0 ? y - 1 : 5 - y), 0);
  return toplam * 2.5;
}

export function calismaCsv(katilimci: string, kayitlar: GorevKaydi[], sus: number[] | null): string {
  const satirlar = ['katilimci;gorev_id;gorev;sure_sn;tiklama;sonuc'];
  for (const k of kayitlar) {
    const metin = /[;"\n]/.test(k.gorev) ? `"${k.gorev.replace(/"/g, '""')}"` : k.gorev;
    satirlar.push([katilimci, k.gorevId, metin, (k.sureMs / 1000).toLocaleString('tr-TR', { maximumFractionDigits: 1 }), k.tiklama, k.sonuc].join(';'));
  }
  if (sus) {
    satirlar.push('', `katilimci;${sus.map((_, i) => `sus_${i + 1}`).join(';')};sus_puani`);
    satirlar.push(`${katilimci};${sus.join(';')};${susPuani(sus).toLocaleString('tr-TR')}`);
  }
  return '﻿' + satirlar.join('\r\n');
}
