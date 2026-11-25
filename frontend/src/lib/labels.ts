import type { BelgeTur, Niyet } from '@/api/types';

export const BELGE_TURU: Record<BelgeTur, string> = {
  yonetmelik: 'Yönetmelik',
  akademik_takvim: 'Akademik takvim',
  duyuru: 'Duyuru',
  sinav_yonergesi: 'Sınav yönergesi',
  izlence: 'Ders izlencesi',
};

export const NIYET_ETIKETI: Record<Niyet, string> = {
  belge: 'Belge sorusu',
  kisisel: 'Kişisel veri',
  karma: 'Karma',
  bulunamadi: 'Bulunamadı',
};
