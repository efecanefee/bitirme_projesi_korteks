import { useState } from 'react';
import { Box, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useCevaplanamayan, useCozulduIsaretle } from '@/api/queries';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/states';
import { sayi } from '@/lib/format';
import dayjs from '@/lib/dayjs';

export function UnansweredPage() {
  const { data, isPending, isError, error, refetch } = useCevaplanamayan();
  const cozuldu = useCozulduIsaretle();
  const [filtre, setFiltre] = useState<'acik' | 'hepsi'>('acik');
  const liste = (data ?? []).filter((c) => filtre === 'hepsi' || !c.cozuldu).sort((a, b) => b.tekrar - a.tekrar);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h1">Cevaplanamayan sorular</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, mb: 3 }}>
        Benzerlik eşiğini (0,60) geçemeyen ve “bulunamadı” yanıtı verilen sorular. Sık sorulanlar için ilgili belgeyi yükleyip çözüldü olarak işaretle.
      </Typography>
      <ToggleButtonGroup size="small" exclusive value={filtre} onChange={(_, v) => v && setFiltre(v)} sx={{ mb: 2 }} aria-label="Filtre">
        <ToggleButton value="acik">Açık</ToggleButton>
        <ToggleButton value="hepsi">Hepsi</ToggleButton>
      </ToggleButtonGroup>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {isError && (
          <Box sx={{ pt: 2.5 }}>
            <ErrorState error={error} onRetry={() => void refetch()} />
          </Box>
        )}
        {isPending ? (
          <Box sx={{ pt: 2.5 }}>
            <CardSkeleton rows={4} />
          </Box>
        ) : liste.length === 0 ? (
          <EmptyState title="Açık soru yok">Asistan son dönemde sorulan tüm soruları kaynaklarda buldu.</EmptyState>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table aria-label="Cevaplanamayan sorular">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: 3 }}>Soru</TableCell>
                  <TableCell align="right">Tekrar</TableCell>
                  <TableCell align="right">En yüksek benzerlik</TableCell>
                  <TableCell>Son soruluş</TableCell>
                  <TableCell sx={{ pr: 3 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {liste.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell sx={{ pl: 3 }}>{c.soru}</TableCell>
                    <TableCell align="right">{c.tekrar}</TableCell>
                    <TableCell align="right">{sayi(c.en_yuksek_benzerlik)}</TableCell>
                    <TableCell>{dayjs(c.tarih).fromNow()}</TableCell>
                    <TableCell sx={{ pr: 3 }} align="right">
                      {c.cozuldu ? (
                        <Typography variant="body2" color="success.main">
                          Çözüldü
                        </Typography>
                      ) : (
                        <Button size="small" variant="outlined" onClick={() => cozuldu.mutate(c.id)} loading={cozuldu.isPending && cozuldu.variables === c.id}>
                          Çözüldü olarak işaretle
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
