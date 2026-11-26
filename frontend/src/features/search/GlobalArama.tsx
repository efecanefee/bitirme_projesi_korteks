import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Box, ClickAwayListener, InputBase, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { BookOpen, ClipboardCheck, CornerDownLeft, FileText, LayoutGrid, Megaphone, Search, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import dayjs from '@/lib/dayjs';
import { endpoints } from '@/api/endpoints';
import { qk } from '@/api/queries';
import { SourceTag } from '@/components/SourceTag';
import { KortiMascot } from '@/components/korti/KortiMascot';
import { ara, dizinOlustur, GRUP_ETIKETI, soruMu, type AramaSonucu, type SonucTur } from './arama';

const SIMGE: Record<SonucTur, LucideIcon> = { sayfa: LayoutGrid, ders: BookOpen, etkinlik: ClipboardCheck, duyuru: Megaphone, not: FileText };
const GRUP_SIRASI: SonucTur[] = ['ders', 'etkinlik', 'duyuru', 'not', 'sayfa'];

type Secenek = { tip: 'sonuc'; sonuc: AramaSonucu } | { tip: 'korti' };

/** Arama verisi yalnızca kutu açılınca istenir; panelle aynı önbelleği paylaşır. */
function useAramaVerisi(etkin: boolean) {
  const gun = dayjs().format('YYYY-MM-DD');
  const bas = useMemo(() => dayjs(gun).subtract(30, 'day').toISOString(), [gun]);
  const bit = useMemo(() => dayjs(gun).add(150, 'day').toISOString(), [gun]);
  const dersler = useQuery({ queryKey: qk.dersler, queryFn: endpoints.dersler.liste, enabled: etkin });
  const duyurular = useQuery({ queryKey: qk.duyurular, queryFn: endpoints.duyurular.liste, enabled: etkin });
  const notlar = useQuery({ queryKey: qk.notlar, queryFn: endpoints.notlar, enabled: etkin });
  const etkinlikler = useQuery({ queryKey: qk.etkinlikler(bas, bit), queryFn: () => endpoints.etkinlikler({ baslangic: bas, bitis: bit }), enabled: etkin });
  return useMemo(
    () => dizinOlustur({ dersler: dersler.data, duyurular: duyurular.data, notlar: notlar.data, etkinlikler: etkinlikler.data }),
    [dersler.data, duyurular.data, notlar.data, etkinlikler.data],
  );
}

function Onizleme({ secenek, sorgu }: { secenek: Secenek | undefined; sorgu: string }) {
  if (!secenek) return null;
  if (secenek.tip === 'korti') {
    return (
      <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2 }}>
        <KortiMascot state="listen" size={96} decorative />
        <Typography sx={{ fontWeight: 600, mt: 1 }}>Korti&apos;ye sor</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>
          “{sorgu.trim()}”
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5 }}>
          Yönetmelik ve akademik takvim sorularını kaynak göstererek, not ve devam sorularını kendi verinle yanıtlar.
        </Typography>
      </Box>
    );
  }
  const s = secenek.sonuc;
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {GRUP_ETIKETI[s.tur]}
      </Typography>
      <Typography sx={{ fontWeight: 600, mt: 0.5, fontSize: '1.0625rem' }}>{s.baslik}</Typography>
      <Box component="dl" sx={{ m: 0, mt: 1.5, display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 1.5, rowGap: 0.75 }}>
        {s.ayrinti.map((a, i) => (
          <Box key={i} sx={{ display: 'contents' }}>
            <Typography component="dt" variant="body2" color="text.secondary">
              {a.etiket}
            </Typography>
            <Typography component="dd" variant="body2" sx={{ m: 0 }}>
              {a.deger}
            </Typography>
          </Box>
        ))}
      </Box>
      {s.kaynak_sistem && (
        <Box sx={{ mt: 1.5 }}>
          <SourceTag sistem={s.kaynak_sistem} sonSenkron={s.son_senkron} />
        </Box>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
        <CornerDownLeft size={12} aria-hidden /> Enter ile aç
      </Typography>
    </Box>
  );
}

/**
 * Birleşik arama (26.11.2026 kararı): yazarken cihazdaki veride anında arar; altta her zaman
 * "Korti'ye sor" satırı durur, sorgu soruya benziyorsa en üste çıkar. LLM yalnızca kullanıcı
 * bu satırı seçerse çağrılır. Ctrl+K / ⌘K ile açılır.
 */
export function GlobalArama() {
  const navigate = useNavigate();
  const theme = useTheme();
  const genis = useMediaQuery(theme.breakpoints.up('md'));
  const inputRef = useRef<HTMLInputElement>(null);
  const listeId = useId();
  const [sorgu, setSorgu] = useState('');
  const [acik, setAcik] = useState(false);
  const [aktif, setAktif] = useState(0);
  const [etkin, setEtkin] = useState(false);
  const dizin = useAramaVerisi(etkin);

  useEffect(() => {
    const kisayol = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', kisayol);
    return () => window.removeEventListener('keydown', kisayol);
  }, []);

  const { secenekler, gruplar } = useMemo(() => {
    const bulunan = ara(dizin, sorgu);
    const sirali = GRUP_SIRASI.flatMap((t) => bulunan.filter((s) => s.tur === t));
    const sonuclar: Secenek[] = sirali.map((s) => ({ tip: 'sonuc', sonuc: s }));
    const korti: Secenek[] = sorgu.trim() ? [{ tip: 'korti' }] : [];
    const ustte = soruMu(sorgu) || sirali.length === 0;
    return {
      secenekler: ustte ? [...korti, ...sonuclar] : [...sonuclar, ...korti],
      gruplar: GRUP_SIRASI.filter((t) => sirali.some((s) => s.tur === t)),
    };
  }, [dizin, sorgu]);

  const kapat = () => setAcik(false);
  const sec = (s: Secenek | undefined) => {
    if (!s) return;
    const q = sorgu.trim();
    setSorgu('');
    kapat();
    (document.activeElement as HTMLElement | null)?.blur();
    if (s.tip === 'korti') navigate(`/asistan?soru=${encodeURIComponent(q)}`);
    else navigate(s.sonuc.hedef);
  };

  const tus = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAcik(true);
      setAktif((a) => Math.min(a + 1, secenekler.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAktif((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      sec(secenekler[aktif]);
    } else if (e.key === 'Escape') {
      kapat();
      inputRef.current?.blur();
    }
  };

  const gorunur = acik && sorgu.trim().length > 0;
  const secId = (i: number) => `${listeId}-s${i}`;
  const kortiIndex = secenekler.findIndex((s) => s.tip === 'korti');

  const satir = (s: Secenek, i: number) => {
    const secili = i === aktif;
    const ortak = {
      id: secId(i),
      role: 'option',
      'aria-selected': secili,
      onMouseEnter: () => setAktif(i),
      onMouseDown: (e: React.MouseEvent) => e.preventDefault(),
      onClick: () => sec(s),
      sx: { display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1, mx: 1, borderRadius: 2, cursor: 'pointer', bgcolor: secili ? 'secili' : 'transparent' },
    } as const;
    if (s.tip === 'korti') {
      return (
        <Box key="korti" {...ortak}>
          <Box aria-hidden sx={{ width: 32, height: 32, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: 'primary.contrastText', flexShrink: 0 }}>
            <Sparkles size={16} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600 }} noWrap>
              Korti&apos;ye sor: “{sorgu.trim()}”
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Yapay zekâ asistanı · kaynak göstererek yanıtlar
            </Typography>
          </Box>
        </Box>
      );
    }
    const Simge = SIMGE[s.sonuc.tur];
    return (
      <Box key={s.sonuc.id} {...ortak}>
        <Box aria-hidden sx={{ width: 32, height: 32, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'yuzeyIkincil', color: 'text.secondary', flexShrink: 0 }}>
          <Simge size={16} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: 500 }}>
            {s.sonuc.baslik}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            {s.sonuc.alt}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <ClickAwayListener onClickAway={kapat}>
      <Box role="search" sx={{ flex: 1, maxWidth: 880, position: 'relative' }} data-tur="arama">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            height: 44,
            borderRadius: 999,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'yuzeyIkincil',
            transition: 'border-color .15s, background-color .15s',
            '&:focus-within': { borderColor: 'primary.main', bgcolor: 'background.paper' },
          }}
        >
          <Box component={Search} size={18} aria-hidden sx={{ color: 'text.secondary', flexShrink: 0 }} />
          <InputBase
            inputRef={inputRef}
            value={sorgu}
            onChange={(e) => {
              setSorgu(e.target.value);
              setAktif(0);
              setAcik(true);
            }}
            onFocus={() => {
              setEtkin(true);
              setAcik(true);
            }}
            onKeyDown={tus}
            placeholder="Ders, sınav, duyuru ara ya da Korti'ye sor"
            inputProps={{
              role: 'combobox',
              'aria-label': "Ara veya Korti'ye sor",
              'aria-expanded': gorunur,
              'aria-controls': listeId,
              'aria-autocomplete': 'list',
              'aria-activedescendant': gorunur && secenekler[aktif] ? secId(aktif) : undefined,
              maxLength: 1000,
            }}
            sx={{ flex: 1, fontSize: '0.9375rem' }}
          />
          <Box
            component="kbd"
            sx={{ display: { xs: 'none', md: 'block' }, fontFamily: 'inherit', fontSize: 12, color: 'text.secondary', border: 1, borderColor: 'divider', borderRadius: 1, px: 0.75, py: 0.25, bgcolor: 'background.paper' }}
          >
            Ctrl K
          </Box>
        </Box>
        {gorunur && (
          <Paper elevation={8} sx={{ position: { xs: 'fixed', sm: 'absolute' }, top: { xs: 64, sm: '100%' }, left: { xs: 8, sm: 0 }, right: { xs: 8, sm: 0 }, minWidth: { sm: 360 }, zIndex: 1300, mt: 1, borderRadius: 3, overflow: 'hidden', display: 'grid', gridTemplateColumns: genis ? 'minmax(0, 1fr) 280px' : '1fr', maxHeight: '70vh' }}>
            <Box id={listeId} role="listbox" aria-label="Arama sonuçları" sx={{ overflowY: 'auto', py: 1 }}>
              {kortiIndex === 0 && satir(secenekler[0]!, 0)}
              {gruplar.map((g) => (
                <Box key={g} role="group" aria-label={GRUP_ETIKETI[g]}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2.5, pt: 1.25, pb: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }} aria-hidden>
                    {GRUP_ETIKETI[g]}
                  </Typography>
                  {secenekler.map((s, i) => (s.tip === 'sonuc' && s.sonuc.tur === g ? satir(s, i) : null))}
                </Box>
              ))}
              {kortiIndex > 0 && (
                <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1, pt: 1 }}>{satir(secenekler[kortiIndex]!, kortiIndex)}</Box>
              )}
            </Box>
            {genis && (
              <Box sx={{ borderLeft: 1, borderColor: 'divider', p: 2.5, bgcolor: 'yuzeyIkincil', overflowY: 'auto' }} aria-live="polite">
                <Onizleme secenek={secenekler[aktif]} sorgu={sorgu} />
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
}
