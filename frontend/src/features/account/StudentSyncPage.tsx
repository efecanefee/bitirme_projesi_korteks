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
import { CheckCircle2, Database, RefreshCw, ShieldCheck } from 'lucide-react';
import { useSenkronOzeti } from '@/api/queries';
import { SectionCard } from '@/components/SectionCard';
import { SourceTag } from '@/components/SourceTag';
import { saat, uzunTarih } from '@/lib/format';
import type { KaynakSistem } from '@/api/types';

const SISTEM_DETAYLARI: Record<
  KaynakSistem,
  {
    tamAd: string;
    adres: string;
    aktarilanVeriler: string[];
    siklik: string;
  }
> = {
  OBS: {
    tamAd: 'Öğrenci Bilgi Sistemi (OBS)',
    adres: 'obs.beykent.edu.tr',
    aktarilanVeriler: [
      'Alınan dersler, krediler ve ders programı',
      'Vize, final, bütünleme ve ödev notları',
      'Haftalık yoklama ve kalan devamsızlık hakkı',
      'Transkript (YANO/AGNO), müfredat (AKTS) ve danışman bilgileri',
    ],
    siklik: 'Her 15 dakikada bir otomatik',
  },
  PUSULA: {
    tamAd: 'Pusula Öğrenim Yönetim Sistemi (LMS)',
    adres: 'pusula.beykent.edu.tr',
    aktarilanVeriler: [
      'Haftalık ders materyalleri (PDF, sunum, uygulama föyleri)',
      'Ödev ve proje teslim tarihleri',
      'Sanal sınıf canlı ders bağlantıları ve video kayıt arşivleri',
      'Öğretim elemanı ders duyuruları',
    ],
    siklik: 'Her 15 dakikada bir otomatik',
  },
  PSG: {
    tamAd: 'Sınav ve Salon Planlama Sistemi (PSG)',
    adres: 'psg.beykent.edu.tr',
    aktarilanVeriler: [
      'Ara sınav (vize), final ve bütünleme sınav tarih/saatleri',
      'Sınav bina, derslik/salon ve sıra numarası bilgileri',
      'Sınav süresi ve salon değişikliği duyuruları',
    ],
    siklik: 'Her 30 dakikada bir otomatik',
  },
};

export function StudentSyncPage() {
  const { data: ozet, refetch, isFetching } = useSenkronOzeti();

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h1">Veri Kaynakları ve Senkronizasyon Durumu</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Korteks’in OBS, Pusula ve PSG sistemleriyle yaptığı veri eşitleme durumu ve kapsamı (FOG-09)
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshCw size={18} />}
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          {isFetching ? 'Kontrol ediliyor…' : 'Durumu Yenile'}
        </Button>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.5, mb: 3 }}>
        {(['OBS', 'PUSULA', 'PSG'] as const).map((sistem) => {
          const kayit = ozet?.find((x) => x.kaynak_sistem === sistem);
          const detay = SISTEM_DETAYLARI[sistem];
          return (
            <Paper key={sistem} variant="outlined" sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <SourceTag sistem={sistem} />
                  <Chip
                    size="small"
                    icon={<CheckCircle2 size={14} />}
                    label={kayit?.durum === 'hatali' ? 'Kesinti Var' : 'Bağlantı Aktif'}
                    color={kayit?.durum === 'hatali' ? 'warning' : 'success'}
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="h2" sx={{ fontSize: '1.125rem' }}>
                  {detay.tamAd}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {detay.adres} · {detay.siklik}
                </Typography>

                <Box component="ul" sx={{ pl: 2.25, mt: 2, mb: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
                  {detay.aktarilanVeriler.map((v) => (
                    <li key={v} style={{ marginBottom: 4 }}>
                      {v}
                    </li>
                  ))}
                </Box>
              </Box>

              <Box sx={{ pt: 1.5, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Son başarılı senkron:
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  {kayit?.son_basarili ? `${uzunTarih(kayit.son_basarili)} ${saat(kayit.son_basarili)}` : '–'}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>

      <SectionCard title="Veri Güvenliği ve Salt-Okunur Erişim İlkeleri" flush>
        <Box sx={{ overflowX: 'auto' }}>
          <Table aria-label="Veri kaynakları güvenlik tablosu">
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 3 }}>İlke</TableCell>
                <TableCell>Açıklama</TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>
                  Gereksinim Kodu
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ pl: 3, fontWeight: 700 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Database size={16} />
                    <span>Salt-Okunur (Read-Only) Adaptör</span>
                  </Stack>
                </TableCell>
                <TableCell>
                  Korteks kaynak sistemlerdeki (OBS, Pusula, PSG) hiçbir veriyi değiştirmez; yalnızca okuma erişimiyle önbelleğe alır.
                </TableCell>
                <TableCell align="right" sx={{ pr: 3, fontWeight: 600 }}>FG-02 / FG-03</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: 3, fontWeight: 700 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <RefreshCw size={16} />
                    <span>Kesinti Dayanıklılığı</span>
                  </Stack>
                </TableCell>
                <TableCell>
                  Kaynak sistemlerden biri yanıt vermezse son başarılı senkron verisi ve saati gösterilmeye devam eder.
                </TableCell>
                <TableCell align="right" sx={{ pr: 3, fontWeight: 600 }}>FOG-09</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: 3, fontWeight: 700, borderBottom: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <ShieldCheck size={16} />
                    <span>KVKK ve Yapay Zekâ Anonimleştirmesi</span>
                  </Stack>
                </TableCell>
                <TableCell sx={{ borderBottom: 0 }}>
                  Asistan sorularında öğrencinin adı, soyadı ve öğrenci numarası dil modeline (LLM) gönderilmez.
                </TableCell>
                <TableCell align="right" sx={{ pr: 3, fontWeight: 600, borderBottom: 0 }}>FOG-07</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </SectionCard>
    </Box>
  );
}
