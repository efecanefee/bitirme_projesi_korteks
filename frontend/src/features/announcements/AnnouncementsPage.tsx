import { useState } from 'react';
import { Box, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useDuyuruOkundu, useDuyurular } from '@/api/queries';
import { SourceTag } from '@/components/SourceTag';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/states';
import dayjs from '@/lib/dayjs';
import type { KaynakSistem } from '@/api/types';

type Filtre = 'hepsi' | 'okunmamis' | KaynakSistem;

export function AnnouncementsPage() {
  const { data, isPending, isError, error, refetch } = useDuyurular();
  const okundu = useDuyuruOkundu();
  const [filtre, setFiltre] = useState<Filtre>('hepsi');
  const [acik, setAcik] = useState<number | null>(null);

  const liste = (data ?? []).filter((d) =>
    filtre === 'hepsi' ? true : filtre === 'okunmamis' ? !d.okundu : d.kaynak_sistem === filtre,
  );

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      <Typography variant="h1">Duyurular</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, mb: 3 }}>
        Pusula, OBS ve PSG duyuruları tarih sırasıyla
      </Typography>

      <ToggleButtonGroup size="small" exclusive value={filtre} onChange={(_, v: Filtre | null) => v && setFiltre(v)} aria-label="Duyuru filtresi" sx={{ mb: 2, flexWrap: 'wrap' }}>
        <ToggleButton value="hepsi">Hepsi</ToggleButton>
        <ToggleButton value="okunmamis">Okunmamış</ToggleButton>
        <ToggleButton value="PUSULA">Pusula</ToggleButton>
        <ToggleButton value="OBS">OBS</ToggleButton>
        <ToggleButton value="PSG">PSG</ToggleButton>
      </ToggleButtonGroup>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {isError && (
          <Box sx={{ pt: 2.5 }}>
            <ErrorState error={error} onRetry={() => void refetch()} />
          </Box>
        )}
        {isPending && (
          <Box sx={{ pt: 2.5 }}>
            <CardSkeleton rows={5} />
          </Box>
        )}
        {data && liste.length === 0 && <EmptyState title={filtre === 'okunmamis' ? 'Okunmamış duyurun yok' : 'Bu filtrede duyuru yok'} />}
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {liste.map((d, i) => {
            const genis = acik === d.id;
            return (
              <Box component="li" key={d.id} sx={{ borderTop: i ? 1 : 0, borderColor: 'divider' }}>
                <Box
                  component="button"
                  type="button"
                  aria-expanded={genis}
                  onClick={() => {
                    setAcik(genis ? null : d.id);
                    if (!d.okundu) okundu.mutate(d.id);
                  }}
                  sx={{ width: '100%', textAlign: 'left', border: 0, bgcolor: 'transparent', font: 'inherit', color: 'inherit', cursor: 'pointer', px: 3, py: 2, display: 'flex', gap: 2, '&:hover': { bgcolor: 'yuzeyIkincil' } }}
                >
                  <Box aria-hidden sx={{ width: 8, height: 8, mt: 1, borderRadius: '50%', flexShrink: 0, bgcolor: d.okundu ? 'transparent' : 'primary.main' }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <Typography sx={{ fontWeight: d.okundu ? 500 : 700 }}>
                        {d.baslik}
                        {!d.okundu && <span className="sr-only"> (okunmamış)</span>}
                      </Typography>
                      <SourceTag sistem={d.kaynak_sistem} sonSenkron={d.son_senkron} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {d.yayinlayan} · {dayjs(d.tarih).format('D MMMM, HH.mm')}
                      {d.ders_kodu ? ` · ${d.ders_kodu}` : ''}
                    </Typography>
                    {genis && <Typography sx={{ mt: 1.5 }}>{d.ozet}</Typography>}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}
