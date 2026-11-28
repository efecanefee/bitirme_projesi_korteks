import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
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
import { Download, FileSpreadsheet, FileText, Presentation, Video } from 'lucide-react';
import { useDersler } from '@/api/queries';
import { SectionCard } from '@/components/SectionCard';
import { SourceTag } from '@/components/SourceTag';

interface HaftalikMateryal {
  id: number;
  dersKodu: string;
  dersAdi: string;
  hafta: number;
  baslik: string;
  tur: 'pdf' | 'sunum' | 'uygulama' | 'kayit';
  boyut: string;
  yuklemeTarihi: string;
}

const MATERYALLER: HaftalikMateryal[] = [
  { id: 1, dersKodu: 'BİL301', dersAdi: 'Algoritma Analizi', hafta: 8, baslik: 'Dinamik Programlama Örnekleri.pdf', tur: 'pdf', boyut: '2.4 MB', yuklemeTarihi: '25 Kasım 2026' },
  { id: 2, dersKodu: 'BİL301', dersAdi: 'Algoritma Analizi', hafta: 7, baslik: 'Açgözlü (Greedy) Algoritmalar Sunumu.pptx', tur: 'sunum', boyut: '5.1 MB', yuklemeTarihi: '18 Kasım 2026' },
  { id: 3, dersKodu: 'BİL301', dersAdi: 'Algoritma Analizi', hafta: 6, baslik: 'Böl ve Yönet & Master Teoremi Çalışma Soruları.pdf', tur: 'uygulama', boyut: '1.2 MB', yuklemeTarihi: '11 Kasım 2026' },
  { id: 4, dersKodu: 'BİL303', dersAdi: 'Veritabanı Sistemleri', hafta: 8, baslik: 'Normalizasyon (1NF, 2NF, 3NF, BCNF) Sunumu.pdf', tur: 'sunum', boyut: '3.8 MB', yuklemeTarihi: '26 Kasım 2026' },
  { id: 5, dersKodu: 'BİL303', dersAdi: 'Veritabanı Sistemleri', hafta: 7, baslik: 'İlişkisel Cebir ve SQL JOIN Laboratuvar Föyü.pdf', tur: 'uygulama', boyut: '1.9 MB', yuklemeTarihi: '19 Kasım 2026' },
  { id: 6, dersKodu: 'BİL305', dersAdi: 'İşletim Sistemleri', hafta: 8, baslik: 'Sanal Sınıf Kaydı · Hafta 8 (Deadlock & Банкer Algoritması)', tur: 'kayit', boyut: '104 dk', yuklemeTarihi: '21 Kasım 2026' },
  { id: 7, dersKodu: 'BİL305', dersAdi: 'İşletim Sistemleri', hafta: 7, baslik: 'CPU Zamanlama Algoritmaları (FCFS, SJF, RR) Ders Notu.pdf', tur: 'pdf', boyut: '3.2 MB', yuklemeTarihi: '14 Kasım 2026' },
  { id: 8, dersKodu: 'BİL307', dersAdi: 'Yazılım Mühendisliği', hafta: 8, baslik: 'UML Diyagramları ve Tasarım Kalıpları.pdf', tur: 'sunum', boyut: '6.4 MB', yuklemeTarihi: '20 Kasım 2026' },
  { id: 9, dersKodu: 'MAT301', dersAdi: 'Olasılık ve İstatistik', hafta: 8, baslik: 'Hafta 8 Ders Notları (Sürekli Olasılık Dağılımları).pdf', tur: 'pdf', boyut: '2.7 MB', yuklemeTarihi: '24 Kasım 2026' },
  { id: 10, dersKodu: 'MAT301', dersAdi: 'Olasılık ve İstatistik', hafta: 7, baslik: 'Sanal Sınıf Kaydı · Hafta 7 (Binom ve Poisson Dağılımı)', tur: 'kayit', boyut: '96 dk', yuklemeTarihi: '19 Kasım 2026' },
];

const TUR_BILGI: Record<HaftalikMateryal['tur'], { etiket: string; Icon: typeof FileText }> = {
  pdf: { etiket: 'Ders Notu (PDF)', Icon: FileText },
  sunum: { etiket: 'Sunum', Icon: Presentation },
  uygulama: { etiket: 'Lab / Uygulama', Icon: FileSpreadsheet },
  kayit: { etiket: 'Ders Kaydı', Icon: Video },
};

export function CourseMaterialsPage() {
  const { data: dersler } = useDersler();
  const [seciliDers, setSeciliDers] = useState<string>('TUMU');
  const [indirilenId, setIndirilenId] = useState<number | null>(null);

  const filtrelenmis = MATERYALLER.filter((m) => (seciliDers === 'TUMU' ? true : m.dersKodu === seciliDers));

  const indirSimule = (m: HaftalikMateryal) => {
    setIndirilenId(m.id);
    const icerik = `Korteks - Pusula Ders İçeriği Özeti\nDers: ${m.dersKodu} - ${m.dersAdi}\nHafta: ${m.hafta}\nBaşlık: ${m.baslik}\nTarih: ${m.yuklemeTarihi}\n`;
    const blob = new Blob([icerik], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${m.dersKodu}_Hafta${m.hafta}_${m.baslik.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setIndirilenId(null), 1500);
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h1">Ders İçerikleri</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Pusula üzerinden paylaşılan haftalık PDF ders notları, sunumlar ve laboratuvar föyleri
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <InputLabel id="ders-filtre-etiket">Derse göre filtrele</InputLabel>
          <Select
            labelId="ders-filtre-etiket"
            value={seciliDers}
            label="Derse göre filtrele"
            onChange={(e) => setSeciliDers(e.target.value)}
          >
            <MenuItem value="TUMU">Tüm Dersler ({MATERYALLER.length})</MenuItem>
            {(dersler ?? []).map((k) => (
              <MenuItem key={k.ders.kod} value={k.ders.kod}>
                {k.ders.kod} · {k.ders.ad}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2.5, mb: 3 }}>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            TOPLAM MATERYAL
          </Typography>
          <Typography variant="h2" sx={{ mt: 0.5 }}>
            {MATERYALLER.length} dosya
          </Typography>
          <Typography variant="body2" color="text.secondary">
            5 aktif dersten senkronize edildi
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            SON YÜKLENEN HAFTA
          </Typography>
          <Typography variant="h2" sx={{ mt: 0.5 }}>
            8. Hafta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vize öncesi tüm ders notları hazır
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            KAYNAK SİSTEM
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
            <SourceTag sistem="PUSULA" />
            <Typography variant="body2" color="text.secondary">
              Otomatik senkronize
            </Typography>
          </Stack>
        </Paper>
      </Box>

      <SectionCard title="Haftalık Ders Materyalleri" flush action={<SourceTag sistem="PUSULA" />}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table aria-label="Ders içerikleri tablosu">
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 3 }}>Hafta</TableCell>
                <TableCell>Ders</TableCell>
                <TableCell>Materyal Başlığı</TableCell>
                <TableCell>Tür</TableCell>
                <TableCell>Boyut / Süre</TableCell>
                <TableCell>Yüklenme Tarihi</TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>
                  İşlem
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtrelenmis.map((m) => {
                const turBilgi = TUR_BILGI[m.tur];
                const Icon = turBilgi.Icon;
                return (
                  <TableRow key={m.id} hover>
                    <TableCell sx={{ pl: 3 }}>
                      <Chip size="small" label={`${m.hafta}. Hafta`} sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>
                      <Typography
                        component={RouterLink}
                        to={`/derslerim/${encodeURIComponent(m.dersKodu)}`}
                        sx={{ fontWeight: 700, color: 'text.primary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {m.dersKodu}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {m.dersAdi}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: 'yuzeyIkincil', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <Icon size={18} />
                        </Box>
                        <Typography sx={{ fontWeight: 600 }}>{m.baslik}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {turBilgi.etiket}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{m.boyut}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{m.yuklemeTarihi}</TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      <Button
                        size="small"
                        variant={indirilenId === m.id ? 'contained' : 'outlined'}
                        startIcon={<Download size={16} />}
                        onClick={() => indirSimule(m)}
                      >
                        {indirilenId === m.id ? 'İndirildi' : 'İndir'}
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
