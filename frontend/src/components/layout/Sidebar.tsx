import { NavLink } from 'react-router';
import { Badge, Box, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Typography } from '@mui/material';
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  FileText,
  Gauge,
  Home,
  MessageSquare,
  MessageSquareWarning,
  RefreshCw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';
import { useDuyurular, useSenkronOzeti } from '@/api/queries';
import { LogoMark } from '@/components/Logo';
import { SISTEM_ETIKETI, saat } from '@/lib/format';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  end?: boolean;
}

function NavItems({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <>
      {items.map(({ to, label, icon: Icon, badge, end }) => (
        <ListItemButton
          key={to}
          component={NavLink}
          to={to}
          end={end}
          onClick={onNavigate}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            py: 1,
            color: 'menu.metin',
            '&:hover': { bgcolor: 'menu.kart' },
            '&.active': { bgcolor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemText-primary': { fontWeight: 600 } },
            '&.active:hover': { bgcolor: 'primary.light' },
            '&:focus-visible': { outline: 2, outlineColor: 'menu.metin', outlineStyle: 'solid', outlineOffset: -2 },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
            <Icon size={20} strokeWidth={1.75} aria-hidden />
          </ListItemIcon>
          <ListItemText primary={label} slotProps={{ primary: { sx: { fontSize: '1rem' } } }} />
          {badge ? (
            <Badge
              badgeContent={badge}
              aria-label={`${badge} okunmamış`}
              sx={{ '& .MuiBadge-badge': { position: 'static', transform: 'none', bgcolor: 'menu.rozet', color: 'menu.metin', fontWeight: 600 } }}
            />
          ) : null}
        </ListItemButton>
      ))}
    </>
  );
}

function SyncStatus() {
  const { data } = useSenkronOzeti();
  return (
    <Box sx={{ mx: 0.5, p: 1.5, borderRadius: 3, bgcolor: 'menu.kart' }} aria-label="Son senkronizasyon">
      <Typography variant="body2" sx={{ mb: 1, px: 0.5, fontWeight: 600, color: 'menu.metin' }}>
        Son senkronizasyon
      </Typography>
      {(data ?? []).map((s) => (
        <Box key={s.kaynak_sistem} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5, py: 0.5 }}>
          <Box aria-hidden sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: `sistem.${s.kaynak_sistem}` }} />
          <Typography variant="body2" sx={{ flex: 1, color: 'menu.metinIkincil' }}>
            {SISTEM_ETIKETI[s.kaynak_sistem]}
          </Typography>
          <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums', color: s.durum === 'hatali' ? 'primary.light' : 'menu.metinIkincil' }}>
            {s.son_basarili ? saat(s.son_basarili) : '–'}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const rol = useAuthStore((s) => s.kullanici?.rol);
  const { data: duyurular } = useDuyurular();
  const okunmamis = duyurular?.filter((d) => !d.okundu).length;

  const ogrenci: NavItem[] = [
    { to: '/', label: 'Panel', icon: Home, end: true },
    { to: '/derslerim', label: 'Derslerim', icon: BookOpen },
    { to: '/takvim', label: 'Takvim', icon: CalendarDays },
    { to: '/notlar', label: 'Notlar ve devam', icon: BarChart3 },
    { to: '/asistan', label: 'Asistan', icon: MessageSquare },
    { to: '/duyurular', label: 'Duyurular', icon: Bell, badge: okunmamis },
  ];
  const yonetici: NavItem[] = [
    { to: '/yonetim', label: 'Genel bakış', icon: Gauge, end: true },
    { to: '/yonetim/belgeler', label: 'Belgeler', icon: FileText },
    { to: '/yonetim/cevaplanamayan', label: 'Cevaplanamayan sorular', icon: MessageSquareWarning },
    { to: '/yonetim/senkronizasyon', label: 'Senkronizasyon', icon: RefreshCw },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1, pb: 3, pt: 0.5 }}>
        <LogoMark />
        <Box>
          <Typography sx={{ fontFamily: (t) => t.typography.h1.fontFamily, fontWeight: 700, fontSize: '1.375rem', lineHeight: 1.1, color: '#FFFFFF' }}>Korteks</Typography>
          <Typography variant="body2" sx={{ color: 'menu.metinIkincil' }}>
            {rol === 'yonetici' ? 'Yönetim paneli' : 'Öğrenci platformu'}
          </Typography>
        </Box>
      </Box>
      <Box component="nav" aria-label="Ana menü" sx={{ flex: 1, overflowY: 'auto' }}>
        <List disablePadding>
          {rol === 'yonetici' ? (
            <>
              <ListSubheader disableSticky sx={{ bgcolor: 'transparent', lineHeight: 2, px: 1, color: 'menu.baslik', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Asistan yönetimi
              </ListSubheader>
              <NavItems items={yonetici} onNavigate={onNavigate} />
            </>
          ) : (
            <NavItems items={ogrenci} onNavigate={onNavigate} />
          )}
        </List>
      </Box>
      <SyncStatus />
    </Box>
  );
}
