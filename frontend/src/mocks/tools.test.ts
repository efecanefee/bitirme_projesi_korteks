import { describe, expect, it } from 'vitest';
import { finalGerekliHesapla } from './tools';
import type { Degerlendirme } from '@/api/types';

const n = (tur: Degerlendirme['tur'], agirlik: number, puan: number | null, baslik: string = tur): Degerlendirme => ({
  id: Math.random(),
  ders_kaydi_id: 1,
  tur,
  baslik,
  agirlik,
  puan,
  tarih: null,
  kaynak_sistem: 'OBS',
  son_senkron: '2026-11-25T10:00:00Z',
});
const ders = { kod: 'MAT301', gecme_notu: 60, final_alt_siniri: null };

describe('final_gerekli_puan (rapor 5.3)', () => {
  it('rapordaki örneği verir: vize 48 (%40), final %60 → 68', () => {
    const s = finalGerekliHesapla(ders, [n('vize', 0.4, 48, 'Ara sınav'), n('final', 0.6, null)], '');
    expect(s.durum).toBe('hesaplandi');
    expect(s.gerekli).toBe(68);
    expect(s.formul).toContain('= 68');
  });

  it('ödev gibi ek değerlendirmeleri hesaba katar', () => {
    // 72·0,3 + 85·0,2 = 38,6 → (60 − 38,6) / 0,5 = 42,8 → 43
    const s = finalGerekliHesapla(ders, [n('vize', 0.3, 72), n('odev', 0.2, 85), n('final', 0.5, null)], '');
    expect(s.gerekli).toBe(43);
  });

  it('girilmemiş notları yok sayar', () => {
    const s = finalGerekliHesapla(ders, [n('vize', 0.3, 64), n('odev', 0.1, 82), n('odev', 0.1, null), n('final', 0.5, null)], '');
    // 19,2 + 8,2 = 27,4 → 65,2 → 66
    expect(s.gerekli).toBe(66);
  });

  it('100 üstü gerekiyorsa "ulaşılamaz" döner', () => {
    const s = finalGerekliHesapla(ders, [n('vize', 0.7, 5), n('final', 0.3, null)], '');
    expect(s.durum).toBe('ulasilamaz');
    expect(s.gerekli).toBeNull();
  });

  it('yönetmelik final alt sınırını uygular', () => {
    const s = finalGerekliHesapla({ ...ders, final_alt_siniri: 50 }, [n('vize', 0.4, 100), n('final', 0.6, null)], '');
    expect(s.gerekli).toBe(50);
  });

  it('final öncesi not yoksa "veri_yok" döner', () => {
    const s = finalGerekliHesapla(ders, [n('vize', 0.4, null), n('final', 0.6, null)], '');
    expect(s.durum).toBe('veri_yok');
  });
});
