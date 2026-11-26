import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { Alert, Box, Button, Link, Paper, Stack, Switch, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { onbellegiTemizle } from '@/app/onbellek';
import { endpoints } from '@/api/endpoints';
import { ApiError } from '@/api/client';
import { useAuthStore } from '@/features/auth/authStore';
import { uzunTarih } from '@/lib/format';
import { KVKK_SURUM, KVKK_TASLAK } from './kvkkMetni';

/** Cihazdaki çevrimdışı kopyayı (7 gün) siler; veriler bir sonraki açılışta sunucudan yeniden yüklenir. */
function CihazVerisi() {
  const qc = useQueryClient();
  const [silindi, setSilindi] = useState(false);
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h2" sx={{ fontSize: '1.125rem' }}>
        Cihazdaki veriler
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, maxWidth: '60ch' }}>
        Bağlantın koptuğunda son verilerini gösterebilmek için ders, not, devam, sınav ve duyuru
        bilgilerin en fazla 7 gün bu cihazda tutulur. Çıkış yaptığında kendiliğinden silinir.
      </Typography>
      <Button
        variant="outlined"
        startIcon={<Trash2 size={16} />}
        sx={{ mt: 2 }}
        onClick={async () => {
          await onbellegiTemizle();
          // Bellekteki kopya da atılır; açık sayfalar sunucudan yeniden yükler
          await qc.resetQueries();
          setSilindi(true);
        }}
      >
        Cihazdaki verileri sil
      </Button>
      {silindi && (
        <Typography variant="body2" color="success.main" sx={{ mt: 1.5 }} role="status">
          Bu cihazdaki kopya silindi.
        </Typography>
      )}
    </Paper>
  );
}

/** Gizlilik tercihleri: onay bilgisi, sohbet değerlendirme izninin geri alınması ve cihazdaki veriler. */
export function PrivacyPage() {
  const kullanici = useAuthStore((s) => s.kullanici);
  const setKullanici = useAuthStore((s) => s.setKullanici);
  const guncelle = useMutation({ mutationFn: endpoints.auth.riza, onSuccess: setKullanici });
  const riza = kullanici?.riza;

  return (
    <Box sx={{ maxWidth: 820, mx: 'auto' }}>
      <Typography variant="h1">Gizlilik ve KVKK</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, mb: 4 }}>
        Verilerinin nasıl işlendiğini gör ve isteğe bağlı izinlerini yönet.
      </Typography>

      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h2" sx={{ fontSize: '1.125rem' }}>
            Aydınlatma metni
          </Typography>
          <Typography sx={{ mt: 1 }}>
            {riza
              ? `${uzunTarih(riza.tarih)} tarihinde onayladın (sürüm ${riza.metin_surumu}).`
              : 'Henüz onay vermedin.'}
          </Typography>
          {KVKK_TASLAK && (
            <Typography variant="body2" color="warning.main" sx={{ mt: 0.5 }}>
              Geçerli metin taslaktır; resmî metin geldiğinde yeniden onay istenecek.
            </Typography>
          )}
          <Link
            component={RouterLink}
            to="/kvkk"
            underline="hover"
            sx={{ display: 'inline-block', mt: 1.5 }}
          >
            Metnin tamamını oku
          </Link>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
          >
            <Box>
              <Typography variant="h2" sx={{ fontSize: '1.125rem' }} id="sohbet-izni">
                Sohbetlerin değerlendirmede kullanılması
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5, maxWidth: '60ch' }}>
                Açıksa, asistanın doğruluğunu ölçmek için sohbetlerin adın ve öğrenci numaran
                çıkarılarak incelenebilir. Kapatırsan bundan sonraki sohbetlerin değerlendirmeye
                alınmaz.
              </Typography>
            </Box>
            <Switch
              checked={!!riza?.sohbet_degerlendirme}
              disabled={!riza || guncelle.isPending}
              onChange={(_, v) =>
                guncelle.mutate({
                  metin_surumu: riza?.metin_surumu ?? KVKK_SURUM,
                  sohbet_degerlendirme: v,
                })
              }
              slotProps={{ input: { 'aria-labelledby': 'sohbet-izni' } }}
            />
          </Stack>
          {guncelle.isSuccess && (
            <Typography variant="body2" color="success.main" sx={{ mt: 1.5 }} role="status">
              Tercihin kaydedildi.
            </Typography>
          )}
          {guncelle.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {guncelle.error instanceof ApiError
                ? guncelle.error.message
                : 'Tercihin kaydedilemedi. Tekrar dene.'}
            </Alert>
          )}
        </Paper>

        <CihazVerisi />
      </Stack>
    </Box>
  );
}
