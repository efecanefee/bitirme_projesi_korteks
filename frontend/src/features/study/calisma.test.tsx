import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { calismaCsv, susPuani, useCalismaStore } from './calismaStore';
import { CalismaPaneli } from './CalismaPaneli';
import { girisYap, renderRoute } from '@/test/render';
import { server } from '@/test/server';

describe('SUS puanı (Brooke)', () => {
  it('en olumlu yanıtlar 100, en olumsuz 0, kararsız 50 verir', () => {
    expect(susPuani([5, 1, 5, 1, 5, 1, 5, 1, 5, 1])).toBe(100);
    expect(susPuani([1, 5, 1, 5, 1, 5, 1, 5, 1, 5])).toBe(0);
    expect(susPuani([3, 3, 3, 3, 3, 3, 3, 3, 3, 3])).toBe(50);
  });

  it('elle hesaplanan örnekle aynı sonucu verir', () => {
    // (4-1)+(5-2)+(4-1)+(5-1)+(5-1)+(5-2)+(4-1)+(5-2)+(5-1)+(5-1) = 34 → 34 × 2,5 = 85
    expect(susPuani([4, 2, 4, 1, 5, 2, 4, 2, 5, 1])).toBe(85);
  });

  it('eksik veya geçersiz yanıtı reddeder', () => {
    expect(() => susPuani([3, 3, 3])).toThrow();
    expect(() => susPuani([0, 3, 3, 3, 3, 3, 3, 3, 3, 3])).toThrow();
  });
});

describe('Çalışma CSV', () => {
  it('ad veya öğrenci numarası içermez, katılımcı kodu ve SUS puanı içerir', () => {
    const csv = calismaCsv('K-AB12', [{ gorevId: 'G1', gorev: 'Kalan devam hakkını bul', sureMs: 12_400, tiklama: 3, sonuc: 'buldu' }], [4, 2, 4, 1, 5, 2, 4, 2, 5, 1]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('K-AB12;G1;Kalan devam hakkını bul;12,4;3;buldu');
    expect(csv).toContain(';85');
    expect(csv).not.toMatch(/Deniz|2303/);
  });
});

describe('Çalışma paneli', () => {
  beforeEach(() => {
    sessionStorage.clear();
    useCalismaStore.getState().bitirCalisma();
  });

  it('?calisma=1 ile açılır; görev listesi boşsa uyarı gösterir', async () => {
    girisYap();
    server.use(
      http.get('*/calisma-gorevleri.json', () => HttpResponse.json({ gorevler: [] })),
      http.get('*/sus-maddeleri.json', () => HttpResponse.json({ kaynak: 'SUS-TR', onaylandi: false, maddeler: Array.from({ length: 10 }, (_, i) => `M${i + 1}`) })),
    );
    renderRoute(<CalismaPaneli />, { path: '/', url: '/?calisma=1' });
    expect(await screen.findByRole('region', { name: 'Kullanıcı çalışması' })).toBeInTheDocument();
    expect(await screen.findByText(/Görev listesi henüz yüklenmedi/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Başla' })).toBeDisabled();
  });

  it('görevleri ölçer, SUS anketini alır ve sonucu gösterir', async () => {
    girisYap();
    server.use(
      http.get('*/calisma-gorevleri.json', () => HttpResponse.json({ gorevler: [{ id: 'G1', metin: 'Bir sonraki sınavın tarihini bul' }] })),
      http.get('*/sus-maddeleri.json', () => HttpResponse.json({ kaynak: 'SUS-TR', onaylandi: true, maddeler: Array.from({ length: 10 }, (_, i) => `Madde ${i + 1}`) })),
    );
    renderRoute(<CalismaPaneli />, { path: '/', url: '/?calisma=1' });
    await userEvent.click(await screen.findByRole('button', { name: 'Başla' }));
    expect(screen.getByText('Bir sonraki sınavın tarihini bul')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Buldum' }));
    const anket = await screen.findByRole('dialog', { name: /SUS/ });
    const gruplar = anket.querySelectorAll('fieldset');
    expect(gruplar).toHaveLength(10);
    for (const g of gruplar) await userEvent.click(g.querySelectorAll('input')[2]!);
    await userEvent.click(screen.getByRole('button', { name: 'Gönder' }));
    await waitFor(() => expect(screen.getByText(/SUS puanı 50/)).toBeInTheDocument());
    expect(useCalismaStore.getState().kayitlar[0]).toMatchObject({ gorevId: 'G1', sonuc: 'buldu' });
  });
});
