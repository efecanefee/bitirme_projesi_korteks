import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { LogOut, Menu as MenuIcon, Moon, ShieldCheck, Sun } from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';
import { GlobalArama } from '@/features/search/GlobalArama';
import { BildirimZili } from '@/features/notifications/BildirimZili';
import { onbellegiTemizle } from '@/app/onbellek';
import { useBildirimStore } from '@/features/notifications/bildirimStore';
import { basHarfler } from '@/lib/format';
import { endpoints } from '@/api/endpoints';
import { useQueryClient } from '@tanstack/react-query';
import { useColorMode } from '@/app/colorMode';

/** Açık/koyu tema düğmesi; seçim tarayıcıda hatırlanır. */
export function ThemeToggle() {
  const { mode, toggle } = useColorMode();
  const koyu = mode === 'dark';
  return (
    <Tooltip title={koyu ? 'Açık tema' : 'Koyu tema'}>
      <IconButton
        onClick={toggle}
        aria-label={koyu ? 'Açık temaya geç' : 'Koyu temaya geç'}
        aria-pressed={koyu}
        sx={{ border: 1, borderColor: 'divider', width: 44, height: 44 }}
      >
        {koyu ? <Sun size={20} strokeWidth={1.75} aria-hidden /> : <Moon size={20} strokeWidth={1.75} aria-hidden />}
      </IconButton>
    </Tooltip>
  );
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const theme = useTheme();
  const masaustu = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const qc = useQueryClient();
  const kullanici = useAuthStore((s) => s.kullanici);
  const logout = useAuthStore((s) => s.logout);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const cikis = async () => {
    setAnchor(null);
    try {
      await endpoints.auth.logout();
    } catch {
      /* sunucu yanıt vermese de yerel oturum kapatılır */
    }
    logout();
    useBildirimStore.getState().temizle();
    qc.clear();
    void onbellegiTemizle();
    navigate('/giris', { replace: true });
  };

  if (!kullanici) return null;
  const alt = kullanici.rol === 'yonetici' ? 'Yönetici' : `${kullanici.bolum} · ${kullanici.sinif}. sınıf`;

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: { xs: 2, md: 5 },
        height: { xs: 64, md: 76 },
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      {!masaustu && (
        <IconButton onClick={onMenu} aria-label="Menüyü aç" edge="start">
          <MenuIcon size={22} />
        </IconButton>
      )}
      {kullanici.rol === 'ogrenci' ? <GlobalArama /> : <Box sx={{ flex: 1 }} />}
      <Box sx={{ ml: 'auto !important' }}>
        <ThemeToggle />
      </Box>
      {kullanici.rol === 'ogrenci' && <BildirimZili />}
      <Box
        component="button"
        type="button"
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-haspopup="menu"
        aria-label="Hesap menüsü"
        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, border: 0, bgcolor: 'transparent', cursor: 'pointer', p: 0.5, borderRadius: 2, font: 'inherit', color: 'inherit', textAlign: 'left' }}
      >
        <Avatar sx={{ width: 44, height: 44, bgcolor: 'secondary.main', color: 'secondary.contrastText', fontWeight: 700, fontSize: '1rem' }}>
          {basHarfler(kullanici.ad_soyad)}
        </Avatar>
        {masaustu && (
          <Box>
            <Typography sx={{ fontWeight: 600, lineHeight: 1.2 }}>{kullanici.ad_soyad}</Typography>
            <Typography variant="body2" color="text.secondary">
              {alt}
            </Typography>
          </Box>
        )}
      </Box>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Box sx={{ px: 2, py: 1 }}>
          <Typography sx={{ fontWeight: 600 }}>{kullanici.ad_soyad}</Typography>
          <Typography variant="body2" color="text.secondary">
            {kullanici.e_posta}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchor(null);
            navigate('/gizlilik');
          }}
        >
          <ListItemIcon>
            <ShieldCheck size={18} />
          </ListItemIcon>
          Gizlilik ve KVKK
        </MenuItem>
        <MenuItem onClick={cikis}>
          <ListItemIcon>
            <LogOut size={18} />
          </ListItemIcon>
          Çıkış yap
        </MenuItem>
      </Menu>
    </Box>
  );
}
