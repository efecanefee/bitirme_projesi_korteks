import { api } from './client';
import type {
  Belge,
  CevaplanamayanSoru,
  DersDetayi,
  DersKaydi,
  DevamOzeti,
  Degerlendirme,
  Duyuru,
  Etkinlik,
  EtkinlikTur,
  FinalGerekliSonuc,
  GeriBildirimIstegi,
  GirisIstegi,
  Kullanici,
  PanelOzeti,
  SenkronLog,
  SenkronOzeti,
  Sohbet,
  SohbetMesaji,
  SoruIstegi,
  TokenYaniti,
  YoneticiIstatistik,
  RizaIstegi,
  BelgeTur,
  KaynakSistem,
} from './types';

/** Endpoint listesi docs/openapi.yaml ile aynıdır; değişiklikler iki yerde birlikte yapılır. */
export const endpoints = {
  auth: {
    login: (body: GirisIstegi) =>
      api<TokenYaniti>('/auth/login', { method: 'POST', body: { ...body } }),
    me: () => api<Kullanici>('/auth/me'),
    logout: () => api<void>('/auth/logout', { method: 'POST' }),
    riza: (body: RizaIstegi) => api<Kullanici>('/auth/riza', { method: 'PUT', body: { ...body } }),
  },
  panel: () => api<PanelOzeti>('/panel'),
  senkron: {
    ozet: () => api<SenkronOzeti[]>('/senkron/ozet'),
  },
  dersler: {
    liste: () => api<DersKaydi[]>('/dersler'),
    detay: (kod: string) => api<DersDetayi>(`/dersler/${encodeURIComponent(kod)}`),
  },
  notlar: () => api<Degerlendirme[]>('/notlar'),
  devam: () => api<DevamOzeti[]>('/devam'),
  etkinlikler: (q: { baslangic: string; bitis: string; tur?: EtkinlikTur }) =>
    api<Etkinlik[]>('/etkinlikler', { query: q }),
  duyurular: {
    liste: () => api<Duyuru[]>('/duyurular'),
    okundu: (id: number) => api<void>(`/duyurular/${id}/okundu`, { method: 'POST' }),
  },
  araclar: {
    finalGerekli: (kod: string) =>
      api<FinalGerekliSonuc>(`/araclar/final-gerekli-puan/${encodeURIComponent(kod)}`),
  },
  asistan: {
    sohbetler: () => api<Sohbet[]>('/asistan/sohbetler'),
    mesajlar: (sohbetId: number) => api<SohbetMesaji[]>(`/asistan/sohbetler/${sohbetId}/mesajlar`),
    sor: (body: SoruIstegi) =>
      api<SohbetMesaji>('/asistan/mesajlar', { method: 'POST', body: { ...body } }),
    geriBildirim: (mesajId: number, body: GeriBildirimIstegi) =>
      api<void>(`/asistan/mesajlar/${mesajId}/geri-bildirim`, { method: 'POST', body: { ...body } }),
  },
  yonetici: {
    belgeler: () => api<Belge[]>('/yonetici/belgeler'),
    belgeYukle: (dosya: File, baslik: string, tur: BelgeTur) => {
      const form = new FormData();
      form.append('dosya', dosya);
      form.append('baslik', baslik);
      form.append('tur', tur);
      return api<Belge>('/yonetici/belgeler', { method: 'POST', body: form });
    },
    belgeGuncelle: (id: number, body: { aktif_mi: boolean }) =>
      api<Belge>(`/yonetici/belgeler/${id}`, { method: 'PATCH', body: { ...body } }),
    cevaplanamayan: () => api<CevaplanamayanSoru[]>('/yonetici/cevaplanamayan'),
    cozuldu: (id: number) =>
      api<CevaplanamayanSoru>(`/yonetici/cevaplanamayan/${id}`, {
        method: 'PATCH',
        body: { cozuldu: true },
      }),
    istatistik: () => api<YoneticiIstatistik>('/yonetici/istatistik'),
    senkronLoglari: () => api<SenkronLog[]>('/yonetici/senkron-loglari'),
    senkronBaslat: (sistem: KaynakSistem) =>
      api<SenkronLog>(`/yonetici/senkron/${sistem}`, { method: 'POST' }),
  },
};
