import { useState } from 'react';
import {
  Box,
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
  alpha,
} from '@mui/material';
import { CalendarRange, CheckCircle2, Clock, Flag } from 'lucide-react';
import { SectionCard } from '@/components/SectionCard';
import { SourceTag } from '@/components/SourceTag';

type DonemFiltre = 'tumu' | 'guz' | 'bahar';

interface AkademikOlay {
  id: number;
  donem: 'guz' | 'bahar';
  baslik: string;
  tarihAraligi: string;
  kategori: 'kayit' | 'ders' | 'sinav' | 'tatil';
  durum: 'tamamlandi' | 'aktif' | 'yaklasan';
  aciklama?: string;
}

const AKADEMIK_TAKVIM: AkademikOlay[] = [
  {
    id: 1,
    donem: 'guz',
    baslik: 'Güz Yarıyılı Ders Kayıtları ve Danışman Onayları',
    tarihAraligi: '21 – 27 Eylül 2026',
    kategori: 'kayit',
    durum: 'tamamlandi',
    aciklama: 'OBS üzerinden ders seçimi ve akademik danışman onayı.',
  },
  {
    id: 2,
    donem: 'guz',
    baslik: 'Güz Yarıyılı Derslerinin Başlaması',
    tarihAraligi: '28 Eylül 2026',
    kategori: 'ders',
    durum: 'tamamlandi',
  },
  {
    id: 3,
    donem: 'guz',
    baslik: 'Ders Ekleme – Bırakma (Ekle/Sil) Haftası',
    tarihAraligi: '5 – 9 Ekim 2026',
    kategori: 'kayit',
    durum: 'tamamlandi',
  },
  {
    id: 4,
    donem: 'guz',
    baslik: '29 Ekim Cumhuriyet Bayramı (Resmî Tatil)',
    tarihAraligi: '28 – 29 Ekim 2026',
    kategori: 'tatil',
    durum: 'tamamlandi',
  },
  {
    id: 5,
    donem: 'guz',
    baslik: 'Güz Yarıyılı Ara Sınavları (Vize Haftası)',
    tarihAraligi: '23 Kasım – 4 Aralık 2026',
    kategori: 'sinav',
    durum: 'aktif',
    aciklama: 'Sınav salonları ve saatleri PSG üzerinden ilan edilir.',
  },
  {
    id: 6,
    donem: 'guz',
    baslik: 'Ara Sınav Mazeret Başvuruları Son Tarihi',
    tarihAraligi: '9 Aralık 2026',
    kategori: 'sinav',
    durum: 'yaklasan',
    aciklama: 'Haklı ve geçerli mazeret belgeleriyle Öğrenci İşleri’ne dilekçe teslimi (Yönetmelik Madde 24).',
  },
  {
    id: 7,
    donem: 'guz',
    baslik: 'Güz Yarıyılı Derslerinin Sona Ermesi',
    tarihAraligi: '31 Aralık 2026',
    kategori: 'ders',
    durum: 'yaklasan',
  },
  {
    id: 8,
    donem: 'guz',
    baslik: 'Güz Yarıyılı Yarıyıl Sonu (Final) Sınavları',
    tarihAraligi: '4 – 17 Ocak 2027',
    kategori: 'sinav',
    durum: 'yaklasan',
    aciklama: 'Devam koşulunu (%70) sağlayan öğrenciler katılabilir (Madde 18).',
  },
  {
    id: 9,
    donem: 'guz',
    baslik: 'Güz Yarıyılı Bütünleme Sınavları',
    tarihAraligi: '25 – 31 Ocak 2027',
    kategori: 'sinav',
    durum: 'yaklasan',
    aciklama: 'Final sınavına girme hakkı olup başarısız olan veya giremeyen öğrenciler için (Madde 25).',
  },
  {
    id: 10,
    donem: 'bahar',
    baslik: 'Bahar Yarıyılı Ders Kayıtları',
    tarihAraligi: '2 – 6 Şubat 2027',
    kategori: 'kayit',
    durum: 'yaklasan',
    aciklama: 'OBS üzerinden yapılır; danışman onayları 9 Şubat 2027’ye kadar tamamlanır.',
  },
  {
    id: 11,
    donem: 'bahar',
    baslik: 'Bahar Yarıyılı Derslerinin Başlaması',
    tarihAraligi: '15 Şubat 2027',
    kategori: 'ders',
    durum: 'yaklasan',
  },
  {
    id: 12,
    donem: 'bahar',
    baslik: 'Bahar Yarıyılı Ders Ekleme – Bırakma',
    tarihAraligi: '22 – 26 Şubat 2027',
    kategori: 'kayit',
    durum: 'yaklasan',
  },
  {
    id: 13,
    donem: 'bahar',
    baslik: 'Bahar Yarıyılı Ara Sınavları (Vize)',
    tarihAraligi: '5 – 16 Nisan 2027',
    kategori: 'sinav',
    durum: 'yaklasan',
  },
  {
    id: 14,
    donem: 'bahar',
    baslik: 'Bahar Yarıyılı Yarıyıl Sonu (Final) Sınavları',
    tarihAraligi: '31 Mayıs – 13 Haziran 2027',
    kategori: 'sinav',
    durum: 'yaklasan',
  },
  {
    id: 15,
    donem: 'bahar',
    baslik: 'Bahar Yarıyılı Bütünleme Sınavları',
    tarihAraligi: '21 – 27 Haziran 2027',
    kategori: 'sinav',
    durum: 'yaklasan',
  },
];

const KATEGORI_ETIKET: Record<AkademikOlay['kategori'], { ad: string; renk: 'primary' | 'secondary' | 'warning' | 'info' }> = {
  kayit: { ad: 'Kayıt & Onay', renk: 'info' },
  ders: { ad: 'Eğitim-Öğretim', renk: 'secondary' },
  sinav: { ad: 'Sınav Dönemi', renk: 'primary' },
  tatil: { ad: 'Resmî Tatil', renk: 'warning' },
};

export function AcademicCalendarPage() {
  const [donem, setDonem] = useState<DonemFiltre>('tumu');

  const liste = AKADEMIK_TAKVIM.filter((o) => (donem === 'tumu' ? true : o.donem === donem));

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { md: 'flex-end' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h1">Akademik Takvim</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            2026–2027 Eğitim-Öğretim Yılı Önlisans ve Lisans Akademik Takvimi
          </Typography>
        </Box>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={donem}
          onChange={(_, v: DonemFiltre | null) => v && setDonem(v)}
          aria-label="Dönem filtresi"
        >
          <ToggleButton value="tumu">Tüm Yıl</ToggleButton>
          <ToggleButton value="guz">Güz Dönemi</ToggleButton>
          <ToggleButton value="bahar">Bahar Dönemi</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.5, mb: 3 }}>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: 'secili', display: 'grid', placeItems: 'center', color: 'primary.main' }}>
            <Clock size={24} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              AKTİF DÖNEM & HAFTA
            </Typography>
            <Typography variant="h2" sx={{ fontSize: '1.125rem' }}>
              2026–2027 Güz · 9. Hafta
            </Typography>
            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
              Ara Sınav (Vize) Dönemi
            </Typography>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: 'yuzeyIkincil', display: 'grid', placeItems: 'center', color: 'text.primary' }}>
            <Flag size={24} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              YAKLAŞAN KRİTİK TARİH
            </Typography>
            <Typography variant="h2" sx={{ fontSize: '1.125rem' }}>
              Final Sınavları
            </Typography>
            <Typography variant="body2" color="text.secondary">
              4 – 17 Ocak 2027
            </Typography>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: 'yuzeyIkincil', display: 'grid', placeItems: 'center', color: 'text.primary' }}>
            <CalendarRange size={24} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              BAHAR DERS KAYITLARI
            </Typography>
            <Typography variant="h2" sx={{ fontSize: '1.125rem' }}>
              2 – 6 Şubat 2027
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Danışman onayı: 9 Şubat 2027
            </Typography>
          </Box>
        </Paper>
      </Box>

      <SectionCard title="Akademik Takvim Çizelgesi" flush action={<SourceTag sistem="OBS" />}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table aria-label="Akademik takvim tablosu">
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 3 }}>Dönem</TableCell>
                <TableCell>Akademik Olay / Faaliyet</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell>Tarih Aralığı</TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>
                  Durum
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {liste.map((o) => {
                const kat = KATEGORI_ETIKET[o.kategori];
                const aktif = o.durum === 'aktif';
                return (
                  <TableRow
                    key={o.id}
                    hover
                    sx={
                      aktif
                        ? {
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                          }
                        : undefined
                    }
                  >
                    <TableCell sx={{ pl: 3, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {o.donem === 'guz' ? 'Güz' : 'Bahar'}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: aktif ? 700 : 600 }}>{o.baslik}</Typography>
                      {o.aciklama && (
                        <Typography variant="body2" color="text.secondary">
                          {o.aciklama}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={kat.ad} color={kat.renk} variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{o.tarihAraligi}</TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      {o.durum === 'tamamlandi' && (
                        <Chip
                          size="small"
                          icon={<CheckCircle2 size={14} />}
                          label="Tamamlandı"
                          variant="outlined"
                          sx={{ color: 'text.secondary' }}
                        />
                      )}
                      {o.durum === 'aktif' && <Chip size="small" label="Aktif Hafta" color="primary" sx={{ fontWeight: 700 }} />}
                      {o.durum === 'yaklasan' && <Chip size="small" label="Yaklaşan" variant="outlined" />}
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
