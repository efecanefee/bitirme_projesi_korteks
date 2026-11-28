import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { CalendarPlus, CheckCircle2, Clock, Upload } from 'lucide-react';
import { useDersler, useNotlar } from '@/api/queries';
import { SectionCard } from '@/components/SectionCard';
import { SourceTag } from '@/components/SourceTag';
import { indirIcs } from '@/lib/ics';

type OdevFiltre = 'tumu' | 'bekleyen' | 'teslim_edildi';

interface OdevKaydi {
  id: number;
  dersKodu: string;
  dersAdi: string;
  baslik: string;
  agirlikYuzde: number;
  sonTeslim: string;
  teslimBicimi: string;
  durum: 'bekleyen' | 'teslim_edildi' | 'notlandirildi';
  puan: number | null;
  kalanGun: number;
}

const ODEVLER: OdevKaydi[] = [
  {
    id: 1,
    dersKodu: 'BİL303',
    dersAdi: 'Veritabanı Sistemleri',
    baslik: 'ER Diyagramı ve İlişkisel Şema Tasarımı Ödevi',
    agirlikYuzde: 10,
    sonTeslim: '1 Aralık 2026 · 23:59',
    teslimBicimi: 'PDF + SQL dosyası (Pusula)',
    durum: 'bekleyen',
    puan: null,
    kalanGun: 3,
  },
  {
    id: 2,
    dersKodu: 'MAT301',
    dersAdi: 'Olasılık ve İstatistik',
    baslik: 'Problem Seti 3 (Rastgele Değişkenler)',
    agirlikYuzde: 10,
    sonTeslim: '3 Aralık 2026 · 23:59',
    teslimBicimi: 'Pusula Ödev Alanı (PDF)',
    durum: 'bekleyen',
    puan: null,
    kalanGun: 5,
  },
  {
    id: 3,
    dersKodu: 'BİL305',
    dersAdi: 'İşletim Sistemleri',
    baslik: 'Süreç Zamanlama (CPU Scheduling) Simülasyonu',
    agirlikYuzde: 15,
    sonTeslim: '8 Aralık 2026 · 23:59',
    teslimBicimi: 'Kaynak Kod (.zip) + Rapor',
    durum: 'bekleyen',
    puan: null,
    kalanGun: 10,
  },
  {
    id: 4,
    dersKodu: 'BİL307',
    dersAdi: 'Yazılım Mühendisliği',
    baslik: 'Dönem Projesi (SRS ve Mimari Tasarım Teslimi)',
    agirlikYuzde: 30,
    sonTeslim: '18 Aralık 2026 · 23:59',
    teslimBicimi: 'GitHub Deposu + Rapor',
    durum: 'teslim_edildi',
    puan: null,
    kalanGun: 20,
  },
  {
    id: 5,
    dersKodu: 'BİL301',
    dersAdi: 'Algoritma Analizi',
    baslik: 'Ödev 1: Asimptotik Karmaşıklık ve Rekürans Analizi',
    agirlikYuzde: 20,
    sonTeslim: '16 Kasım 2026 · 23:59',
    teslimBicimi: 'PDF Rapor (Pusula)',
    durum: 'notlandirildi',
    puan: 85,
    kalanGun: -12,
  },
  {
    id: 6,
    dersKodu: 'BİL303',
    dersAdi: 'Veritabanı Sistemleri',
    baslik: 'Ödev 1: Kavramsal Veri Modelleme',
    agirlikYuzde: 10,
    sonTeslim: '13 Kasım 2026 · 23:59',
    teslimBicimi: 'PDF Rapor (Pusula)',
    durum: 'notlandirildi',
    puan: 82,
    kalanGun: -15,
  },
];

export function AssignmentsPage() {
  useDersler();
  useNotlar();
  const [filtre, setFiltre] = useState<OdevFiltre>('tumu');
  const [teslimEdilenler, setTeslimEdilenler] = useState<number[]>([]);

  const liste = ODEVLER.map((o) =>
    teslimEdilenler.includes(o.id) ? { ...o, durum: 'teslim_edildi' as const } : o,
  ).filter((o) => {
    if (filtre === 'bekleyen') return o.durum === 'bekleyen';
    if (filtre === 'teslim_edildi') return o.durum === 'teslim_edildi' || o.durum === 'notlandirildi';
    return true;
  });

  const bekleyenSayisi = ODEVLER.filter((o) => o.durum === 'bekleyen' && !teslimEdilenler.includes(o.id)).length;

  const takvimeEkle = () => {
    indirIcs(
      'korteks-odev-teslimleri.ics',
      ODEVLER.filter((o) => o.kalanGun > 0).map((o) => ({
        baslik: `${o.dersKodu} Ödev Teslimi: ${o.baslik}`,
        baslangic: new Date(Date.now() + o.kalanGun * 86400000).toISOString(),
        sureDk: 30,
        aciklama: o.teslimBicimi,
      })),
    );
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { md: 'flex-end' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h1">Ödevler ve Projeler</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Pusula ödev teslim tarihleri, ağırlık oranları ve OBS notlandırma durumu
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={filtre}
            onChange={(_, v: OdevFiltre | null) => v && setFiltre(v)}
            aria-label="Ödev durumu filtresi"
          >
            <ToggleButton value="tumu">Tümü ({ODEVLER.length})</ToggleButton>
            <ToggleButton value="bekleyen">Bekleyen ({bekleyenSayisi})</ToggleButton>
            <ToggleButton value="teslim_edildi">Tamamlanan</ToggleButton>
          </ToggleButtonGroup>
          <Button variant="outlined" startIcon={<CalendarPlus size={18} />} onClick={takvimeEkle}>
            Teslimleri takvime ekle
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2.5, mb: 3 }}>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            BEKLEYEN TESLİM
          </Typography>
          <Typography variant="h2" sx={{ mt: 0.5, color: bekleyenSayisi > 0 ? 'primary.main' : 'text.primary' }}>
            {bekleyenSayisi} ödev
          </Typography>
          <Typography variant="body2" color="text.secondary">
            En yakın teslim: 3 gün içinde (BİL303)
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            NOTLANDIRILAN ÖDEV ORTALAMASI
          </Typography>
          <Typography variant="h2" sx={{ mt: 0.5 }}>
            83,5 / 100
          </Typography>
          <Typography variant="body2" color="text.secondary">
            BİL301 (85) · BİL303 (82)
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            SENKRONİZE SİSTEMLER
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
            <SourceTag sistem="PUSULA" />
            <SourceTag sistem="OBS" />
          </Stack>
        </Paper>
      </Box>

      <SectionCard title="Ödev ve Proje Listesi" flush action={<SourceTag sistem="PUSULA" />}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table aria-label="Ödevler tablosu">
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 3 }}>Ders</TableCell>
                <TableCell>Ödev / Proje Başlığı</TableCell>
                <TableCell>Ağırlık</TableCell>
                <TableCell>Son Teslim Tarihi</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell align="right">Not</TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>
                  İşlem
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {liste.map((o) => (
                <TableRow key={o.id} hover>
                  <TableCell sx={{ pl: 3 }}>
                    <Typography
                      component={RouterLink}
                      to={`/derslerim/${encodeURIComponent(o.dersKodu)}`}
                      sx={{ fontWeight: 700, color: 'text.primary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {o.dersKodu}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {o.dersAdi}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>{o.baslik}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {o.teslimBicimi}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>%{o.agirlikYuzde}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {o.sonTeslim}
                    </Typography>
                    {o.durum === 'bekleyen' && (
                      <Typography variant="caption" color={o.kalanGun <= 3 ? 'warning.main' : 'text.secondary'} sx={{ fontWeight: 600 }}>
                        {o.kalanGun} gün kaldı
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {o.durum === 'bekleyen' && (
                      <Chip size="small" icon={<Clock size={14} />} label="Teslim Bekliyor" color="warning" variant="outlined" />
                    )}
                    {o.durum === 'teslim_edildi' && (
                      <Chip size="small" icon={<CheckCircle2 size={14} />} label="Teslim Edildi" color="info" variant="outlined" />
                    )}
                    {o.durum === 'notlandirildi' && (
                      <Chip size="small" icon={<CheckCircle2 size={14} />} label="Notlandırıldı" color="success" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {o.puan !== null ? o.puan : '–'}
                  </TableCell>
                  <TableCell align="right" sx={{ pr: 3 }}>
                    {o.durum === 'bekleyen' ? (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Upload size={15} />}
                        onClick={() => setTeslimEdilenler((prev) => [...prev, o.id])}
                      >
                        Teslim İşaretle
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Tamamlandı
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </SectionCard>
    </Box>
  );
}
