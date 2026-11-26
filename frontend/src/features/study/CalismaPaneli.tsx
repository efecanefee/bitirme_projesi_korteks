import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { Download, Flag, Play, Timer, X } from 'lucide-react';
import { calismaCsv, susPuani, useCalismaStore, type Gorev } from './calismaStore';

interface GorevDosyasi {
  gorevler: Gorev[];
}
interface SusDosyasi {
  kaynak: string;
  onaylandi: boolean;
  maddeler: string[];
}

const OLCEK = ['Kesinlikle katılmıyorum', 'Katılmıyorum', 'Kararsızım', 'Katılıyorum', 'Kesinlikle katılıyorum'];

const getJson = async <T,>(yol: string): Promise<T> => {
  const r = await fetch(yol, { cache: 'no-store' });
  if (!r.ok) throw new Error(`${yol} okunamadı`);
  return (await r.json()) as T;
};

function sureMetni(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function Sayac({ baslangic }: { baslangic: number }) {
  const [simdi, setSimdi] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setSimdi(Date.now()), 500);
    return () => window.clearInterval(t);
  }, []);
  return (
    <Typography component="span" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }} aria-hidden>
      {sureMetni(simdi - baslangic)}
    </Typography>
  );
}

/** SUS anketi: 10 madde, 5'li ölçek. Madde metinleri public/sus-maddeleri.json dosyasından okunur. */
function SusAnketi({ acik, sus, onGonder }: { acik: boolean; sus: SusDosyasi | undefined; onGonder: (y: number[]) => void }) {
  const [yanitlar, setYanitlar] = useState<(number | null)[]>(() => Array(10).fill(null));
  const tamam = yanitlar.every((y) => y !== null);
  return (
    <Dialog open={acik} fullWidth maxWidth="md" aria-labelledby="sus-baslik" scroll="paper">
      <DialogTitle id="sus-baslik">Kullanılabilirlik anketi (SUS)</DialogTitle>
      <DialogContent dividers>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Korteks&apos;i kullanma deneyimine göre her ifadeye ne kadar katıldığını seç. Yanıtların adınla ilişkilendirilmez.
        </Typography>
        {sus && !sus.onaylandi && (
          <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
            Madde metinleri henüz eklenmedi. SUS-TR makalesindeki maddeler public/sus-maddeleri.json dosyasına yazılıp onaylanmalı.
          </Alert>
        )}
        <Stack spacing={2.5}>
          {(sus?.maddeler ?? Array.from({ length: 10 }, (_, i) => `Madde ${i + 1}`)).map((m, i) => (
            <FormControl key={i} component="fieldset">
              <FormLabel component="legend" sx={{ color: 'text.primary', fontWeight: 600, mb: 0.5 }}>
                {i + 1}. {m}
              </FormLabel>
              <RadioGroup
                row
                value={yanitlar[i] ?? ''}
                onChange={(_, v) => setYanitlar((y) => y.map((x, j) => (j === i ? Number(v) : x)))}
                sx={{ gap: { sm: 1 } }}
              >
                {OLCEK.map((etiket, d) => (
                  <FormControlLabel key={d} value={d + 1} control={<Radio size="small" />} label={<Typography variant="body2">{etiket}</Typography>} sx={{ mr: 1 }} />
                ))}
              </RadioGroup>
            </FormControl>
          ))}
        </Stack>
        {sus && (
          <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 2 }}>
            Kaynak: {sus.kaynak}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {yanitlar.filter((y) => y !== null).length} / 10 yanıtlandı
        </Typography>
        <Button variant="contained" disabled={!tamam} onClick={() => onGonder(yanitlar as number[])}>
          Gönder
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * Kullanıcı çalışması paneli (İP-8, FOG-08, H5). Adrese ?calisma=1 eklenince açılır.
 * Görev süresi ve tıklama sayısı ölçülür, sonunda SUS anketi uygulanır; sonuçlar yalnızca
 * katılımcı kodlu CSV olarak indirilir.
 */
export function CalismaPaneli() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const s = useCalismaStore();
  const panelRef = useRef<HTMLDivElement>(null);

  // ?calisma=1 açar, ?calisma=0 kapatır; parametre adresten temizlenir
  useEffect(() => {
    const q = new URLSearchParams(search);
    const v = q.get('calisma');
    if (v === null) return;
    if (v === '1' && !useCalismaStore.getState().aktif) useCalismaStore.getState().baslat();
    if (v === '0') useCalismaStore.getState().bitirCalisma();
    q.delete('calisma');
    navigate({ search: q.toString() }, { replace: true });
  }, [search, navigate]);

  const gorevler = useQuery({ queryKey: ['calisma', 'gorevler'], queryFn: () => getJson<GorevDosyasi>('/calisma-gorevleri.json'), enabled: s.aktif, staleTime: Infinity });
  const sus = useQuery({ queryKey: ['calisma', 'sus'], queryFn: () => getJson<SusDosyasi>('/sus-maddeleri.json'), enabled: s.aktif, staleTime: Infinity });

  // Görev sırasında panel dışındaki tıklamalar sayılır
  useEffect(() => {
    if (s.asama !== 'gorev') return;
    const say = (e: MouseEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      useCalismaStore.getState().tikla();
    };
    document.addEventListener('click', say, true);
    return () => document.removeEventListener('click', say, true);
  }, [s.asama]);

  if (!s.aktif) return null;
  const liste = gorevler.data?.gorevler ?? [];
  const gorev = liste[s.gorevIndex];

  const indir = () => {
    const blob = new Blob([calismaCsv(s.katilimci, s.kayitlar, s.susYanitlari)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `korteks_calisma_${s.katilimci}.csv`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <>
      <Paper
        ref={panelRef}
        elevation={10}
        role="region"
        aria-label="Kullanıcı çalışması"
        sx={{ position: 'fixed', left: { xs: 12, md: 304 }, bottom: 16, zIndex: 1400, width: 'min(380px, calc(100vw - 24px))', borderRadius: 3, p: 2, borderTop: 4, borderColor: 'primary.main' }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" sx={{ flex: 1, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Kullanıcı çalışması · {s.katilimci}
          </Typography>
          <Button size="small" color="inherit" startIcon={<X size={14} />} onClick={s.bitirCalisma}>
            Çık
          </Button>
        </Stack>

        {s.asama === 'giris' && (
          <>
            {gorevler.isSuccess && liste.length === 0 ? (
              <Alert severity="info" variant="outlined" sx={{ mb: 1.5 }}>
                Görev listesi henüz yüklenmedi. Görevler Ahmet&apos;in test setinden public/calisma-gorevleri.json dosyasına eklenecek.
              </Alert>
            ) : (
              <Typography variant="body2" sx={{ mb: 1.5 }}>
                {liste.length} görev var. Her görevde istenen bilgiyi bul ve &quot;Buldum&quot;a bas. Süre ve tıklama sayısı ölçülür; adın kaydedilmez.
              </Typography>
            )}
            <Stack direction="row" spacing={1}>
              <Button variant="contained" startIcon={<Play size={16} />} disabled={liste.length === 0} onClick={s.gorevBaslat}>
                Başla
              </Button>
              <Button variant="outlined" onClick={s.susaGec}>
                Yalnızca SUS anketi
              </Button>
            </Stack>
          </>
        )}

        {s.asama === 'gorev' && gorev && s.baslangic && (
          <>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Görev {s.gorevIndex + 1} / {liste.length}
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Timer size={16} aria-hidden />
                <Sayac baslangic={s.baslangic} />
              </Stack>
            </Stack>
            <Typography sx={{ fontWeight: 600, my: 1.25 }} aria-live="polite">
              {gorev.metin}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" startIcon={<Flag size={16} />} onClick={() => s.gorevBitir(gorev, 'buldu', liste.length)}>
                Buldum
              </Button>
              <Button variant="outlined" onClick={() => s.gorevBitir(gorev, 'yapamadi', liste.length)}>
                Yapamadım
              </Button>
            </Stack>
          </>
        )}

        {s.asama === 'sonuc' && (
          <>
            <Typography variant="body2">
              Teşekkürler! {s.kayitlar.length} görev tamamlandı
              {s.susYanitlari ? `, SUS puanı ${susPuani(s.susYanitlari).toLocaleString('tr-TR')}` : ''}.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Button variant="contained" startIcon={<Download size={16} />} onClick={indir}>
                CSV indir
              </Button>
              <Button variant="outlined" onClick={s.bitirCalisma}>
                Bitir
              </Button>
            </Stack>
          </>
        )}
      </Paper>
      <SusAnketi key={s.katilimci} acik={s.asama === 'sus'} sus={sus.data} onGonder={s.susKaydet} />
    </>
  );
}
