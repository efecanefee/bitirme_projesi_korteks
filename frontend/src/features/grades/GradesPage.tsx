import { Link as RouterLink } from 'react-router';
import { useQueries } from '@tanstack/react-query';
import { Box, Link, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useDersler, useDevam, useNotlar } from '@/api/queries';
import { endpoints } from '@/api/endpoints';
import { qk } from '@/api/queries';
import { SectionCard } from '@/components/SectionCard';
import { SourceTag } from '@/components/SourceTag';
import { CardSkeleton, ErrorState } from '@/components/states';
import { AttendanceRow } from '@/features/dashboard/DashboardPage';
import { sayi } from '@/lib/format';
import type { FinalGerekliSonuc } from '@/api/types';

function finalMetni(s: FinalGerekliSonuc | undefined) {
  if (!s) return '…';
  switch (s.durum) {
    case 'hesaplandi':
      return String(s.gerekli);
    case 'ulasilamaz':
      return 'Ulaşılamaz';
    case 'zaten_gecti':
      return 'Gerekmiyor';
    default:
      return '–';
  }
}

export function GradesPage() {
  const dersler = useDersler();
  const notlar = useNotlar();
  const devam = useDevam();
  const finaller = useQueries({
    queries: (dersler.data ?? []).map((k) => ({
      queryKey: qk.finalGerekli(k.ders.kod),
      queryFn: () => endpoints.araclar.finalGerekli(k.ders.kod),
    })),
  });

  const yukleniyor = dersler.isPending || notlar.isPending;
  const hata = dersler.error ?? notlar.error;

  const dersOrtalamasi = (kayitId: number) => {
    const n = (notlar.data ?? []).filter((x) => x.ders_kaydi_id === kayitId && x.puan !== null);
    const agirlik = n.reduce((t, x) => t + x.agirlik, 0);
    if (agirlik === 0) return null;
    return n.reduce((t, x) => t + (x.puan as number) * x.agirlik, 0) / agirlik;
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h1">Notlar ve devam</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, mb: 4 }}>
        Not ve devam bilgileri OBS'den gelir. "Finalden gereken" sütunu sunucudaki hesaplama aracıyla bulunur.
      </Typography>

      {hata && <ErrorState error={hata} onRetry={() => void Promise.all([dersler.refetch(), notlar.refetch()])} />}

      <Stack spacing={3}>
        <SectionCard title="Bu dönemin notları" flush action={<SourceTag sistem="OBS" sonSenkron={notlar.data?.[0]?.son_senkron} />}>
          {yukleniyor ? (
            <CardSkeleton rows={5} />
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table aria-label="Ders notları">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ pl: 3 }}>Ders</TableCell>
                    <TableCell>Değerlendirmeler</TableCell>
                    <TableCell align="right">Şu ana kadarki ortalama</TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      Finalden gereken
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dersler.data?.map((k, i) => {
                    const n = (notlar.data ?? []).filter((x) => x.ders_kaydi_id === k.id && x.tur !== 'final');
                    const ort = dersOrtalamasi(k.id);
                    const f = finaller[i]?.data;
                    return (
                      <TableRow key={k.id} hover>
                        <TableCell sx={{ pl: 3 }}>
                          <Link component={RouterLink} to={`/derslerim/${encodeURIComponent(k.ders.kod)}`} underline="hover" sx={{ fontWeight: 600 }}>
                            {k.ders.ad}
                          </Link>
                          <Typography variant="body2" color="text.secondary">
                            {k.ders.kod}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
                            {n.map((x) => (
                              <Typography key={x.id} variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                                <Box component="span" sx={{ color: 'text.secondary' }}>
                                  {x.baslik} (%{Math.round(x.agirlik * 100)}):
                                </Box>{' '}
                                <b>{x.puan ?? '–'}</b>
                              </Typography>
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {ort === null ? '–' : sayi(ort, 1)}
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 3, fontWeight: 700, color: f?.durum === 'ulasilamaz' ? 'error.main' : 'primary.main' }}>
                          {finalMetni(f)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </SectionCard>

        <SectionCard title="Devam durumu" flush action={<SourceTag sistem="OBS" sonSenkron={devam.data?.[0]?.son_senkron} />}>
          {devam.isPending ? <CardSkeleton rows={5} /> : devam.data?.map((d) => <AttendanceRow key={d.ders_kaydi_id} d={d} />)}
          <Typography variant="caption" color="text.secondary" component="p" sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
            Teorik derslerin en az %70'ine devam zorunludur; sınırı aşan öğrenci final ve bütünleme sınavlarına giremez (Yönetmelik, Madde 18).
          </Typography>
        </SectionCard>
      </Stack>
    </Box>
  );
}
