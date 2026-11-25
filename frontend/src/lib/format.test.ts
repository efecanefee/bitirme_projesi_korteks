import { describe, expect, it } from 'vitest';
import dayjs from './dayjs';
import { basHarfler, iyelik, kalanGun, saatTr, sayi } from './format';
import { icsOlustur } from './ics';

describe('biçimlendirme', () => {
  const simdi = dayjs('2026-11-25T14:00:00');
  it('kalan günü Türkçe yazar', () => {
    expect(kalanGun('2026-11-25T23:59:00', simdi)).toBe('Bugün');
    expect(kalanGun('2026-11-26T10:00:00', simdi)).toBe('Yarın');
    expect(kalanGun('2026-11-30T10:00:00', simdi)).toBe('5 gün');
    expect(kalanGun('2026-11-20T10:00:00', simdi)).toBe('Geçti');
  });
  it('iyelik ekini doğru seçer', () => {
    expect(iyelik(3)).toBe("3'ü");
    expect(iyelik(2)).toBe("2'si");
    expect(iyelik(6)).toBe("6'sı");
    expect(iyelik(9)).toBe("9'u");
  });
  it('baş harfleri Türkçe büyük harfe çevirir', () => {
    expect(basHarfler('ilker ışık')).toBe('İI');
    expect(basHarfler('Deniz Yılmaz')).toBe('DY');
  });
  it('Türkçe ondalık ve saat yazımı', () => {
    expect(sayi(3.12)).toBe('3,12');
    expect(saatTr('09:00')).toBe('09.00');
  });
});

describe('iCalendar', () => {
  it('geçerli VEVENT üretir ve özel karakterleri kaçırır', () => {
    const ics = icsOlustur([{ baslik: 'BİL301; ara sınav, D-301', baslangic: '2026-11-26T07:00:00Z', sureDk: 75 }]);
    expect(ics).toMatch(/^BEGIN:VCALENDAR/);
    expect(ics).toContain('DTSTART:20261126T070000Z');
    expect(ics).toContain('DTEND:20261126T081500Z');
    expect(ics).toContain(String.raw`SUMMARY:BİL301\; ara sınav\, D-301`);
  });
});
