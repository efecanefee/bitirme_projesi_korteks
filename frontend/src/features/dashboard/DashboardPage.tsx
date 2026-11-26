import { Link as RouterLink } from 'react-router';
import { Box, Link, Stack, Typography } from '@mui/material';
import { DevamHalkasi, SeviyeEtiketi } from '@/components/DevamHalkasi';
import dayjs from '@/lib/dayjs';
import { usePanel } from '@/api/queries';
import { useAuthStore } from '@/features/auth/authStore';
import { SectionCard } from '@/components/SectionCard';
import { SourceTag } from '@/components/SourceTag';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/states';
import { DateBadge } from '@/components/DateBadge';
import { ilkAd, kalanGun, saat, saatTr, selam, sayi, tamGun } from '@/lib/format';
import type { DevamOzeti, PanelOzeti } from '@/api/types';
import { useKortiStore } from '@/components/korti/kortiStore';
import { KortiCard } from './KortiCard';
import { DikkatKarti } from '@/features/notifications/DikkatKarti';

export function SourceLegend() {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }} data-tur="kaynaklar">
      <SourceTag sistem="OBS" size="md" />
      <SourceTag sistem="PUSULA" size="md" />
      <SourceTag sistem="PSG" size="md" />
      <Typography variant="body2" color="text.secondary">
        Her kart verinin geldiği sistemi gösterir
      </Typography>
    </Stack>
  );
}

function TodayClasses({ dersler }: { dersler: PanelOzeti['bugunku_dersler'] }) {
  const simdi = dayjs().format('HH:mm');
  if (dersler.length === 0) return <EmptyState title="Bugün dersin yok">Yaklaşan sınav ve ödevlerini aşağıda görebilirsin.</EmptyState>;
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: `repeat(${Math.min(dersler.length, 3)}, 1fr)` }, gap: 0, mx: 3, mb: 2.5 }}>
      {dersler.map((d, i) => {
        const suAn = d.baslangic <= simdi && simdi <= d.bitis;
        return (
          <Box
            key={`${d.ders_kodu}-${d.baslangic}`}
            aria-current={suAn ? 'time' : undefined}
            sx={{
              px: { xs: 0, sm: 2 },
              py: 2,
              borderRadius: suAn ? 2 : 0,
              bgcolor: suAn ? 'vurguZemin' : 'transparent',
              borderLeft: (t) => ({ sm: i > 0 && !suAn ? `1px solid ${t.palette.divider}` : 'none' }),
              borderTop: (t) => ({ xs: i > 0 ? `1px solid ${t.palette.divider}` : 'none', sm: 'none' }),
            }}
          >
            <Typography variant="body2" color={suAn ? 'vurguMetin' : 'text.secondary'} sx={{ fontWeight: suAn ? 600 : 400 }}>
              {suAn ? 'Şu an · ' : ''}
              {saatTr(d.baslangic)} – {saatTr(d.bitis)}
            </Typography>
            <Typography sx={{ fontWeight: 600, mt: 0.5, fontSize: '1.0625rem' }}>{d.ders_adi}</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary">
                {d.ders_kodu} · {d.yer}
              </Typography>
              {d.kaynak_sistem !== 'OBS' && <SourceTag sistem={d.kaynak_sistem} />}
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
}

function Upcoming({ liste }: { liste: PanelOzeti['yaklasan'] }) {
  if (liste.length === 0) return <EmptyState title="Yaklaşan sınav veya ödev yok" />;
  return (
    <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {liste.map((e) => {
        const kalan = kalanGun(e.tarih);
        const acil = kalan === 'Bugün' || kalan === 'Yarın';
        return (
          <Box component="li" key={e.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
            <DateBadge iso={e.tarih} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600 }}>{e.baslik}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {[e.ders_kodu, saatTr(saat(e.tarih)), e.yer, e.sure_dk ? `${e.sure_dk} dk` : null].filter(Boolean).join(' · ')}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <SourceTag sistem={e.kaynak_sistem} sonSenkron={e.son_senkron} />
              <Typography sx={{ fontWeight: 600, mt: 0.5 }} color={acil ? 'error' : 'text.primary'}>
                {kalan}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export function AttendanceRow({ d, dense }: { d: DevamOzeti; dense?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: dense ? 1 : 1.25, borderTop: 1, borderColor: 'divider' }}>
      <DevamHalkasi kullanilan={d.kullanilan} sinir={d.sinir} ders={d.ders_adi} size={40} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap>{d.ders_adi}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {d.kullanilan} / {d.sinir} hak kullanıldı
        </Typography>
      </Box>
      <SeviyeEtiketi kullanilan={d.kullanilan} sinir={d.sinir} />
    </Box>
  );
}

export function DashboardPage() {
  const ad = useAuthStore((s) => s.kullanici?.ad_soyad ?? '');
  const { data, isPending, isError, error, refetch } = usePanel();
  const kortiKapali = useKortiStore((s) => s.kartKapali);

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: { md: 'flex-end' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', md: 'row' }, mb: 4 }}>
        <Box>
          <Typography variant="h1">
            {selam()}, {ilkAd(ad)}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            {tamGun()}
            {data && ` · ${data.akademik_donem.ad} ${data.akademik_donem.hafta}. hafta${data.akademik_donem.aciklama ? `, ${data.akademik_donem.aciklama}` : ''}`}
          </Typography>
        </Box>
        <SourceLegend />
      </Box>

      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      <Box sx={{ mb: 3, '&:empty': { display: 'none' } }}>
        <DikkatKarti />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.5fr) minmax(380px, 1fr)' }, gap: 3, alignItems: 'start' }}>
        <Stack spacing={3}>
          <SectionCard title="Bugünkü dersler" action={<SourceTag sistem="OBS" ek="ders programı" sonSenkron={data?.devam[0]?.son_senkron} />}>
            {isPending ? <CardSkeleton rows={1} /> : data && <TodayClasses dersler={data.bugunku_dersler} />}
          </SectionCard>

          <SectionCard
            title="Yaklaşan sınav ve ödevler"
            flush
            action={
              <Link component={RouterLink} to="/takvim" underline="hover" variant="body2">
                Takvimde aç
              </Link>
            }
          >
            {isPending ? <CardSkeleton rows={4} /> : data && <Upcoming liste={data.yaklasan} />}
          </SectionCard>
        </Stack>

        <Stack spacing={3}>
          {!kortiKapali && <KortiCard yaklasan={data?.yaklasan} />}
          <SectionCard title="Devam durumu" flush action={<SourceTag sistem="OBS" sonSenkron={data?.devam[0]?.son_senkron} />}>
            {isPending ? <CardSkeleton rows={4} /> : data?.devam.slice(0, 4).map((d) => <AttendanceRow key={d.ders_kaydi_id} d={d} />)}
          </SectionCard>

          <SectionCard title="Notlar" action={<SourceTag sistem="OBS" ek={data?.notlar.donem} />}>
            {isPending ? (
              <CardSkeleton rows={1} />
            ) : (
              data && (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 2 }}>
                  {data.notlar.genel_ortalama !== null && (
                    <Box>
                      <Typography sx={{ fontSize: '2rem', fontWeight: 600, lineHeight: 1.2 }}>{sayi(data.notlar.genel_ortalama)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Genel not ortalaması
                      </Typography>
                    </Box>
                  )}
                  {data.notlar.son_notlar.map((n) => (
                    <Box key={n.etiket}>
                      <Typography sx={{ fontSize: '2rem', fontWeight: 600, lineHeight: 1.2 }}>{n.puan}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {n.etiket}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )
            )}
          </SectionCard>

          <SectionCard
            title="Duyurular"
            flush
            action={
              <Link component={RouterLink} to="/duyurular" underline="hover" variant="body2">
                Tümü{data ? ` (${data.okunmamis_duyuru})` : ''}
              </Link>
            }
          >
            {isPending ? (
              <CardSkeleton rows={3} />
            ) : (
              data?.duyurular.map((d) => (
                <Box key={d.id} sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Typography sx={{ fontWeight: 600 }}>{d.baslik}</Typography>
                    <SourceTag sistem={d.kaynak_sistem} sonSenkron={d.son_senkron} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {d.yayinlayan} · {d.ozet}
                  </Typography>
                </Box>
              ))
            )}
          </SectionCard>
        </Stack>
      </Box>
    </Box>
  );
}
