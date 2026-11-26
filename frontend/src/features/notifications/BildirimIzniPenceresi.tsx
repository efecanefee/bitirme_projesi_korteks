import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { KortiMascot } from '@/components/korti/KortiMascot';
import { useAyarlar } from '@/app/ayarlar';
import { useBildirimStore } from './bildirimStore';
import { izinIste, izinPenceresiGerekli } from './tarayiciBildirimi';

/**
 * İlk girişte (KVKK onayından sonra) tarayıcı bildirimi izni (26.11.2026 kararı). Tarayıcılar izin
 * penceresinin kullanıcı hareketiyle açılmasını istediği için izin "Bildirimleri aç" düğmesiyle istenir.
 */
export function BildirimIzniPenceresi() {
  const izinSoruldu = useBildirimStore((s) => s.izinSoruldu);
  const setIzinSoruldu = useBildirimStore((s) => s.setIzinSoruldu);
  const setTarayiciBildirimi = useAyarlar((s) => s.setTarayiciBildirimi);
  const esikler = useAyarlar((s) => s.esikler);
  const [bekliyor, setBekliyor] = useState(false);

  if (!izinPenceresiGerekli(izinSoruldu)) return null;

  const ac = async () => {
    setBekliyor(true);
    const sonuc = await izinIste();
    setTarayiciBildirimi(sonuc === 'granted');
    setIzinSoruldu(true);
  };

  return (
    <Dialog open onClose={() => setIzinSoruldu(true)} maxWidth="xs" fullWidth aria-labelledby="bildirim-izni-baslik" aria-describedby="bildirim-izni-metin">
      <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <KortiMascot state="found" size={120} decorative />
        </Box>
        <Typography id="bildirim-izni-baslik" variant="h2" sx={{ mt: 2, fontSize: '1.375rem' }}>
          Sınavlarını kaçırma
        </Typography>
        <Typography id="bildirim-izni-metin" color="text.secondary" sx={{ mt: 1 }}>
          Sınavları {esikler.sinavGun} gün, ödevleri {esikler.odevGun} gün önceden; kalan devam hakkın {esikler.devamHak} olunca haber vereyim mi? Bildirimler yalnızca Korteks açıkken gelir; ayarlardan istediğin zaman kapatabilirsin.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
        <Button onClick={() => setIzinSoruldu(true)} fullWidth color="inherit">
          Şimdi değil
        </Button>
        <Button onClick={ac} variant="contained" fullWidth loading={bekliyor}>
          Bildirimleri aç
        </Button>
      </DialogActions>
    </Dialog>
  );
}
