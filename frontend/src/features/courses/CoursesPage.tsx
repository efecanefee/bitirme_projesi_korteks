import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { Box, CardActionArea, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { CalendarDays, LayoutGrid } from 'lucide-react';
import { DevamHalkasi, SeviyeEtiketi } from '@/components/DevamHalkasi';
import { HaftalikProgram } from './HaftalikProgram';
import { useDersler, useDevam } from '@/api/queries';
import { SourceTag } from '@/components/SourceTag';
import { ErrorState } from '@/components/states';
import { Skeleton } from '@mui/material';
import { saatTr } from '@/lib/format';

const GUNLER = ['', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const GORUNUM_ANAHTARI = 'korteks.derslerGorunum';
type Gorunum = 'program' | 'dersler';

function kayitliGorunum(): Gorunum {
  try {
    return localStorage.getItem(GORUNUM_ANAHTARI) === 'dersler' ? 'dersler' : 'program';
  } catch {
    return 'program';
  }
}

export function CoursesPage() {
  const dersler = useDersler();
  const devam = useDevam();
  const [gorunum, setGorunumState] = useState<Gorunum>(kayitliGorunum);
  const setGorunum = (g: Gorunum) => {
    setGorunumState(g);
    try {
      localStorage.setItem(GORUNUM_ANAHTARI, g);
    } catch {
      /* gizli sekme: seçim yalnızca bu oturumda geçerli */
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: { sm: 'flex-end' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mb: 3 }}>
        <Box>
          <Typography variant="h1" sx={{ mb: 0.75 }}>
            Derslerim
          </Typography>
          <Typography color="text.secondary">
            {dersler.data ? `${dersler.data[0]?.ders.donem} · ${dersler.data.length} ders, ${dersler.data.reduce((t, k) => t + k.ders.kredi, 0)} kredi` : ' '}
          </Typography>
        </Box>
        <ToggleButtonGroup size="small" exclusive value={gorunum} onChange={(_, v: Gorunum | null) => v && setGorunum(v)} aria-label="Görünüm">
          <ToggleButton value="program" sx={{ gap: 0.75, px: 1.5 }}>
            <CalendarDays size={16} aria-hidden /> Program
          </ToggleButton>
          <ToggleButton value="dersler" sx={{ gap: 0.75, px: 1.5 }}>
            <LayoutGrid size={16} aria-hidden /> Dersler
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {dersler.isError && <ErrorState error={dersler.error} onRetry={() => void dersler.refetch()} />}

      {gorunum === 'program' && dersler.isPending && <Skeleton variant="rounded" height={480} sx={{ borderRadius: 3 }} />}
      {gorunum === 'program' && dersler.data && <HaftalikProgram dersler={dersler.data} />}

      <Box sx={{ display: gorunum === 'dersler' ? 'grid' : 'none', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 3 }}>
        {dersler.isPending &&
          Array.from({ length: 5 }, (_, i) => <Skeleton key={i} variant="rounded" height={180} sx={{ borderRadius: 3 }} />)}
        {dersler.data?.map((k) => {
          const d = devam.data?.find((x) => x.ders_kaydi_id === k.id);
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
                  <Stack direction="row" spacing={1.5} sx={{ mt: 2, alignItems: 'center' }}>
                    <DevamHalkasi kullanilan={d.kullanilan} sinir={d.sinir} ders={k.ders.ad} size={36} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" component="div">
                        Devamsızlık
                      </Typography>
                      <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {d.kullanilan} / {d.sinir} hak kullanıldı
                      </Typography>
                    </Box>
                    <SeviyeEtiketi kullanilan={d.kullanilan} sinir={d.sinir} />
                  </Stack>
                )}
              </CardActionArea>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
