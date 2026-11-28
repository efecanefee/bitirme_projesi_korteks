import { useState } from 'react';
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Eye, EyeOff, GraduationCap, ShieldAlert } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { endpoints } from '@/api/endpoints';
import { ApiError } from '@/api/client';
import { BrandLogo } from '@/components/BrandLogo';
import { KortiMascot } from '@/components/korti/KortiMascot';
import { useAuthStore } from './authStore';

const sema = z.object({
  e_posta: z.string().trim().min(1, 'E-posta adresini yaz.').email('Geçerli bir e-posta adresi yaz.'),
  sifre: z.string().min(1, 'Şifreni yaz.'),
});
type Form = z.infer<typeof sema>;

const MOCK = import.meta.env.VITE_USE_MOCKS === 'true';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const girisli = useAuthStore((s) => s.isAuthenticated());
  const [goster, setGoster] = useState(false);

  const { register, handleSubmit, setValue, formState } = useForm<Form>({
    resolver: zodResolver(sema),
    defaultValues: { e_posta: '', sifre: '' },
  });

  const giris = useMutation({
    mutationFn: endpoints.auth.login,
    onSuccess: (t) => {
      setSession(t.access_token, t.expires_in, t.kullanici);
      const hedef = (location.state as { from?: string } | null)?.from;
      navigate(hedef ?? (t.kullanici.rol === 'yonetici' ? '/yonetim' : '/'), { replace: true });
    },
  });

  if (girisli) return <Navigate to="/" replace />;

  const demo = (e_posta: string, sifre: string) => {
    setValue('e_posta', e_posta);
    setValue('sifre', sifre);
  };

  const hizliGecis = (e_posta: string, sifre: string) => {
    setValue('e_posta', e_posta);
    setValue('sifre', sifre);
    giris.mutate({ e_posta, sifre });
  };

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', bgcolor: 'background.default', p: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Stack spacing={1} sx={{ alignItems: 'center', mb: 4 }}>
          <KortiMascot state="found" size={128} decorative />
          <BrandLogo size={56} />
          <Typography variant="body2" color="text.secondary">
            PSG, Pusula ve OBS tek yerde
          </Typography>
        </Stack>

        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
          <Typography variant="h1" component="h1" sx={{ fontSize: '1.5rem', mb: 0.5 }}>
            Giriş yap
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Üniversite e-posta adresinle devam et.
          </Typography>

          {giris.isError && (
            <Alert severity="error" sx={{ mb: 2 }} role="alert">
              {giris.error instanceof ApiError ? giris.error.message : 'Sunucuya ulaşılamadı. Bağlantını kontrol et.'}
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit((v) => giris.mutate(v))}>
            <Stack spacing={2}>
              <TextField
                label="E-posta"
                type="email"
                autoComplete="username"
                autoFocus
                fullWidth
                {...register('e_posta')}
                error={!!formState.errors.e_posta}
                helperText={formState.errors.e_posta?.message}
              />
              <TextField
                label="Şifre"
                type={goster ? 'text' : 'password'}
                autoComplete="current-password"
                fullWidth
                {...register('sifre')}
                error={!!formState.errors.sifre}
                helperText={formState.errors.sifre?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setGoster((g) => !g)} aria-label={goster ? 'Şifreyi gizle' : 'Şifreyi göster'} edge="end">
                          {goster ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button type="submit" variant="contained" size="large" loading={giris.isPending} fullWidth sx={{ minHeight: 48 }}>
                Giriş yap
              </Button>
            </Stack>
          </Box>

          {MOCK && (
            <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'secili' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Hızlı Geçiş Paneli (Demo)
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<GraduationCap size={16} />}
                  onClick={() => hizliGecis('deniz.yilmaz@ogr.beykent.edu.tr', 'korteks123')}
                  disabled={giris.isPending}
                  fullWidth
                >
                  Öğrenci Geçişi
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  startIcon={<ShieldAlert size={16} />}
                  onClick={() => hizliGecis('yonetici@beykent.edu.tr', 'yonetici123')}
                  disabled={giris.isPending}
                  fullWidth
                >
                  Admin Geçişi
                </Button>
              </Stack>
              <Stack spacing={0.5}>
                <Link component="button" type="button" variant="caption" onClick={() => demo('deniz.yilmaz@ogr.beykent.edu.tr', 'korteks123')} sx={{ textAlign: 'left' }}>
                  Öğrenci: deniz.yilmaz@ogr.beykent.edu.tr
                </Link>
                <Link component="button" type="button" variant="caption" onClick={() => demo('yonetici@beykent.edu.tr', 'yonetici123')} sx={{ textAlign: 'left' }}>
                  Yönetici: yonetici@beykent.edu.tr
                </Link>
              </Stack>
            </Box>
          )}
        </Paper>

        <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 3, textAlign: 'center', px: 2 }}>
          Korteks kaynak sistemlere yalnızca okuma erişimiyle bağlanır ve şifreni saklamaz. Kişisel verilerin
          6698 sayılı KVKK kapsamında işlenir; adın ve öğrenci numaran yapay zekâ modeline gönderilmez.{' '}
          <Link component={RouterLink} to="/kvkk" underline="always" color="inherit">
            Aydınlatma metni
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
