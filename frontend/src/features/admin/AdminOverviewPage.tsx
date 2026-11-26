import { Link as RouterLink } from 'react-router';
import { Box, Link, Stack, Typography } from '@mui/material';
import dayjs from '@/lib/dayjs';
import { useCevaplanamayan, useIstatistik } from '@/api/queries';
import { SectionCard } from '@/components/SectionCard';
import { CardSkeleton, ErrorState } from '@/components/states';
import { BarChart, HBarList, StatTile } from './charts';
import { NIYET_ETIKETI } from '@/lib/labels';
import { DisaAktarDugmesi } from '@/components/DisaAktarDugmesi';
import type { Rapor } from '@/lib/disaAktar';
import type { CevaplanamayanSoru, YoneticiIstatistik } from '@/api/types';

const sn = (ms: number) => `${(ms / 1000).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} sn`;
const yuzde = (o: number) => `%${Math.round(o * 100)}`;

/** İstatistik raporu: İP-8 değerlendirmesi ve tez ekleri için (FOG-02 yanıt süreleri dahil). */
function istatistikRaporu(data: YoneticiIstatistik, acik: CevaplanamayanSoru[]): Rapor {
  return {
    baslik: 'Asistan kullanım istatistikleri',
    aciklama: 'Son 14 gün',
    ozet: [
      { etiket: 'Toplam soru', deger: data.toplam_soru.toLocaleString('tr-TR') },
      { etiket: 'Ortalama yanıt süresi (hedef ≤ 5 sn)', deger: sn(data.ortalama_sure_ms) },
      { etiket: 'p95 yanıt süresi (hedef ≤ 8 sn)', deger: sn(data.p95_sure_ms) },
      { etiket: 'Olumlu geri bildirim', deger: yuzde(data.olumlu_oran) },
      { etiket: '“Bulunamadı” yanıtı', deger: yuzde(data.bulunamadi_oran) },
    ],
    tablolar: [
      {
        baslik: 'Günlük soru sayısı ve ortalama yanıt süresi',
        sutunlar: ['Tarih', 'Soru', 'Ortalama süre (sn)'],
        satirlar: data.gunluk.map((g) => [dayjs(g.tarih).format('D MMMM YYYY dddd'), g.soru, Math.round(g.ortalama_sure_ms / 100) / 10]),
      },
      { baslik: 'Soru türleri', sutunlar: ['Tür', 'Sayı'], satirlar: data.niyet_dagilimi.map((n) => [NIYET_ETIKETI[n.niyet], n.sayi]) },
      {
        baslik: 'Açık cevaplanamayan sorular',
        sutunlar: ['Soru', 'Tekrar', 'En yüksek benzerlik'],
        satirlar: [...acik].sort((a, b) => b.tekrar - a.tekrar).map((c) => [c.soru, c.tekrar, c.en_yuksek_benzerlik]),
      },
    ],
  };
}

export function AdminOverviewPage() {
  const { data, isPending, isError, error, refetch } = useIstatistik();
  const cevaplanamayan = useCevaplanamayan();
  const acik = cevaplanamayan.data?.filter((c) => !c.cozuldu) ?? [];

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, mb: 4 }}>
        <Box>
          <Typography variant="h1">Genel bakış</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Asistanın son 14 gündeki kullanımı, yanıt süreleri ve geri bildirimler
          </Typography>
        </Box>
        <DisaAktarDugmesi rapor={() => istatistikRaporu(data!, acik)} disabled={!data} />
      </Stack>

      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {data && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          <StatTile etiket="Ortalama yanıt süresi" deger={sn(data.ortalama_sure_ms)} hedef="≤ 5 sn" tamam={data.ortalama_sure_ms <= 5000} />
          <StatTile etiket="p95 yanıt süresi" deger={sn(data.p95_sure_ms)} hedef="≤ 8 sn" tamam={data.p95_sure_ms <= 8000} />
          <StatTile etiket="Olumlu geri bildirim" deger={yuzde(data.olumlu_oran)} />
          <StatTile etiket="“Bulunamadı” yanıtı" deger={yuzde(data.bulunamadi_oran)} />
        </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.6fr) minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
        <SectionCard title="Günlük soru sayısı" action={data && <Typography variant="body2" color="text.secondary">Toplam {data.toplam_soru.toLocaleString('tr-TR')}</Typography>}>
          {isPending ? (
            <CardSkeleton rows={4} />
          ) : (
            data && (
              <BarChart
                baslik="Günlük soru sayısı"
                veri={data.gunluk.map((g) => ({
                  etiket: dayjs(g.tarih).format('D MMM'),
                  deger: g.soru,
                  ipucu: `${dayjs(g.tarih).format('D MMMM dddd')}: ${g.soru} soru, ortalama ${sn(g.ortalama_sure_ms)}`,
                }))}
              />
            )
          )}
        </SectionCard>
        <Stack spacing={3}>
          <SectionCard title="Soru türleri">
            {data ? <HBarList veri={data.niyet_dagilimi.map((n) => ({ etiket: NIYET_ETIKETI[n.niyet], deger: n.sayi }))} /> : <CardSkeleton rows={4} />}
          </SectionCard>
          <SectionCard
            title="Açık cevaplanamayan sorular"
            flush
            action={
              <Link component={RouterLink} to="/yonetim/cevaplanamayan" underline="hover" variant="body2">
                Tümü ({acik.length})
              </Link>
            }
          >
            {acik.slice(0, 3).map((c) => (
              <Box key={c.id} sx={{ px: 3, py: 1.75, borderTop: 1, borderColor: 'divider' }}>
                <Typography>{c.soru}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {c.tekrar} kez soruldu
                </Typography>
              </Box>
            ))}
          </SectionCard>
        </Stack>
      </Box>
    </Box>
  );
}
