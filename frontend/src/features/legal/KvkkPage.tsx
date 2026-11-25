import { Link as RouterLink } from 'react-router';
import { Box, Button, Paper, Typography } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { useAuthStore } from '@/features/auth/authStore';
import { KvkkText } from './KvkkText';
import { KVKK_BASLIK } from './kvkkMetni';

/** Herkese açık aydınlatma metni sayfası (giriş ekranından bağlantılı). */
export function KvkkPage() {
  const girisli = useAuthStore((s) => s.isAuthenticated());
  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', py: { xs: 3, md: 6 }, px: 2 }}>
      <Box sx={{ maxWidth: 820, mx: 'auto' }}>
        <Box sx={{ mb: 3 }}>
          <BrandLogo size={44} />
        </Box>
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
          <Typography variant="h1" sx={{ mb: 3 }}>
            {KVKK_BASLIK}
          </Typography>
          <KvkkText />
        </Paper>
        <Button
          component={RouterLink}
          to={girisli ? '/gizlilik' : '/giris'}
          startIcon={<ArrowLeft size={18} />}
          sx={{ mt: 2 }}
        >
          {girisli ? 'Gizlilik ayarlarına dön' : 'Giriş ekranına dön'}
        </Button>
      </Box>
    </Box>
  );
}
