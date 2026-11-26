import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { Box, ButtonBase, Paper, Tab, Tabs, Typography, useMediaQuery, useTheme } from '@mui/material';
import dayjs from '@/lib/dayjs';
import type { DersKaydi, DersOturumu } from '@/api/types';
import { saatTr } from '@/lib/format';
import { SourceTag } from '@/components/SourceTag';
import { EmptyState } from '@/components/states';

const GUN_KISA = ['', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const GUN_UZUN = ['', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
/** Izgaranın satır aralığı: 15 dakika */
const ADIM = 15;

interface Blok {
  kayit: DersKaydi;
  oturum: DersOturumu;
  renk: number;
}

const dk = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/** Her derse ayrı bir ton: marka renklerinden türetilmiş, açık ve koyu temada okunur. */
const TONLAR = ['#FF5C23', '#3A7BD5', '#14A38B', '#8B5CF6', '#D9469A', '#C58A00', '#0E8FB0'];

function bloklar(dersler: DersKaydi[]): Blok[] {
  return dersler.flatMap((k, i) => k.program.map((oturum) => ({ kayit: k, oturum, renk: i % TONLAR.length })));
}

function suAn(o: DersOturumu, simdi = dayjs()) {
  const d = simdi.hour() * 60 + simdi.minute();
  return simdi.isoWeekday() === o.gun && dk(o.baslangic) <= d && d <= dk(o.bitis);
}

function DersBlogu({ b, kompakt }: { b: Blok; kompakt?: boolean }) {
  const aktif = suAn(b.oturum);
  const ton = TONLAR[b.renk]!;
  return (
    <ButtonBase
      component={RouterLink}
      to={`/derslerim/${encodeURIComponent(b.kayit.ders.kod)}`}
      aria-current={aktif ? 'time' : undefined}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        textAlign: 'left',
        overflow: 'hidden',
        borderRadius: 2,
        px: 1.25,
        py: kompakt ? 0.75 : 1,
        bgcolor: (t) => `${ton}${t.palette.mode === 'dark' ? '33' : '1F'}`,
        borderLeft: `4px solid ${ton}`,
        outline: aktif ? 2 : 0,
        outlineStyle: 'solid',
        outlineColor: 'primary.main',
        outlineOffset: 1,
        '&:hover': { bgcolor: (t) => `${ton}${t.palette.mode === 'dark' ? '4D' : '33'}` },
        '&:focus-visible': { outline: 2, outlineStyle: 'solid', outlineColor: 'primary.main' },
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
        <span className="sr-only">{GUN_UZUN[b.oturum.gun]} </span>
        {aktif ? 'Şu an · ' : ''}
        {saatTr(b.oturum.baslangic)}–{saatTr(b.oturum.bitis)}
      </Typography>
      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.25, mt: 0.25 }}>{b.kayit.ders.ad}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }} className={kompakt ? 'sr-only' : undefined}>
        {b.kayit.ders.kod} · {b.oturum.yer}
      </Typography>
    </ButtonBase>
  );
}

/** Masaüstü: Pazartesi–Cuma (varsa Cumartesi) ızgarası. Bloklar başlangıç/bitiş saatine göre yerleşir. */
function Izgara({ liste }: { liste: Blok[] }) {
  const gunler = [1, 2, 3, 4, 5, ...(liste.some((b) => b.oturum.gun === 6) ? [6] : []), ...(liste.some((b) => b.oturum.gun === 7) ? [7] : [])];
  const enErken = Math.floor(Math.min(...liste.map((b) => dk(b.oturum.baslangic))) / 60) * 60;
  const enGec = Math.ceil(Math.max(...liste.map((b) => dk(b.oturum.bitis))) / 60) * 60;
  const satirSayisi = (enGec - enErken) / ADIM;
  const saatler = Array.from({ length: (enGec - enErken) / 60 }, (_, i) => enErken + i * 60);
  const bugun = dayjs().isoWeekday();
  const satir = (d: number) => Math.round((d - enErken) / ADIM) + 2;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'auto' }}>
      <Box
        role="group"
        aria-label="Haftalık ders programı"
        sx={{
          display: 'grid',
          gridTemplateColumns: `56px repeat(${gunler.length}, minmax(140px, 1fr))`,
          gridTemplateRows: `44px repeat(${satirSayisi}, 16px)`,
          minWidth: 56 + gunler.length * 140,
          p: 1.5,
          pt: 0,
          columnGap: 1,
        }}
      >
        {gunler.map((g, i) => (
          <Box key={g} aria-hidden sx={{ gridColumn: i + 2, gridRow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, borderBottom: 1, borderColor: 'divider' }}>
            <Typography sx={{ fontWeight: g === bugun ? 700 : 600, color: g === bugun ? 'vurguMetin' : 'text.primary' }}>{GUN_UZUN[g]}</Typography>
            {g === bugun && (
              <Typography variant="caption" sx={{ px: 0.75, borderRadius: 1, bgcolor: 'vurguZemin', color: 'vurguMetin', fontWeight: 600 }}>
                Bugün
              </Typography>
            )}
          </Box>
        ))}
        {saatler.map((s) => (
          <Box key={s} sx={{ gridColumn: '1 / -1', gridRow: `${satir(s)} / span 1`, borderTop: 1, borderColor: 'divider', display: 'flex', alignItems: 'flex-start' }} aria-hidden>
            <Typography variant="caption" color="text.secondary" sx={{ width: 48, fontVariantNumeric: 'tabular-nums', mt: '-9px', bgcolor: 'background.paper', pr: 0.5 }}>
              {String(s / 60).padStart(2, '0')}.00
            </Typography>
          </Box>
        ))}
        {liste.map((b) => (
          <Box
            key={`${b.kayit.id}-${b.oturum.gun}-${b.oturum.baslangic}`}
            sx={{ gridColumn: gunler.indexOf(b.oturum.gun) + 2, gridRow: `${satir(dk(b.oturum.baslangic))} / ${satir(dk(b.oturum.bitis))}`, zIndex: 1, py: 0.25 }}
          >
            <DersBlogu b={b} kompakt={dk(b.oturum.bitis) - dk(b.oturum.baslangic) < 60} />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

/** Mobil: gün sekmeleri, varsayılan bugün (hafta sonu ise Pazartesi). */
function GunSekmeleri({ liste }: { liste: Blok[] }) {
  const bugun = dayjs().isoWeekday();
  const gunler = [1, 2, 3, 4, 5, ...(liste.some((b) => b.oturum.gun >= 6) ? [6, 7] : [])].filter((g) => g <= 5 || liste.some((b) => b.oturum.gun === g));
  const [gun, setGun] = useState(gunler.includes(bugun) ? bugun : 1);
  const gunun = liste.filter((b) => b.oturum.gun === gun).sort((a, b) => dk(a.oturum.baslangic) - dk(b.oturum.baslangic));
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Tabs value={gun} onChange={(_, v: number) => setGun(v)} variant="fullWidth" aria-label="Gün seç" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        {gunler.map((g) => (
          <Tab
            key={g}
            value={g}
            label={
              <span>
                <abbr title={GUN_UZUN[g]} style={{ textDecoration: 'none' }}>
                  {GUN_KISA[g]}
                </abbr>
                {g === bugun && (
                  <>
                    <span aria-hidden> •</span>
                    <span className="sr-only">, bugün</span>
                  </>
                )}
              </span>
            }
            sx={{ minWidth: 0, px: 0.5 }}
          />
        ))}
      </Tabs>
      <Box role="tabpanel" aria-label={GUN_UZUN[gun]} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {gunun.length === 0 ? (
          <EmptyState title={`${GUN_UZUN[gun]} dersin yok`} />
        ) : (
          gunun.map((b) => (
            <Box key={`${b.kayit.id}-${b.oturum.baslangic}`} sx={{ minHeight: 72 }}>
              <DersBlogu b={b} />
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
}

/** Derslerim sayfasının "Program" görünümü (26.11.2026 kararı: masaüstünde ızgara, mobilde gün sekmeleri). */
export function HaftalikProgram({ dersler }: { dersler: DersKaydi[] }) {
  const theme = useTheme();
  const genis = useMediaQuery(theme.breakpoints.up('md'));
  const liste = bloklar(dersler);
  if (liste.length === 0) return <EmptyState title="Ders programı bulunamadı" />;
  return (
    <Box>
      {genis ? <Izgara liste={liste} /> : <GunSekmeleri liste={liste} />}
      <Box sx={{ mt: 1.5 }}>
        <SourceTag sistem="OBS" ek="ders programı" />
      </Box>
    </Box>
  );
}
