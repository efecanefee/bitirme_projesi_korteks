import { useEffect, useMemo, useState } from 'react';
import dayjs from '@/lib/dayjs';
import { useDevam, useDuyurular, useEtkinlikler, useSenkronOzeti } from '@/api/queries';
import { useAyarlar } from '@/app/ayarlar';
import { useAuthStore } from '@/features/auth/authStore';
import { bildirimleriUret, type Bildirim } from './bildirimUret';
import { useBildirimStore } from './bildirimStore';

/** Dakikada bir yenilenen "şimdi": ertelemelerin süresi dolunca bildirim geri gelir. */
export function useSimdi(aralikMs = 60_000) {
  const [simdi, setSimdi] = useState(() => dayjs());
  useEffect(() => {
    const t = window.setInterval(() => setSimdi(dayjs()), aralikMs);
    return () => window.clearInterval(t);
  }, [aralikMs]);
  return simdi;
}

export interface BildirimDurumuSonucu {
  /** Ertelenmemiş tüm bildirimler (zil menüsü) */
  tumu: (Bildirim & { okundu: boolean })[];
  /** Kapatılmamış ve ertelenmemiş sınav, ödev, devam ve senkron uyarıları (Dikkat kartı) */
  dikkat: Bildirim[];
  okunmamis: number;
  yukleniyor: boolean;
}

/**
 * Bildirimleri mevcut sorgulardan türetir. Etkinlikler için yalnızca bugünden en uzak eşiğe
 * kadar olan aralık istenir; diğer sorgular panelle aynı önbelleği paylaşır.
 */
export function useBildirimler(): BildirimDurumuSonucu {
  const ogrenci = useAuthStore((s) => s.kullanici?.rol === 'ogrenci');
  const esikler = useAyarlar((s) => s.esikler);
  const simdi = useSimdi();
  const gun = simdi.format('YYYY-MM-DD');
  const ufuk = Math.max(esikler.sinavGun, esikler.odevGun);
  // Sorgu anahtarı gün içinde sabit kalsın diye aralık gün başına yuvarlanır
  const bas = useMemo(() => dayjs(gun).startOf('day').toISOString(), [gun]);
  const bit = useMemo(() => dayjs(gun).add(ufuk, 'day').endOf('day').toISOString(), [gun, ufuk]);

  const etkinlikler = useEtkinlikler(bas, bit);
  const devam = useDevam();
  const duyurular = useDuyurular();
  const senkron = useSenkronOzeti();
  const { okunan, kapatilan, ertelenen } = useBildirimStore();

  return useMemo(() => {
    if (!ogrenci) return { tumu: [], dikkat: [], okunmamis: 0, yukleniyor: false };
    const liste = bildirimleriUret({
      etkinlikler: etkinlikler.data,
      devam: devam.data,
      duyurular: duyurular.data,
      senkron: senkron.data,
      esikler,
      simdi,
    });
    const simdiMs = simdi.valueOf();
    const aktif = liste.filter((b) => (ertelenen[b.id] ?? 0) <= simdiMs);
    const tumu = aktif.map((b) => ({ ...b, okundu: okunan[b.id] === b.imza }));
    // Duyurular zaten paneldeki Duyurular kartında; Dikkat kartı tarih ve devam uyarılarına odaklanır
    const dikkat = aktif.filter((b) => kapatilan[b.id] !== b.imza && b.tur !== 'duyuru');
    return {
      tumu,
      dikkat,
      okunmamis: tumu.filter((b) => !b.okundu).length,
      yukleniyor: etkinlikler.isPending || devam.isPending,
    };
  }, [ogrenci, etkinlikler.data, etkinlikler.isPending, devam.data, devam.isPending, duyurular.data, senkron.data, esikler, simdi, okunan, kapatilan, ertelenen]);
}
