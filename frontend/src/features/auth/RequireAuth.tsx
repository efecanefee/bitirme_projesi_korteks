import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import type { Rol } from '@/api/types';
import { useAuthStore } from './authStore';
import { rizaGecerli } from '@/features/legal/consent';

/** Oturum ve rol kontrolü (FG-01, FG-10). Asıl yetki kontrolü sunucudadır; bu yalnızca yönlendirme yapar. */
export function RequireAuth({ children, rol }: { children: ReactNode; rol?: Rol }) {
  const location = useLocation();
  const girisli = useAuthStore((s) => s.isAuthenticated());
  const kullanici = useAuthStore((s) => s.kullanici);

  if (!girisli || !kullanici) {
    return <Navigate to="/giris" replace state={{ from: location.pathname + location.search }} />;
  }
  // KVKK onayı verilmemiş veya metin sürümü değişmişse önce onay adımı (rapor: aydınlatma metni ve rıza)
  if (!rizaGecerli(kullanici)) {
    return <Navigate to="/onay" replace state={{ from: location.pathname + location.search }} />;
  }
  if (rol && kullanici.rol !== rol) {
    return <Navigate to={kullanici.rol === 'yonetici' ? '/yonetim' : '/'} replace />;
  }
  return <>{children}</>;
}
