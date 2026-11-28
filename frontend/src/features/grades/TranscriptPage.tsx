import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Award, Download, GraduationCap, TrendingUp } from 'lucide-react';
import { SectionCard } from '@/components/SectionCard';
import { SourceTag } from '@/components/SourceTag';
import { useAuthStore } from '@/features/auth/authStore';
import { sayi } from '@/lib/format';

interface TranskriptDers {
  kod: string;
  ad: string;
  kredi: number;
  akts: number;
  harf: string;
  katsayi: number | null;
  durum: 'Geçti' | 'Devam Ediyor';
}

interface TranskriptDonem {
  id: string;
  ad: string;
  yariyil: number;
  yano: number | null;
  agno: number;
  tamamlananAkts: number;
  dersler: TranskriptDers[];
}

const TRANSKRIPT_VERISI: TranskriptDonem[] = [
  {
    id: '2024-guz',
    ad: '2024–2025 Güz Yarıyılı',
    yariyil: 1,
    yano: 3.05,
    agno: 3.05,
    tamamlananAkts: 30,
    dersler: [
      { kod: 'BİL101', ad: 'Bilgisayar Mühendisliğine Giriş', kredi: 3, akts: 5, harf: 'AA', katsayi: 4.0, durum: 'Geçti' },
      { kod: 'BİL103', ad: 'Algoritma ve Programlama I', kredi: 4, akts: 6, harf: 'BA', katsayi: 3.5, durum: 'Geçti' },
      { kod: 'MAT101', ad: 'Matematik I (Calculus I)', kredi: 4, akts: 6, harf: 'CB', katsayi: 2.5, durum: 'Geçti' },
      { kod: 'FİZ101', ad: 'Fizik I', kredi: 4, akts: 6, harf: 'BB', katsayi: 3.0, durum: 'Geçti' },
      { kod: 'TÜR101', ad: 'Türk Dili I', kredi: 2, akts: 2, harf: 'AA', katsayi: 4.0, durum: 'Geçti' },
      { kod: 'İNG101', ad: 'İngilizce I', kredi: 3, akts: 5, harf: 'CC', katsayi: 2.0, durum: 'Geçti' },
    ],
  },
  {
    id: '2025-bahar',
    ad: '2024–2025 Bahar Yarıyılı',
    yariyil: 2,
    yano: 3.18,
    agno: 3.11,
    tamamlananAkts: 30,
    dersler: [
      { kod: 'BİL102', ad: 'Algoritma ve Programlama II (OOP)', kredi: 4, akts: 6, harf: 'AA', katsayi: 4.0, durum: 'Geçti' },
      { kod: 'BİL104', ad: 'Ayrık Matematik', kredi: 3, akts: 5, harf: 'BA', katsayi: 3.5, durum: 'Geçti' },
      { kod: 'MAT102', ad: 'Matematik II (Calculus II)', kredi: 4, akts: 6, harf: 'BB', katsayi: 3.0, durum: 'Geçti' },
      { kod: 'FİZ102', ad: 'Fizik II', kredi: 4, akts: 6, harf: 'CB', katsayi: 2.5, durum: 'Geçti' },
      { kod: 'MAT104', ad: 'Lineer Cebir', kredi: 3, akts: 5, harf: 'BB', katsayi: 3.0, durum: 'Geçti' },
      { kod: 'TÜR102', ad: 'Türk Dili II', kredi: 2, akts: 2, harf: 'AA', katsayi: 4.0, durum: 'Geçti' },
    ],
  },
  {
    id: '2025-guz',
    ad: '2025–2026 Güz Yarıyılı',
    yariyil: 3,
    yano: 3.08,
    agno: 3.10,
    tamamlananAkts: 30,
    dersler: [
      { kod: 'BİL201', ad: 'Veri Yapıları', kredi: 4, akts: 6, harf: 'BA', katsayi: 3.5, durum: 'Geçti' },
      { kod: 'BİL203', ad: 'Sayısal Tasarım ve Mantık Devreleri', kredi: 4, akts: 6, harf: 'BB', katsayi: 3.0, durum: 'Geçti' },
      { kod: 'BİL205', ad: 'Nesneye Yönelik Programlama', kredi: 3, akts: 6, harf: 'AA', katsayi: 4.0, durum: 'Geçti' },
      { kod: 'MAT201', ad: 'Diferansiyel Denklemler', kredi: 4, akts: 6, harf: 'CC', katsayi: 2.0, durum: 'Geçti' },
      { kod: 'ATA201', ad: 'Atatürk İlkeleri ve İnkılap Tarihi I', kredi: 2, akts: 2, harf: 'AA', katsayi: 4.0, durum: 'Geçti' },
      { kod: 'SEÇ201', ad: 'Web Teknolojilerine Giriş', kredi: 3, akts: 4, harf: 'BB', katsayi: 3.0, durum: 'Geçti' },
    ],
  },
  {
    id: '2026-bahar',
    ad: '2025–2026 Bahar Yarıyılı',
    yariyil: 4,
    yano: 3.19,
    agno: 3.12,
    tamamlananAkts: 30,
    dersler: [
      { kod: 'BİL202', ad: 'Bilgisayar Mimarisi ve Organizasyonu', kredi: 4, akts: 6, harf: 'BB', katsayi: 3.0, durum: 'Geçti' },
      { kod: 'BİL204', ad: 'Biçimsel Diller ve Otomata Teorisi', kredi: 3, akts: 6, harf: 'BA', katsayi: 3.5, durum: 'Geçti' },
      { kod: 'BİL206', ad: 'Programlama Dilleri Prensipleri', kredi: 3, akts: 6, harf: 'BB', katsayi: 3.0, durum: 'Geçti' },
      { kod: 'BİL208', ad: 'Sayısal Yöntemler', kredi: 3, akts: 5, harf: 'CB', katsayi: 2.5, durum: 'Geçti' },
      { kod: 'ATA202', ad: 'Atatürk İlkeleri ve İnkılap Tarihi II', kredi: 2, akts: 2, harf: 'AA', katsayi: 4.0, durum: 'Geçti' },
      { kod: 'SEÇ202', ad: 'Kullanıcı Arayüzü Tasarımı', kredi: 3, akts: 5, harf: 'AA', katsayi: 4.0, durum: 'Geçti' },
    ],
  },
  {
    id: '2026-guz',
    ad: '2026–2027 Güz Yarıyılı (Aktif Dönem)',
    yariyil: 5,
    yano: null,
    agno: 3.12,
    tamamlananAkts: 30,
    dersler: [
      { kod: 'BİL301', ad: 'Algoritma Analizi', kredi: 4, akts: 6, harf: '–', katsayi: null, durum: 'Devam Ediyor' },
      { kod: 'BİL303', ad: 'Veritabanı Sistemleri', kredi: 4, akts: 6, harf: '–', katsayi: null, durum: 'Devam Ediyor' },
      { kod: 'BİL305', ad: 'İşletim Sistemleri', kredi: 4, akts: 6, harf: '–', katsayi: null, durum: 'Devam Ediyor' },
      { kod: 'BİL307', ad: 'Yazılım Mühendisliği', kredi: 3, akts: 6, harf: '–', katsayi: null, durum: 'Devam Ediyor' },
      { kod: 'MAT301', ad: 'Olasılık ve İstatistik', kredi: 3, akts: 6, harf: '–', katsayi: null, durum: 'Devam Ediyor' },
    ],
  },
];

export function TranscriptPage() {
  const kullanici = useAuthStore((s) => s.kullanici);
  const [seciliDonem, setSeciliDonem] = useState<string>('TUMU');

  const gorunenDonemler = TRANSKRIPT_VERISI.filter((d) => (seciliDonem === 'TUMU' ? true : d.id === seciliDonem));

  const transkriptIndir = () => {
    const satirlar = [
      `İSTANBUL BEYKENT ÜNİVERSİTESİ - NOT DÖKÜM BELGESİ (TRANSKRİPT)`,
      `Öğrenci: ${kullanici?.ad_soyad ?? 'Deniz Yılmaz'} (${kullanici?.ogrenci_no ?? '2303022001'})`,
      `Bölüm: ${kullanici?.bolum ?? 'Bilgisayar Mühendisliği'} | Sınıf: ${kullanici?.sinif ?? 3}`,
      `Genel Not Ortalaması (AGNO): 3,12 / 4,00 | Tamamlanan AKTS: 120 / 240`,
      `-------------------------------------------------------------------------`,
      ...TRANSKRIPT_VERISI.flatMap((d) => [
        `\n[${d.yariyil}. Yarıyıl - ${d.ad}] (YANO: ${d.yano ? sayi(d.yano, 2) : 'Devam'} | AGNO: ${sayi(d.agno, 2)})`,
        ...d.dersler.map((x) => `  ${x.kod} | ${x.ad.padEnd(38, ' ')} | Kredi: ${x.kredi} | AKTS: ${x.akts} | Harf: ${x.harf}`),
      ]),
    ];
    const blob = new Blob([satirlar.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transkript_${kullanici?.ogrenci_no ?? '2303022001'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h1">Transkript ve Dönem Ortalamaları</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            OBS yarıyıl ağırlıklı not ortalamaları (YANO), genel not ortalaması (AGNO) ve harf notu dökümü
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel id="donem-secim-etiket">Yarıyıl Filtresi</InputLabel>
            <Select
              labelId="donem-secim-etiket"
              value={seciliDonem}
              label="Yarıyıl Filtresi"
              onChange={(e) => setSeciliDonem(e.target.value)}
            >
              <MenuItem value="TUMU">Tüm Yarıyıllar (1 – 5. Yarıyıl)</MenuItem>
              {TRANSKRIPT_VERISI.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.yariyil}. Yarıyıl · {d.ad}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Download size={18} />} onClick={transkriptIndir}>
            Transkript İndir
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2.5, mb: 3 }}>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: 'secili', display: 'grid', placeItems: 'center', color: 'primary.main' }}>
            <TrendingUp size={24} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              GENEL NOT ORTALAMASI (AGNO)
            </Typography>
            <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>
              3,12 <Typography component="span" variant="body2" color="text.secondary">/ 4,00</Typography>
            </Typography>
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
              Onur Öğrencisi Adayı (≥ 3,00)
            </Typography>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: 'yuzeyIkincil', display: 'grid', placeItems: 'center' }}>
            <GraduationCap size={24} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              TAMAMLANAN / MEZUNİYET AKTS
            </Typography>
            <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>
              120 <Typography component="span" variant="body2" color="text.secondary">/ 240 AKTS</Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              +30 AKTS aktif dönemde alınıyor
            </Typography>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: 'yuzeyIkincil', display: 'grid', placeItems: 'center' }}>
            <Award size={24} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              BAŞARILI DERS SAYISI
            </Typography>
            <Typography variant="h2" sx={{ fontSize: '1.5rem' }}>
              24 Ders
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Alttan / başarısız ders bulunmuyor
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Stack spacing={3}>
        {gorunenDonemler.map((donem) => (
          <SectionCard
            key={donem.id}
            title={`${donem.yariyil}. Yarıyıl · ${donem.ad}`}
            flush
            action={
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Chip
                  size="small"
                  label={donem.yano !== null ? `YANO: ${sayi(donem.yano, 2)}` : 'YANO: Dönem Devam Ediyor'}
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  size="small"
                  label={`AGNO: ${sayi(donem.agno, 2)}`}
                  color="primary"
                  sx={{ fontWeight: 700 }}
                />
                <SourceTag sistem="OBS" />
              </Stack>
            }
          >
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" aria-label={`${donem.ad} dersleri`}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ pl: 3, width: 120 }}>Ders Kodu</TableCell>
                    <TableCell>Ders Adı</TableCell>
                    <TableCell align="right">Kredi</TableCell>
                    <TableCell align="right">AKTS</TableCell>
                    <TableCell align="center">Harf Notu</TableCell>
                    <TableCell align="right">Katsayı</TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      Durum
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {donem.dersler.map((d) => (
                    <TableRow key={d.kod} hover>
                      <TableCell sx={{ pl: 3, fontWeight: 700 }}>{d.kod}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{d.ad}</TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{d.kredi}</TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{d.akts}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={d.harf}
                          color={d.harf === 'AA' || d.harf === 'BA' ? 'success' : d.harf === '–' ? 'default' : 'primary'}
                          variant={d.harf === '–' ? 'outlined' : 'filled'}
                          sx={{ fontWeight: 700, minWidth: 44 }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {d.katsayi !== null ? sayi(d.katsayi, 2) : '–'}
                      </TableCell>
                      <TableCell align="right" sx={{ pr: 3 }}>
                        <Typography
                          variant="body2"
                          color={d.durum === 'Geçti' ? 'success.main' : 'primary.main'}
                          sx={{ fontWeight: 600 }}
                        >
                          {d.durum}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </SectionCard>
        ))}
      </Stack>
    </Box>
  );
}
