import { createTheme, alpha } from '@mui/material/styles';
import type { KaynakSistem } from '@/api/types';

/**
 * Tasarım belirteçleri ara rapordaki arayüz taslaklarından (Şekil 5) alınmıştır.
 * Kaynak sistem renkleri tüm uygulamada sabittir: kullanıcı bir rengi gördüğünde
 * verinin hangi sistemden geldiğini öğrenir (FG-04).
 */
export const tokens = {
  lacivert: '#1D4F91',
  lacivertKoyu: '#163D72',
  zemin: '#F5F6F8',
  yuzey: '#FFFFFF',
  cizgi: '#E4E7EC',
  metin: '#1B2130',
  metinIkincil: '#5D6575',
  secili: '#E8EEF7',
  tehlike: '#C62828',
  uyari: '#B9531B',
  basari: '#2F7D5B',
  sistem: {
    OBS: '#3A6CC4',
    PUSULA: '#BF6129',
    PSG: '#6B57B3',
  } satisfies Record<KaynakSistem, string>,
};

declare module '@mui/material/styles' {
  interface Palette {
    sistem: Record<KaynakSistem, string>;
    cizgi: string;
  }
  interface PaletteOptions {
    sistem?: Record<KaynakSistem, string>;
    cizgi?: string;
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: tokens.lacivert, dark: tokens.lacivertKoyu, contrastText: '#fff' },
    error: { main: tokens.tehlike },
    warning: { main: tokens.uyari },
    success: { main: tokens.basari },
    background: { default: tokens.zemin, paper: tokens.yuzey },
    text: { primary: tokens.metin, secondary: tokens.metinIkincil },
    divider: tokens.cizgi,
    sistem: tokens.sistem,
    cizgi: tokens.cizgi,
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    h1: { fontSize: '1.875rem', fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.01em' },
    h2: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.3 },
    h3: { fontSize: '1.0625rem', fontWeight: 600, lineHeight: 1.35 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.55 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    caption: { fontSize: '0.8125rem', lineHeight: 1.4 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { WebkitFontSmoothing: 'antialiased' },
        ':focus-visible': { outline: `2px solid ${tokens.lacivert}`, outlineOffset: 2 },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': { animationDuration: '0.01ms !important', transitionDuration: '0.01ms !important' },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { outlined: { borderColor: tokens.cizgi } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, paddingInline: 16, minHeight: 40 },
        outlined: { borderColor: tokens.cizgi, color: tokens.metin, backgroundColor: '#fff' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500 },
        outlined: { borderColor: tokens.cizgi, backgroundColor: '#fff' },
      },
    },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500, fontSize: '0.9375rem', minHeight: 48 } } },
    MuiTableCell: {
      styleOverrides: {
        head: { color: tokens.metinIkincil, fontWeight: 500, fontSize: '0.8125rem' },
        root: { borderColor: tokens.cizgi },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: '#fff', '& fieldset': { borderColor: tokens.cizgi } },
      },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { height: 6, borderRadius: 3, backgroundColor: alpha(tokens.metin, 0.07) }, bar: { borderRadius: 3 } },
    },
    MuiTooltip: { defaultProps: { arrow: true } },
  },
});
