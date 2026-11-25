import { Link as RouterLink } from 'react-router';
import { Box, CardActionArea, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { useDersler, useDevam } from '@/api/queries';
import { SourceTag } from '@/components/SourceTag';
import { ErrorState } from '@/components/states';
import { Skeleton } from '@mui/material';
import { tokens } from '@/app/theme';
import { saatTr } from '@/lib/format';

const GUNLER = ['', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export function CoursesPage() {
  const dersler = useDersler();
  const devam = useDevam();

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h1" sx={{ mb: 0.75 }}>
        Derslerim
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        {dersler.data ? `${dersler.data[0]?.ders.donem} · ${dersler.data.length} ders, ${dersler.data.reduce((t, k) => t + k.ders.kredi, 0)} kredi` : ' '}
      </Typography>

      {dersler.isError && <ErrorState error={dersler.error} onRetry={() => void dersler.refetch()} />}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 3 }}>
        {dersler.isPending &&
          Array.from({ length: 5 }, (_, i) => <Skeleton key={i} variant="rounded" height={180} sx={{ borderRadius: 3 }} />)}
        {dersler.data?.map((k) => {
          const d = devam.data?.find((x) => x.ders_kaydi_id === k.id);
          const oran = d ? d.kullanilan / d.sinir : 0;
          return (
            <Paper key={k.id} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <CardActionArea component={RouterLink} to={`/derslerim/${encodeURIComponent(k.ders.kod)}`} sx={{ p: 3, height: '100%' }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {k.ders.kod} · {k.ders.kredi} kredi
                  </Typography>
                  <SourceTag sistem="OBS" />
                </Stack>
                <Typography variant="h2" component="h2" sx={{ mt: 1 }}>
                  {k.ders.ad}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {k.ders.ogretim_elemani}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1.5 }}>
                  {k.program.map((p) => `${GUNLER[p.gun]} ${saatTr(p.baslangic)}, ${p.yer}`).join(' · ')}
                </Typography>
                {d && (
                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="caption" color="text.secondary">
                        Devamsızlık
                      </Typography>
                      <Typography variant="caption" color={oran >= 0.75 ? 'warning.main' : 'text.secondary'} sx={{ fontWeight: 600 }}>
                        {d.kullanilan} / {d.sinir} hak
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={oran * 100}
                      aria-label={`Devamsızlık ${d.kullanilan} / ${d.sinir}`}
                      sx={{ '& .MuiLinearProgress-bar': { bgcolor: oran >= 0.75 ? tokens.uyari : tokens.basari } }}
                    />
                  </Box>
                )}
              </CardActionArea>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
