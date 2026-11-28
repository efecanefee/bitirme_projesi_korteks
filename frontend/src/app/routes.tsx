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
const CourseSchedulePage = lazy(() => import('@/features/courses/CourseSchedulePage').then((m) => ({ default: m.CourseSchedulePage })));
const CourseMaterialsPage = lazy(() => import('@/features/courses/CourseMaterialsPage').then((m) => ({ default: m.CourseMaterialsPage })));
const AssignmentsPage = lazy(() => import('@/features/courses/AssignmentsPage').then((m) => ({ default: m.AssignmentsPage })));
const CalendarPage = lazy(() => import('@/features/calendar/CalendarPage').then((m) => ({ default: m.CalendarPage })));
const AcademicCalendarPage = lazy(() => import('@/features/calendar/AcademicCalendarPage').then((m) => ({ default: m.AcademicCalendarPage })));
const GradesPage = lazy(() => import('@/features/grades/GradesPage').then((m) => ({ default: m.GradesPage })));
const TranscriptPage = lazy(() => import('@/features/grades/TranscriptPage').then((m) => ({ default: m.TranscriptPage })));
const CurriculumPage = lazy(() => import('@/features/grades/CurriculumPage').then((m) => ({ default: m.CurriculumPage })));
const ExamSchedulePage = lazy(() => import('@/features/exams/ExamSchedulePage').then((m) => ({ default: m.ExamSchedulePage })));
const OnlineExamsPage = lazy(() => import('@/features/exams/OnlineExamsPage').then((m) => ({ default: m.OnlineExamsPage })));
const AssistantPage = lazy(() => import('@/features/assistant/AssistantPage').then((m) => ({ default: m.AssistantPage })));
const ChatHistoryPage = lazy(() => import('@/features/assistant/ChatHistoryPage').then((m) => ({ default: m.ChatHistoryPage })));
const AnnouncementsPage = lazy(() => import('@/features/announcements/AnnouncementsPage').then((m) => ({ default: m.AnnouncementsPage })));
const ProfileAdvisorPage = lazy(() => import('@/features/account/ProfileAdvisorPage').then((m) => ({ default: m.ProfileAdvisorPage })));
const NotificationsPage = lazy(() => import('@/features/account/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const StudentSyncPage = lazy(() => import('@/features/account/StudentSyncPage').then((m) => ({ default: m.StudentSyncPage })));
const AdminOverviewPage = lazy(() => import('@/features/admin/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage })));
const DocumentsPage = lazy(() => import('@/features/admin/DocumentsPage').then((m) => ({ default: m.DocumentsPage })));
const UnansweredPage = lazy(() => import('@/features/admin/UnansweredPage').then((m) => ({ default: m.UnansweredPage })));
const PrivacyPage = lazy(() => import('@/features/legal/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
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
      { path: 'duyurular', element: <RequireAuth rol="ogrenci">{s(<AnnouncementsPage />)}</RequireAuth> },
      { path: 'akademik-takvim', element: <RequireAuth rol="ogrenci">{s(<AcademicCalendarPage />)}</RequireAuth> },
      { path: 'takvim', element: <RequireAuth rol="ogrenci">{s(<CalendarPage />)}</RequireAuth> },
      { path: 'derslerim', element: <RequireAuth rol="ogrenci">{s(<CoursesPage />)}</RequireAuth> },
      { path: 'derslerim/:kod', element: <RequireAuth rol="ogrenci">{s(<CourseDetailPage />)}</RequireAuth> },
      { path: 'ders-programi', element: <RequireAuth rol="ogrenci">{s(<CourseSchedulePage />)}</RequireAuth> },
      { path: 'ders-icerikleri', element: <RequireAuth rol="ogrenci">{s(<CourseMaterialsPage />)}</RequireAuth> },
      { path: 'odevler', element: <RequireAuth rol="ogrenci">{s(<AssignmentsPage />)}</RequireAuth> },
      { path: 'notlar', element: <RequireAuth rol="ogrenci">{s(<GradesPage />)}</RequireAuth> },
      { path: 'devamsizlik', element: <RequireAuth rol="ogrenci">{s(<GradesPage />)}</RequireAuth> },
      { path: 'transkript', element: <RequireAuth rol="ogrenci">{s(<TranscriptPage />)}</RequireAuth> },
      { path: 'mufredat', element: <RequireAuth rol="ogrenci">{s(<CurriculumPage />)}</RequireAuth> },
      { path: 'sinav-takvimi', element: <RequireAuth rol="ogrenci">{s(<ExamSchedulePage />)}</RequireAuth> },
      { path: 'sanal-sinif', element: <RequireAuth rol="ogrenci">{s(<OnlineExamsPage />)}</RequireAuth> },
      { path: 'asistan', element: <RequireAuth rol="ogrenci">{s(<AssistantPage />)}</RequireAuth> },
      { path: 'sohbet-gecmisi', element: <RequireAuth rol="ogrenci">{s(<ChatHistoryPage />)}</RequireAuth> },
      { path: 'profil', element: <RequireAuth rol="ogrenci">{s(<ProfileAdvisorPage />)}</RequireAuth> },
      { path: 'bildirimler', element: <RequireAuth rol="ogrenci">{s(<NotificationsPage />)}</RequireAuth> },
      { path: 'veri-kaynaklari', element: <RequireAuth rol="ogrenci">{s(<StudentSyncPage />)}</RequireAuth> },
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
      { path: '*', element: <NotFound /> },
    ],
  },
]);
