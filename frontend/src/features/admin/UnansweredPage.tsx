import { useSearchParams } from 'react-router';
import { Box, Button, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useCevaplanamayan, useCozulduIsaretle } from '@/api/queries';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/states';
import { DataTable, type Sutun } from '@/components/DataTable';
import { DisaAktarDugmesi } from '@/components/DisaAktarDugmesi';
import { sayi } from '@/lib/format';
import dayjs from '@/lib/dayjs';
import type { CevaplanamayanSoru } from '@/api/types';
import type { Rapor } from '@/lib/disaAktar';

type Filtre = 'acik' | 'hepsi';

export function UnansweredPage() {
  const { data, isPending, isError, error, refetch } = useCevaplanamayan();
  const cozuldu = useCozulduIsaretle();
  const [params, setParams] = useSearchParams();
  // Filtre adres satırında tutulur: bağlantı paylaşılınca aynı görünüm açılır
  const filtre: Filtre = params.get('durum') === 'hepsi' ? 'hepsi' : 'acik';
  const setFiltre = (f: Filtre) => {
    const yeni = new URLSearchParams(params);
    if (f === 'acik') yeni.delete('durum');
    else yeni.set('durum', f);
    yeni.delete('sayfa');
    setParams(yeni, { replace: true });
  };
  const liste = (data ?? []).filter((c) => filtre === 'hepsi' || !c.cozuldu);

  const sutunlar: Sutun<CevaplanamayanSoru>[] = [
    { id: 'soru', baslik: 'Soru', hucre: (c) => c.soru, deger: (c) => c.soru },
    { id: 'tekrar', baslik: 'Tekrar', align: 'right', hucre: (c) => c.tekrar, deger: (c) => c.tekrar },
    { id: 'benzerlik', baslik: 'En yüksek benzerlik', align: 'right', hucre: (c) => sayi(c.en_yuksek_benzerlik), deger: (c) => c.en_yuksek_benzerlik },
    { id: 'tarih', baslik: 'Son soruluş', hucre: (c) => dayjs(c.tarih).fromNow(), deger: (c) => c.tarih },
    {
      id: 'islem',
      baslik: 'Durum',
      align: 'right',
      hucre: (c) =>
        c.cozuldu ? (
          <Typography variant="body2" color="success.main">
            Çözüldü
          </Typography>
        ) : (
          <Button size="small" variant="outlined" onClick={() => cozuldu.mutate(c.id)} loading={cozuldu.isPending && cozuldu.variables === c.id}>
            Çözüldü olarak işaretle
          </Button>
        ),
    },
  ];

  const rapor = (): Rapor => ({
    baslik: 'Cevaplanamayan sorular',
    aciklama: filtre === 'acik' ? 'Yalnızca açık sorular' : 'Tüm sorular',
    ozet: [
      { etiket: 'Soru sayısı', deger: String(liste.length) },
      { etiket: 'Toplam tekrar', deger: String(liste.reduce((t, c) => t + c.tekrar, 0)) },
    ],
    tablolar: [
      {
        baslik: 'Sorular',
        sutunlar: ['Soru', 'Tekrar', 'En yüksek benzerlik', 'Son soruluş', 'Durum'],
        satirlar: [...liste]
          .sort((a, b) => b.tekrar - a.tekrar)
          .map((c) => [c.soru, c.tekrar, c.en_yuksek_benzerlik, dayjs(c.tarih).format('D MMMM YYYY HH.mm'), c.cozuldu ? 'Çözüldü' : 'Açık']),
      },
    ],
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h1">Cevaplanamayan sorular</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, mb: 3 }}>
        Benzerlik eşiğini (0,60) geçemeyen ve “bulunamadı” yanıtı verilen sorular. Sık sorulanlar için ilgili belgeyi yükleyip çözüldü olarak işaretle.
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
        <ToggleButtonGroup size="small" exclusive value={filtre} onChange={(_, v: Filtre | null) => v && setFiltre(v)} aria-label="Filtre">
          <ToggleButton value="acik">Açık</ToggleButton>
          <ToggleButton value="hepsi">Hepsi</ToggleButton>
        </ToggleButtonGroup>
        <DisaAktarDugmesi rapor={rapor} disabled={!data || liste.length === 0} />
      </Stack>
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
          <DataTable satirlar={liste} sutunlar={sutunlar} anahtar={(c) => c.id} etiket="Cevaplanamayan sorular" varsayilanSiralama={{ id: 'tekrar', yon: 'desc' }} />
        )}
      </Paper>
    </Box>
  );
}
