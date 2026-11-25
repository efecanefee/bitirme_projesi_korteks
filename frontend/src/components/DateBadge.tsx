import { Box, Typography } from '@mui/material';
import dayjs from '@/lib/dayjs';

/** Taslaktaki "12 / Kas, Per" tarih rozeti. */
export function DateBadge({ iso }: { iso: string }) {
  const t = dayjs(iso);
  return (
    <Box
      aria-label={t.format('D MMMM dddd')}
      sx={{ width: 64, flexShrink: 0, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2, py: 0.75, bgcolor: 'background.paper' }}
    >
      <Typography aria-hidden sx={{ fontWeight: 700, fontSize: '1.375rem', lineHeight: 1.15 }}>
        {t.format('D')}
      </Typography>
      <Typography aria-hidden variant="caption" color="text.secondary">
        {t.format('MMM, ddd')}
      </Typography>
    </Box>
  );
}
