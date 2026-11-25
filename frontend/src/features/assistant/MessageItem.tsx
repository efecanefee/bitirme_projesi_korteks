import { useState } from 'react';
import { Alert, Box, Button, Chip, Collapse, Stack, Typography } from '@mui/material';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import type { SohbetMesaji, YanitKaynagi } from '@/api/types';
import { KortiMascot } from '@/components/korti/KortiMascot';
import { kortiDurumu } from '@/components/korti/kortiStore';
import { SISTEM_ETIKETI, saat, uzunTarih } from '@/lib/format';
import { useGeriBildirim } from '@/api/queries';
import { RichText } from './RichText';

export function UserBubble({ text }: { text: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Box sx={{ maxWidth: '78%', bgcolor: 'secondary.main', color: 'secondary.contrastText', px: 2.5, py: 1.5, borderRadius: '18px 18px 4px 18px' }}>
        <Typography sx={{ fontSize: '1rem', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{text}</Typography>
      </Box>
    </Box>
  );
}

function kaynakEtiketi(k: YanitKaynagi): string | null {
  if (k.tip === 'belge') {
    if (k.belge_turu === 'duyuru') return `Duyuru, ${k.belge_basligi}`;
    return [k.belge_basligi.replace(' Eğitim-Öğretim', ''), k.madde].filter(Boolean).join(', ');
  }
  if (k.tip === 'kisisel_veri') return `${SISTEM_ETIKETI[k.kaynak_sistem]} · ${k.baslik.split(' · ')[1] ?? k.baslik}, ${saat(k.son_senkron)}`;
  return null;
}

export function AssistantBubble({ mesaj, onSelect, selected }: { mesaj: SohbetMesaji; onSelect: () => void; selected: boolean }) {
  const geriBildirim = useGeriBildirim();
  const [hesap, setHesap] = useState(false);
  const arac = mesaj.kaynaklar.find((k) => k.tip === 'arac');
  const belgeVar = mesaj.kaynaklar.some((k) => k.tip === 'belge');
  const etiketler = mesaj.kaynaklar.map(kaynakEtiketi).filter((e): e is string => !!e);
  const tekil = [...new Set(etiketler)];

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      <Box sx={{ mt: 0.25, display: { xs: 'none', sm: 'block' }, flexShrink: 0 }}>
        <KortiMascot state={kortiDurumu(mesaj)} size={52} mini decorative />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, maxWidth: 820 }}>
        <Box
          onClick={onSelect}
          sx={{
            border: 1,
            borderColor: selected ? 'primary.light' : 'divider',
            borderRadius: 3,
            bgcolor: 'background.paper',
            px: 3,
            py: 2.25,
            cursor: 'pointer',
          }}
        >
          <Typography className="sr-only">Korti yanıtı:</Typography>
          <RichText text={mesaj.cevap} />
          {mesaj.niyet === 'bulunamadi' && mesaj.onerilen_birim && (
            <Alert severity="info" variant="outlined" sx={{ mt: 2, bgcolor: 'yuzeyIkincil' }}>
              İlgili birim: {mesaj.onerilen_birim}
            </Alert>
          )}
          {tekil.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap', alignItems: 'center', rowGap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {belgeVar ? 'Kaynaklar' : 'Veri kaynağı'}
              </Typography>
              {tekil.map((e) => (
                <Chip key={e} label={e} variant="outlined" size="medium" sx={{ fontSize: '0.875rem' }} />
              ))}
            </Stack>
          )}
          <Collapse in={hesap} unmountOnExit>
            {arac?.tip === 'arac' && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'yuzeyIkincil', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {arac.arac}
                </Typography>
                <Typography sx={{ fontVariantNumeric: 'tabular-nums', mt: 0.5 }}>{arac.formul}</Typography>
              </Box>
            )}
          </Collapse>
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: 1.25, alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            aria-pressed={mesaj.geri_bildirim === 1}
            startIcon={mesaj.geri_bildirim === 1 ? <ThumbsUp size={14} /> : undefined}
            onClick={() => geriBildirim.mutate({ mesaj, deger: 1 })}
            sx={{ minHeight: 32, fontWeight: 500, color: mesaj.geri_bildirim === 1 ? 'success.main' : 'text.secondary', borderColor: mesaj.geri_bildirim === 1 ? 'success.main' : undefined }}
          >
            Yararlı
          </Button>
          <Button
            size="small"
            variant="outlined"
            aria-pressed={mesaj.geri_bildirim === -1}
            startIcon={mesaj.geri_bildirim === -1 ? <ThumbsDown size={14} /> : undefined}
            onClick={() => geriBildirim.mutate({ mesaj, deger: -1 })}
            sx={{ minHeight: 32, fontWeight: 500, color: mesaj.geri_bildirim === -1 ? 'error.main' : 'text.secondary', borderColor: mesaj.geri_bildirim === -1 ? 'error.main' : undefined }}
          >
            Yararlı değil
          </Button>
          {arac && (
            <Button size="small" variant="outlined" aria-expanded={hesap} onClick={() => setHesap((h) => !h)} sx={{ minHeight: 32, fontWeight: 500, color: 'text.secondary' }}>
              {hesap ? 'Hesabı gizle' : 'Hesabı göster'}
            </Button>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto !important' }} title={uzunTarih(mesaj.olusturma)}>
            {(mesaj.sure_ms / 1000).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} sn
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

export function TypingBubble() {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }} role="status">
      <Box sx={{ display: { xs: 'none', sm: 'block' }, flexShrink: 0 }}>
        <KortiMascot state="think" size={64} decorative />
      </Box>
      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper', px: 3, py: 2, display: 'flex', gap: 0.75, alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            aria-hidden
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: 'text.secondary',
              animation: 'korteksNokta 1.2s infinite ease-in-out',
              animationDelay: `${i * 0.15}s`,
              '@keyframes korteksNokta': { '0%, 80%, 100%': { opacity: 0.25 }, '40%': { opacity: 1 } },
            }}
          />
        ))}
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          Korti düşünüyor, kaynaklar taranıyor
        </Typography>
      </Box>
    </Box>
  );
}
