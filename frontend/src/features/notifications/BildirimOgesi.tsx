import { useState, type MouseEvent } from 'react';
import { Box, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { AlarmClock, X } from 'lucide-react';
import { SourceTag } from '@/components/SourceTag';
import type { Bildirim, BildirimOnem } from './bildirimUret';
import { TUR_ETIKETI, TUR_SIMGESI } from './bildirimEtiketleri';
import { ERTELE_ETIKETI, useBildirimStore, type ErteleSecenegi } from './bildirimStore';

const ONEM_ETIKETI: Record<BildirimOnem, string> = { kritik: 'Acil', uyari: 'Yaklaşıyor', bilgi: 'Bilgi' };

/** Önem rengi her zaman metin etiketiyle birlikte verilir (renk tek başına bilgi taşımaz, WCAG 1.4.1). */
export function OnemSimgesi({ b }: { b: Bildirim }) {
  const Simge = TUR_SIMGESI[b.tur];
  const renk = b.onem === 'kritik' ? 'error.main' : b.onem === 'uyari' ? 'warning.main' : 'text.secondary';
  return (
    <Box
      aria-hidden
      sx={{
        width: 40,
        height: 40,
        borderRadius: 2.5,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        color: renk,
        bgcolor: b.onem === 'bilgi' ? 'yuzeyIkincil' : 'transparent',
        border: 1,
        borderColor: b.onem === 'bilgi' ? 'transparent' : renk,
      }}
    >
      <Simge size={19} strokeWidth={1.75} />
    </Box>
  );
}

export function OnemEtiketi({ onem }: { onem: BildirimOnem }) {
  if (onem === 'bilgi') return null;
  return (
    <Typography component="span" variant="caption" sx={{ fontWeight: 700, color: onem === 'kritik' ? 'error.main' : 'warning.main', whiteSpace: 'nowrap' }}>
      {ONEM_ETIKETI[onem]}
    </Typography>
  );
}

/** "Sonra hatırlat" menüsü: 1 saat · Yarın 09.00 · 3 gün. */
export function ErteleDugmesi({ b, kucuk }: { b: Bildirim; kucuk?: boolean }) {
  const ertele = useBildirimStore((s) => s.ertele);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const sec = (s: ErteleSecenegi) => {
    ertele(b.id, s);
    setAnchor(null);
  };
  return (
    <>
      <Tooltip title="Sonra hatırlat">
        <IconButton
          size={kucuk ? 'small' : 'medium'}
          aria-label={`${b.baslik}: sonra hatırlat`}
          aria-haspopup="menu"
          onClick={(e: MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            setAnchor(e.currentTarget);
          }}
        >
          <AlarmClock size={18} aria-hidden />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)} onClick={(e) => e.stopPropagation()}>
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, display: 'block', pb: 0.5 }}>
          Sonra hatırlat
        </Typography>
        {(Object.keys(ERTELE_ETIKETI) as ErteleSecenegi[]).map((s) => (
          <MenuItem key={s} onClick={() => sec(s)}>
            <ListItemIcon>
              <AlarmClock size={16} aria-hidden />
            </ListItemIcon>
            {ERTELE_ETIKETI[s]}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function KapatDugmesi({ b, kucuk }: { b: Bildirim; kucuk?: boolean }) {
  const kapat = useBildirimStore((s) => s.kapat);
  return (
    <Tooltip title="Kapat">
      <IconButton
        size={kucuk ? 'small' : 'medium'}
        aria-label={`${b.baslik}: kapat`}
        onClick={(e) => {
          e.stopPropagation();
          kapat(b.id, b.imza);
        }}
      >
        <X size={18} aria-hidden />
      </IconButton>
    </Tooltip>
  );
}

/** Zil menüsünde ve "Tümünü gör" penceresinde tek bildirim satırı. */
export function BildirimSatiri({ b, okundu, onAc }: { b: Bildirim; okundu: boolean; onAc: (b: Bildirim) => void }) {
  return (
    <Box
      component="li"
      sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, px: 2, py: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: okundu ? 'transparent' : 'vurguZemin', '&:first-of-type': { borderTop: 0 } }}
    >
      <Box
        component="button"
        type="button"
        onClick={() => onAc(b)}
        sx={{ display: 'flex', gap: 1.5, flex: 1, minWidth: 0, textAlign: 'left', border: 0, p: 0, bgcolor: 'transparent', font: 'inherit', color: 'inherit', cursor: 'pointer', borderRadius: 1, '&:focus-visible': { outline: 2, outlineStyle: 'solid', outlineColor: 'primary.main', outlineOffset: 2 } }}
      >
        <OnemSimgesi b={b} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline', flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: okundu ? 500 : 700, fontSize: '0.9375rem', lineHeight: 1.35 }}>
              {b.baslik}
              {!okundu && <span className="sr-only"> (okunmamış)</span>}
            </Typography>
            <OnemEtiketi onem={b.onem} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {b.aciklama}
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <SourceTag sistem={b.kaynak_sistem} ek={TUR_ETIKETI[b.tur]} sonSenkron={b.son_senkron} />
          </Box>
        </Box>
      </Box>
      {b.tur !== 'duyuru' && <ErteleDugmesi b={b} kucuk />}
    </Box>
  );
}
