import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderRoute } from '@/test/render';
import { DataTable, type Sutun } from './DataTable';
import { csvOlustur, dosyaAdi, yazdirmaHtml, type Rapor } from '@/lib/disaAktar';
import { karsilastir } from '@/lib/siralama';

interface Satir {
  id: number;
  ad: string;
  sayi: number;
}
const satirlar: Satir[] = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, ad: ['Çağla', 'Ali', 'Şule', 'İrem', 'Oğuz', 'Ümit'][i % 6]!, sayi: (i * 7) % 12 }));
const sutunlar: Sutun<Satir>[] = [
  { id: 'ad', baslik: 'Ad', hucre: (s) => s.ad, deger: (s) => s.ad },
  { id: 'sayi', baslik: 'Sayı', align: 'right', hucre: (s) => s.sayi, deger: (s) => s.sayi },
];

describe('DataTable', () => {
  it('başlığa tıklayınca sıralar, aria-sort ve adres satırını günceller', async () => {
    const { router } = renderRoute(<DataTable satirlar={satirlar} sutunlar={sutunlar} anahtar={(s) => s.id} etiket="Deneme" />, { path: '/t', url: '/t' });
    await userEvent.click(screen.getByRole('button', { name: 'Sayı' }));
    expect(screen.getByRole('columnheader', { name: 'Sayı' })).toHaveAttribute('aria-sort', 'ascending');
    expect(router.state.location.search).toContain('sirala=sayi');
    const ilk = () => within(screen.getAllByRole('row')[1]!).getAllByRole('cell')[1]!.textContent;
    expect(ilk()).toBe('0');
    await userEvent.click(screen.getByRole('button', { name: 'Sayı' }));
    expect(ilk()).toBe('11');
  });

  it('sayfalar: 10 satır gösterir, sonraki sayfaya geçer', async () => {
    renderRoute(<DataTable satirlar={satirlar} sutunlar={sutunlar} anahtar={(s) => s.id} etiket="Deneme" />, { path: '/t', url: '/t' });
    expect(screen.getAllByRole('row')).toHaveLength(11);
    expect(screen.getByText('1–10 / 12')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  it('adres satırındaki sıralamayla açılır', () => {
    renderRoute(<DataTable satirlar={satirlar} sutunlar={sutunlar} anahtar={(s) => s.id} etiket="Deneme" />, { path: '/t', url: '/t?sirala=ad&yon=asc' });
    expect(within(screen.getAllByRole('row')[1]!).getAllByRole('cell')[0]!.textContent).toBe('Ali');
  });
});

describe('Türkçe sıralama', () => {
  it('Ç, İ, Ş, Ü harflerini doğru yere koyar, boşları sona atar', () => {
    expect(['Şule', 'Ümit', 'Ali', 'Çağla', 'İrem', 'Oğuz'].sort(karsilastir)).toEqual(['Ali', 'Çağla', 'İrem', 'Oğuz', 'Şule', 'Ümit']);
    expect([3, null, 1].sort(karsilastir)).toEqual([1, 3, null]);
  });
});

describe('Dışa aktarma', () => {
  const rapor: Rapor = {
    baslik: 'Cevaplanamayan sorular',
    aciklama: 'Açık',
    ozet: [{ etiket: 'Soru sayısı', deger: '2' }],
    tablolar: [{ baslik: 'Sorular', sutunlar: ['Soru', 'Benzerlik'], satirlar: [['Yaz okulu; başka üniversite?', 0.41], ['<b>Burs</b>', 0.5]] }],
  };

  it("CSV: UTF-8 BOM, noktalı virgül ayracı, Türkçe ondalık ve kaçış", () => {
    const csv = csvOlustur(rapor);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('Soru;Benzerlik');
    expect(csv).toContain('"Yaz okulu; başka üniversite?";0,41');
  });

  it('PDF görünümü HTML kaçışı yapar', () => {
    const html = yazdirmaHtml(rapor);
    expect(html).toContain('&lt;b&gt;Burs&lt;/b&gt;');
    expect(html).not.toContain('<b>Burs</b>');
  });

  it('dosya adı Türkçe karakter içermez', () => {
    expect(dosyaAdi(rapor, 'csv')).toMatch(/^korteks_cevaplanamayan_sorular_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.csv$/);
  });
});
