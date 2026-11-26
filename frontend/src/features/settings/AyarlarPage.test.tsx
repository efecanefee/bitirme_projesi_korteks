import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { girisYap, renderRoute } from '@/test/render';
import { AyarlarPage } from './AyarlarPage';
import { useAyarlar, VARSAYILAN_ESIKLER } from '@/app/ayarlar';
import { sayfaBasligi } from '@/components/layout/sayfaBasligi';

beforeEach(() => {
  localStorage.clear();
  useAyarlar.setState({ esikler: VARSAYILAN_ESIKLER, yaziBoyutu: 100, hareketAzalt: false, yuksekKontrast: false });
});

describe('Ayarlar sayfası', () => {
  it('yazı boyutunu ve hareket azaltmayı değiştirir', async () => {
    girisYap();
    renderRoute(<AyarlarPage />, { path: '/ayarlar', url: '/ayarlar' });
    await userEvent.click(screen.getByRole('button', { name: 'Çok büyük' }));
    expect(useAyarlar.getState().yaziBoyutu).toBe(125);
    await userEvent.click(screen.getByRole('switch', { name: 'Hareketi azalt' }));
    expect(useAyarlar.getState().hareketAzalt).toBe(true);
    await userEvent.click(screen.getByRole('switch', { name: 'Yüksek kontrast' }));
    expect(useAyarlar.getState().yuksekKontrast).toBe(true);
  });

  it('bildirim eşikleri değiştirilip varsayılana döndürülebilir', async () => {
    girisYap();
    renderRoute(<AyarlarPage />, { path: '/ayarlar', url: '/ayarlar?sekme=bildirimler' });
    expect(screen.getByRole('tab', { name: 'Bildirimler' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(screen.getByRole('combobox', { name: 'Sınavdan önce' }));
    await userEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: '7 gün' }));
    expect(useAyarlar.getState().esikler.sinavGun).toBe(7);
    await userEvent.click(screen.getByRole('button', { name: /Varsayılanlara dön/ }));
    expect(useAyarlar.getState().esikler).toEqual(VARSAYILAN_ESIKLER);
  });

  it('yönetici yalnızca Görünüm sekmesini görür', () => {
    girisYap('yonetici');
    renderRoute(<AyarlarPage />, { path: '/ayarlar', url: '/ayarlar?sekme=bildirimler' });
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Görünüm']);
  });
});

describe('sayfaBasligi', () => {
  it('her sayfaya Korteks ekli başlık verir', () => {
    expect(sayfaBasligi('/')).toBe('Panel · Korteks');
    expect(sayfaBasligi('/derslerim/MAT301')).toBe('MAT301 · Korteks');
    expect(sayfaBasligi('/yonetim/belgeler')).toBe('Belgeler · Korteks');
    expect(sayfaBasligi('/bilinmeyen')).toBe('Korteks');
  });
});
