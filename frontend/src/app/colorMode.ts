import { createContext, useContext } from 'react';
import type { PaletteMode } from '@mui/material';

/** Kullanıcının seçimi; `sistem` cihazın açık/koyu ayarını izler. */
export type TemaTercihi = PaletteMode | 'sistem';

export const TEMA_ANAHTARI = 'korteks.tema';

export interface ColorModeValue {
  /** Şu an uygulanan tema */
  mode: PaletteMode;
  tercih: TemaTercihi;
  setTercih: (t: TemaTercihi) => void;
  /** Uygulanan temanın tersine geçer ve seçimi hatırlar */
  toggle: () => void;
}

export const ColorModeContext = createContext<ColorModeValue | null>(null);

export function useColorMode(): ColorModeValue {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error('useColorMode, ColorModeProvider içinde kullanılmalı');
  return ctx;
}

export function kayitliTercih(): TemaTercihi {
  try {
    const v = localStorage.getItem(TEMA_ANAHTARI);
    return v === 'light' || v === 'dark' ? v : 'sistem';
  } catch {
    return 'sistem';
  }
}

export function tercihiKaydet(t: TemaTercihi) {
  try {
    if (t === 'sistem') localStorage.removeItem(TEMA_ANAHTARI);
    else localStorage.setItem(TEMA_ANAHTARI, t);
  } catch {
    /* gizli sekme vb.: tercih yalnızca bu oturumda geçerli olur */
  }
}
