import { Link as RouterLink } from 'react-router';
import {
  Alert,
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
  Typography,
} from '@mui/material';
import { CalendarPlus, Clock, MapPin, ShieldAlert } from 'lucide-react';
import { SectionCard } from '@/components/SectionCard';
import { SourceTag } from '@/components/SourceTag';
import { indirIcs } from '@/lib/ics';

interface SinavOturumu {
  id: number;
  dersKodu: string;
  dersAdi: string;
  tur: 'Ara Sınav (Vize)' | 'Kısa Sınav (Quiz)' | 'Final Sınavı';
  tarih: string;
  saat: string;
  salon: string;
  siraNo: string;
  sureDk: number;
  gozetmen: string;
  durum: 'yaklasan' | 'tamamlandi' | 'planlaniyor';
  not?: number;
}

const SINAV_TAKVIMI: SinavOturumu[] = [
  {
    id: 1,
    dersKodu: 'BİL301',
    dersAdi: 'Algoritma Analizi',
    tur: 'Ara Sınav (Vize)',
    tarih: '29 Kasım 2026 Pazar',
    saat: '10:00',
    salon: 'Ayazağa D-301',
    siraNo: 'B-14',
    sureDk: 75,
    gozetmen: 'Arş. Gör. Emre Kaya',
    durum: 'yaklasan',
  },
  {
    id: 2,
    dersKodu: 'BİL307',
    dersAdi: 'Yazılım Mühendisliği',
    tur: 'Kısa Sınav (Quiz)',
    tarih: '4 Aralık 2026 Cuma',
    saat: '14:00',
    salon: 'Ayazağa A-112',
    siraNo: 'C-08',
    sureDk: 30,
    gozetmen: 'Dr. Öğr. Üyesi Can Demir',
    durum: 'yaklasan',
  },
  {
    id: 3,
    dersKodu: 'BİL305',
    dersAdi: 'İşletim Sistemleri',
    tur: 'Ara Sınav (Vize)',
    tarih: '22 Kasım 2026 Pazar',
    saat: '13:00',
    salon: 'Ayazağa D-205',
    siraNo: 'A-04',
    sureDk: 80,
    gozetmen: 'Doç. Dr. Kerem Öz',
    durum: 'tamamlandi',
    not: 55,
  },
  {
    id: 4,
    dersKodu: 'BİL303',
    dersAdi: 'Veritabanı Sistemleri',
    tur: 'Ara Sınav (Vize)',
    tarih: '20 Kasım 2026 Cuma',
    saat: '09:00',
    salon: 'Ayazağa B-204',
    siraNo: 'D-11',
    sureDk: 90,
    gozetmen: 'Dr. Öğr. Üyesi Elif Arslan',
    durum: 'tamamlandi',
    not: 64,
  },
  {
    id: 5,
    dersKodu: 'MAT301',
    dersAdi: 'Olasılık ve İstatistik',
    tur: 'Ara Sınav (Vize)',
    tarih: '20 Kasım 2026 Cuma',
    saat: '13:00',
    salon: 'Ayazağa C-105',
    siraNo: 'B-09',
    sureDk: 90,
    gozetmen: 'Dr. Öğr. Üyesi Selin Aydın',
    durum: 'tamamlandi',
    not: 48,
  },
  {
    id: 6,
    dersKodu: 'Tümü',
    dersAdi: 'Yarıyıl Sonu (Final) Sınavları',
    tur: 'Final Sınavı',
    tarih: '4 – 17 Ocak 2027',
    saat: 'İlan Edilecek',
    salon: 'PSG Üzerinden İlan Edilecek',
    siraNo: '–',
    sureDk: 90,
    gozetmen: '–',
    durum: 'planlaniyor',
  },
];

export function ExamSchedulePage() {
  const takvimeIndir = () => {
    indirIcs(
      'psg-sinav-takvimi.ics',
      SINAV_TAKVIMI.filter((s) => s.durum === 'yaklasan').map((s, i) => ({
        baslik: `${s.dersKodu} ${s.tur} (${s.salon})`,
        baslangic: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
        sureDk: s.sureDk,
        aciklama: `Salon: ${s.salon} · Sıra No: ${s.siraNo} · Gözetmen: ${s.gozetmen}`,
      })),
    );
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h1">Sınav Takvimi (PSG & OBS)</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            PSG sınav salonu, sıra numarası, süre bilgileri ve OBS sınav sonuçları
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<CalendarPlus size={18} />} onClick={takvimeIndir}>
          Sınavları takvime ekle (.ics)
        </Button>
      </Stack>

      <Alert severity="info" icon={<ShieldAlert size={20} />} sx={{ mb: 3, borderRadius: 2.5 }}>
        <b>Sınav Uygulama Yönergesi (Madde 9):</b> Öğrenciler sınava öğrenci kimlik kartı ve PSG sınav giriş belgesi ile girer. Sınavın ilk <b>15 dakikasından sonra</b> sınav salonuna öğrenci alınmaz.
      </Alert>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.5, mb: 3 }}>
        {SINAV_TAKVIMI.filter((s) => s.durum === 'yaklasan').map((s) => (
          <Paper key={s.id} variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: 'primary.main', borderWidth: 1.5 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Chip size="small" label={s.tur} color="primary" sx={{ fontWeight: 700 }} />
              <SourceTag sistem="PSG" />
            </Stack>
            <Typography variant="h2" sx={{ mt: 0.5 }}>
              {s.dersKodu} · {s.dersAdi}
            </Typography>
            <Stack direction="row" spacing={3} sx={{ mt: 2, flexWrap: 'wrap', rowGap: 1 }}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <Clock size={16} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {s.tarih} · {s.saat} ({s.sureDk} dk)
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <MapPin size={16} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {s.salon} · Sıra: {s.siraNo}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Box>

      <SectionCard title="Tüm Sınav Oturumları" flush action={<SourceTag sistem="PSG" />}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table aria-label="Sınav takvimi tablosu">
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 3 }}>Ders</TableCell>
                <TableCell>Sınav Türü</TableCell>
                <TableCell>Tarih & Saat</TableCell>
                <TableCell>Salon & Sıra No</TableCell>
                <TableCell align="right">Süre</TableCell>
                <TableCell align="right">Açıklanan Not</TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>
                  Durum
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {SINAV_TAKVIMI.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell sx={{ pl: 3 }}>
                    {s.dersKodu !== 'Tümü' ? (
                      <Typography
                        component={RouterLink}
                        to={`/derslerim/${encodeURIComponent(s.dersKodu)}`}
                        sx={{ fontWeight: 700, color: 'text.primary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {s.dersKodu}
                      </Typography>
                    ) : (
                      <Typography sx={{ fontWeight: 700 }}>{s.dersKodu}</Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {s.dersAdi}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{s.tur}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {s.tarih}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Saat: {s.saat}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {s.salon}
                    </Typography>
                    {s.siraNo !== '–' && (
                      <Typography variant="caption" color="text.secondary">
                        Sıra No: <b>{s.siraNo}</b> · {s.gozetmen}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {s.sureDk} dk
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {s.not !== undefined ? s.not : '–'}
                  </TableCell>
                  <TableCell align="right" sx={{ pr: 3 }}>
                    {s.durum === 'yaklasan' && <Chip size="small" label="Yaklaşan" color="primary" sx={{ fontWeight: 700 }} />}
                    {s.durum === 'tamamlandi' && <Chip size="small" label="Tamamlandı" color="success" variant="outlined" />}
                    {s.durum === 'planlaniyor' && <Chip size="small" label="Planlanıyor" variant="outlined" />}
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
