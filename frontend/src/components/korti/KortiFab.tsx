import { useLocation, useNavigate } from 'react-router';
import { Box, ButtonBase, Tooltip } from '@mui/material';
import { KortiMascot } from './KortiMascot';
import { SORU_ODAKLA_OLAYI, useKortiStore } from './kortiStore';

/**
 * Sağ altta duran yuvarlak Korti düğmesi. Tüm öğrenci sayfalarında görünür;
 * yalnızca paneldeki Korti kartı açıkken panelde gizlenir (kart zaten oradadır).
 * Asistan sayfasında soru kutusuna odaklar, diğer sayfalarda asistana götürür.
 */
export function KortiFab() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const kartKapali = useKortiStore((s) => s.kartKapali);
  const setKartKapali = useKortiStore((s) => s.setKartKapali);

  const panel = pathname === '/';
  const asistan = pathname.startsWith('/asistan');
  if (panel && !kartKapali) return null;

  const tikla = () => {
    if (panel) setKartKapali(false);
    else if (asistan) window.dispatchEvent(new Event(SORU_ODAKLA_OLAYI));
    else navigate('/asistan');
  };
  const etiket = panel ? "Korti kartını aç" : asistan ? "Korti'ye soru yaz" : "Korti'ye sor";

  return (
    <Tooltip title={etiket} placement="left">
      <ButtonBase
        onClick={tikla}
        aria-label={etiket}
        sx={{
          position: 'fixed',
          right: { xs: 16, md: 28 },
          // asistan sayfasında soru kutusunun ve gönder düğmesinin üstünde durur
          bottom: asistan ? { xs: 112, md: 120 } : { xs: 16, md: 24 },
          zIndex: (t) => t.zIndex.speedDial,
          width: 68,
          height: 68,
          borderRadius: '50%',
          border: 3,
          borderColor: 'primary.main',
          bgcolor: 'menu.zemin',
          boxShadow: '0 10px 28px rgba(11, 27, 43, 0.28)',
          transition: 'transform .2s ease',
          '&:hover': { transform: 'translateY(-2px)' },
          '&:focus-visible': { outline: 3, outlineStyle: 'solid', outlineColor: 'secondary.main', outlineOffset: 3 },
        }}
      >
        <KortiMascot state="idle" size={50} mini decorative />
        <Box
          aria-hidden
          sx={{ position: 'absolute', top: 2, right: 2, width: 14, height: 14, borderRadius: '50%', bgcolor: 'success.main', border: 2, borderColor: 'menu.zemin' }}
        />
      </ButtonBase>
    </Tooltip>
  );
}
