import { NavLink, useNavigate } from 'react-router';
import {
  Badge,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
} from '@mui/material';
import {
  BarChart3,
  Bell,
  BellRing,
  BookMarked,
  BookOpen,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  Database,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Gauge,
  GraduationCap,
  History,
  Home,
  LogOut,
  MessageSquare,
  MessageSquareWarning,
  MonitorPlay,
  NotebookPen,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/authStore';
import { useDuyurular, useSenkronOzeti } from '@/api/queries';
import { endpoints } from '@/api/endpoints';
import { KorteksLogo } from '@/components/KorteksLogo';
import { SISTEM_ETIKETI, saat } from '@/lib/format';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  end?: boolean;
}

interface NavGroup {
  baslik: string;
  ogeler: NavItem[];
}

function GroupHeader({ children }: { children: string }) {
  return (
    <ListSubheader
      disableSticky
      sx={{
        bgcolor: 'transparent',
        lineHeight: 1.8,
        px: 1,
        pt: 1.5,
        pb: 0.25,
        color: 'menu.baslik',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </ListSubheader>
  );
}

function NavItems({
  items,
  onNavigate,
  onBeforeNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
  onBeforeNavigate?: (to: string, e: React.MouseEvent) => void;
}) {
  return (
    <>
      {items.map(({ to, label, icon: Icon, badge, end }) => (
        <ListItemButton
          key={to}
          component={NavLink}
          to={to}
          end={end}
          onClick={(e) => {
            onBeforeNavigate?.(to, e);
            onNavigate?.();
          }}
          sx={{
            borderRadius: 2,
            mb: 0.25,
            py: 0.75,
            px: 1.25,
            color: 'menu.metin',
            '&:hover': { bgcolor: 'menu.kart' },
            '&.active': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '& .MuiListItemText-primary': { fontWeight: 600 },
            },
            '&.active:hover': { bgcolor: 'primary.light' },
            '&:focus-visible': { outline: 2, outlineColor: 'menu.metin', outlineStyle: 'solid', outlineOffset: -2 },
          }}
        >
          <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>
            <Icon size={18} strokeWidth={1.75} aria-hidden />
          </ListItemIcon>
          <ListItemText primary={label} slotProps={{ primary: { sx: { fontSize: '0.9125rem' } } }} />
          {badge ? (
            <Badge
              badgeContent={badge}
              aria-label={`${badge} okunmamış`}
              sx={{
                '& .MuiBadge-badge': {
                  position: 'static',
                  transform: 'none',
                  bgcolor: 'menu.rozet',
                  color: 'menu.metin',
                  fontWeight: 600,
                },
              }}
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
    <Box sx={{ mx: 0.5, mt: 1.5, p: 1.25, borderRadius: 2.5, bgcolor: 'menu.kart' }} aria-label="Son senkronizasyon">
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5, px: 0.5, fontWeight: 600, color: 'menu.metin' }}>
        Son senkronizasyon
      </Typography>
      {(data ?? []).map((s) => (
        <Box key={s.kaynak_sistem} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5, py: 0.25 }}>
          <Box aria-hidden sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: `sistem.${s.kaynak_sistem}` }} />
          <Typography variant="caption" sx={{ flex: 1, color: 'menu.metinIkincil' }}>
            {SISTEM_ETIKETI[s.kaynak_sistem]}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontVariantNumeric: 'tabular-nums',
              color: s.durum === 'hatali' ? 'primary.light' : 'menu.metinIkincil',
            }}
          >
            {s.son_basarili ? saat(s.son_basarili) : '–'}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const rol = useAuthStore((s) => s.kullanici?.rol);
  const setSession = useAuthStore((s) => s.setSession);
  const logout = useAuthStore((s) => s.logout);
  const { data: duyurular } = useDuyurular();
  const okunmamis = duyurular?.filter((d) => !d.okundu).length;

  const ogrenciSayfasinaGec = async (to: string, e: React.MouseEvent) => {
    if (rol === 'yonetici' && to !== '/gizlilik') {
      e.preventDefault();
      try {
        const t = await endpoints.auth.login({ e_posta: 'deniz.yilmaz@ogr.beykent.edu.tr', sifre: 'korteks123' });
        setSession(t.access_token, t.expires_in, t.kullanici);
        qc.clear();
        navigate(to);
      } catch {
        /* demo geçiş hatası */
      }
    }
  };

  const cikisYap = async () => {
    onNavigate?.();
    try {
      await endpoints.auth.logout();
    } catch {
      /* sunucu hatası olsa bile yerel oturum kapatılır */
    }
    logout();
    qc.clear();
    navigate('/giris', { replace: true });
  };

  const ogrenciGruplari: NavGroup[] = [
    {
      baslik: 'Genel',
      ogeler: [
        { to: '/', label: 'Ana Panel', icon: Home, end: true },
        { to: '/duyurular', label: 'Duyurular', icon: Bell, badge: okunmamis },
        { to: '/akademik-takvim', label: 'Akademik Takvim', icon: CalendarRange },
      ],
    },
    {
      baslik: 'Derslerim',
      ogeler: [
        { to: '/derslerim', label: 'Alınan Dersler', icon: BookOpen },
        { to: '/ders-programi', label: 'Ders Programı', icon: CalendarClock },
        { to: '/ders-icerikleri', label: 'Ders İçerikleri (Pusula)', icon: FolderOpen },
        { to: '/odevler', label: 'Ödevler', icon: NotebookPen },
      ],
    },
    {
      baslik: 'Notlar ve Durum',
      ogeler: [
        { to: '/notlar', label: 'Not Listesi', icon: BarChart3 },
        { to: '/devamsizlik', label: 'Devamsızlık Durumu', icon: ClipboardCheck },
        { to: '/transkript', label: 'Transkript (AGNO)', icon: FileSpreadsheet },
        { to: '/mufredat', label: 'Müfredat Bilgi Paketi', icon: BookMarked },
      ],
    },
    {
      baslik: 'Sınavlar',
      ogeler: [
        { to: '/sinav-takvimi', label: 'Sınav Takvimi (PSG)', icon: GraduationCap },
        { to: '/sanal-sinif', label: 'Çevrim İçi Sınav & Sanal Sınıf', icon: MonitorPlay },
        { to: '/takvim', label: 'Aylık Takvim', icon: CalendarDays },
      ],
    },
    {
      baslik: 'Asistan',
      ogeler: [
        { to: '/asistan', label: 'Korteks Asistan', icon: MessageSquare },
        { to: '/sohbet-gecmisi', label: 'Sohbet Geçmişi', icon: History },
      ],
    },
    {
      baslik: 'Hesap',
      ogeler: [
        { to: '/profil', label: 'Profil ve Danışman', icon: UserCheck },
        { to: '/bildirimler', label: 'Bildirimler & Hatırlatma', icon: BellRing },
        { to: '/veri-kaynaklari', label: 'Veri Kaynakları & Senkron', icon: Database },
        { to: '/gizlilik', label: 'Gizlilik ve KVKK', icon: ShieldCheck },
      ],
    },
  ];

  const yonetici: NavItem[] = [
    { to: '/yonetim', label: 'İstatistikler (Genel Bakış)', icon: Gauge, end: true },
    { to: '/yonetim/belgeler', label: 'Belge Yönetimi', icon: FileText },
    { to: '/yonetim/cevaplanamayan', label: 'Cevaplanamayan Sorular', icon: MessageSquareWarning },
    { to: '/yonetim/senkronizasyon', label: 'Senkronizasyon Logları', icon: RefreshCw },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      <Box sx={{ px: 1, pb: 2, pt: 0.5 }}>
        <KorteksLogo theme="dark" size={40} title="Korteks ana sayfa" />
        {rol === 'yonetici' && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              pl: 0.5,
              color: 'menu.metinIkincil',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Yönetim paneli
          </Typography>
        )}
      </Box>
      <Box
        component="nav"
        aria-label="Ana menü"
        sx={{
          flex: 1,
          overflowY: 'auto',
          pr: 0.5,
          '&::-webkit-scrollbar': { width: 5 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'menu.kenar', borderRadius: 3 },
        }}
      >
        <List disablePadding>
          {rol === 'yonetici' && (
            <Box>
              <GroupHeader>Yönetici Menüsü</GroupHeader>
              <NavItems items={yonetici} onNavigate={onNavigate} />
            </Box>
          )}
          {ogrenciGruplari.map((grup) => (
            <Box key={grup.baslik}>
              <GroupHeader>{grup.baslik}</GroupHeader>
              <NavItems items={grup.ogeler} onNavigate={onNavigate} onBeforeNavigate={ogrenciSayfasinaGec} />
            </Box>
          ))}
          <ListItemButton
            onClick={cikisYap}
            sx={{
              borderRadius: 2,
              mt: 0.5,
              py: 0.75,
              px: 1.25,
              color: 'menu.metinIkincil',
              '&:hover': { bgcolor: 'menu.kart', color: 'menu.metin' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>
              <LogOut size={18} strokeWidth={1.75} aria-hidden />
            </ListItemIcon>
            <ListItemText primary="Çıkış" slotProps={{ primary: { sx: { fontSize: '0.9125rem' } } }} />
          </ListItemButton>
        </List>
      </Box>
      <SyncStatus />
    </Box>
  );
}
