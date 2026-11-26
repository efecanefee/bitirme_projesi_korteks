import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ArrowUp, History, Plus, X } from 'lucide-react';
import { useMesajlar, useSohbetler, useSoruSor } from '@/api/queries';
import { ApiError } from '@/api/client';
import { AssistantBubble, TypingBubble, UserBubble } from './MessageItem';
import { SourcesPanel } from './SourcesPanel';
import { SohbetGecmisi } from './SohbetGecmisi';
import { useCevrimici } from '@/lib/useCevrimici';
import { KortiMascot } from '@/components/korti/KortiMascot';
import { SORU_ODAKLA_OLAYI } from '@/components/korti/kortiStore';

const GENEL_ONERILER = ['Bütünlemeye kimler girebilir?', 'Bu hafta neyim var?', 'Ders kaydı ne zaman?'];
const dersOnerileri = (kod: string) => [`${kod} finalden kaç almam gerekiyor?`, `${kod} devam durumum nasıl?`, `${kod} sınavım hangi salonda?`];

export function AssistantPage() {
  const theme = useTheme();
  const genis = useMediaQuery(theme.breakpoints.up('lg'));
  const [params, setParams] = useSearchParams();
  const [sohbetId, setSohbetId] = useState<number | null>(null);
  const [deger, setDeger] = useState('');
  const [seciliId, setSeciliId] = useState<number | null>(null);
  const [gecmisAcik, setGecmisAcik] = useState(false);
  const cevrimici = useCevrimici();
  const [dersBaglami, setDersBaglami] = useState<string | null>(params.get('ders'));
  const listeRef = useRef<HTMLDivElement>(null);
  const girdiRef = useRef<HTMLTextAreaElement>(null);

  const sohbetler = useSohbetler();
  const mesajlar = useMesajlar(sohbetId);
  const sor = useSoruSor();

  const liste = useMemo(() => mesajlar.data ?? [], [mesajlar.data]);
  const secili = liste.find((m) => m.id === seciliId) ?? liste[liste.length - 1];

  const gonder = (soru: string) => {
    const temiz = soru.trim();
    if (!temiz || sor.isPending || !navigator.onLine) return;
    setDeger('');
    sor.mutate(
      { soru: temiz, sohbet_id: sohbetId, ders_kodu: dersBaglami },
      {
        onSuccess: (m) => {
          setSohbetId(m.sohbet_id);
          setSeciliId(m.id);
        },
      },
    );
  };

  // Üst çubuktaki "Korteks'e sor" alanından gelen soru (?soru=…) bir kez gönderilir
  const islenen = useRef<string | null>(null);
  useEffect(() => {
    const q = params.get('soru');
    if (q && islenen.current !== q) {
      islenen.current = q;
      const yeni = new URLSearchParams(params);
      yeni.delete('soru');
      setParams(yeni, { replace: true });
      setSohbetId(null);
      gonder(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // Sağ alttaki Korti düğmesi bu sayfada soru kutusuna odaklar
  useEffect(() => {
    const odakla = () => girdiRef.current?.focus();
    window.addEventListener(SORU_ODAKLA_OLAYI, odakla);
    return () => window.removeEventListener(SORU_ODAKLA_OLAYI, odakla);
  }, []);

  useEffect(() => {
    listeRef.current?.scrollTo({ top: listeRef.current.scrollHeight, behavior: 'smooth' });
  }, [liste.length, sor.isPending]);

  const yeniSohbet = () => {
    setSohbetId(null);
    setSeciliId(null);
    sor.reset();
    girdiRef.current?.focus();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    gonder(deger);
  };
  const tus = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      gonder(deger);
    }
  };

  const oneriler = dersBaglami ? dersOnerileri(dersBaglami) : GENEL_ONERILER;
  const bekleyenSoru = sor.isPending ? sor.variables?.soru : undefined;
  const bos = liste.length === 0 && !bekleyenSoru;

  return (
    <Box
      sx={{
        maxWidth: 1600,
        mx: 'auto',
        display: 'grid',
        gridTemplateColumns: genis ? 'minmax(0, 1fr) 400px' : 'minmax(0, 1fr)',
        gap: 3,
        height: { lg: 'calc(100dvh - 76px - 64px)' },
      }}
    >
      <Paper variant="outlined" sx={{ borderRadius: 3, display: 'flex', flexDirection: 'column', minHeight: { xs: 'calc(100dvh - 64px - 48px)', lg: 0 }, overflow: 'hidden' }}>
        <Stack direction="row" spacing={1} sx={{ px: 3, py: 1.5, borderBottom: 1, borderColor: 'divider', alignItems: 'center' }}>
          <Typography variant="h1" component="h1" sx={{ fontSize: '1.125rem', flex: 1 }}>
            Asistan
          </Typography>
          <Tooltip title="Geçmiş sohbetler">
            <span>
              <IconButton aria-label="Geçmiş sohbetler" aria-haspopup="dialog" onClick={() => setGecmisAcik(true)} disabled={!sohbetler.data?.length}>
                <History size={20} />
              </IconButton>
            </span>
          </Tooltip>
          <Button size="small" startIcon={<Plus size={16} />} onClick={yeniSohbet}>
            Yeni sohbet
          </Button>
        </Stack>

        <SohbetGecmisi
          acik={gecmisAcik}
          onKapat={() => setGecmisAcik(false)}
          sohbetler={sohbetler.data ?? []}
          seciliId={sohbetId}
          onSec={(id) => {
            setSohbetId(id);
            setSeciliId(null);
            setGecmisAcik(false);
          }}
        />

        <Box ref={listeRef} sx={{ flex: 1, overflowY: 'auto', px: { xs: 2, sm: 4 }, py: 3 }} role="log" aria-live="polite" aria-label="Sohbet">
          {bos ? (
            <Box sx={{ maxWidth: 560, mx: 'auto', textAlign: 'center', pt: { xs: 2, md: 6 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <KortiMascot state={deger.trim() ? 'listen' : 'idle'} size={180} decorative />
              <Typography variant="h2" sx={{ mt: 2 }}>
                Merhaba, ben Korti
              </Typography>
              <Typography sx={{ fontWeight: 600, mt: 0.5 }}>Ne öğrenmek istersin?</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Yönetmelik ve akademik takvim sorularını kaynak göstererek; not, devam ve sınav sorularını kendi OBS, Pusula ve PSG verinle hesaplayarak yanıtlarım.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={3}>
              {liste.map((m) => (
                <Stack key={m.id} spacing={3}>
                  <UserBubble text={m.soru} />
                  <AssistantBubble mesaj={m} selected={genis && secili?.id === m.id && liste.length > 1} onSelect={() => setSeciliId(m.id)} />
                </Stack>
              ))}
              {bekleyenSoru && (
                <>
                  <UserBubble text={bekleyenSoru} />
                  <TypingBubble />
                </>
              )}
              {sor.isError && (
                <Alert
                  severity="error"
                  action={
                    <Button color="inherit" size="small" onClick={() => sor.variables && gonder(sor.variables.soru)}>
                      Tekrar dene
                    </Button>
                  }
                >
                  {sor.error instanceof ApiError ? sor.error.message : 'Yanıt alınamadı. Bağlantını kontrol edip tekrar dene.'}
                </Alert>
              )}
            </Stack>
          )}
        </Box>

        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 1.5 }}>
          {dersBaglami && (
            <Chip
              label={`Bağlam: ${dersBaglami}`}
              onDelete={() => {
                setDersBaglami(null);
                const yeni = new URLSearchParams(params);
                yeni.delete('ders');
                setParams(yeni, { replace: true });
              }}
              deleteIcon={<X size={14} aria-label="Bağlamı kaldır" />}
              color="primary"
              variant="outlined"
              sx={{ mb: 1.5 }}
            />
          )}
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1.5 }} aria-label="Önerilen sorular">
            {oneriler.map((o) => (
              <Chip key={o} label={o} variant="outlined" onClick={() => gonder(o)} disabled={sor.isPending || !cevrimici} sx={{ borderRadius: 999, fontSize: '0.9375rem', height: 38, px: 0.5 }} />
            ))}
          </Stack>
        </Box>
        {!cevrimici && (
          <Alert severity="info" variant="outlined" sx={{ mx: { xs: 2, sm: 3 }, mb: 1 }}>
            Çevrimdışısın. Korti yanıt verebilmek için sunucuya bağlanmalı; geçmiş sohbetlerini yine de okuyabilirsin.
          </Alert>
        )}
        <Box component="form" onSubmit={submit} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end', px: { xs: 2, sm: 3 }, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <TextField
            inputRef={girdiRef}
            value={deger}
            onChange={(e) => setDeger(e.target.value)}
            onKeyDown={tus}
            placeholder='Sorunu yaz, örneğin "Algoritma sınavım hangi salonda?"'
            multiline
            maxRows={5}
            fullWidth
            autoFocus
            slotProps={{ htmlInput: { 'aria-label': 'Sorunu yaz', maxLength: 1000 } }}
          />
          <Button type="submit" variant="contained" startIcon={<ArrowUp size={18} />} disabled={!deger.trim() || sor.isPending || !cevrimici} sx={{ minHeight: 56, px: 3, flexShrink: 0 }}>
            Gönder
          </Button>
        </Box>
      </Paper>

      {genis ? (
        <SourcesPanel mesaj={secili} />
      ) : (
        secili && <SourcesPanel mesaj={secili} />
      )}
    </Box>
  );
}
