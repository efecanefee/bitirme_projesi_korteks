import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { endpoints } from '@/api/endpoints';
import { ApiError } from '@/api/client';
import { LogoMark } from '@/components/Logo';
import { useAuthStore } from '@/features/auth/authStore';
import { KvkkText } from './KvkkText';
import { KVKK_BASLIK, KVKK_SURUM } from './kvkkMetni';
import { rizaGecerli } from './consent';

/**
 * İlk girişte (veya metin sürümü değiştiğinde) gösterilen onay adımı.
 * Aydınlatma metninin okunduğu onayı zorunlu; sohbetlerin değerlendirmede kullanılması isteğe bağlıdır.
 */
export function ConsentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const kullanici = useAuthStore((s) => s.kullanici);
  const setKullanici = useAuthStore((s) => s.setKullanici);
  const logout = useAuthStore((s) => s.logout);
  const [okudum, setOkudum] = useState(false);
  const [sohbet, setSohbet] = useState(false);
  const [denendi, setDenendi] = useState(false);

  const kaydet = useMutation({
    mutationFn: endpoints.auth.riza,
    onSuccess: (k) => {
      setKullanici(k);
      navigate((location.state as { from?: string } | null)?.from ?? '/', { replace: true });
    },
  });

  if (!kullanici) return <Navigate to="/giris" replace />;
  if (rizaGecerli(kullanici)) return <Navigate to="/" replace />;

  const onayla = () => {
    setDenendi(true);
    if (!okudum) return;
    kaydet.mutate({ metin_surumu: KVKK_SURUM, sohbet_degerlendirme: sohbet });
  };

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', py: { xs: 3, md: 6 }, px: 2 }}>
      <Box sx={{ maxWidth: 820, mx: 'auto' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
          <LogoMark size={40} />
          <Typography sx={{ fontWeight: 700, fontSize: '1.375rem' }}>Korteks</Typography>
        </Stack>
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: { xs: 3, md: 4 }, pb: 2 }}>
            <Typography variant="h1" sx={{ fontSize: '1.5rem' }}>
              Başlamadan önce
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: '72ch' }}>
              Korteks, PSG, Pusula ve OBS'deki bilgilerini senin adına okur. Aşağıdaki metin hangi
              verilerinin, hangi amaçla işlendiğini açıklıyor.
            </Typography>
          </Box>
          <Box
            tabIndex={0}
            role="region"
            aria-label={KVKK_BASLIK}
            sx={{
              maxHeight: { xs: '45dvh', md: '50dvh' },
              overflowY: 'auto',
              px: { xs: 3, md: 4 },
              py: 2.5,
              borderBlock: 1,
              borderColor: 'divider',
              bgcolor: 'yuzeyIkincil',
            }}
          >
            <Typography variant="h2" sx={{ mb: 2 }}>
              {KVKK_BASLIK}
            </Typography>
            <KvkkText />
          </Box>
          <Box sx={{ p: { xs: 3, md: 4 }, pt: 2.5 }}>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Checkbox checked={okudum} onChange={(e) => setOkudum(e.target.checked)} />
                }
                label="Aydınlatma metnini okudum ve anladım. (zorunlu)"
              />
              {denendi && !okudum && (
                <Typography variant="body2" color="error" role="alert" sx={{ pl: 4 }}>
                  Devam etmek için aydınlatma metnini okuduğunu onayla.
                </Typography>
              )}
              <FormControlLabel
                control={
                  <Checkbox checked={sohbet} onChange={(e) => setSohbet(e.target.checked)} />
                }
                label="Sohbetlerimin anonimleştirilerek asistanın değerlendirilmesinde kullanılmasına izin veriyorum. (isteğe bağlı, istediğin zaman geri alabilirsin)"
              />
            </Stack>
            {kaydet.isError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {kaydet.error instanceof ApiError
                  ? kaydet.error.message
                  : 'Onayın kaydedilemedi. Tekrar dene.'}
              </Alert>
            )}
            <Stack
              direction={{ xs: 'column-reverse', sm: 'row' }}
              spacing={1.5}
              sx={{ mt: 3, justifyContent: 'flex-end' }}
            >
              <Button
                onClick={() => {
                  logout();
                  navigate('/giris', { replace: true });
                }}
              >
                Çıkış yap
              </Button>
              <Button variant="contained" onClick={onayla} loading={kaydet.isPending}>
                Onayla ve devam et
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
