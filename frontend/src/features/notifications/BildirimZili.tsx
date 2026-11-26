import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge, Box, Button, Chip, Dialog, DialogContent, DialogTitle, IconButton, Popover, Stack, Tooltip, Typography } from '@mui/material';
import { Bell, BellRing, CheckCheck, X } from 'lucide-react';
import { useBildirimler } from './useBildirimler';
import { useBildirimStore } from './bildirimStore';
import { BildirimSatiri } from './BildirimOgesi';
import { TUR_ETIKETI } from './bildirimEtiketleri';
import type { Bildirim, BildirimTur } from './bildirimUret';
import { izinDurumu, izinIste, tarayiciDestekliyor } from './tarayiciBildirimi';
import { useAyarlar } from '@/app/ayarlar';
import { EmptyState } from '@/components/states';

const MENUDE_EN_FAZLA = 6;

function TarayiciBildirimiSatiri() {
  const acik = useAyarlar((s) => s.tarayiciBildirimi);
  const setAcik = useAyarlar((s) => s.setTarayiciBildirimi);
  const [durum, setDurum] = useState(izinDurumu);
  if (!tarayiciDestekliyor() || (acik && durum === 'granted')) return null;
  if (durum === 'denied') {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, py: 1.25, borderTop: 1, borderColor: 'divider' }}>
        Tarayıcı bildirimleri engellenmiş. Açmak için tarayıcının site ayarlarından Korteks'e izin ver.
      </Typography>
    );
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, borderTop: 1, borderColor: 'divider', bgcolor: 'yuzeyIkincil' }}>
      <BellRing size={18} aria-hidden />
      <Typography variant="body2" sx={{ flex: 1 }}>
        Sınav ve ödevleri tarayıcı bildirimiyle de hatırlatayım mı?
      </Typography>
      <Button
        size="small"
        variant="outlined"
        onClick={async () => {
          const sonuc = await izinIste();
          setDurum(sonuc);
          setAcik(sonuc === 'granted');
        }}
      >
        Aç
      </Button>
    </Box>
  );
}

function TumBildirimler({ acik, onKapat, onAc }: { acik: boolean; onKapat: () => void; onAc: (b: Bildirim) => void }) {
  const { tumu } = useBildirimler();
  const [filtre, setFiltre] = useState<BildirimTur | 'hepsi'>('hepsi');
  const turler = [...new Set(tumu.map((b) => b.tur))];
  const liste = tumu.filter((b) => filtre === 'hepsi' || b.tur === filtre);
  return (
    <Dialog open={acik} onClose={onKapat} fullWidth maxWidth="sm" aria-labelledby="tum-bildirimler-baslik">
      <DialogTitle id="tum-bildirimler-baslik" sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1.5 }}>
        <Box sx={{ flex: 1 }}>Tüm bildirimler</Box>
        <IconButton aria-label="Kapat" onClick={onKapat}>
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 0, pb: 1 }}>
        <Stack direction="row" spacing={1} sx={{ px: 3, pb: 1.5, flexWrap: 'wrap', rowGap: 1 }} role="group" aria-label="Bildirim türü">
          <Chip label={`Hepsi (${tumu.length})`} color={filtre === 'hepsi' ? 'primary' : 'default'} variant={filtre === 'hepsi' ? 'filled' : 'outlined'} onClick={() => setFiltre('hepsi')} aria-pressed={filtre === 'hepsi'} />
          {turler.map((t) => (
            <Chip
              key={t}
              label={`${TUR_ETIKETI[t]} (${tumu.filter((b) => b.tur === t).length})`}
              color={filtre === t ? 'primary' : 'default'}
              variant={filtre === t ? 'filled' : 'outlined'}
              onClick={() => setFiltre(t)}
              aria-pressed={filtre === t}
            />
          ))}
        </Stack>
        {liste.length === 0 ? (
          <EmptyState title="Bildirim yok">Yaklaşan sınav, ödev veya devam uyarın bulunmuyor.</EmptyState>
        ) : (
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, borderTop: 1, borderColor: 'divider' }}>
            {liste.map((b) => (
              <BildirimSatiri key={b.id} b={b} okundu={b.okundu} onAc={onAc} />
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Üst bardaki zil (FG-13). İTAM'daki zil + rozet + "Tümünü gör" deseninin Korteks uyarlaması. */
export function BildirimZili() {
  const navigate = useNavigate();
  const { tumu, okunmamis } = useBildirimler();
  const okundu = useBildirimStore((s) => s.okundu);
  const hepsiOkundu = useBildirimStore((s) => s.hepsiOkundu);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [tumAcik, setTumAcik] = useState(false);
  const [duyuru, setDuyuru] = useState('');
  const onceki = useRef(okunmamis);

  // Yeni bildirim gelince ekran okuyucuya bir kez duyurulur
  useEffect(() => {
    if (okunmamis > onceki.current) setDuyuru(`${okunmamis} okunmamış bildirimin var`);
    onceki.current = okunmamis;
  }, [okunmamis]);

  const ac = (b: Bildirim) => {
    okundu(b.id, b.imza);
    setAnchor(null);
    setTumAcik(false);
    navigate(b.hedef);
  };

  return (
    <>
      <Tooltip title="Bildirimler">
        <IconButton
          aria-label={okunmamis ? `Bildirimler, ${okunmamis} okunmamış` : 'Bildirimler'}
          aria-haspopup="dialog"
          aria-expanded={!!anchor}
          onClick={(e) => setAnchor(e.currentTarget)}
          data-tur="bildirimler"
          sx={{ border: 1, borderColor: 'divider', width: 44, height: 44 }}
        >
          <Badge
            badgeContent={okunmamis}
            max={9}
            color="primary"
            overlap="circular"
            sx={{
              '& .MuiBadge-badge': {
                fontWeight: 700,
                animation: okunmamis ? 'korteksRozet 2.4s ease-in-out 3' : 'none',
                '@keyframes korteksRozet': { '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 92, 35, 0.55)' }, '50%': { boxShadow: '0 0 0 6px rgba(255, 92, 35, 0)' } },
                '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
              },
            }}
          >
            <Bell size={20} strokeWidth={1.75} />
          </Badge>
        </IconButton>
      </Tooltip>
      <Box className="sr-only" role="status" aria-live="polite">
        {duyuru}
      </Box>

      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 'min(420px, calc(100vw - 24px))', mt: 1, borderRadius: 3, overflow: 'hidden' }, role: 'dialog', 'aria-label': 'Bildirimler' } as object }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h2" component="h2" sx={{ fontSize: '1rem', flex: 1 }}>
            Bildirimler
          </Typography>
          {okunmamis > 0 && (
            <Button size="small" startIcon={<CheckCheck size={16} />} onClick={() => hepsiOkundu(tumu)}>
              Tümünü okundu say
            </Button>
          )}
        </Box>
        {tumu.length === 0 ? (
          <EmptyState title="Her şey yolunda">Yaklaşan sınav, ödev veya devam uyarın yok.</EmptyState>
        ) : (
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, maxHeight: 420, overflowY: 'auto' }}>
            {tumu.slice(0, MENUDE_EN_FAZLA).map((b) => (
              <BildirimSatiri key={b.id} b={b} okundu={b.okundu} onAc={ac} />
            ))}
          </Box>
        )}
        <TarayiciBildirimiSatiri />
        {tumu.length > 0 && (
          <Button
            fullWidth
            onClick={() => {
              setAnchor(null);
              setTumAcik(true);
            }}
            sx={{ borderRadius: 0, borderTop: 1, borderColor: 'divider', py: 1.25 }}
          >
            Tümünü gör ({tumu.length})
          </Button>
        )}
      </Popover>
      <TumBildirimler acik={tumAcik} onKapat={() => setTumAcik(false)} onAc={ac} />
    </>
  );
}
