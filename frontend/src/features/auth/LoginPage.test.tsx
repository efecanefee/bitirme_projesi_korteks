import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderRoute } from '@/test/render';
import { LoginPage } from './LoginPage';
import { useAuthStore } from './authStore';

describe('Giriş', () => {
  it('boş formda doğrulama mesajı gösterir', async () => {
    renderRoute(<LoginPage />, { path: '/giris', url: '/giris' });
    await userEvent.click(screen.getByRole('button', { name: 'Giriş yap' }));
    expect(await screen.findByText('E-posta adresini yaz.')).toBeInTheDocument();
  });

  it('hatalı şifrede sunucu mesajını gösterir', async () => {
    renderRoute(<LoginPage />, { path: '/giris', url: '/giris' });
    await userEvent.type(screen.getByLabelText('E-posta'), 'deniz.yilmaz@ogr.beykent.edu.tr');
    await userEvent.type(screen.getByLabelText('Şifre'), 'yanlis');
    await userEvent.click(screen.getByRole('button', { name: 'Giriş yap' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('E-posta veya şifre hatalı.');
  });

  it('başarılı girişte oturumu açar ve panele yönlendirir', async () => {
    const { router } = renderRoute(<LoginPage />, { path: '/giris', url: '/giris' });
    await userEvent.type(screen.getByLabelText('E-posta'), 'deniz.yilmaz@ogr.beykent.edu.tr');
    await userEvent.type(screen.getByLabelText('Şifre'), 'korteks123');
    await userEvent.click(screen.getByRole('button', { name: 'Giriş yap' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(useAuthStore.getState().kullanici?.ad_soyad).toBe('Deniz Yılmaz');
  });
});
