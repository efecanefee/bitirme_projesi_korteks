import { useNavigate } from 'react-router';
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
import { ArrowRight, History, MessageSquare, Plus, Sparkles } from 'lucide-react';
import { useSohbetler } from '@/api/queries';
import { SectionCard } from '@/components/SectionCard';
import { EmptyState } from '@/components/states';
import dayjs from '@/lib/dayjs';

const ORNEK_ARSIV = [
  {
    id: 9001,
    baslik: 'MAT301 finalden kaç almam gerekiyor?',
    kategori: 'Kişisel Veri & Hesaplama Aracı',
    tarih: 'Bugün · 11:20',
    soru: 'MAT301 finalden kaç almam gerekiyor?',
  },
  {
    id: 9002,
    baslik: 'Bütünleme sınavına kimler girebilir?',
    kategori: 'Yönetmelik (Madde 25)',
    tarih: 'Dün · 16:45',
    soru: 'Bütünlemeye kimler girebilir?',
  },
  {
    id: 9003,
    baslik: 'BİL301 ara sınavım hangi salonda?',
    kategori: 'PSG Sınav Bilgisi',
    tarih: '2 gün önce',
    soru: 'BİL301 sınavım hangi salonda?',
  },
  {
    id: 9004,
    baslik: 'Bahar dönemi ders kayıtları ne zaman?',
    kategori: 'Akademik Takvim',
    tarih: '3 gün önce',
    soru: 'Ders kaydı ne zaman?',
  },
];

export function ChatHistoryPage() {
  const navigate = useNavigate();
  const { data: sohbetler } = useSohbetler();

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h1">Sohbet Geçmişi</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Korteks Asistan (Korti) ile yaptığın önceki görüşmeler ve sık sorulan sorular
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate('/asistan')}>
          Yeni Sohbet Başlat
        </Button>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Bu Oturumdaki Sohbetlerin" flush>
          {!sohbetler || sohbetler.length === 0 ? (
            <EmptyState title="Bu oturumda henüz bir sohbet başlatmadın">
              Aşağıdaki kayıtlı sorulardan birine tıklayarak veya yeni sohbet başlatarak Korti'ye soru sorabilirsin.
            </EmptyState>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table aria-label="Oturum sohbet geçmişi">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ pl: 3 }}>Sohbet Başlığı</TableCell>
                    <TableCell>Son Mesaj Zamanı</TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      İşlem
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sohbetler.map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell sx={{ pl: 3 }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <MessageSquare size={18} />
                          <Typography sx={{ fontWeight: 600 }}>{s.baslik}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{dayjs(s.son_mesaj).fromNow()}</TableCell>
                      <TableCell align="right" sx={{ pr: 3 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          endIcon={<ArrowRight size={15} />}
                          onClick={() => navigate(`/asistan?soru=${encodeURIComponent(s.baslik)}`)}
                        >
                          Sohbete Git
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </SectionCard>

        <SectionCard title="Önceki Dönem & Sık Sorulan Asistan Sorguları" flush>
          <Box sx={{ overflowX: 'auto' }}>
            <Table aria-label="Örnek sohbet geçmişi">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: 3 }}>Soru / Konu</TableCell>
                  <TableCell>Yanıt Kaynağı</TableCell>
                  <TableCell>Tarih</TableCell>
                  <TableCell align="right" sx={{ pr: 3 }}>
                    Tekrar Sor
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ORNEK_ARSIV.map((o) => (
                  <TableRow key={o.id} hover>
                    <TableCell sx={{ pl: 3 }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <History size={18} />
                        <Typography sx={{ fontWeight: 600 }}>{o.baslik}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={o.kategori} variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{o.tarih}</TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Sparkles size={15} />}
                        onClick={() => navigate(`/asistan?soru=${encodeURIComponent(o.soru)}`)}
                      >
                        Asistanda Aç
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </SectionCard>

        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
          <Typography variant="caption" color="text.secondary">
            <b>Gizlilik Notu (FOG-06 / KVKK):</b> Sohbet geçmişin tarayıcı oturumu boyunca saklanır. Değerlendirme iznin kapalıysa sohbetlerin sistem kalitesi analizlerine dahil edilmez.
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );
}
