import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Box, ButtonBase, IconButton, InputBase, Stack, Tooltip, Typography } from '@mui/material';
import { ArrowRight, ArrowUp, Minimize2 } from 'lucide-react';
import { KortiMascot } from '@/components/korti/KortiMascot';
import { useKortiStore } from '@/components/korti/kortiStore';
import { kalanGun } from '@/lib/format';
import type { PanelOzeti } from '@/api/types';
import { marka } from '@/app/theme';

const DEVAM_SORUSU = 'Kaç devamsızlık hakkım kaldı?';
const GENEL_ONERILER = [DEVAM_SORUSU, 'Bu hafta hangi sınavlarım var?', 'Mazeret sınavına kimler girebilir?'];

/** En yakın sınava göre Korti'nin kendiliğinden yaptığı öneri ve hazır sorular. */
function oneriHazirla(yaklasan: PanelOzeti['yaklasan'] | undefined) {
  const sinav = yaklasan
    ?.filter((e) => e.tur === 'sinav' && kalanGun(e.tarih) !== 'Geçti')
    .sort((a, b) => a.tarih.localeCompare(b.tarih))[0];
  if (!sinav?.ders_kodu) return { balon: 'Notların, devamsızlığın ve yönetmelik hakkında sorabilirsin.', sorular: GENEL_ONERILER };
  const kalan = kalanGun(sinav.tarih);
  const ne = kalan === 'Bugün' || kalan === 'Yarın' ? `${kalan.toLowerCase()}` : `${kalan} sonra`;
  return {
    balon: `${sinav.baslik} ${ne}. Salonunu ya da finalde kaç alman gerektiğini söyleyeyim mi?`,
    sorular: [`${sinav.ders_kodu} sınavım hangi salonda?`, `${sinav.ders_kodu} finalden kaç almam gerekiyor?`, DEVAM_SORUSU],
  };
}

/** Paneldeki Korti kartı. Küçültülünce sağ alttaki Korti düğmesine dönüşür. */
export function KortiCard({ yaklasan }: { yaklasan?: PanelOzeti['yaklasan'] }) {
  const navigate = useNavigate();
  const setKartKapali = useKortiStore((s) => s.setKartKapali);
  const [deger, setDeger] = useState('');
  const { balon, sorular } = oneriHazirla(yaklasan);

  const sor = (soru: string) => navigate(`/asistan?soru=${encodeURIComponent(soru)}`);
  const gonder = (e: FormEvent) => {
    e.preventDefault();
    if (deger.trim()) sor(deger.trim());
  };

  return (
    <Box
      component="section"
      aria-labelledby="korti-kart-baslik"
      sx={{
        bgcolor: (t) => (t.palette.mode === 'dark' ? '#12324A' : t.palette.menu.zemin),
        border: 1,
        borderColor: (t) => (t.palette.mode === 'dark' ? '#2A5674' : t.palette.menu.zemin),
        color: '#FFFFFF',
        borderRadius: 3,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'menu.metin' }}>
          <Box component="span" aria-hidden sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
          Korti çevrim içi
        </Typography>
        <Tooltip title="Küçült">
          <IconButton
            onClick={() => setKartKapali(true)}
            aria-label="Korti kartını küçült"
            sx={{ width: 40, height: 40, border: 1, borderColor: 'rgba(200, 243, 255, 0.3)', color: 'menu.metin', '&:hover': { bgcolor: 'rgba(200, 243, 255, 0.1)' } }}
          >
            <Minimize2 size={18} aria-hidden />
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-end' }}>
        <Box sx={{ flexShrink: 0 }}>
          <KortiMascot state="idle" size={112} decorative />
        </Box>
        <Box sx={{ mb: 3.5, px: 2, py: 1.5, borderRadius: '16px 16px 16px 4px', bgcolor: marka.buz, color: marka.lacivert }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {balon}
          </Typography>
        </Box>
      </Stack>

      <Box>
        <Typography id="korti-kart-baslik" variant="h2" component="h2" sx={{ fontSize: '1.375rem' }}>
          Korti&apos;ye sor
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, color: 'menu.metin' }}>
          Notların, devamsızlığın ve yönetmelik hakkındaki sorularını kaynağını göstererek yanıtlar.
        </Typography>
      </Box>

      <Stack spacing={1} aria-label="Önerilen sorular">
        {sorular.map((s) => (
          <ButtonBase
            key={s}
            onClick={() => sor(s)}
            sx={{
              justifyContent: 'space-between',
              gap: 1,
              textAlign: 'left',
              px: 1.75,
              py: 1.25,
              borderRadius: 2.5,
              border: 1,
              borderColor: 'rgba(200, 243, 255, 0.22)',
              bgcolor: 'rgba(200, 243, 255, 0.06)',
              color: '#FFFFFF',
              font: 'inherit',
              fontSize: '0.9375rem',
              '&:hover': { bgcolor: 'rgba(200, 243, 255, 0.12)' },
              '&:focus-visible': { outline: 2, outlineStyle: 'solid', outlineColor: 'menu.metin' },
            }}
          >
            {s}
            <Box component={ArrowRight} size={16} aria-hidden sx={{ color: 'menu.metin', flexShrink: 0 }} />
          </ButtonBase>
        ))}
      </Stack>

      <Box component="form" onSubmit={gonder} sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2, pr: 0.75, height: 52, borderRadius: 3.5, bgcolor: '#FFFFFF' }}>
        <InputBase
          value={deger}
          onChange={(e) => setDeger(e.target.value)}
          placeholder="Bir soru yaz…"
          inputProps={{ 'aria-label': "Korti'ye soru yaz", maxLength: 1000 }}
          sx={{ flex: 1, color: marka.lacivert, fontSize: '0.9375rem' }}
        />
        <IconButton type="submit" aria-label="Gönder" disabled={!deger.trim()} sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.light' }, '&.Mui-disabled': { bgcolor: 'primary.main', color: 'primary.contrastText', opacity: 0.55 } }}>
          <ArrowUp size={18} aria-hidden />
        </IconButton>
      </Box>
      <Typography variant="caption" sx={{ color: 'menu.metinIkincil' }}>
        Yanıtlar yapay zekâ tarafından üretilir · resmî bilgi kaynak sistemdedir
      </Typography>
    </Box>
  );
}
