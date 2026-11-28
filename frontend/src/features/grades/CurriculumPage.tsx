import { useState } from 'react';
import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import { CheckCircle2, CircleDot, Clock } from 'lucide-react';
import { SectionCard } from '@/components/SectionCard';
import { SourceTag } from '@/components/SourceTag';

interface MufredatDers {
  kod: string;
  ad: string;
  tur: 'Zorunlu' | 'Seçmeli';
  teorik: number;
  uygulama: number;
  kredi: number;
  akts: number;
  durum: 'tamamlandi' | 'aliniyor' | 'alinmadi';
  harf?: string;
}

const MUFREDAT: Record<number, MufredatDers[]> = {
  1: [
    { kod: 'BİL101', ad: 'Bilgisayar Mühendisliğine Giriş', tur: 'Zorunlu', teorik: 3, uygulama: 0, kredi: 3, akts: 5, durum: 'tamamlandi', harf: 'AA' },
    { kod: 'BİL103', ad: 'Algoritma ve Programlama I', tur: 'Zorunlu', teorik: 3, uygulama: 2, kredi: 4, akts: 6, durum: 'tamamlandi', harf: 'BA' },
    { kod: 'MAT101', ad: 'Matematik I', tur: 'Zorunlu', teorik: 4, uygulama: 0, kredi: 4, akts: 6, durum: 'tamamlandi', harf: 'CB' },
    { kod: 'FİZ101', ad: 'Fizik I', tur: 'Zorunlu', teorik: 3, uygulama: 2, kredi: 4, akts: 6, durum: 'tamamlandi', harf: 'BB' },
    { kod: 'TÜR101', ad: 'Türk Dili I', tur: 'Zorunlu', teorik: 2, uygulama: 0, kredi: 2, akts: 2, durum: 'tamamlandi', harf: 'AA' },
    { kod: 'İNG101', ad: 'İngilizce I', tur: 'Zorunlu', teorik: 3, uygulama: 0, kredi: 3, akts: 5, durum: 'tamamlandi', harf: 'CC' },
  ],
  2: [
    { kod: 'BİL102', ad: 'Algoritma ve Programlama II', tur: 'Zorunlu', teorik: 3, uygulama: 2, kredi: 4, akts: 6, durum: 'tamamlandi', harf: 'AA' },
    { kod: 'BİL104', ad: 'Ayrık Matematik', tur: 'Zorunlu', teorik: 3, uygulama: 0, kredi: 3, akts: 5, durum: 'tamamlandi', harf: 'BA' },
    { kod: 'MAT102', ad: 'Matematik II', tur: 'Zorunlu', teorik: 4, uygulama: 0, kredi: 4, akts: 6, durum: 'tamamlandi', harf: 'BB' },
    { kod: 'FİZ102', ad: 'Fizik II', tur: 'Zorunlu', teorik: 3, uygulama: 2, kredi: 4, akts: 6, durum: 'tamamlandi', harf: 'CB' },
    { kod: 'MAT104', ad: 'Lineer Cebir', tur: 'Zorunlu', teorik: 3, uygulama: 0, kredi: 3, akts: 5, durum: 'tamamlandi', harf: 'BB' },
    { kod: 'TÜR102', ad: 'Türk Dili II', tur: 'Zorunlu', teorik: 2, uygulama: 0, kredi: 2, akts: 2, durum: 'tamamlandi', harf: 'AA' },
  ],
  3: [
    { kod: 'BİL201', ad: 'Veri Yapıları', tur: 'Zorunlu', teorik: 3, uygulama: 2, kredi: 4, akts: 6, durum: 'tamamlandi', harf: 'BA' },
    { kod: 'BİL203', ad: 'Sayısal Tasarım ve Mantık Devreleri', tur: 'Zorunlu', teorik: 3, uygulama: 2, kredi: 4, akts: 6, durum: 'tamamlandi', harf: 'BB' },
    { kod: 'BİL205', ad: 'Nesneye Yönelik Programlama', tur: 'Zorunlu', teorik: 3, uygulama: 0, kredi: 3, akts: 6, durum: 'tamamlandi', harf: 'AA' },
    { kod: 'MAT201', ad: 'Diferansiyel Denklemler', tur: 'Zorunlu', teorik: 4, uygulama: 0, kredi: 4, akts: 6, durum: 'tamamlandi', harf: 'CC' },
    { kod: 'ATA201', ad: 'Atatürk İlkeleri ve İnkılap Tarihi I', tur: 'Zorunlu', teorik: 2, uygulama: 0, kredi: 2, akts: 2, durum: 'tamamlandi', harf: 'AA' },
    { kod: 'SEÇ201', ad: 'Web Teknolojilerine Giriş', tur: 'Seçmeli', teorik: 3, uygulama: 0, kredi: 3, akts: 4, durum: 'tamamlandi', harf: 'BB' },
  ],
  4: [
    { kod: 'BİL202', ad: 'Bilgisayar Mimarisi ve Organizasyonu', tur: 'Zorunlu', teorik: 3, uygulama: 2, kredi: 4, akts: 6, durum: 'tamamlandi', harf: 'BB' },
    { kod: 'BİL204', ad: 'Biçimsel Diller ve Otomata Teorisi', tur: 'Zorunlu', teorik: 3, uygulama: 0, kredi: 3, akts: 6, durum: 'tamamlandi', harf: 'BA' },
    { kod: 'BİL206', ad: 'Programlama Dilleri Prensipleri', tur: 'Zorunlu', teorik: 3, uygulama: 0, kredi: 3, akts: 6, durum: 'tamamlandi', harf: 'BB' },
    { kod: 'BİL208', ad: 'Sayısal Yöntemler', tur: 'Zorunlu', teorik: 3, uygulama: 0, kredi: 3, akts: 5, durum: 'tamamlandi', harf: 'CB' },
    { kod: 'ATA202', ad: 'Atatürk İlkeleri ve İnkılap Tarihi II', tur: 'Zorunlu', teorik: 2, uygulama: 0, kredi: 2, akts: 2, durum: 'tamamlandi', harf: 'AA' },
    { kod: 'SEÇ202', ad: 'Kullanıcı Arayüzü Tasarımı', tur: 'Seçmeli', teorik: 3, uygulama: 0, kredi: 3, akts: 5, durum: 'tamamlandi', harf: 'AA' },
  ],
  5: [
    { kod: 'BİL301', ad: 'Algoritma Analizi', tur: 'Zorunlu', teorik: 3, uygulama: 2, kredi: 4, akts: 6, durum: 'aliniyor' },
    { kod: 'BİL303', ad: 'Veritabanı Sistemleri', tur: 'Zorunlu', teorik: 3, uygulama: 2, kredi: 4, akts: 6, durum: 'aliniyor' },
    { kod: 'BİL305', ad: 'İşletim Sistemleri', tur: 'Zorunlu', teorik: 3, uygulama: 2, kredi: 4, akts: 6, durum: 'aliniyor' },
    { kod: 'BİL307', ad: 'Yazılım Mühendisliği', tur: 'Zorunlu', teorik: 3, uygulama: 0, kredi: 3, akts: 6, durum: 'aliniyor' },
    { kod: 'MAT301', ad: 'Olasılık ve İstatistik', tur: 'Zorunlu', teorik: 3, uygulama: 0, kredi: 3, akts: 6, durum: 'aliniyor' },
  ],
  6: [
    { kod: 'BİL302', ad: 'Bilgisayar Ağları', tur: 'Zorunlu', teorik: 3, uygulama: 2, kredi: 4, akts: 6, durum: 'alinmadi' },
    { kod: 'BİL304', ad: 'Yapay Zekâ ve Makine Öğrenmesi', tur: 'Zorunlu', teorik: 3, uygulama: 2, kredi: 4, akts: 6, durum: 'alinmadi' },
    { kod: 'BİL306', ad: 'Mikroişlemciler ve Gömülü Sistemler', tur: 'Zorunlu', teorik: 3, uygulama: 2, kredi: 4, akts: 6, durum: 'alinmadi' },
    { kod: 'BİL308', ad: 'Bilgi Güvenliği ve Kriptografi', tur: 'Zorunlu', teorik: 3, uygulama: 0, kredi: 3, akts: 6, durum: 'alinmadi' },
    { kod: 'SEÇ302', ad: 'Bulut Bilişim Mimarileri', tur: 'Seçmeli', teorik: 3, uygulama: 0, kredi: 3, akts: 6, durum: 'alinmadi' },
  ],
  7: [
    { kod: 'BİL401', ad: 'Tasarım Projesi (Bitirme Öncesi)', tur: 'Zorunlu', teorik: 1, uygulama: 4, kredi: 3, akts: 8, durum: 'alinmadi' },
    { kod: 'BİL403', ad: 'Derleyici Tasarımı', tur: 'Zorunlu', teorik: 3, uygulama: 0, kredi: 3, akts: 6, durum: 'alinmadi' },
    { kod: 'BİL405', ad: 'Yazılım Kalite Güvencesi ve Testi', tur: 'Seçmeli', teorik: 3, uygulama: 0, kredi: 3, akts: 5, durum: 'alinmadi' },
    { kod: 'BİL407', ad: 'Doğal Dil İşleme ve Büyük Dil Modelleri', tur: 'Seçmeli', teorik: 3, uygulama: 0, kredi: 3, akts: 5, durum: 'alinmadi' },
    { kod: 'STJ401', ad: 'Yaz Stajı I (20 İş Günü)', tur: 'Zorunlu', teorik: 0, uygulama: 0, kredi: 0, akts: 6, durum: 'alinmadi' },
  ],
  8: [
    { kod: 'BİL402', ad: 'Bitirme Projesi', tur: 'Zorunlu', teorik: 1, uygulama: 6, kredi: 4, akts: 10, durum: 'alinmadi' },
    { kod: 'BİL404', ad: 'Mühendislik Etiği ve Hukuku', tur: 'Zorunlu', teorik: 2, uygulama: 0, kredi: 2, akts: 4, durum: 'alinmadi' },
    { kod: 'SEÇ402', ad: 'Dağıtık Sistemler', tur: 'Seçmeli', teorik: 3, uygulama: 0, kredi: 3, akts: 5, durum: 'alinmadi' },
    { kod: 'SEÇ404', ad: 'Derin Öğrenme Uygulamaları', tur: 'Seçmeli', teorik: 3, uygulama: 0, kredi: 3, akts: 5, durum: 'alinmadi' },
    { kod: 'STJ402', ad: 'Yaz Stajı II (20 İş Günü)', tur: 'Zorunlu', teorik: 0, uygulama: 0, kredi: 0, akts: 6, durum: 'alinmadi' },
  ],
};

export function CurriculumPage() {
  const [yariyil, setYariyil] = useState<number>(5);
  const dersler = MUFREDAT[yariyil] ?? [];

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h1">Müfredat Bilgi Paketi (AKTS)</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, mb: 3 }}>
        Bilgisayar Mühendisliği Bölümü 8 yarıyıllık ders planı, kredi/AKTS yükleri ve mezuniyet ilerleme durumu
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 1.5, gap: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 700 }}>Mezuniyet AKTS İlerlemesi</Typography>
            <Typography variant="body2" color="text.secondary">
              Tamamlanan: 120 AKTS (%50) · Aktif Alınan: 30 AKTS · Kalan: 90 AKTS (Toplam 240 AKTS)
            </Typography>
          </Box>
          <Chip label="5. Yarıyıl (3. Sınıf)" color="primary" sx={{ fontWeight: 700 }} />
        </Stack>
        <LinearProgress variant="buffer" value={50} valueBuffer={62.5} sx={{ height: 10, borderRadius: 999 }} />
      </Paper>

      <Tabs
        value={yariyil}
        onChange={(_, v: number) => setYariyil(v)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        aria-label="Yarıyıllar"
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map((y) => (
          <Tab
            key={y}
            value={y}
            label={`${y}. Yarıyıl ${y === 5 ? '(Aktif)' : ''}`}
          />
        ))}
      </Tabs>

      <SectionCard
        title={`${yariyil}. Yarıyıl Ders Planı (${yariyil % 2 === 1 ? 'Güz' : 'Bahar'})`}
        flush
        action={<SourceTag sistem="OBS" />}
      >
        <Box sx={{ overflowX: 'auto' }}>
          <Table aria-label="Müfredat dersleri">
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 3 }}>Ders Kodu</TableCell>
                <TableCell>Ders Adı</TableCell>
                <TableCell>Türü</TableCell>
                <TableCell align="center">T + U</TableCell>
                <TableCell align="right">Kredi</TableCell>
                <TableCell align="right">AKTS</TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>
                  Durum
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dersler.map((d) => (
                <TableRow key={d.kod} hover>
                  <TableCell sx={{ pl: 3, fontWeight: 700 }}>{d.kod}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{d.ad}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={d.tur}
                      variant="outlined"
                      color={d.tur === 'Zorunlu' ? 'default' : 'info'}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ fontVariantNumeric: 'tabular-nums', color: 'text.secondary' }}>
                    {d.teorik} + {d.uygulama}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{d.kredi}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{d.akts}</TableCell>
                  <TableCell align="right" sx={{ pr: 3 }}>
                    {d.durum === 'tamamlandi' && (
                      <Chip
                        size="small"
                        icon={<CheckCircle2 size={14} />}
                        label={`Tamamlandı (${d.harf})`}
                        color="success"
                        variant="outlined"
                      />
                    )}
                    {d.durum === 'aliniyor' && (
                      <Chip
                        size="small"
                        icon={<Clock size={14} />}
                        label="Bu Dönem Alınıyor"
                        color="primary"
                      />
                    )}
                    {d.durum === 'alinmadi' && (
                      <Chip
                        size="small"
                        icon={<CircleDot size={14} />}
                        label="Gelecek Dönem"
                        variant="outlined"
                        sx={{ color: 'text.secondary' }}
                      />
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
