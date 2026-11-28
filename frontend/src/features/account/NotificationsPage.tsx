import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { BellRing, CalendarPlus, CheckCheck, Clock, AlertTriangle } from 'lucide-react';
import { SectionCard } from '@/components/SectionCard';
import { SourceTag } from '@/components/SourceTag';
import { indirIcs } from '@/lib/ics';
import type { KaynakSistem } from '@/api/types';

interface HatirlatmaKaydi {
  id: number;
  baslik: string;
  detay: string;
  zaman: string;
  oncelik: 'kritik' | 'yaklasan' | 'bilgi';
  kaynak: KaynakSistem;
  okundu: boolean;
}

const BASLANGIC_BILDIRIMLERI: HatirlatmaKaydi[] = [
  {
    id: 1,
    baslik: 'BİL301 Algoritma Analizi Ara Sınavı Yarın!',
    detay: '29 Kasım Pazar 10:00 · Salon: Ayazağa D-301 (Sınav salonu değişikliği doğrulandı)',
    zaman: 'Yarın 10:00',
    oncelik: 'kritik',
    kaynak: 'PSG',
    okundu: false,
  },
  {
    id: 2,
    baslik: 'MAT301 Olasılık ve İstatistik Devamsızlık Sınırı Uyarısı',
    detay: '4 devamsızlık hakkının 3 tanesini kullandın. 1 devamsızlık daha yaparsan final hakkını kaybedersin.',
    zaman: 'Kritik Eşik (3/4)',
    oncelik: 'kritik',
    kaynak: 'OBS',
    okundu: false,
  },
  {
    id: 3,
    baslik: 'BİL303 ER Diyagramı Ödevi Teslimine 3 Gün Kaldı',
    detay: 'Son teslim: 1 Aralık 23:59 · Pusula üzerinden PDF yükleme',
    zaman: '3 gün kaldı',
    oncelik: 'yaklasan',
    kaynak: 'PUSULA',
    okundu: false,
  },
  {
    id: 4,
    baslik: 'Mazeret Sınavı Başvuruları Başladı',
    detay: 'Ara sınav mazeret başvuruları 4 Aralık tarihine kadar Öğrenci İşleri’ne dilekçeyle yapılır.',
    zaman: 'Son 6 gün',
    oncelik: 'bilgi',
    kaynak: 'PUSULA',
    okundu: true,
  },
  {
    id: 5,
    baslik: 'BİL305 İşletim Sistemleri Ara Sınav Notu Açıklandı',
    detay: 'Ara sınav (%40): 55 · Finalden geçmek için en az 64 alman gerekiyor.',
    zaman: '6 gün önce',
    oncelik: 'bilgi',
    kaynak: 'OBS',
    okundu: true,
  },
];

export function NotificationsPage() {
  const [bildirimler, setBildirimler] = useState(BASLANGIC_BILDIRIMLERI);
  const [tercihler, setTercihler] = useState({
    sinavHatirlatma: true,
    odevTeslim: true,
    devamsizlikUyari: true,
    notAciklanma: true,
  });

  const tumunuOkunduYap = () => {
    setBildirimler((prev) => prev.map((b) => ({ ...b, okundu: true })));
  };

  const hatirlatmalariIndir = () => {
    indirIcs('korteks-hatirlatmalar.ics', [
      { baslik: 'BİL301 Ara Sınavı (Ayazağa D-301)', baslangic: new Date(Date.now() + 86400000).toISOString(), sureDk: 75 },
      { baslik: 'BİL303 ER Diyagramı Ödev Teslimi', baslangic: new Date(Date.now() + 3 * 86400000).toISOString(), sureDk: 30 },
    ]);
  };

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h1">Bildirimler ve Hatırlatmalar</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Yaklaşan sınavlar, ödev teslimleri, devamsızlık sınır uyarıları ve yeni açıklanan not bildirimleri (FG-13)
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<CheckCheck size={18} />} onClick={tumunuOkunduYap}>
            Tümünü okundu işaretle
          </Button>
          <Button variant="contained" startIcon={<CalendarPlus size={18} />} onClick={hatirlatmalariIndir}>
            Takvime aktar (.ics)
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.5fr 1fr' }, gap: 3, alignItems: 'start' }}>
        <SectionCard title="Aktif Uyarı ve Hatırlatmalar" flush>
          <Box sx={{ overflowX: 'auto' }}>
            <Table aria-label="Bildirimler listesi">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: 3 }}>Bildirim & Detay</TableCell>
                  <TableCell>Zaman / Eşik</TableCell>
                  <TableCell align="right" sx={{ pr: 3 }}>
                    Kaynak
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bildirimler.map((b) => (
                  <TableRow key={b.id} hover sx={{ opacity: b.okundu ? 0.75 : 1 }}>
                    <TableCell sx={{ pl: 3 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.25 }}>
                        {b.oncelik === 'kritik' && <AlertTriangle size={16} color="#FF5C23" />}
                        {b.oncelik === 'yaklasan' && <Clock size={16} />}
                        {b.oncelik === 'bilgi' && <BellRing size={16} />}
                        <Typography sx={{ fontWeight: b.okundu ? 600 : 700 }}>{b.baslik}</Typography>
                        {!b.okundu && <Chip size="small" label="Yeni" color="primary" sx={{ height: 20, fontSize: 11 }} />}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {b.detay}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{b.zaman}</TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      <SourceTag sistem={b.kaynak} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </SectionCard>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h2" sx={{ fontSize: '1.125rem', mb: 1 }}>
            Hatırlatma Kuralları
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Korteks senkronize edilen verilerden otomatik olarak akıllı uyarılar üretir:
          </Typography>

          <Stack spacing={2}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>Sınav Hatırlatmaları (PSG)</Typography>
                <Typography variant="caption" color="text.secondary">
                  Sınava 24 saat ve 3 gün kala salon/saat bildirimi
                </Typography>
              </Box>
              <Switch
                checked={tercihler.sinavHatirlatma}
                onChange={(_, v) => setTercihler((p) => ({ ...p, sinavHatirlatma: v }))}
              />
            </Stack>

            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>Ödev Teslim Uyarıları (Pusula)</Typography>
                <Typography variant="caption" color="text.secondary">
                  Teslim tarihine 72 saat kala hatırlatma
                </Typography>
              </Box>
              <Switch
                checked={tercihler.odevTeslim}
                onChange={(_, v) => setTercihler((p) => ({ ...p, odevTeslim: v }))}
              />
            </Stack>

            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>Devamsızlık Sınırı Uyarısı (OBS)</Typography>
                <Typography variant="caption" color="text.secondary">
                  Devamsızlık hakkının %75’i dolduğunda kritik uyarı
                </Typography>
              </Box>
              <Switch
                checked={tercihler.devamsizlikUyari}
                onChange={(_, v) => setTercihler((p) => ({ ...p, devamsizlikUyari: v }))}
              />
            </Stack>

            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>Yeni Not ve Final Hesabı (OBS)</Typography>
                <Typography variant="caption" color="text.secondary">
                  Vize/ödev notu girildiğinde gereken final puanını hesapla
                </Typography>
              </Box>
              <Switch
                checked={tercihler.notAciklanma}
                onChange={(_, v) => setTercihler((p) => ({ ...p, notAciklanma: v }))}
              />
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
