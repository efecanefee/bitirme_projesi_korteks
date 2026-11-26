import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ONBELLEK_OMRU_MS, ONBELLEK_SURUMU, persister, saklanabilir } from './onbellek';
import { createAppTheme } from './theme';
import { useAyarlar } from './ayarlar';
import { createQueryClient } from './queryClient';
import { ColorModeContext, kayitliTercih, tercihiKaydet, type ColorModeValue, type TemaTercihi } from './colorMode';

/** Açık/koyu tema: ilk açılışta cihaz ayarı, kullanıcı seçince onun tercihi (localStorage). */
export function ColorModeProvider({ children }: { children: ReactNode }) {
  const sistemKoyu = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const [tercih, setTercihState] = useState<TemaTercihi>(kayitliTercih);
  const mode = tercih === 'sistem' ? (sistemKoyu ? 'dark' : 'light') : tercih;

  const setTercih = useCallback((t: TemaTercihi) => {
    tercihiKaydet(t);
    setTercihState(t);
  }, []);

  const value = useMemo<ColorModeValue>(
    () => ({ mode, tercih, setTercih, toggle: () => setTercih(mode === 'dark' ? 'light' : 'dark') }),
    [mode, tercih, setTercih],
  );
  const kontrast = useAyarlar((s) => s.yuksekKontrast);
  const yaziBoyutu = useAyarlar((s) => s.yaziBoyutu);
  const hareketAzalt = useAyarlar((s) => s.hareketAzalt);
  const theme = useMemo(() => createAppTheme(mode, { kontrast }), [mode, kontrast]);

  useEffect(() => {
    // Yazı boyutu kök öğeye uygulanır; MUI rem kullandığı için arayüz orantılı büyür (WCAG 1.4.4)
    document.documentElement.style.fontSize = yaziBoyutu === 100 ? '' : `${yaziBoyutu}%`;
    document.documentElement.classList.toggle('hareket-azalt', hareketAzalt);
  }, [yaziBoyutu, hareketAzalt]);

  useEffect(() => {
    // Mobil tarayıcı çubuğu ve PWA başlığı temaya uysun
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.palette.background.default);
  }, [theme]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(createQueryClient);
  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{ persister, maxAge: ONBELLEK_OMRU_MS, buster: ONBELLEK_SURUMU, dehydrateOptions: { shouldDehydrateQuery: saklanabilir } }}
    >
      <ColorModeProvider>{children}</ColorModeProvider>
    </PersistQueryClientProvider>
  );
}
