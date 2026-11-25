import type { ReactNode } from 'react';
import { Box, Paper, Typography, type SxProps, type Theme } from '@mui/material';

interface Props {
  title: string;
  /** Başlığın sağındaki alan: kaynak etiketi veya bağlantı */
  action?: ReactNode;
  children: ReactNode;
  /** İçerik kendi iç boşluğunu yönetiyorsa (tablo, liste) */
  flush?: boolean;
  sx?: SxProps<Theme>;
  headingLevel?: 'h2' | 'h3';
}

export function SectionCard({ title, action, children, flush, sx, headingLevel = 'h2' }: Props) {
  const id = `kart-${title.toLocaleLowerCase('tr-TR').replace(/[^a-z0-9ğüşıöç]+/g, '-')}`;
  return (
    <Paper variant="outlined" component="section" aria-labelledby={id} sx={{ borderRadius: 3, overflow: 'hidden', ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', columnGap: 2, rowGap: 0.5, px: 3, pt: 2.5, pb: flush ? 2 : 1.5 }}>
        <Typography id={id} variant="h2" component={headingLevel} sx={{ fontSize: '1.125rem' }}>
          {title}
        </Typography>
        {action}
      </Box>
      <Box sx={flush ? undefined : { px: 3, pb: 2.5 }}>{children}</Box>
    </Paper>
  );
}
