import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from '@/lib/dayjs';
import { useEtkinlikler } from '@/api/queries';
import { SourceTag } from '@/components/SourceTag';
import { SourceLegend } from '@/features/dashboard/DashboardPage';
import { EmptyState, ErrorState } from '@/components/states';
import { tokens } from '@/app/theme';
import { indirIcs } from '@/lib/ics';
import { saat, saatTr } from '@/lib/format';
import type { Etkinlik, EtkinlikTur } from '@/api/types';

type Filtre = 'hepsi' | 'sinav' | 'odev';
const TUR_ETIKETI: Partial<Record<EtkinlikTur, string>> = { sinav: 'Sınav', odev: 'Ödev', materyal: 'Materyal', sanal_sinif: 'Sanal sınıf', duyuru: 'Duyuru' };
const HAFTA_GUNLERI = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function EtkinlikKarti({ e }: { e: Etkinlik }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, px: 3, py: 2, borderTop: 1, borderColor: 'divider', alignItems: 'center' }}>
      <Box sx={{ width: 4, alignSelf: 'stretch', borderRadius: 2, bgcolor: tokens.sistem[e.kaynak_sistem] }} aria-hidden />
      <Box sx={{ width: 56, flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{saatTr(saat(e.tarih))}</Typography>
        <Typography variant="caption" color="text.secondary">
          {TUR_ETIKETI[e.tur]}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600 }}>{e.baslik}</Typography>
        <Typography variant="body2" color="text.secondary">
          {[e.ders_kodu, e.yer, e.sure_dk ? `${e.sure_dk} dk` : null].filter(Boolean).join(' · ')}
        </Typography>
      </Box>
      <SourceTag sistem={e.kaynak_sistem} sonSenkron={e.son_senkron} />
    </Box>
  );
}

export function CalendarPage() {
  const theme = useTheme();
  const genis = useMediaQuery(theme.breakpoints.up('md'));
  const [ay, setAy] = useState(() => dayjs().startOf('month'));
  const [secili, setSecili] = useState(() => dayjs().startOf('day'));
  const [filtre, setFiltre] = useState<Filtre>('hepsi');

  const gridBas = ay.startOf('isoWeek');
  const gridBit = ay.endOf('month').endOf('isoWeek');
  const { data, isError, error, refetch } = useEtkinlikler(gridBas.toISOString(), gridBit.toISOString());

  const gorunen = useMemo(
    () => (data ?? []).filter((e) => (filtre === 'hepsi' ? e.tur === 'sinav' || e.tur === 'odev' : e.tur === filtre)),
    [data, filtre],
  );
  const gune = (d: dayjs.Dayjs) => gorunen.filter((e) => dayjs(e.tarih).isSame(d, 'day'));

  const gunler: dayjs.Dayjs[] = [];
  for (let d = gridBas; d.isBefore(gridBit); d = d.add(1, 'day')) gunler.push(d);

  const seciliListe = gune(secili);
  const ajanda = gorunen.filter((e) => !dayjs(e.tarih).isBefore(dayjs().startOf('day')));

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { md: 'flex-end' }, gap: 2, flexDirection: { xs: 'column', md: 'row' }, mb: 3 }}>
        <Box>
          <Typography variant="h1">Takvim</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            PSG sınav tarihleri ve Pusula ödev teslimleri tek takvimde
          </Typography>
        </Box>
        <SourceLegend />
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton aria-label="Önceki ay" onClick={() => setAy((a) => a.subtract(1, 'month'))}>
            <ChevronLeft size={20} />
          </IconButton>
          <Typography variant="h2" component="h2" sx={{ minWidth: 160, textAlign: 'center' }} aria-live="polite">
            {ay.format('MMMM YYYY')}
          </Typography>
          <IconButton aria-label="Sonraki ay" onClick={() => setAy((a) => a.add(1, 'month'))}>
            <ChevronRight size={20} />
          </IconButton>
          <Button
            size="small"
            onClick={() => {
              setAy(dayjs().startOf('month'));
              setSecili(dayjs().startOf('day'));
            }}
          >
            Bugün
          </Button>
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <ToggleButtonGroup size="small" exclusive value={filtre} onChange={(_, v: Filtre | null) => v && setFiltre(v)} aria-label="Etkinlik türü">
            <ToggleButton value="hepsi">Hepsi</ToggleButton>
            <ToggleButton value="sinav">Sınavlar</ToggleButton>
            <ToggleButton value="odev">Ödevler</ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="outlined"
            startIcon={<CalendarPlus size={18} />}
            disabled={ajanda.length === 0}
            onClick={() => indirIcs('korteks-takvim.ics', ajanda.map((e) => ({ baslik: `${e.ders_kodu ?? ''} ${e.baslik}`.trim(), baslangic: e.tarih, sureDk: e.sure_dk ?? 30, aciklama: e.yer ?? undefined })))}
          >
            Dışa aktar
          </Button>
        </Stack>
      </Stack>

      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {genis ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(320px, 1fr)', gap: 3, alignItems: 'start' }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box role="grid" aria-label={`${ay.format('MMMM YYYY')} takvimi`}>
              <Box role="row" sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: 1, borderColor: 'divider' }}>
                {HAFTA_GUNLERI.map((g) => (
                  <Typography role="columnheader" key={g} variant="caption" color="text.secondary" sx={{ py: 1.25, textAlign: 'center', fontWeight: 500 }}>
                    {g}
                  </Typography>
                ))}
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {gunler.map((d) => {
                  const liste = gune(d);
                  const buAy = d.month() === ay.month();
                  const bugun = d.isSame(dayjs(), 'day');
                  const sec = d.isSame(secili, 'day');
                  return (
                    <Box
                      key={d.format('YYYY-MM-DD')}
                      role="gridcell"
                      component="button"
                      type="button"
                      aria-selected={sec}
                      aria-label={`${d.format('D MMMM dddd')}${liste.length ? `, ${liste.length} etkinlik` : ''}`}
                      onClick={() => setSecili(d)}
                      sx={{
                        minHeight: 104,
                        p: 1,
                        textAlign: 'left',
                        border: 0,
                        borderRight: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: sec ? tokens.secili : buAy ? '#fff' : '#FAFBFC',
                        font: 'inherit',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        '&:nth-of-type(7n)': { borderRight: 0 },
                        '&:hover': { bgcolor: sec ? tokens.secili : '#F7F9FC' },
                      }}
                    >
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{
                          width: 28,
                          height: 28,
                          display: 'grid',
                          placeItems: 'center',
                          borderRadius: '50%',
                          fontWeight: bugun ? 700 : 500,
                          color: bugun ? '#fff' : buAy ? 'text.primary' : 'text.disabled',
                          bgcolor: bugun ? 'primary.main' : 'transparent',
                        }}
                      >
                        {d.date()}
                      </Typography>
                      {liste.slice(0, 2).map((e) => (
                        <Box
                          key={e.id}
                          component="span"
                          sx={{ fontSize: 12, lineHeight: 1.3, px: 0.75, py: 0.25, borderRadius: 1, bgcolor: `${tokens.sistem[e.kaynak_sistem]}14`, color: tokens.metin, borderLeft: `3px solid ${tokens.sistem[e.kaynak_sistem]}`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {e.ders_kodu ?? e.baslik}
                        </Box>
                      ))}
                      {liste.length > 2 && (
                        <Typography component="span" variant="caption" color="text.secondary">
                          +{liste.length - 2} daha
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Paper>
          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }} aria-live="polite">
            <Typography variant="h2" component="h2" sx={{ px: 3, pt: 2.5, pb: 2, fontSize: '1.125rem' }}>
              {secili.format('D MMMM dddd')}
            </Typography>
            {seciliListe.length === 0 ? <EmptyState title="Bu gün için sınav veya teslim yok" /> : seciliListe.map((e) => <EtkinlikKarti key={e.id} e={e} />)}
          </Paper>
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Typography variant="h2" component="h2" sx={{ px: 3, pt: 2.5, pb: 2, fontSize: '1.125rem' }}>
            Yaklaşanlar
          </Typography>
          {ajanda.length === 0 ? (
            <EmptyState title="Bu ay yaklaşan sınav veya teslim yok" />
          ) : (
            ajanda.map((e, i) => {
              const yeniGun = i === 0 || !dayjs(ajanda[i - 1]!.tarih).isSame(e.tarih, 'day');
              return (
                <Box key={e.id}>
                  {yeniGun && (
                    <Typography variant="body2" sx={{ px: 3, pt: 2, pb: 0.5, fontWeight: 600 }}>
                      {dayjs(e.tarih).format('D MMMM dddd')}
                    </Typography>
                  )}
                  <EtkinlikKarti e={e} />
                </Box>
              );
            })
          )}
        </Paper>
      )}
    </Box>
  );
}
