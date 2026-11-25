import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { createAppTheme } from './theme';
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
  const theme = useMemo(() => createAppTheme(mode), [mode]);

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
    <QueryClientProvider client={client}>
      <ColorModeProvider>{children}</ColorModeProvider>
    </QueryClientProvider>
  );
}
