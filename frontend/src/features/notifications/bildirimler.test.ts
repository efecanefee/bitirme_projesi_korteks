import dayjs from '@/lib/dayjs';
import { describe, expect, it } from 'vitest';
import { bildirimleriUret } from './bildirimUret';
import { erteleBitisi } from './bildirimStore';
import { VARSAYILAN_ESIKLER, devamSeviyesi } from '@/app/ayarlar';
import type { DevamOzeti, Duyuru, Etkinlik } from '@/api/types';

const simdi = dayjs('2026-11-26T10:00:00');
const senkron = '2026-11-26T09:30:00.000Z';

const etk = (id: number, tur: Etkinlik['tur'], gun: number, baslik = `Etkinlik ${id}`): Etkinlik => ({
  id,
  ders_id: 1,
  ders_kodu: 'MAT301',
  tur,
  baslik,
  aciklama: null,
  tarih: simdi.add(gun, 'day').hour(14).toISOString(),
  yer: 'C-105',
  sure_dk: 90,
  kaynak_sistem: tur === 'sinav' ? 'PSG' : 'PUSULA',
  son_senkron: senkron,
});

const devam = (id: number, kullanilan: number, sinir = 4): DevamOzeti => ({
  ders_kaydi_id: id,
  ders_kodu: `BİL30${id}`,
  ders_adi: `Ders ${id}`,
  kullanilan,
  sinir,
  kaynak_sistem: 'OBS',
  son_senkron: senkron,
});

describe('bildirimleriUret (eşikler: sınav 14 gün, ödev 5 gün, devam 2 hak)', () => {
  it('sınavı 14 gün, ödevi 5 gün önceden uyarır; daha uzaktakileri ve geçmişi atlar', () => {
    const liste = bildirimleriUret({
      etkinlikler: [etk(1, 'sinav', 14), etk(2, 'sinav', 15), etk(3, 'odev', 5), etk(4, 'odev', 6), etk(5, 'sinav', -1), etk(6, 'materyal', 1)],
      esikler: VARSAYILAN_ESIKLER,
      simdi,
    });
    expect(liste.map((b) => b.id)).toEqual(['odev-3', 'sinav-1']);
  });

  it('önem kalan güne göre belirlenir ve kritik olanlar önce gelir', () => {
    const liste = bildirimleriUret({ etkinlikler: [etk(1, 'sinav', 10), etk(2, 'sinav', 1), etk(3, 'odev', 3)], esikler: VARSAYILAN_ESIKLER, simdi });
    expect(liste.map((b) => [b.id, b.onem])).toEqual([
      ['sinav-2', 'kritik'],
      ['odev-3', 'uyari'],
      ['sinav-1', 'bilgi'],
    ]);
    expect(liste[0]!.aciklama).toContain('Sınav yarın');
    expect(liste[0]!.hedef).toBe('/derslerim/MAT301');
  });

  it('devamda 2 hak kalınca uyarı, 0 kalınca kritik verir; hesap sunucudan gelen sayılarla yapılır', () => {
    const liste = bildirimleriUret({ devam: [devam(1, 1), devam(2, 2), devam(3, 3), devam(4, 4)], esikler: VARSAYILAN_ESIKLER, simdi });
    expect(liste.map((b) => [b.id, b.onem])).toEqual([
      ['devam-4', 'kritik'],
      ['devam-2', 'uyari'],
      ['devam-3', 'uyari'],
    ]);
    expect(liste[0]!.baslik).toContain('devam hakkın doldu');
    expect(liste[1]!.baslik).toContain('2 devam hakkın kaldı');
  });

  it('imza değişince kapatılan bildirim yeniden görünebilir', () => {
    const once = bildirimleriUret({ devam: [devam(1, 2)], esikler: VARSAYILAN_ESIKLER, simdi })[0]!;
    const sonra = bildirimleriUret({ devam: [devam(1, 3)], esikler: VARSAYILAN_ESIKLER, simdi })[0]!;
    expect(once.id).toBe(sonra.id);
    expect(once.imza).not.toBe(sonra.imza);
  });

  it('okunmamış duyuruları ve hatalı senkronu bildirir', () => {
    const duyuru: Duyuru = { id: 9, baslik: 'Salon değişti', ozet: '', yayinlayan: 'PSG', tarih: senkron, ders_kodu: null, okundu: false, kaynak_sistem: 'PSG', son_senkron: senkron };
    const liste = bildirimleriUret({
      duyurular: [duyuru, { ...duyuru, id: 10, okundu: true }],
      senkron: [{ kaynak_sistem: 'PUSULA', son_basarili: senkron, durum: 'hatali' }, { kaynak_sistem: 'OBS', son_basarili: senkron, durum: 'basarili' }],
      esikler: VARSAYILAN_ESIKLER,
      simdi,
    });
    expect(liste.map((b) => b.id)).toEqual(['senkron-PUSULA', 'duyuru-9']);
  });
});

describe('devamSeviyesi', () => {
  it('eşik 2 iken: 3 yolunda, 2 ve 1 sınırda, 0 doldu', () => {
    expect([3, 2, 1, 0, -1].map((k) => devamSeviyesi(k, 2))).toEqual(['yolunda', 'sinirda', 'sinirda', 'doldu', 'doldu']);
  });
});

describe('erteleBitisi', () => {
  it('1 saat, yarın 09.00 ve 3 gün seçenekleri', () => {
    expect(dayjs(erteleBitisi('1s', simdi)).format('YYYY-MM-DD HH:mm')).toBe('2026-11-26 11:00');
    expect(dayjs(erteleBitisi('yarin', simdi)).format('YYYY-MM-DD HH:mm')).toBe('2026-11-27 09:00');
    expect(dayjs(erteleBitisi('3g', simdi)).format('YYYY-MM-DD HH:mm')).toBe('2026-11-29 10:00');
  });
});
