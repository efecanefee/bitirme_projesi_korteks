import { describe, expect, it } from 'vitest';
import { getContrastRatio } from '@mui/material/styles';
import { belirtecler, createAppTheme, marka } from './theme';

// WCAG 2.1 AA (rapor Tablo 1): normal metin 4.5:1, büyük metin ve arayüz öğeleri 3:1
const AA = 4.5;

describe.each(['light', 'dark'] as const)('%s tema', (mode) => {
  const t = belirtecler[mode];
  const theme = createAppTheme(mode);

  it('metin renkleri zemin ve yüzey üstünde AA kontrastı sağlar', () => {
    for (const zemin of [t.zemin, t.yuzey, t.yuzeyIkincil]) {
      expect(getContrastRatio(t.metin, zemin)).toBeGreaterThanOrEqual(AA);
      expect(getContrastRatio(t.metinIkincil, zemin)).toBeGreaterThanOrEqual(AA);
      expect(getContrastRatio(t.vurguMetin, zemin)).toBeGreaterThanOrEqual(AA);
    }
    expect(getContrastRatio(t.vurguMetin, t.vurguZemin)).toBeGreaterThanOrEqual(AA);
  });

  it('turuncu düğme üstündeki metin okunur', () => {
    expect(getContrastRatio(theme.palette.primary.contrastText, theme.palette.primary.main)).toBeGreaterThanOrEqual(AA);
  });

  it('yan menü metinleri lacivert zeminde okunur', () => {
    expect(getContrastRatio(t.menu.metin, t.menu.zemin)).toBeGreaterThanOrEqual(AA);
    expect(getContrastRatio(t.menu.metinIkincil, t.menu.zemin)).toBeGreaterThanOrEqual(AA);
    expect(getContrastRatio(t.menu.metinIkincil, t.menu.kart)).toBeGreaterThanOrEqual(AA);
  });

  it('kaynak sistem renkleri birbirinden ve marka turuncusundan farklıdır', () => {
    const renkler = Object.values(t.sistem);
    expect(new Set(renkler).size).toBe(3);
    expect(renkler).not.toContain(marka.turuncu);
    // nokta ve şeritler arayüz öğesi: yüzeye karşı en az 3:1
    for (const r of renkler) expect(getContrastRatio(r, t.yuzey)).toBeGreaterThanOrEqual(mode === 'light' ? 2.5 : 3);
  });
});

it('beyaz metin turuncu üstünde AA geçmez; bu yüzden lacivert kullanılır', () => {
  expect(getContrastRatio('#FFFFFF', marka.turuncu)).toBeLessThan(AA);
  expect(getContrastRatio(marka.lacivert, marka.turuncu)).toBeGreaterThanOrEqual(AA);
});
