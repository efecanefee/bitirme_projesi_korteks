import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderRoute } from '@/test/render';
import { useAuthStore } from '@/features/auth/authStore';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { kullanicilar } from '@/mocks/data';
import { ConsentPage } from './ConsentPage';
import { KVKK_SURUM } from './kvkkMetni';

function onaysizGiris() {
  const { sifre: _s, ...k } = kullanicilar.find((x) => x.rol === 'ogrenci')!;
  void _s;
  useAuthStore.getState().setSession(`mock.${k.id}.test`, 3600, { ...k, riza: null });
}

describe('KVKK onay adımı', () => {
  it('onay vermemiş öğrenciyi onay sayfasına yönlendirir', () => {
    onaysizGiris();
    const { router } = renderRoute(
      <RequireAuth>
        <div>panel</div>
      </RequireAuth>,
    );
    expect(router.state.location.pathname).toBe('/onay');
  });

  it('eski metin sürümünü onaylamış öğrenciden yeniden onay ister', () => {
    onaysizGiris();
    const k = useAuthStore.getState().kullanici!;
    useAuthStore.getState().setKullanici({
      ...k,
      riza: { metin_surumu: 'eski', tarih: '2026-01-01T00:00:00Z', sohbet_degerlendirme: true },
    });
    const { router } = renderRoute(
      <RequireAuth>
        <div>panel</div>
      </RequireAuth>,
    );
    expect(router.state.location.pathname).toBe('/onay');
  });

  it('zorunlu kutu işaretlenmeden devam ettirmez', async () => {
    onaysizGiris();
    renderRoute(<ConsentPage />, { path: '/onay', url: '/onay' });
    await userEvent.click(screen.getByRole('button', { name: 'Onayla ve devam et' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('okuduğunu onayla');
    expect(useAuthStore.getState().kullanici?.riza).toBeNull();
  });

  it('onayı ve isteğe bağlı izni kaydeder, panele geçer', async () => {
    onaysizGiris();
    const { router } = renderRoute(<ConsentPage />, { path: '/onay', url: '/onay' });
    await userEvent.click(screen.getByRole('checkbox', { name: /Aydınlatma metnini okudum/ }));
    await userEvent.click(screen.getByRole('checkbox', { name: /anonimleştirilerek/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Onayla ve devam et' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    const riza = useAuthStore.getState().kullanici?.riza;
    expect(riza?.metin_surumu).toBe(KVKK_SURUM);
    expect(riza?.sohbet_degerlendirme).toBe(true);
  });

  it('yönetici için onay adımı gerekmez', () => {
    const { sifre: _s, ...k } = kullanicilar.find((x) => x.rol === 'yonetici')!;
    void _s;
    useAuthStore.getState().setSession(`mock.${k.id}.test`, 3600, { ...k, riza: null });
    renderRoute(
      <RequireAuth>
        <div>yonetim</div>
      </RequireAuth>,
      { path: '/yonetim', url: '/yonetim' },
    );
    expect(screen.getByText('yonetim')).toBeInTheDocument();
  });
});
