import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Box, Button, IconButton, Paper, Portal, Stack, Typography } from '@mui/material';
import { X } from 'lucide-react';
import { KortiMascot, type KortiState } from '@/components/korti/KortiMascot';
import { useBildirimStore } from '@/features/notifications/bildirimStore';
import { izinPenceresiGerekli } from '@/features/notifications/tarayiciBildirimi';
import { useCalismaStore } from '@/features/study/calismaStore';
import { useTurStore } from './turStore';

interface Adim {
  hedef: string | null;
  baslik: string;
  metin: string;
  korti: KortiState;
}

const ADIMLAR: Adim[] = [
  {
    hedef: '[data-tur="kaynaklar"]',
    baslik: 'Üç sistem, tek panel',
    metin: 'PSG, Pusula ve OBS bilgilerin burada. Her kartta verinin geldiği sistem ve son güncelleme saati yazar.',
    korti: 'found',
  },
  {
    hedef: '[data-tur="arama"]',
    baslik: 'Her şeyi buradan ara',
    metin: "Ders, sınav ya da duyuru yaz; sonuçlar anında gelir. Bir soru sorarsan Korti'ye yönlendiririm. Kısayol: Ctrl K.",
    korti: 'listen',
  },
  {
    hedef: '[data-tur="bildirimler"]',
    baslik: 'Hiçbir tarihi kaçırma',
    metin: 'Yaklaşan sınav, ödev ve devam uyarıları zilde toplanır. Eşikleri Ayarlar sayfasından değiştirebilirsin.',
    korti: 'idle',
  },
  {
    hedef: '[data-tur="korti"]',
    baslik: 'Bana soru sor',
    metin: 'Yönetmelik sorularını kaynağını göstererek, not ve devam sorularını kendi verinle hesaplayarak yanıtlarım. Kararlar her zaman sende.',
    korti: 'think',
  },
  {
    hedef: '[data-tur="hesap"]',
    baslik: 'Ayarlar ve gizlilik',
    metin: 'Tema, yazı boyutu, bildirimler ve KVKK tercihlerin hesap menüsünde. Bu turu Ayarlar > Korti bölümünden yeniden açabilirsin.',
    korti: 'dance',
  },
];

const KART_GENISLIK = 360;
const BOSLUK = 12;

interface Konum {
  hedef: DOMRect | null;
}

function gorunurHedef(secici: string | null): HTMLElement | null {
  if (!secici) return null;
  const el = Array.from(document.querySelectorAll<HTMLElement>(secici)).find((e) => e.getClientRects().length > 0 && e.offsetParent !== null);
  return el ?? null;
}

/**
 * İlk girişte Korti'nin gösterdiği 5 adımlık tanıtım turu (FOG-08). Hedef görünmüyorsa (örn. mobilde
 * gizli öğe) kart ekranın ortasında açılır. Esc ya da "Turu atla" ile kapanır; hareket azaltma açıksa
 * animasyonsuzdur (genel CSS kuralı).
 */
export function TanitimTuru() {
  const { pathname } = useLocation();
  const { acik, adim, tamamlandi, baslat, git, kapat } = useTurStore();
  const izinSoruldu = useBildirimStore((s) => s.izinSoruldu);
  const calisma = useCalismaStore((s) => s.aktif);
  const kartRef = useRef<HTMLDivElement>(null);
  const [konum, setKonum] = useState<Konum>({ hedef: null });

  // Panel ilk açıldığında, bildirim izni penceresinden sonra ve kullanıcı çalışması dışında kendiliğinden başlar
  useEffect(() => {
    if (!tamamlandi && !acik && !calisma && pathname === '/' && !izinPenceresiGerekli(izinSoruldu)) {
      const t = window.setTimeout(baslat, 800);
      return () => window.clearTimeout(t);
    }
  }, [tamamlandi, acik, calisma, pathname, izinSoruldu, baslat]);

  const olc = useCallback(() => {
    const el = gorunurHedef(ADIMLAR[adim]?.hedef ?? null);
    setKonum({ hedef: el ? el.getBoundingClientRect() : null });
  }, [adim]);

  useLayoutEffect(() => {
    if (!acik) return;
    const el = gorunurHedef(ADIMLAR[adim]?.hedef ?? null);
    el?.scrollIntoView({ block: 'center', behavior: 'auto' });
    const t = window.setTimeout(olc, 60);
    window.addEventListener('resize', olc);
    window.addEventListener('scroll', olc, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', olc);
      window.removeEventListener('scroll', olc, true);
    };
  }, [acik, adim, olc]);

  useEffect(() => {
    if (acik) kartRef.current?.focus();
  }, [acik, adim]);

  if (!acik) return null;
  const a = ADIMLAR[adim]!;
  const son = adim === ADIMLAR.length - 1;
  const r = konum.hedef;

  // Kart hedefin altına, sığmazsa üstüne yerleşir; yatayda ekranda kalır
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const genislik = Math.min(KART_GENISLIK, vw - 24);
  let kartStil: React.CSSProperties;
  if (r) {
    const sol = Math.min(Math.max(12, r.left + r.width / 2 - genislik / 2), vw - genislik - 12);
    const altta = r.bottom + BOSLUK + 260 < vh;
    kartStil = altta ? { top: r.bottom + BOSLUK, left: sol } : { bottom: vh - r.top + BOSLUK, left: sol };
  } else {
    kartStil = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }

  const tus = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') kapat();
    if (e.key === 'ArrowRight' && !son) git(adim + 1);
    if (e.key === 'ArrowLeft' && adim > 0) git(adim - 1);
  };

  return (
    <Portal>
      <Box sx={{ position: 'fixed', inset: 0, zIndex: 1500 }} onKeyDown={tus}>
        {/* Karartma: hedef varsa çevresi boş bırakılır */}
        {r ? (
          <Box
            aria-hidden
            sx={{
              position: 'fixed',
              top: r.top - 6,
              left: r.left - 6,
              width: r.width + 12,
              height: r.height + 12,
              borderRadius: 3,
              boxShadow: '0 0 0 9999px rgba(11, 27, 43, 0.62)',
              outline: '3px solid',
              outlineColor: 'primary.main',
              transition: 'all .25s ease',
              pointerEvents: 'none',
            }}
          />
        ) : (
          <Box aria-hidden sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(11, 27, 43, 0.62)' }} />
        )}
        <Paper
          ref={kartRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tur-baslik"
          aria-describedby="tur-metin"
          elevation={12}
          sx={{ position: 'fixed', width: genislik, borderRadius: 3, p: 2.5, outline: 'none', ...kartStil }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <Box sx={{ flexShrink: 0, mt: -0.5 }}>
              <KortiMascot state={a.korti} size={64} decorative />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Adım {adim + 1} / {ADIMLAR.length}
              </Typography>
              <Typography id="tur-baslik" variant="h2" sx={{ fontSize: '1.0625rem', mt: 0.25 }}>
                {a.baslik}
              </Typography>
            </Box>
            <IconButton aria-label="Turu kapat" size="small" onClick={kapat} sx={{ mt: -0.5, mr: -0.5 }}>
              <X size={18} />
            </IconButton>
          </Stack>
          <Typography id="tur-metin" variant="body2" sx={{ mt: 1.5 }}>
            {a.metin}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 0.75, flex: 1 }} aria-hidden>
              {ADIMLAR.map((_, i) => (
                <Box key={i} sx={{ width: i === adim ? 18 : 7, height: 7, borderRadius: 4, bgcolor: i === adim ? 'primary.main' : 'divider', transition: 'width .2s' }} />
              ))}
            </Box>
            <Button size="small" color="inherit" onClick={kapat}>
              Turu atla
            </Button>
            {adim > 0 && (
              <Button size="small" variant="outlined" onClick={() => git(adim - 1)}>
                Geri
              </Button>
            )}
            <Button size="small" variant="contained" onClick={() => (son ? kapat() : git(adim + 1))}>
              {son ? 'Bitir' : 'İleri'}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Portal>
  );
}
