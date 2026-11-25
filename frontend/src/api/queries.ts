import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints } from './endpoints';
import type { BelgeTur, EtkinlikTur, KaynakSistem, SohbetMesaji, SoruIstegi } from './types';

/** Sorgu anahtarları tek yerde: geçersiz kılma (invalidate) hatalarını önler. */
export const qk = {
  me: ['me'] as const,
  panel: ['panel'] as const,
  senkron: ['senkron'] as const,
  dersler: ['dersler'] as const,
  ders: (kod: string) => ['dersler', kod] as const,
  notlar: ['notlar'] as const,
  devam: ['devam'] as const,
  etkinlikler: (b: string, e: string, t?: EtkinlikTur) => ['etkinlikler', b, e, t] as const,
  duyurular: ['duyurular'] as const,
  finalGerekli: (kod: string) => ['araclar', 'final', kod] as const,
  sohbetler: ['asistan', 'sohbetler'] as const,
  mesajlar: (id: number) => ['asistan', 'mesajlar', id] as const,
  yonetici: {
    belgeler: ['yonetici', 'belgeler'] as const,
    cevaplanamayan: ['yonetici', 'cevaplanamayan'] as const,
    istatistik: ['yonetici', 'istatistik'] as const,
    senkron: ['yonetici', 'senkron'] as const,
  },
};

export const usePanel = () => useQuery({ queryKey: qk.panel, queryFn: endpoints.panel });

export const useSenkronOzeti = () =>
  useQuery({ queryKey: qk.senkron, queryFn: endpoints.senkron.ozet, refetchInterval: 60_000 });

export const useDersler = () => useQuery({ queryKey: qk.dersler, queryFn: endpoints.dersler.liste });

export const useDersDetayi = (kod: string) =>
  useQuery({ queryKey: qk.ders(kod), queryFn: () => endpoints.dersler.detay(kod), enabled: !!kod });

export const useNotlar = () => useQuery({ queryKey: qk.notlar, queryFn: endpoints.notlar });
export const useDevam = () => useQuery({ queryKey: qk.devam, queryFn: endpoints.devam });

export const useEtkinlikler = (baslangic: string, bitis: string, tur?: EtkinlikTur) =>
  useQuery({
    queryKey: qk.etkinlikler(baslangic, bitis, tur),
    queryFn: () => endpoints.etkinlikler({ baslangic, bitis, tur }),
    placeholderData: keepPreviousData,
  });

export const useDuyurular = () =>
  useQuery({ queryKey: qk.duyurular, queryFn: endpoints.duyurular.liste });

export const useDuyuruOkundu = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: endpoints.duyurular.okundu,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.duyurular });
      void qc.invalidateQueries({ queryKey: qk.panel });
    },
  });
};

export const useFinalGerekli = (kod: string) =>
  useQuery({
    queryKey: qk.finalGerekli(kod),
    queryFn: () => endpoints.araclar.finalGerekli(kod),
    enabled: !!kod,
  });

export const useSohbetler = () =>
  useQuery({ queryKey: qk.sohbetler, queryFn: endpoints.asistan.sohbetler });

export const useMesajlar = (sohbetId: number | null) =>
  useQuery({
    queryKey: qk.mesajlar(sohbetId ?? -1),
    queryFn: () => endpoints.asistan.mesajlar(sohbetId as number),
    enabled: sohbetId !== null,
  });

export const useSoruSor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SoruIstegi) => endpoints.asistan.sor(body),
    onSuccess: (mesaj) => {
      qc.setQueryData<SohbetMesaji[]>(qk.mesajlar(mesaj.sohbet_id), (eski) => [
        ...(eski ?? []),
        mesaj,
      ]);
      void qc.invalidateQueries({ queryKey: qk.sohbetler });
    },
  });
};

export const useGeriBildirim = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ mesaj, deger }: { mesaj: SohbetMesaji; deger: -1 | 1 }) =>
      endpoints.asistan.geriBildirim(mesaj.id, { deger }),
    onMutate: ({ mesaj, deger }) => {
      qc.setQueryData<SohbetMesaji[]>(qk.mesajlar(mesaj.sohbet_id), (eski) =>
        eski?.map((m) => (m.id === mesaj.id ? { ...m, geri_bildirim: deger } : m)),
      );
    },
  });
};

// ---------- Yönetici ----------

export const useBelgeler = () =>
  useQuery({ queryKey: qk.yonetici.belgeler, queryFn: endpoints.yonetici.belgeler });

export const useBelgeYukle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { dosya: File; baslik: string; tur: BelgeTur }) =>
      endpoints.yonetici.belgeYukle(v.dosya, v.baslik, v.tur),
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.yonetici.belgeler }),
  });
};

export const useBelgeAktiflik = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: number; aktif_mi: boolean }) =>
      endpoints.yonetici.belgeGuncelle(v.id, { aktif_mi: v.aktif_mi }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.yonetici.belgeler }),
  });
};

export const useCevaplanamayan = () =>
  useQuery({ queryKey: qk.yonetici.cevaplanamayan, queryFn: endpoints.yonetici.cevaplanamayan });

export const useCozulduIsaretle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: endpoints.yonetici.cozuldu,
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.yonetici.cevaplanamayan }),
  });
};

export const useIstatistik = () =>
  useQuery({ queryKey: qk.yonetici.istatistik, queryFn: endpoints.yonetici.istatistik });

export const useSenkronLoglari = () =>
  useQuery({ queryKey: qk.yonetici.senkron, queryFn: endpoints.yonetici.senkronLoglari });

export const useSenkronBaslat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (s: KaynakSistem) => endpoints.yonetici.senkronBaslat(s),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.yonetici.senkron });
      void qc.invalidateQueries({ queryKey: qk.senkron });
    },
  });
};
