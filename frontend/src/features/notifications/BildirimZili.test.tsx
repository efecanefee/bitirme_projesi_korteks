import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { girisYap, renderRoute } from '@/test/render';
import { BildirimZili } from './BildirimZili';
import { DikkatKarti } from './DikkatKarti';
import { useBildirimStore } from './bildirimStore';

beforeEach(() => {
  localStorage.clear();
  useBildirimStore.getState().temizle();
});

describe('Bildirim zili', () => {
  it('okunmamış sayıyı gösterir, menüde bildirimleri listeler ve tıklanınca ilgili sayfaya gider', async () => {
    girisYap();
    const { router } = renderRoute(<BildirimZili />);
    const zil = await screen.findByRole('button', { name: /Bildirimler, \d+ okunmamış/ });
    await userEvent.click(zil);
    const menu = await screen.findByRole('dialog', { name: 'Bildirimler' });
    // Örnek veride yarınki Algoritma Analizi ara sınavı var (PSG)
    const sinav = await within(menu).findByRole('button', { name: (n) => n.startsWith('Algoritma Analizi ara sınavı') && !n.endsWith('sonra hatırlat') });
    await userEvent.click(sinav);
    await waitFor(() => expect(decodeURIComponent(router.state.location.pathname)).toBe('/derslerim/BİL301'));
  });

  it('"Tümünü okundu say" rozeti sıfırlar', async () => {
    girisYap();
    renderRoute(<BildirimZili />);
    await userEvent.click(await screen.findByRole('button', { name: /okunmamış/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Tümünü okundu say' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Bildirimler', hidden: true })).toBeInTheDocument());
  });
});

describe('Dikkat kartı', () => {
  it('uyarıları listeler; kapatılan uyarı listeden çıkar', async () => {
    girisYap();
    renderRoute(<DikkatKarti />);
    const kart = await screen.findByRole('region', { name: 'Dikkat edilmesi gerekenler' });
    const satir = await within(kart).findByText('Algoritma Analizi ara sınavı');
    expect(within(kart).getAllByText('Acil').length).toBeGreaterThan(0);
    await userEvent.click(within(kart).getByRole('button', { name: 'Algoritma Analizi ara sınavı: kapat' }));
    await waitFor(() => expect(satir).not.toBeInTheDocument());
  });

  it('"Sonra hatırlat" menüsü üç seçenek sunar ve seçilince uyarıyı gizler', async () => {
    girisYap();
    renderRoute(<DikkatKarti />);
    const kart = await screen.findByRole('region', { name: 'Dikkat edilmesi gerekenler' });
    await within(kart).findByText('Algoritma Analizi ara sınavı');
    await userEvent.click(within(kart).getByRole('button', { name: 'Algoritma Analizi ara sınavı: sonra hatırlat' }));
    const menu = await screen.findByRole('menu');
    expect(within(menu).getAllByRole('menuitem').map((m) => m.textContent)).toEqual(['1 saat sonra', 'Yarın 09.00', '3 gün sonra']);
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'Yarın 09.00' }));
    await waitFor(() => expect(within(kart).queryByText('Algoritma Analizi ara sınavı')).not.toBeInTheDocument());
    expect(Object.values(useBildirimStore.getState().ertelenen)[0]).toBeGreaterThan(Date.now());
  });
});
