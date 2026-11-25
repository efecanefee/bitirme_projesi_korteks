import { Box } from '@mui/material';
import { marka } from '@/app/theme';

/** Korteks işareti: beyin kıvrımlarını andıran sade bir kalkan. */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        borderRadius: size * 0.25 + 'px',
        bgcolor: marka.turuncu,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none" stroke={marka.lacivert} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3c-3.5 0-7 1.5-7 1.5v7c0 5 7 9.5 7 9.5s7-4.5 7-9.5v-7S15.5 3 12 3z" />
        <path d="M12 7v10" />
        <path d="M12 9.5c-1.6 0-2.8-.9-2.8-2.1M12 9.5c1.6 0 2.8-.9 2.8-2.1" />
        <path d="M12 13.5c-1.8 0-3.2 1-3.2 2.3M12 13.5c1.8 0 3.2 1 3.2 2.3" />
      </svg>
    </Box>
  );
}
