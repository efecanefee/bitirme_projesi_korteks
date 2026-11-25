import { Box, Tooltip, Typography } from '@mui/material';
import type { KaynakSistem } from '@/api/types';
import { SISTEM_ETIKETI, saat } from '@/lib/format';

interface Props {
  sistem: KaynakSistem;
  /** Etiketin yanına eklenecek bağlam, örn. "ders programı" */
  ek?: string;
  sonSenkron?: string;
  size?: 'sm' | 'md';
}

/** Renkli nokta + sistem adı. Her kartta verinin geldiği yeri gösterir (FG-04, H1). */
export function SourceTag({ sistem, ek, sonSenkron, size = 'sm' }: Props) {
  const etiket = (
    <Box
      component="span"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, whiteSpace: 'nowrap' }}
      aria-label={`Kaynak: ${SISTEM_ETIKETI[sistem]}${sonSenkron ? `, son güncelleme ${saat(sonSenkron)}` : ''}`}
    >
      <Box
        component="span"
        aria-hidden
        sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: `sistem.${sistem}`, flexShrink: 0 }}
      />
      <Typography component="span" variant={size === 'sm' ? 'caption' : 'body2'} color="text.secondary" sx={{ fontWeight: 500 }}>
        {SISTEM_ETIKETI[sistem]}
        {ek ? ` · ${ek}` : ''}
      </Typography>
    </Box>
  );
  if (!sonSenkron) return etiket;
  return <Tooltip title={`Son senkronizasyon ${saat(sonSenkron)}`}>{etiket}</Tooltip>;
}
