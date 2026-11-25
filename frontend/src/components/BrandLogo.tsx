import { useTheme } from '@mui/material';
import { KorteksLogo, type KorteksLogoVariant } from './KorteksLogo';

/**
 * Sayfa zeminine göre doğru logo sürümünü seçer: açık temada `light`, koyu temada `dark`.
 * Yan menü her iki temada lacivert olduğu için orada doğrudan `theme="dark"` kullanılır.
 * Kılavuz: işaret 24 px, yatay logo 120 px genişliğin altında kullanılmaz.
 */
export function BrandLogo({ variant = 'horizontal', size = 40 }: { variant?: KorteksLogoVariant; size?: number }) {
  const { palette } = useTheme();
  return <KorteksLogo variant={variant} size={size} theme={palette.mode === 'dark' ? 'dark' : 'light'} />;
}
