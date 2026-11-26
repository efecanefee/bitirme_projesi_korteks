import { Box, Tooltip, Typography } from '@mui/material';
import { SEVIYE_ETIKETI, SEVIYE_RENGI, useDevamSeviyesi } from '@/lib/devam';

interface Props {
  kullanilan: number;
  sinir: number;
  /** Ders adı: ekran okuyucu metni için */
  ders?: string;
  size?: number;
  /** Ortada yazı gösterilsin mi (küçük boyutlarda kapalı) */
  merkez?: boolean;
}

/**
 * Devamsızlık halkası (İTAM'daki halka grafik deseni). Kalan hak sunucudan gelen
 * `sinir − kullanilan` farkıdır; arayüzde yeni hesap yapılmaz. Renk tek başına bilgi taşımaz:
 * ortada sayı, ekran okuyucuda tam cümle, yanında seviye etiketi kullanılır (WCAG 1.4.1).
 */
export function DevamHalkasi({ kullanilan, sinir, ders, size = 44, merkez = size >= 64 }: Props) {
  const { kalan, seviye } = useDevamSeviyesi(kullanilan, sinir);
  const kalinlik = Math.max(4, Math.round(size / 9));
  const r = (size - kalinlik) / 2;
  const cevre = 2 * Math.PI * r;
  const oran = sinir > 0 ? Math.min(kullanilan / sinir, 1) : 0;
  const etiket = `${ders ? `${ders}: ` : ''}${sinir} devam hakkının ${kullanilan} tanesi kullanıldı, ${Math.max(kalan, 0)} hak kaldı. ${SEVIYE_ETIKETI[seviye]}.`;

  return (
    <Tooltip title={`${kullanilan} / ${sinir} hak kullanıldı · ${SEVIYE_ETIKETI[seviye]}`}>
      <Box role="img" aria-label={etiket} sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <Box component="circle" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={kalinlik} sx={{ stroke: (t) => t.palette.divider }} />
          {kullanilan > 0 && (
            <Box
              component="circle"
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              strokeWidth={kalinlik}
              strokeLinecap="round"
              strokeDasharray={`${cevre * oran} ${cevre}`}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              sx={{ stroke: (t) => (seviye === 'doldu' ? t.palette.error.main : seviye === 'sinirda' ? t.palette.warning.main : t.palette.success.main), transition: 'stroke-dasharray .4s ease' }}
            />
          )}
        </svg>
        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }} aria-hidden>
          {merkez ? (
            <Box>
              <Typography sx={{ fontWeight: 700, lineHeight: 1, fontSize: size / 3.4, fontVariantNumeric: 'tabular-nums' }}>{Math.max(kalan, 0)}</Typography>
              <Typography sx={{ fontSize: Math.max(10, size / 9), color: 'text.secondary', lineHeight: 1.2 }}>hak kaldı</Typography>
            </Box>
          ) : (
            <Typography sx={{ fontWeight: 700, fontSize: size / 2.9, fontVariantNumeric: 'tabular-nums' }}>{Math.max(kalan, 0)}</Typography>
          )}
        </Box>
      </Box>
    </Tooltip>
  );
}

export function SeviyeEtiketi({ kullanilan, sinir }: { kullanilan: number; sinir: number }) {
  const { seviye } = useDevamSeviyesi(kullanilan, sinir);
  return (
    <Typography component="span" variant="caption" sx={{ fontWeight: 700, color: SEVIYE_RENGI[seviye], whiteSpace: 'nowrap' }}>
      {SEVIYE_ETIKETI[seviye]}
    </Typography>
  );
}
