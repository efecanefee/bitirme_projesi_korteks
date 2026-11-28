import { Link as RouterLink } from 'react-router';
import { Box, Button, Chip, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, alpha } from '@mui/material';
import { CalendarPlus, Clock, MapPin } from 'lucide-react';
import { useDersler } from '@/api/queries';
import { SectionCard } from '@/components/SectionCard';
import { SourceTag } from '@/components/SourceTag';
import { ErrorState } from '@/components/states';
import { indirIcs } from '@/lib/ics';
import { saatTr } from '@/lib/format';
import dayjs from '@/lib/dayjs';

const GUNLER = [
  { no: 1, ad: 'Pazartesi', kisa: 'Pzt' },
  { no: 2, ad: 'Salı', kisa: 'Sal' },
  { no: 3, ad: 'Çarşamba', kisa: 'Çar' },
  { no: 4, ad: 'Perşembe', kisa: 'Per' },
  { no: 5, ad: 'Cuma', kisa: 'Cum' },
] as const;

const SAAT_DILIMLERI = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

export function CourseSchedulePage() {
  const { data: dersler, isPending, isError, error, refetch } = useDersler();
  const bugunNo = dayjs().isoWeekday();

  const oturumlar = (dersler ?? []).flatMap((k) =>
    k.program.map((p) => ({
      ...p,
      dersKodu: k.ders.kod,
      dersAdi: k.ders.ad,
      kredi: k.ders.kredi,
      ogretimElemani: k.ders.ogretim_elemani,
    })),
  );

  const takvimeAktar = () => {
    const baslangicHafta = dayjs().startOf('isoWeek');
    const icsKayitlari = oturumlar.map((o) => {
      const [saatS, dkS] = o.baslangic.split(':').map(Number);
      const [bitSaat, bitDk] = o.bitis.split(':').map(Number);
      const bas = baslangicHafta.isoWeekday(o.gun).hour(saatS ?? 9).minute(dkS ?? 0);
      const sure = ((bitSaat ?? 10) * 60 + (bitDk ?? 50)) - ((saatS ?? 9) * 60 + (dkS ?? 0));
      return {
        baslik: `${o.dersKodu} · ${o.dersAdi}`,
        baslangic: bas.toISOString(),
        sureDk: sure > 0 ? sure : 50,
        aciklama: `${o.yer} · ${o.ogretimElemani}`,
      };
    });
    indirIcs('haftalik-ders-programi.ics', icsKayitlari);
  };

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h1">Ders Programı</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            OBS derslik oturumları ve Pusula sanal sınıf saatleri haftalık çizelgede
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<CalendarPlus size={18} />} onClick={takvimeAktar} disabled={oturumlar.length === 0}>
          Programı dışa aktar (.ics)
        </Button>
      </Stack>

      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {isPending ? (
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: 3 }} />
      ) : (
        <Stack spacing={3}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, minmax(0, 1fr))' }, gap: 2 }}>
            {GUNLER.map((g) => {
              const gununDersleri = oturumlar
                .filter((o) => o.gun === g.no)
                .sort((a, b) => a.baslangic.localeCompare(b.baslangic));
              const bugunMu = bugunNo === g.no;
              return (
                <Paper
                  key={g.no}
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    borderColor: bugunMu ? 'primary.main' : 'divider',
                    borderWidth: bugunMu ? 2 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.5,
                      bgcolor: bugunMu ? 'secili' : 'yuzeyIkincil',
                      borderBottom: 1,
                      borderColor: 'divider',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>{g.ad}</Typography>
                    {bugunMu && <Chip size="small" label="Bugün" color="primary" sx={{ height: 22, fontSize: 11, fontWeight: 700 }} />}
                  </Box>

                  <Stack spacing={1.5} sx={{ p: 2, flex: 1 }}>
                    {gununDersleri.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                        Ders yok
                      </Typography>
                    ) : (
                      gununDersleri.map((o, idx) => (
                        <Paper
                          key={`${o.dersKodu}-${idx}`}
                          component={RouterLink}
                          to={`/derslerim/${encodeURIComponent(o.dersKodu)}`}
                          variant="outlined"
                          sx={{
                            p: 1.75,
                            borderRadius: 2,
                            textDecoration: 'none',
                            color: 'inherit',
                            borderLeft: 4,
                            borderLeftColor: `sistem.${o.kaynak_sistem}`,
                            bgcolor: (t) => alpha(t.palette.sistem[o.kaynak_sistem], 0.06),
                            transition: 'transform .15s, box-shadow .15s',
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 },
                          }}
                        >
                          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                              {o.dersKodu}
                            </Typography>
                            <SourceTag sistem={o.kaynak_sistem} />
                          </Stack>
                          <Typography sx={{ fontWeight: 700, lineHeight: 1.3 }}>{o.dersAdi}</Typography>
                          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 1, color: 'text.secondary' }}>
                            <Clock size={14} />
                            <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                              {saatTr(o.baslangic)} – {saatTr(o.bitis)}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 0.5, color: 'text.secondary' }}>
                            <MapPin size={14} />
                            <Typography variant="caption">{o.yer}</Typography>
                          </Stack>
                        </Paper>
                      ))
                    )}
                  </Stack>
                </Paper>
              );
            })}
          </Box>

          <SectionCard title="Saatlik Matris Görünümü" flush action={<SourceTag sistem="OBS" />}>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" aria-label="Saatlik ders programı matrisi">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ pl: 3, width: 110 }}>Saat</TableCell>
                    {GUNLER.map((g) => (
                      <TableCell key={g.no}>{g.ad}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {SAAT_DILIMLERI.map((saatDilimi) => {
                    const saatBas = Number(saatDilimi.split(':')[0]);
                    return (
                      <TableRow key={saatDilimi} hover>
                        <TableCell sx={{ pl: 3, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'text.secondary' }}>
                          {saatDilimi}
                        </TableCell>
                        {GUNLER.map((g) => {
                          const eslesen = oturumlar.find((o) => {
                            const basH = Number(o.baslangic.split(':')[0]);
                            const bitH = Number(o.bitis.split(':')[0]);
                            return o.gun === g.no && saatBas >= basH && saatBas <= bitH;
                          });
                          return (
                            <TableCell key={g.no} sx={{ py: 1.25 }}>
                              {eslesen ? (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    {eslesen.dersKodu} · {eslesen.dersAdi}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {eslesen.yer} ({eslesen.ogretimElemani})
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="caption" color="text.disabled">
                                  –
                                </Typography>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </SectionCard>
        </Stack>
      )}
    </Box>
  );
}
