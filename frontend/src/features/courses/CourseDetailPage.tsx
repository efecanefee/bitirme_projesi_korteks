import { DevamHalkasi, SeviyeEtiketi } from '@/components/DevamHalkasi';
import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Link,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  alpha,
} from '@mui/material';
import { CalendarPlus, FileText, MessageSquare, NotebookPen, Sparkles } from 'lucide-react';
import dayjs from '@/lib/dayjs';
import { useDersDetayi, useFinalGerekli } from '@/api/queries';
import { SectionCard } from '@/components/SectionCard';
import { SourceTag } from '@/components/SourceTag';
import { CardSkeleton, EmptyState, ErrorState } from '@/components/states';
import { iyelik, saat, saatTr, uzunTarih } from '@/lib/format';
import { indirIcs } from '@/lib/ics';
import type { DersDetayi, Etkinlik } from '@/api/types';

const GUNLER = ['', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

function Evaluation({ d }: { d: DersDetayi }) {
  const sinavlar = d.degerlendirmeler;
  return (
    <SectionCard title="Değerlendirme" flush action={<SourceTag sistem="OBS" ek={`son senkron ${saat(sinavlar[0]?.son_senkron ?? new Date().toISOString())}`} />}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="medium" aria-label="Değerlendirme bileşenleri">
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: 3 }}>Bileşen</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell align="right">Ağırlık</TableCell>
              <TableCell align="right" sx={{ pr: 3 }}>
                Not
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sinavlar.map((s) => (
              <TableRow key={s.id}>
                <TableCell sx={{ pl: 3 }}>{s.baslik}</TableCell>
                <TableCell>
                  {s.tarih ? (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <span>{uzunTarih(s.tarih)}</span>
                      {s.tur === 'vize' && <SourceTag sistem="PSG" />}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Tarih bekleniyor
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">%{Math.round(s.agirlik * 100)}</TableCell>
                <TableCell align="right" sx={{ pr: 3, fontWeight: 700 }}>
                  {s.puan ?? '–'}
                </TableCell>
              </TableRow>
            ))}
            {d.gecme_kosulu && (
              <TableRow>
                <TableCell sx={{ pl: 3, borderBottom: 0 }}>Geçme koşulu</TableCell>
                <TableCell colSpan={3} sx={{ color: 'text.secondary', borderBottom: 0 }}>
                  {d.gecme_kosulu.aciklama} · {d.gecme_kosulu.kaynak}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </SectionCard>
  );
}

function AttendanceGrid({ d }: { d: DersDetayi }) {
  const { kullanilan, sinir } = d.devam_ozeti;
  const kalan = sinir - kullanilan;
  return (
    <SectionCard
      title="Devam çizelgesi"
      action={
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {sinir} hakkın {iyelik(kullanilan)} kullanıldı
          </Typography>
          <SeviyeEtiketi kullanilan={kullanilan} sinir={sinir} />
          <DevamHalkasi kullanilan={kullanilan} sinir={sinir} ders={d.kayit.ders.ad} size={72} />
        </Stack>
      }
    >
      <Box component="ol" aria-label="Haftalık devam" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gridTemplateColumns: { xs: 'repeat(7, minmax(0, 1fr))', sm: `repeat(${d.toplam_hafta}, minmax(0, 1fr))` }, gap: 1 }}>
        {Array.from({ length: d.toplam_hafta }, (_, i) => {
          const hafta = i + 1;
          const k = d.devam.find((x) => x.hafta === hafta);
          const durum = k?.durum;
          const etiket = durum === 'katilmadi' ? 'katılmadın' : durum === 'katildi' ? 'katıldın' : durum === 'izinli' ? 'izinli' : 'henüz yapılmadı';
          return (
            <Box
              component="li"
              key={hafta}
              aria-label={`${hafta}. hafta: ${etiket}`}
              title={k ? `${dayjs(k.tarih).format('D MMMM')} · ${etiket}` : etiket}
              sx={{
                height: 40,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 1.5,
                fontSize: '0.875rem',
                fontWeight: 500,
                ...(durum === 'katilmadi'
                  ? { bgcolor: (t) => alpha(t.palette.error.main, 0.12), color: 'error.main' }
                  : durum
                    ? { bgcolor: 'secili', color: 'text.primary' }
                    : { border: '1px dashed', borderColor: 'divider', color: 'text.secondary' }),
              }}
            >
              {hafta}
            </Box>
          );
        })}
      </Box>
      {kalan <= 1 && (
        <Typography variant="body2" color="warning.main" sx={{ mt: 2 }} role="status">
          {kalan <= 0
            ? 'Devam hakkın doldu. Sınırı aşan öğrenci final sınavına giremez; danışmanınla görüş.'
            : 'Bir devamsızlık daha olursa devam hakkın dolacak. Sınırı aşan öğrenci final sınavına giremez.'}
        </Typography>
      )}
    </SectionCard>
  );
}

function FinalCalc({ kod }: { kod: string }) {
  const { data, isPending, isError, error } = useFinalGerekli(kod);
  return (
    <SectionCard
      title="Finalden alman gereken"
      action={
        <Typography variant="body2" color="text.secondary">
          Hesaplama aracı
        </Typography>
      }
    >
      {isPending && <Skeleton variant="rounded" height={160} />}
      {isError && <Alert severity="error">{(error as Error).message}</Alert>}
      {data && data.durum === 'veri_yok' && (
        <Typography color="text.secondary">Final öncesi notların henüz girilmedi. Ara sınav notu OBS'ye girildiğinde hesap burada görünür.</Typography>
      )}
      {data && data.durum !== 'veri_yok' && (
        <>
          <Typography sx={{ fontSize: '4rem', fontWeight: 700, lineHeight: 1, color: data.durum === 'ulasilamaz' ? 'error.main' : 'vurguMetin' }}>
            {data.durum === 'ulasilamaz' ? '>100' : data.gerekli}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.5 }}>
            {data.durum === 'hesaplandi' && `Dersi geçmek için finalden en az ${data.gerekli} alman gerekiyor.`}
            {data.durum === 'ulasilamaz' && 'Mevcut notlarınla finalden 100 alsan bile geçme notuna ulaşılamıyor.'}
            {data.durum === 'zaten_gecti' && 'Mevcut notların geçme notunu karşılıyor.'}
          </Typography>
          <Box component="dl" sx={{ m: 0, mt: 2.5, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            {data.adimlar.map((a) => (
              <Box key={a.etiket} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6 }}>
                <Typography component="dt" color="text.secondary">
                  {a.etiket}
                </Typography>
                <Typography component="dd" sx={{ m: 0, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {a.deger}
                </Typography>
              </Box>
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1.5 }}>
            OBS verisiyle sunucuda hesaplandı · {saat(data.son_senkron)}
          </Typography>
        </>
      )}
    </SectionCard>
  );
}

const ETKINLIK_IKON = { materyal: FileText, odev: NotebookPen, sanal_sinif: MessageSquare } as const;

function EtkinlikSatiri({ e }: { e: Etkinlik }) {
  const Icon = ETKINLIK_IKON[e.tur as keyof typeof ETKINLIK_IKON] ?? FileText;
  const alt =
    e.tur === 'odev'
      ? `Teslim: ${dayjs(e.tarih).format('D MMMM')} ${saatTr(saat(e.tarih))}`
      : e.tur === 'sanal_sinif'
        ? (e.aciklama ?? '')
        : `Yüklendi: ${dayjs(e.tarih).format('D MMMM')}`;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
      <Box aria-hidden sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: 'yuzeyIkincil', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon size={20} strokeWidth={1.75} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600 }} noWrap>
          {e.baslik}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {alt}
        </Typography>
      </Box>
    </Box>
  );
}

function EtkinlikListesi({ liste, bos }: { liste: Etkinlik[]; bos: string }) {
  if (liste.length === 0) return <EmptyState title={bos} />;
  return <>{liste.map((e) => <EtkinlikSatiri key={e.id} e={e} />)}</>;
}

const SEKMELER = ['Genel bakış', 'Materyaller', 'Ödevler', 'Sanal sınıf kayıtları', 'Duyurular'] as const;

export function CourseDetailPage() {
  const { kod = '' } = useParams();
  const navigate = useNavigate();
  const [sekme, setSekme] = useState(0);
  const { data, isPending, isError, error, refetch } = useDersDetayi(kod);

  if (isError) {
    return (
      <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/derslerim" underline="hover" color="inherit">
            Derslerim
          </Link>
          <Typography color="text.primary">{kod}</Typography>
        </Breadcrumbs>
        <Paper variant="outlined" sx={{ borderRadius: 3, pt: 2.5 }}>
          <ErrorState error={error} onRetry={() => void refetch()} />
        </Paper>
      </Box>
    );
  }

  const k = data?.kayit;
  const pusula = data?.pusula_etkinlikleri ?? [];

  const takvimeEkle = () => {
    if (!data || !k) return;
    const etkinlikler = data.degerlendirmeler
      .filter((d) => d.tarih && dayjs(d.tarih).isAfter(dayjs()))
      .map((d) => ({ baslik: `${k.ders.kod} ${d.baslik}`, baslangic: d.tarih as string, sureDk: 90 }));
    const odevler = pusula
      .filter((e) => e.tur === 'odev' && dayjs(e.tarih).isAfter(dayjs()))
      .map((e) => ({ baslik: `${k.ders.kod} ${e.baslik}`, baslangic: e.tarih, sureDk: 30 }));
    indirIcs(`${k.ders.kod}.ics`, [...etkinlikler, ...odevler]);
  };

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
      <Breadcrumbs sx={{ mb: 1.5 }} aria-label="Konum">
        <Link component={RouterLink} to="/derslerim" underline="hover" color="inherit">
          Derslerim
        </Link>
        <Typography color="text.secondary">{kod}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: { md: 'flex-end' }, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box>
          <Typography variant="h1">{k ? k.ders.ad : <Skeleton width={320} />}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            {k ? (
              [k.ders.kod, `${k.ders.kredi} kredi`, k.ders.ogretim_elemani, ...k.program.map((p) => `${GUNLER[p.gun]} ${saatTr(p.baslangic)}, ${p.yer}`)].join(' · ')
            ) : (
              <Skeleton width={480} />
            )}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
          <Button variant="outlined" startIcon={<CalendarPlus size={18} />} onClick={takvimeEkle} disabled={!data}>
            Takvime ekle
          </Button>
          <Button
            variant="contained"
            startIcon={<Sparkles size={18} />}
            onClick={() => navigate(`/asistan?ders=${encodeURIComponent(kod)}`)}
          >
            Bu dersi asistana sor
          </Button>
        </Stack>
      </Box>

      <Tabs value={sekme} onChange={(_, v: number) => setSekme(v)} variant="scrollable" allowScrollButtonsMobile sx={{ mt: 3, mb: 3, borderBottom: 1, borderColor: 'divider' }} aria-label="Ders bölümleri">
        {SEKMELER.map((s, i) => (
          <Tab key={s} label={s} id={`sekme-${i}`} aria-controls={`panel-${i}`} />
        ))}
      </Tabs>

      <Box role="tabpanel" id={`panel-${sekme}`} aria-labelledby={`sekme-${sekme}`}>
        {isPending || !data ? (
          <Paper variant="outlined" sx={{ borderRadius: 3, pt: 2.5 }}>
            <CardSkeleton rows={5} />
          </Paper>
        ) : sekme === 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.4fr) minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
            <Stack spacing={3}>
              <Evaluation d={data} />
              <AttendanceGrid d={data} />
            </Stack>
            <Stack spacing={3}>
              <FinalCalc kod={kod} />
              <SectionCard title="Pusula etkinlikleri" flush action={<SourceTag sistem="PUSULA" />}>
                <EtkinlikListesi liste={pusula.slice(0, 3)} bos="Bu ders için Pusula etkinliği yok" />
              </SectionCard>
            </Stack>
          </Box>
        ) : (
          <SectionCard
            title={SEKMELER[sekme] ?? ''}
            flush
            action={<SourceTag sistem="PUSULA" />}
          >
            {sekme === 1 && <EtkinlikListesi liste={pusula.filter((e) => e.tur === 'materyal')} bos="Henüz materyal yüklenmedi" />}
            {sekme === 2 && <EtkinlikListesi liste={pusula.filter((e) => e.tur === 'odev')} bos="Bu ders için ödev yok" />}
            {sekme === 3 && <EtkinlikListesi liste={pusula.filter((e) => e.tur === 'sanal_sinif')} bos="Sanal sınıf kaydı yok" />}
            {sekme === 4 &&
              (data.duyurular.length === 0 ? (
                <EmptyState title="Bu derse ait duyuru yok" />
              ) : (
                data.duyurular.map((d) => (
                  <Box key={d.id} sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography sx={{ fontWeight: 600 }}>{d.baslik}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {d.yayinlayan} · {uzunTarih(d.tarih)} · {d.ozet}
                    </Typography>
                  </Box>
                ))
              ))}
          </SectionCard>
        )}
      </Box>
    </Box>
  );
}
