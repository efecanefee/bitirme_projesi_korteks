import { describe, expect, it } from 'vitest';
import { yanitUret } from './assistant';
import { cevaplanamayanlar } from './data';

describe('sahte asistan orkestratörü', () => {
  it('kişisel soruyu hesaplama aracına yönlendirir', () => {
    const y = yanitUret('Olasılıktan geçmek için finalden kaç almam lazım?');
    expect(y.niyet).toBe('kisisel');
    expect(y.cevap).toContain('finalden en az 68');
    expect(y.kaynaklar.some((k) => k.tip === 'arac' && k.arac === 'final_gerekli_puan')).toBe(true);
  });

  it('belge sorusunu kaynak göstererek yanıtlar', () => {
    const y = yanitUret('Mazeret sınavına hangi durumlarda girebilirim?');
    expect(y.niyet).toBe('belge');
    const belge = y.kaynaklar.find((k) => k.tip === 'belge');
    expect(belge && belge.tip === 'belge' && belge.madde).toBe('Madde 24');
  });

  it('kaynakta olmayan soruda tahmin üretmez ve soruyu yöneticiye düşürür (FG-08)', () => {
    const once = cevaplanamayanlar.length;
    const y = yanitUret('Yemekhanede bugün ne var?');
    expect(y.niyet).toBe('bulunamadi');
    expect(y.kaynaklar).toHaveLength(0);
    expect(y.onerilen_birim).toBeTruthy();
    expect(cevaplanamayanlar.length).toBe(once + 1);
  });
});
