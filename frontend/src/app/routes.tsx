import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Link as RouterLink } from 'react-router';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ConsentPage } from '@/features/legal/ConsentPage';
import { KvkkPage } from '@/features/legal/KvkkPage';
import { KortiMascot } from '@/components/korti/KortiMascot';

// Panel dışındaki ekranlar ayrı parçalar halinde yüklenir (FOG-01: ilk yükleme ≤ 2 sn)
const CoursesPage = lazy(() => import('@/features/courses/CoursesPage').then((m) => ({ default: m.CoursesPage })));
const CourseDetailPage = lazy(() => import('@/features/courses/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })));
const CalendarPage = lazy(() => import('@/features/calendar/CalendarPage').then((m) => ({ default: m.CalendarPage })));
const GradesPage = lazy(() => import('@/features/grades/GradesPage').then((m) => ({ default: m.GradesPage })));
const AssistantPage = lazy(() => import('@/features/assistant/AssistantPage').then((m) => ({ default: m.AssistantPage })));
const AnnouncementsPage = lazy(() => import('@/features/announcements/AnnouncementsPage').then((m) => ({ default: m.AnnouncementsPage })));
const AdminOverviewPage = lazy(() => import('@/features/admin/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage })));
const DocumentsPage = lazy(() => import('@/features/admin/DocumentsPage').then((m) => ({ default: m.DocumentsPage })));
const UnansweredPage = lazy(() => import('@/features/admin/UnansweredPage').then((m) => ({ default: m.UnansweredPage })));
const PrivacyPage = lazy(() => import('@/features/legal/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const AyarlarPage = lazy(() => import('@/features/settings/AyarlarPage').then((m) => ({ default: m.AyarlarPage })));
const SyncPage = lazy(() => import('@/features/admin/SyncPage').then((m) => ({ default: m.SyncPage })));

const s = (el: ReactNode) => <Suspense fallback={<LinearProgress aria-label="Sayfa yükleniyor" />}>{el}</Suspense>;

function NotFound() {
  return (
    <Box sx={{ textAlign: 'center', py: { xs: 6, md: 10 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <KortiMascot state="sad" size={170} decorative />
      <Typography variant="h1" sx={{ mt: 2 }}>
        Sayfa bulunamadı
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        Aradığın adres taşınmış ya da hiç var olmamış olabilir.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Panele dön
      </Button>
    </Box>
  );
}

function RouteError() {
  return (
    <Box sx={{ textAlign: 'center', py: { xs: 6, md: 10 }, px: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <KortiMascot state="sad" size={170} decorative />
      <Typography variant="h1" sx={{ mt: 2 }}>
        Bir şeyler ters gitti
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        Sayfa yüklenirken beklenmeyen bir hata oluştu. Sayfayı yenileyerek tekrar dene.
      </Typography>
      <Button variant="contained" onClick={() => window.location.reload()}>
        Sayfayı yenile
      </Button>
    </Box>
  );
}

export const router = createBrowserRouter([
  { path: '/giris', element: <LoginPage /> },
  { path: '/kvkk', element: <KvkkPage /> },
  { path: '/onay', element: <ConsentPage /> },
  {
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    errorElement: <RouteError />,
    children: [
      { index: true, element: <RequireAuth rol="ogrenci"><DashboardPage /></RequireAuth> },
      { path: 'derslerim', element: <RequireAuth rol="ogrenci">{s(<CoursesPage />)}</RequireAuth> },
      { path: 'derslerim/:kod', element: <RequireAuth rol="ogrenci">{s(<CourseDetailPage />)}</RequireAuth> },
      { path: 'takvim', element: <RequireAuth rol="ogrenci">{s(<CalendarPage />)}</RequireAuth> },
      { path: 'notlar', element: <RequireAuth rol="ogrenci">{s(<GradesPage />)}</RequireAuth> },
      { path: 'asistan', element: <RequireAuth rol="ogrenci">{s(<AssistantPage />)}</RequireAuth> },
      { path: 'duyurular', element: <RequireAuth rol="ogrenci">{s(<AnnouncementsPage />)}</RequireAuth> },
      {
        path: 'yonetim',
        children: [
          { index: true, element: <RequireAuth rol="yonetici">{s(<AdminOverviewPage />)}</RequireAuth> },
          { path: 'belgeler', element: <RequireAuth rol="yonetici">{s(<DocumentsPage />)}</RequireAuth> },
          { path: 'cevaplanamayan', element: <RequireAuth rol="yonetici">{s(<UnansweredPage />)}</RequireAuth> },
          { path: 'senkronizasyon', element: <RequireAuth rol="yonetici">{s(<SyncPage />)}</RequireAuth> },
        ],
      },
      { path: 'gizlilik', element: s(<PrivacyPage />) },
      { path: 'ayarlar', element: s(<AyarlarPage />) },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
