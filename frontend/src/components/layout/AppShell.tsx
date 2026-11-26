import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { sayfaBasligi } from './sayfaBasligi';
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CevrimdisiSeridi } from './CevrimdisiSeridi';
import { KortiFab } from '@/components/korti/KortiFab';
import { useAuthStore } from '@/features/auth/authStore';
import { TanitimTuru } from '@/features/tour/TanitimTuru';
import { CalismaPaneli } from '@/features/study/CalismaPaneli';
import { BildirimIzniPenceresi } from '@/features/notifications/BildirimIzniPenceresi';
import { useBildirimler } from '@/features/notifications/useBildirimler';
import { useTarayiciBildirimleri } from '@/features/notifications/tarayiciBildirimi';

/** Öğrenci oturumunda bildirimleri izler ve izinliyse tarayıcı bildirimi gönderir (FG-13). */
function OgrenciBildirimleri() {
  const { tumu } = useBildirimler();
  useTarayiciBildirimleri(tumu);
  return <BildirimIzniPenceresi />;
}

export const SIDEBAR_WIDTH = 288;

export function AppShell() {
  const theme = useTheme();
  const masaustu = useMediaQuery(theme.breakpoints.up('md'));
  const [acik, setAcik] = useState(false);
  const ogrenci = useAuthStore((s) => s.kullanici?.rol === 'ogrenci');
  const { pathname } = useLocation();
  const ilk = useRef(true);

  // Sayfa değişince başlık güncellenir ve odak yeni sayfanın başlığına taşınır (WCAG 2.4.2, 2.4.3).
  // İlk açılışta odak taşınmaz; tarayıcı varsayılanı korunur.
  useEffect(() => {
    document.title = sayfaBasligi(pathname);
    if (ilk.current) {
      ilk.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      const h1 = document.querySelector<HTMLElement>('#icerik h1');
      const hedef = h1 ?? document.getElementById('icerik');
      if (!hedef) return;
      if (h1 && !h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1');
      hedef.focus({ preventScroll: true });
    }, 50);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Box
        component="a"
        href="#icerik"
        sx={{ position: 'absolute', left: -9999, '&:focus': { left: 16, top: 16, zIndex: 2000, bgcolor: 'background.paper', color: 'text.primary', p: 1.5, borderRadius: 1 } }}
      >
        İçeriğe geç
      </Box>
      {masaustu ? (
        <Box
          component="aside"
          sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, borderRight: 1, borderColor: 'menu.kenar', bgcolor: 'menu.zemin', position: 'sticky', top: 0, height: '100dvh' }}
        >
          <Sidebar />
        </Box>
      ) : (
        <Drawer open={acik} onClose={() => setAcik(false)} slotProps={{ paper: { sx: { width: SIDEBAR_WIDTH, bgcolor: 'menu.zemin' } } }}>
          <Sidebar onNavigate={() => setAcik(false)} />
        </Drawer>
      )}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar onMenu={() => setAcik(true)} />
        <CevrimdisiSeridi />
        <Box component="main" id="icerik" tabIndex={-1} sx={{ flex: 1, px: { xs: 2, sm: 3, md: 5 }, py: { xs: 3, md: 4 }, outline: 'none' }}>
          <Outlet />
        </Box>
      </Box>
      {ogrenci && <KortiFab />}
      {ogrenci && <OgrenciBildirimleri />}
      {ogrenci && <TanitimTuru />}
      {ogrenci && <CalismaPaneli />}
    </Box>
  );
}
