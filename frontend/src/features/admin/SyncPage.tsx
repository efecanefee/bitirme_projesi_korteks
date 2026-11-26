import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { DataTable } from '@/components/DataTable';
import { RefreshCw } from 'lucide-react';
import dayjs from '@/lib/dayjs';
import { useSenkronBaslat, useSenkronLoglari } from '@/api/queries';
import { SourceTag } from '@/components/SourceTag';
import { CardSkeleton, ErrorState } from '@/components/states';
import type { KaynakSistem } from '@/api/types';

const SISTEMLER: { s: KaynakSistem; aciklama: string }[] = [
  { s: 'OBS', aciklama: 'Ders, not, devamsızlık, akademik takvim' },
  { s: 'PUSULA', aciklama: 'Ders etkinlikleri, ödevler, duyurular' },
  { s: 'PSG', aciklama: 'Sınav tarihleri ve salonları' },
];

export function SyncPage() {
  const { data, isPending, isError, error, refetch } = useSenkronLoglari();
  const baslat = useSenkronBaslat();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h1">Senkronizasyon</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, mb: 4 }}>
        Adaptörler kaynak sistemlerden periyodik olarak salt okuma yapar. Bir sistem erişilemezse öğrenciler son başarılı veriyi tarihiyle görür.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        {SISTEMLER.map(({ s, aciklama }) => {
          const son = data?.find((l) => l.kaynak_sistem === s);
          const calisiyor = baslat.isPending && baslat.variables === s;
          return (
            <Paper key={s} variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <SourceTag sistem={s} size="md" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {aciklama}
              </Typography>
              <Typography sx={{ mt: 1.5 }}>
                Son çalışma: {son ? dayjs(son.baslangic).format('D MMMM HH.mm') : '–'}
              </Typography>
              <Button sx={{ mt: 2 }} variant="outlined" size="small" startIcon={<RefreshCw size={16} />} loading={calisiyor} onClick={() => baslat.mutate(s)}>
                Şimdi senkronize et
              </Button>
            </Paper>
          );
        })}
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Typography variant="h2" sx={{ px: 3, pt: 2.5, pb: 2, fontSize: '1.125rem' }}>
          Çalışma geçmişi
        </Typography>
        {isError && <ErrorState error={error} onRetry={() => void refetch()} />}
        {isPending ? (
          <CardSkeleton rows={5} />
        ) : (
          <DataTable
            satirlar={data ?? []}
            anahtar={(l) => l.id}
            etiket="Senkronizasyon geçmişi"
            onEk="log_"
            varsayilanSiralama={{ id: 'baslangic', yon: 'desc' }}
            sutunlar={[
              { id: 'sistem', baslik: 'Sistem', hucre: (l) => <SourceTag sistem={l.kaynak_sistem} size="md" />, deger: (l) => l.kaynak_sistem },
              { id: 'baslangic', baslik: 'Başlangıç', hucre: (l) => dayjs(l.baslangic).format('D MMMM HH.mm'), deger: (l) => l.baslangic },
              { id: 'sure', baslik: 'Süre', align: 'right', hucre: (l) => (l.bitis ? `${dayjs(l.bitis).diff(l.baslangic, 'second')} sn` : '–'), deger: (l) => (l.bitis ? dayjs(l.bitis).diff(l.baslangic, 'second') : null) },
              {
                id: 'durum',
                baslik: 'Durum',
                hucre: (l) => (
                  <Stack direction="row">
                    <Chip
                      size="small"
                      variant="outlined"
                      label={l.durum === 'basarili' ? 'Başarılı' : l.durum === 'hatali' ? 'Hatalı' : 'Çalışıyor'}
                      color={l.durum === 'basarili' ? 'success' : l.durum === 'hatali' ? 'error' : 'warning'}
                    />
                  </Stack>
                ),
                deger: (l) => l.durum,
              },
              { id: 'hata', baslik: 'Hata', hucre: (l) => <Box component="span" sx={{ color: 'text.secondary' }}>{l.hata ?? '–'}</Box> },
            ]}
          />
        )}
      </Paper>
    </Box>
  );
}
