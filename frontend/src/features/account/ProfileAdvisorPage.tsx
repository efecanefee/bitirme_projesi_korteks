import { useNavigate } from 'react-router';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { Building2, Clock, Mail, MapPin, MessageSquare, Phone, UserCheck } from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';
import { SectionCard } from '@/components/SectionCard';
import { SourceTag } from '@/components/SourceTag';
import { basHarfler } from '@/lib/format';

export function ProfileAdvisorPage() {
  const kullanici = useAuthStore((s) => s.kullanici);
  const navigate = useNavigate();

  const adSoyad = kullanici?.ad_soyad ?? 'Deniz Yılmaz';
  const ogrenciNo = kullanici?.ogrenci_no ?? '2303022001';
  const ePosta = kullanici?.e_posta ?? 'deniz.yilmaz@ogr.beykent.edu.tr';

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto' }}>
      <Typography variant="h1">Profil ve Akademik Danışman Bilgileri</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, mb: 3 }}>
        OBS öğrenci özlük bilgileri, kayıt durumu ve akademik danışman iletişim detayları
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' }, gap: 3, alignItems: 'start' }}>
        <SectionCard title="Öğrenci Özlük ve Öğrenim Bilgileri" flush action={<SourceTag sistem="OBS" />}>
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5, borderBottom: 1, borderColor: 'divider' }}>
            <Avatar
              sx={{
                width: 68,
                height: 68,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 700,
                fontSize: '1.5rem',
              }}
            >
              {basHarfler(adSoyad)}
            </Avatar>
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="h2">{adSoyad}</Typography>
                <Chip size="small" label="Aktif Öğrenci" color="success" sx={{ fontWeight: 700 }} />
              </Stack>
              <Typography color="text.secondary" sx={{ mt: 0.25 }}>
                Öğrenci No: <b>{ogrenciNo}</b> · {ePosta}
              </Typography>
            </Box>
          </Box>

          <Table size="medium" aria-label="Öğrenci kimlik bilgileri">
            <TableBody>
              <TableRow>
                <TableCell sx={{ pl: 3, color: 'text.secondary', width: '42%' }}>Fakülte</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Mühendislik-Mimarlık Fakültesi</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: 3, color: 'text.secondary' }}>Bölüm / Program</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Bilgisayar Mühendisliği (Türkçe)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: 3, color: 'text.secondary' }}>Yerleşke (Kampüs)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ayazağa – Maslak Yerleşkesi</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: 3, color: 'text.secondary' }}>Sınıf / Yarıyıl</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>3. Sınıf · 5. Yarıyıl (2026–2027 Güz)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: 3, color: 'text.secondary' }}>Kayıt Tarihi & Şekli</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Eylül 2024 · ÖSYM (YKS) (%50 İndirimli)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: 3, color: 'text.secondary' }}>Müfredat Yılı</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>2024 Bilgisayar Mühendisliği Lisans Müfredatı (240 AKTS)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: 3, color: 'text.secondary', borderBottom: 0 }}>Ders Kaydı Durumu</TableCell>
                <TableCell sx={{ borderBottom: 0 }}>
                  <Chip size="small" icon={<UserCheck size={14} />} label="Danışman Onaylı (5 Ders · 18 Kredi · 30 AKTS)" color="success" variant="outlined" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </SectionCard>

        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h2" sx={{ fontSize: '1.125rem' }}>
                Akademik Danışman
              </Typography>
              <SourceTag sistem="OBS" />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2.5 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'secondary.main', color: 'secondary.contrastText', fontWeight: 700 }}>
                AK
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Dr. Öğr. Üyesi Ayşe Kale</Typography>
                <Typography variant="body2" color="text.secondary">
                  Bilgisayar Mühendisliği Bölümü · Akademik Danışman
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Mail size={18} />
                <Typography variant="body2">
                  <b>E-posta:</b> aysekale@beykent.edu.tr
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <MapPin size={18} />
                <Typography variant="body2">
                  <b>Ofis:</b> Ayazağa Yerleşkesi, B Blok Kat: 3, Oda: B-314
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Clock size={18} />
                <Typography variant="body2">
                  <b>Öğrenci Görüşme Saatleri:</b> Salı 14:00–16:00 · Perşembe 10:00–12:00
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Phone size={18} />
                <Typography variant="body2">
                  <b>Dahili Telefon:</b> 444 1 997 / Dahili: 5314
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Mail size={16} />}
                component="a"
                href="mailto:aysekale@beykent.edu.tr?subject=Danışmanlık%20Görüşmesi%20Talebi"
                fullWidth
              >
                E-posta Gönder
              </Button>
              <Button
                variant="contained"
                startIcon={<MessageSquare size={16} />}
                onClick={() => navigate('/asistan?soru=Ders%20kaydı%20ve%20danışman%20onayı%20ne%20zaman%20yapılır%3F')}
                fullWidth
              >
                Asistana Sor
              </Button>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
              <Building2 size={20} />
              <Typography variant="h2" sx={{ fontSize: '1.125rem' }}>
                İlgili Üniversite Birimleri
              </Typography>
            </Stack>
            <Stack spacing={1.25} sx={{ mt: 1.5 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Öğrenci İşleri Daire Başkanlığı
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ogrenciisleri@beykent.edu.tr · Belge, kayıt dondurma, mazeret dilekçeleri
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Staj ve Kariyer Koordinatörlüğü
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  kariyer@beykent.edu.tr · Zorunlu yaz stajı (STJ401/402) evrak ve SGK işlemleri
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Uzaktan Eğitim Merkezi (UZEM / Pusula Destek)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  uzem@beykent.edu.tr · Sanal sınıf, ders kaydı ve Pusula teknik destek
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
