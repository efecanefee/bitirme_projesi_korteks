import { createTheme, alpha, type PaletteMode, type Theme } from '@mui/material/styles';
import type { KaynakSistem } from '@/api/types';

/**
 * Korteks tasarım belirteçleri.
 *
 * Marka renkleri seçilen logodan ("01 · Klasik Devre", Atomic renk düzeni) gelir:
 * Atomic Orange vurgu, Ice Cream Blue yüzey, lacivert metin ve menü.
 *
 * Kaynak sistem renkleri tüm uygulamada sabittir: kullanıcı bir rengi gördüğünde
 * verinin hangi sistemden geldiğini öğrenir (FG-04). Pusula eskiden turuncuydu;
 * marka turuncusuyla karışmasın diye teal'e alındı.
 *
 * Erişilebilirlik (WCAG 2.1 AA, rapor Tablo 1): turuncu zemin üstünde metin
 * lacivert yazılır (yaklaşık 5.6:1); beyaz metin turuncu üstünde AA'yı geçmez.
 * Turuncu metin gerektiğinde açık temada `vurguMetin` (#B23A0E, ~6:1) kullanılır.
 */
export const marka = {
  turuncu: '#FF5C23',
  turuncuAcik: '#FF7A45',
  turuncuKoyu: '#E2400C',
  buz: '#C8F3FF',
  lacivert: '#0B1B2B',
} as const;

interface MenuRenkleri {
  zemin: string;
  kenar: string;
  metin: string;
  metinIkincil: string;
  baslik: string;
  rozet: string;
  kart: string;
}

interface Belirtecler {
  zemin: string;
  yuzey: string;
  yuzeyIkincil: string;
  cizgi: string;
  metin: string;
  metinIkincil: string;
  secili: string;
  vurguZemin: string;
  vurguMetin: string;
  tehlike: string;
  uyari: string;
  basari: string;
  basariZemin: string;
  sistem: Record<KaynakSistem, string>;
  menu: MenuRenkleri;
}

const acik: Belirtecler = {
  zemin: '#F4FBFD',
  yuzey: '#FFFFFF',
  yuzeyIkincil: '#F4FBFD',
  cizgi: '#D6EAF1',
  metin: marka.lacivert,
  metinIkincil: '#3E5366',
  secili: '#E6F7FC',
  vurguZemin: '#FFF1EB',
  vurguMetin: '#B23A0E',
  tehlike: '#C62828',
  uyari: '#B23A0E',
  basari: '#17794E',
  basariZemin: '#E3F7EE',
  sistem: { OBS: '#3A7BD5', PUSULA: '#14A38B', PSG: '#8B5CF6' },
  menu: {
    zemin: marka.lacivert,
    kenar: marka.lacivert,
    metin: marka.buz,
    metinIkincil: '#9FBFCF',
    baslik: '#6F8FA3',
    rozet: '#1E3A52',
    kart: '#12293F',
  },
};

const koyu: Belirtecler = {
  zemin: marka.lacivert,
  yuzey: '#0F2234',
  yuzeyIkincil: '#10263A',
  cizgi: '#1E3A52',
  metin: '#EAF8FD',
  metinIkincil: '#9FBFCF',
  secili: '#12324A',
  vurguZemin: '#3A1E14',
  vurguMetin: '#FF9E7A',
  tehlike: '#FF8A80',
  uyari: '#FF9E7A',
  basari: '#5FD8A0',
  basariZemin: '#0E3B2A',
  sistem: { OBS: '#6AA5F0', PUSULA: '#3CCBB0', PSG: '#A98BFA' },
  menu: {
    zemin: '#06111C',
    kenar: '#1E3A52',
    metin: marka.buz,
    metinIkincil: '#9FBFCF',
    baslik: '#6F8FA3',
    rozet: '#1E3A52',
    kart: '#0F2234',
  },
};

export const belirtecler: Record<PaletteMode, Belirtecler> = { light: acik, dark: koyu };

declare module '@mui/material/styles' {
  interface Palette {
    sistem: Record<KaynakSistem, string>;
    cizgi: string;
    secili: string;
    yuzeyIkincil: string;
    vurguZemin: string;
    vurguMetin: string;
    basariZemin: string;
    menu: MenuRenkleri;
  }
  interface PaletteOptions {
    sistem?: Record<KaynakSistem, string>;
    cizgi?: string;
    secili?: string;
    yuzeyIkincil?: string;
    vurguZemin?: string;
    vurguMetin?: string;
    basariZemin?: string;
    menu?: MenuRenkleri;
  }
  interface TypographyVariants {
    sayi: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    sayi?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    sayi: true;
  }
}

const BASLIK_FONTU = '"Space Grotesk", "IBM Plex Sans", system-ui, sans-serif';

export function createAppTheme(mode: PaletteMode): Theme {
  const t = belirtecler[mode];
  return createTheme({
    palette: {
      mode,
      primary: { main: marka.turuncu, light: marka.turuncuAcik, dark: marka.turuncuKoyu, contrastText: marka.lacivert },
      secondary: { main: mode === 'light' ? marka.lacivert : marka.buz, contrastText: mode === 'light' ? '#FFFFFF' : marka.lacivert },
      error: { main: t.tehlike },
      warning: { main: t.uyari },
      success: { main: t.basari },
      info: { main: t.sistem.OBS },
      background: { default: t.zemin, paper: t.yuzey },
      text: { primary: t.metin, secondary: t.metinIkincil },
      divider: t.cizgi,
      sistem: t.sistem,
      cizgi: t.cizgi,
      secili: t.secili,
      yuzeyIkincil: t.yuzeyIkincil,
      vurguZemin: t.vurguZemin,
      vurguMetin: t.vurguMetin,
      basariZemin: t.basariZemin,
      menu: t.menu,
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
      h1: { fontFamily: BASLIK_FONTU, fontSize: '1.875rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' },
      h2: { fontFamily: BASLIK_FONTU, fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.01em' },
      h3: { fontFamily: BASLIK_FONTU, fontSize: '1.0625rem', fontWeight: 700, lineHeight: 1.35 },
      sayi: { fontFamily: BASLIK_FONTU, fontWeight: 700, fontVariantNumeric: 'tabular-nums' },
      body1: { fontSize: '0.9375rem', lineHeight: 1.55 },
      body2: { fontSize: '0.875rem', lineHeight: 1.5 },
      caption: { fontSize: '0.8125rem', lineHeight: 1.4 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { colorScheme: mode },
          body: { WebkitFontSmoothing: 'antialiased' },
          ':focus-visible': { outline: `2px solid ${mode === 'light' ? marka.lacivert : marka.buz}`, outlineOffset: 2 },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': { animationDuration: '0.01ms !important', transitionDuration: '0.01ms !important' },
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: { backgroundImage: 'none' }, outlined: { borderColor: t.cizgi } },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 10, paddingInline: 16, minHeight: 40 },
          outlined: { borderColor: t.cizgi, color: t.metin, backgroundColor: t.yuzey, '&:hover': { borderColor: t.metinIkincil, backgroundColor: t.yuzeyIkincil } },
          text: { color: t.metin },
        },
      },
      MuiIconButton: {
        styleOverrides: { root: { color: t.metin } },
      },
      MuiLink: {
        defaultProps: { color: 'inherit' },
        styleOverrides: {
          root: { fontWeight: 600, textDecorationColor: alpha(marka.turuncu, 0.7), '&:hover': { textDecorationColor: marka.turuncu } },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 500 },
          outlined: { borderColor: t.cizgi, backgroundColor: t.yuzey },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 500, fontSize: '0.9375rem', minHeight: 48, '&.Mui-selected': { color: t.metin, fontWeight: 600 } },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: { color: t.metinIkincil, fontWeight: 500, fontSize: '0.8125rem' },
          root: { borderColor: t.cizgi },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: t.yuzey,
            '& fieldset': { borderColor: t.cizgi },
            '&:hover fieldset': { borderColor: t.metinIkincil },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: { root: { height: 6, borderRadius: 3, backgroundColor: alpha(t.metin, 0.08) }, bar: { borderRadius: 3 } },
      },
      MuiAlert: {
        styleOverrides: { outlined: { backgroundColor: t.yuzey } },
      },
      MuiMenu: {
        styleOverrides: { paper: { border: `1px solid ${t.cizgi}` } },
      },
      MuiTooltip: { defaultProps: { arrow: true } },
    },
  });
}

/** Testler ve tema bağlamı dışında kullanılan varsayılan (açık) tema. */
export const theme = createAppTheme('light');
