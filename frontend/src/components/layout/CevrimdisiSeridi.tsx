import { useQueryClient } from '@tanstack/react-query';
import { Box, Typography } from '@mui/material';
import { WifiOff } from 'lucide-react';
import dayjs from '@/lib/dayjs';
import { useCevrimici } from '@/lib/useCevrimici';

/**
 * Bağlantı yokken üstte görünen şerit (FOG-09). Panel hata vermez, önbellekteki son veriyi
 * hangi saate ait olduğunu belirterek gösterir.
 */
export function CevrimdisiSeridi() {
  const cevrimici = useCevrimici();
  const qc = useQueryClient();
  if (cevrimici) return null;
  const sonGuncelleme = Math.max(0, ...qc.getQueryCache().getAll().map((q) => q.state.dataUpdatedAt));
  const zaman = sonGuncelleme ? dayjs(sonGuncelleme) : null;
  const metin = zaman ? (zaman.isSame(dayjs(), 'day') ? `bugün ${zaman.format('HH.mm')}` : zaman.format('D MMMM HH.mm')) : null;
  return (
    <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: { xs: 2, md: 5 }, py: 1, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
      <WifiOff size={18} aria-hidden />
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        Çevrimdışısın.{' '}
        {metin ? `Gösterilen veriler ${metin} itibarıyla; bağlantı gelince kendiliğinden güncellenir.` : 'Bağlantı gelince veriler yüklenecek.'}
      </Typography>
    </Box>
  );
}
