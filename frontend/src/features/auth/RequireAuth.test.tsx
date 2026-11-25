import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { girisYap, renderRoute } from '@/test/render';
import { RequireAuth } from './RequireAuth';

describe('Yetki yönlendirmesi (FG-01, FG-10)', () => {
  it('oturum yoksa giriş sayfasına yönlendirir', () => {
    const { router } = renderRoute(<RequireAuth><div>gizli</div></RequireAuth>);
    expect(router.state.location.pathname).toBe('/giris');
    expect(screen.queryByText('gizli')).not.toBeInTheDocument();
  });

  it('öğrenci yönetici sayfasına giremez', () => {
    girisYap('ogrenci');
    const { router } = renderRoute(<RequireAuth rol="yonetici"><div>yonetim</div></RequireAuth>, { path: '/yonetim', url: '/yonetim' });
    expect(router.state.location.pathname).toBe('/');
  });
});
