import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material';
import { theme } from '@/app/theme';
import { useAuthStore } from '@/features/auth/authStore';
import { kullanicilar } from '@/mocks/data';
import { KVKK_SURUM } from '@/features/legal/kvkkMetni';

export function girisYap(rol: 'ogrenci' | 'yonetici' = 'ogrenci') {
  const k = kullanicilar.find((x) => x.rol === rol)!;
  const { sifre: _s, ...kullanici } = k;
  void _s;
  // Testlerde öğrenci güncel metni onaylamış sayılır; onay akışı kendi testinde denenir
  const riza = { metin_surumu: KVKK_SURUM, tarih: new Date().toISOString(), sohbet_degerlendirme: false };
  useAuthStore.getState().setSession(`mock.${k.id}.test`, 3600, { ...kullanici, riza });
}

export function renderRoute(element: ReactElement, { path = '/', url = '/', extra = [] as RouteObject[] } = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const router = createMemoryRouter([{ path, element }, ...extra, { path: '*', element: <div>diger-sayfa</div> }], { initialEntries: [url] });
  const utils = render(
    <QueryClientProvider client={client}>
      <ThemeProvider theme={theme}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>,
  );
  return { ...utils, router, client };
}
