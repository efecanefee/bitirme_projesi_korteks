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
  Typography,
} from '@mui/material';
import { CheckCircle2, MonitorPlay, PlayCircle, Radio } from 'lucide-react';
import { SectionCard } from '@/components/SectionCard';
import { SourceTag } from '@/components/SourceTag';

interface SanalSinifKaydi {
  id: number;
  dersKodu: string;
  dersAdi: string;
  hafta: number;
  konu: string;
  tarih: string;
  sureDk: number;
  izlendiMi: boolean;
}

const SANAL_SINIF_KAYITLARI: SanalSinifKaydi[] = [
  { id: 1, dersKodu: 'BİL305', dersAdi: 'İşletim Sistemleri', hafta: 8, konu: 'Deadlock Önleme, Kaçınma ve Banker Algoritması', tarih: '21 Kasım 2026 · 11:00', sureDk: 104, izlendiMi: true },
  { id: 2, dersKodu: 'MAT301', dersAdi: 'Olasılık ve İstatistik', hafta: 7, konu: 'Kesikli Olasılık Dağılımları: Binom ve Poisson', tarih: '19 Kasım 2026 · 13:00', sureDk: 96, izlendiMi: false },
  { id: 3, dersKodu: 'BİL305', dersAdi: 'İşletim Sistemleri', hafta: 7, konu: 'Kritik Bölge Problemi, Semaforlar ve Mutex', tarih: '14 Kasım 2026 · 11:00', sureDk: 98, izlendiMi: true },
  { id: 4, dersKodu: 'BİL303', dersAdi: 'Veritabanı Sistemleri', hafta: 6, konu: 'Karmaşık SQL Sorguları ve Alt Sorgu Optimizasyonu', tarih: '11 Kasım 2026 · 09:00', sureDk: 88, izlendiMi: true },
  { id: 5, dersKodu: 'BİL301', dersAdi: 'Algoritma Analizi', hafta: 6, konu: 'Çizge (Graph) Algoritmaları: BFS, DFS ve Dijkstra', tarih: '9 Kasım 2026 · 10:00', sureDk: 102, izlendiMi: false },
];

export function OnlineExamsPage() {
  const [izlenenler, setIzlenenler] = useState<number[]>(
    SANAL_SINIF_KAYITLARI.filter((k) => k.izlendiMi).map((k) => k.id),
  );

  const izleToggle = (id: number) => {
    setIzlenenler((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h1">Çevrim İçi Sınavlar ve Sanal Sınıf (Pusula)</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, mb: 3 }}>
        Pusula canlı sanal sınıf oturumları, geçmiş ders video kayıtları ve çevrim içi kısa sınavlar
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.5, mb: 3 }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Chip
              size="small"
              icon={<Radio size={14} />}
              label="Yaklaşan Canlı Ders"
              color="primary"
              sx={{ fontWeight: 700 }}
            />
            <SourceTag sistem="PUSULA" />
          </Stack>
          <Typography variant="h2">BİL305 · İşletim Sistemleri (9. Hafta)</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Doç. Dr. Kerem Öz · Çarşamba 11:00 – 12:50 · Pusula Sanal Sınıf
          </Typography>
          <Typography variant="body2" sx={{ mt: 1.5 }}>
            Konu: Bellek Yönetimi, Sayfalama (Paging) ve Sanal Bellek
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Chip
              size="small"
              icon={<MonitorPlay size={14} />}
              label="Çevrim İçi Kısa Sınav (Quiz)"
              color="secondary"
              sx={{ fontWeight: 700 }}
            />
            <SourceTag sistem="PUSULA" />
          </Stack>
          <Typography variant="h2">MAT301 · Olasılık ve İstatistik Çevrim İçi Quiz 2</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Dr. Öğr. Üyesi Selin Aydın · 7 Aralık 2026 Pazartesi 20:00 · Süre: 25 dk
          </Typography>
          <Typography variant="body2" sx={{ mt: 1.5 }}>
            Durum: Henüz erişime açılmadı (Sınav saatinde Pusula üzerinden aktifleşir)
          </Typography>
        </Paper>
      </Box>

      <SectionCard title="Sanal Sınıf Video Kayıtları Arşivi" flush action={<SourceTag sistem="PUSULA" />}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table aria-label="Sanal sınıf kayıtları tablosu">
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 3 }}>Hafta</TableCell>
                <TableCell>Ders</TableCell>
                <TableCell>İşlenen Konu</TableCell>
                <TableCell>Kayıt Tarihi</TableCell>
                <TableCell align="right">Süre</TableCell>
                <TableCell>İzlenme Durumu</TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>
                  İşlem
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {SANAL_SINIF_KAYITLARI.map((k) => {
                const izlendi = izlenenler.includes(k.id);
                return (
                  <TableRow key={k.id} hover>
                    <TableCell sx={{ pl: 3 }}>
                      <Chip size="small" label={`${k.hafta}. Hafta`} sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>
                      <Typography
                        component={RouterLink}
                        to={`/derslerim/${encodeURIComponent(k.dersKodu)}`}
                        sx={{ fontWeight: 700, color: 'text.primary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {k.dersKodu}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {k.dersAdi}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{k.konu}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{k.tarih}</TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {k.sureDk} dk
                    </TableCell>
                    <TableCell>
                      {izlendi ? (
                        <Chip size="small" icon={<CheckCircle2 size={14} />} label="İzlendi" color="success" variant="outlined" />
                      ) : (
                        <Chip size="small" label="İzlenmedi" color="warning" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      <Button
                        size="small"
                        variant={izlendi ? 'outlined' : 'contained'}
                        startIcon={<PlayCircle size={16} />}
                        onClick={() => izleToggle(k.id)}
                      >
                        {izlendi ? 'Tekrar İzle' : 'Kaydı İzle'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </SectionCard>
    </Box>
  );
}
