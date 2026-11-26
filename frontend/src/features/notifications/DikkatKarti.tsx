import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, Typography } from '@mui/material';
import { SectionCard } from '@/components/SectionCard';
import { SourceTag } from '@/components/SourceTag';
import { useBildirimler } from './useBildirimler';
import { useBildirimStore } from './bildirimStore';
import { ErteleDugmesi, KapatDugmesi, OnemEtiketi, OnemSimgesi } from './BildirimOgesi';
import { TUR_ETIKETI } from './bildirimEtiketleri';

const EN_FAZLA = 5;

/**
 * Panelin üstündeki "Dikkat edilmesi gerekenler" kartı. İTAM'daki System Alerts deseni ve
 * Course Signals [17] yaklaşımı: yaklaşan sınav/ödevler ve sınıra yaklaşan devam durumu.
 * Uyarı yoksa kart hiç gösterilmez.
 */
export function DikkatKarti() {
  const navigate = useNavigate();
  const { dikkat } = useBildirimler();
  const okundu = useBildirimStore((s) => s.okundu);
  const [hepsi, setHepsi] = useState(false);
  if (dikkat.length === 0) return null;
  const gorunen = hepsi ? dikkat : dikkat.slice(0, EN_FAZLA);

  return (
    <SectionCard
      title="Dikkat edilmesi gerekenler"
      flush
      action={
        <Typography variant="body2" color="text.secondary">
          {dikkat.length} uyarı
        </Typography>
      }
    >
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {gorunen.map((b) => (
          <Box component="li" key={b.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
            <OnemSimgesi b={b} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 600 }}>{b.baslik}</Typography>
                <OnemEtiketi onem={b.onem} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {b.aciklama}
              </Typography>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
              <SourceTag sistem={b.kaynak_sistem} ek={TUR_ETIKETI[b.tur]} sonSenkron={b.son_senkron} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  okundu(b.id, b.imza);
                  navigate(b.hedef);
                }}
                aria-label={`${b.baslik}: git`}
                sx={{ mr: 0.5, minWidth: 0 }}
              >
                Git
              </Button>
              <ErteleDugmesi b={b} kucuk />
              <KapatDugmesi b={b} kucuk />
            </Box>
          </Box>
        ))}
      </Box>
      {dikkat.length > EN_FAZLA && (
        <Button fullWidth onClick={() => setHepsi((h) => !h)} sx={{ borderRadius: 0, borderTop: 1, borderColor: 'divider', py: 1.25 }}>
          {hepsi ? 'Daha az göster' : `${dikkat.length - EN_FAZLA} uyarı daha`}
        </Button>
      )}
    </SectionCard>
  );
}
