import { useRef, useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Upload } from 'lucide-react';
import { useBelgeAktiflik, useBelgeler, useBelgeYukle } from '@/api/queries';
import { CardSkeleton, ErrorState } from '@/components/states';
import { BELGE_TURU } from '@/lib/labels';
import { ApiError } from '@/api/client';
import { uzunTarih } from '@/lib/format';
import type { Belge, BelgeTur } from '@/api/types';

const IZINLI = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAKS_MB = 20;

const DURUM: Record<Belge['indeks_durumu'], { etiket: string; renk: 'default' | 'success' | 'warning' | 'error' }> = {
  bekliyor: { etiket: 'Sırada', renk: 'default' },
  isleniyor: { etiket: 'İndeksleniyor', renk: 'warning' },
  hazir: { etiket: 'Hazır', renk: 'success' },
  hatali: { etiket: 'Hata', renk: 'error' },
};

function UploadDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const yukle = useBelgeYukle();
  const dosyaRef = useRef<HTMLInputElement>(null);
  const [dosya, setDosya] = useState<File | null>(null);
  const [baslik, setBaslik] = useState('');
  const [tur, setTur] = useState<BelgeTur>('yonetmelik');
  const [hata, setHata] = useState<string | null>(null);

  const kapat = () => {
    setDosya(null);
    setBaslik('');
    setHata(null);
    yukle.reset();
    onClose();
  };

  const sec = (f: File | undefined) => {
    setHata(null);
    if (!f) return;
    if (!IZINLI.includes(f.type)) return setHata('Yalnızca PDF, DOCX veya TXT dosyası yüklenebilir.');
    if (f.size > MAKS_MB * 1024 * 1024) return setHata(`Dosya en fazla ${MAKS_MB} MB olabilir.`);
    setDosya(f);
    if (!baslik) setBaslik(f.name.replace(/\.[^.]+$/, ''));
  };

  const gonder = (e: FormEvent) => {
    e.preventDefault();
    if (!dosya || !baslik.trim()) return setHata('Dosya ve başlık zorunlu.');
    yukle.mutate({ dosya, baslik: baslik.trim(), tur }, { onSuccess: kapat });
  };

  return (
    <Dialog open={open} onClose={kapat} fullWidth maxWidth="sm" slotProps={{ paper: { component: 'form', onSubmit: gonder } as object }}>
      <DialogTitle>Belge yükle</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Belge madde sınırlarına göre parçalara ayrılıp indekslenir. Aynı başlıkla yüklenen belge yeni sürüm olur; eski sürüm pasife alınır.
        </Typography>
        <Stack spacing={2}>
          <Box
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              sec(e.dataTransfer.files[0]);
            }}
            sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 3, textAlign: 'center' }}
          >
            <input ref={dosyaRef} type="file" hidden accept=".pdf,.docx,.txt" onChange={(e) => sec(e.target.files?.[0])} />
            <Typography sx={{ mb: 1 }}>{dosya ? dosya.name : 'Dosyayı buraya sürükle'}</Typography>
            <Button variant="outlined" onClick={() => dosyaRef.current?.click()}>
              Dosya seç
            </Button>
            <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>
              PDF, DOCX veya TXT · en fazla {MAKS_MB} MB
            </Typography>
          </Box>
          <TextField label="Başlık" value={baslik} onChange={(e) => setBaslik(e.target.value)} required fullWidth />
          <TextField select label="Belge türü" value={tur} onChange={(e) => setTur(e.target.value as BelgeTur)} fullWidth>
            {(Object.keys(BELGE_TURU) as BelgeTur[]).map((t) => (
              <MenuItem key={t} value={t}>
                {BELGE_TURU[t]}
              </MenuItem>
            ))}
          </TextField>
          {(hata || yukle.isError) && <Alert severity="error">{hata ?? (yukle.error instanceof ApiError ? yukle.error.message : 'Yükleme başarısız.')}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={kapat}>Vazgeç</Button>
        <Button type="submit" variant="contained" loading={yukle.isPending} disabled={!dosya}>
          Yükle
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function DocumentsPage() {
  const { data, isPending, isError, error, refetch } = useBelgeler();
  const aktiflik = useBelgeAktiflik();
  const [dialog, setDialog] = useState(false);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, mb: 4 }}>
        <Box>
          <Typography variant="h1">Belgeler</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Asistanın yanıt verirken dayandığı yönetmelik, takvim ve duyurular. Yalnızca aktif sürümler aramaya katılır.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Upload size={18} />} onClick={() => setDialog(true)} sx={{ flexShrink: 0 }}>
          Belge yükle
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {isError && (
          <Box sx={{ pt: 2.5 }}>
            <ErrorState error={error} onRetry={() => void refetch()} />
          </Box>
        )}
        {isPending ? (
          <Box sx={{ pt: 2.5 }}>
            <CardSkeleton rows={5} />
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table aria-label="Belgeler">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: 3 }}>Belge</TableCell>
                  <TableCell>Tür</TableCell>
                  <TableCell align="right">Sürüm</TableCell>
                  <TableCell align="right">Parça</TableCell>
                  <TableCell>Yükleme</TableCell>
                  <TableCell>İndeks</TableCell>
                  <TableCell sx={{ pr: 3 }}>Aktif</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.map((b) => (
                  <TableRow key={b.id} sx={{ opacity: b.aktif_mi ? 1 : 0.6 }}>
                    <TableCell sx={{ pl: 3, fontWeight: 600 }}>{b.baslik}</TableCell>
                    <TableCell>{BELGE_TURU[b.tur]}</TableCell>
                    <TableCell align="right">v{b.surum}</TableCell>
                    <TableCell align="right">{b.parca_sayisi}</TableCell>
                    <TableCell>{uzunTarih(b.yukleme_tarihi)}</TableCell>
                    <TableCell>
                      <Chip size="small" label={DURUM[b.indeks_durumu].etiket} color={DURUM[b.indeks_durumu].renk} variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ pr: 3 }}>
                      <Switch
                        checked={b.aktif_mi}
                        onChange={(_, v) => aktiflik.mutate({ id: b.id, aktif_mi: v })}
                        slotProps={{ input: { 'aria-label': `${b.baslik} v${b.surum} aktif` } }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>
      <UploadDialog open={dialog} onClose={() => setDialog(false)} />
    </Box>
  );
}
