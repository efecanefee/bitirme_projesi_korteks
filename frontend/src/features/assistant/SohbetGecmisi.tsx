import { useMemo, useState } from 'react';
import { Box, Drawer, IconButton, InputAdornment, List, ListItemButton, ListItemText, ListSubheader, TextField, Typography } from '@mui/material';
import { Search, X } from 'lucide-react';
import dayjs from '@/lib/dayjs';
import type { Sohbet } from '@/api/types';
import { sadelestir } from '@/features/search/arama';
import { EmptyState } from '@/components/states';

type Grup = 'Bugün' | 'Dün' | 'Bu hafta' | 'Bu ay' | 'Daha eski';
const GRUPLAR: Grup[] = ['Bugün', 'Dün', 'Bu hafta', 'Bu ay', 'Daha eski'];

function sohbetGrubu(iso: string, simdi = dayjs()): Grup {
  const t = dayjs(iso);
  if (t.isSame(simdi, 'day')) return 'Bugün';
  if (t.isSame(simdi.subtract(1, 'day'), 'day')) return 'Dün';
  if (t.isAfter(simdi.subtract(7, 'day'))) return 'Bu hafta';
  if (t.isAfter(simdi.subtract(30, 'day'))) return 'Bu ay';
  return 'Daha eski';
}

interface Props {
  acik: boolean;
  onKapat: () => void;
  sohbetler: Sohbet[];
  seciliId: number | null;
  onSec: (id: number) => void;
}

/**
 * Geçmiş sohbetler paneli (FG-11): tarihe göre gruplanır, başlıkta aranır. Sohbet silme uç noktası
 * sözleşmede olmadığı için silme düğmesi şimdilik yok (Efecan'a iletildi).
 */
export function SohbetGecmisi({ acik, onKapat, sohbetler, seciliId, onSec }: Props) {
  const [sorgu, setSorgu] = useState('');
  const gruplu = useMemo(() => {
    const s = sadelestir(sorgu);
    const liste = [...sohbetler].filter((x) => !s || sadelestir(x.baslik).includes(s)).sort((a, b) => b.son_mesaj.localeCompare(a.son_mesaj));
    return GRUPLAR.map((g) => ({ g, liste: liste.filter((x) => sohbetGrubu(x.son_mesaj) === g) })).filter((x) => x.liste.length > 0);
  }, [sohbetler, sorgu]);

  return (
    <Drawer anchor="left" open={acik} onClose={onKapat} slotProps={{ paper: { sx: { width: 'min(360px, 100vw)' }, 'aria-labelledby': 'gecmis-baslik' } as object }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2.5, pt: 2, pb: 1 }}>
        <Typography id="gecmis-baslik" variant="h2" sx={{ fontSize: '1.125rem', flex: 1 }}>
          Geçmiş sohbetler
        </Typography>
        <IconButton aria-label="Kapat" onClick={onKapat}>
          <X size={20} />
        </IconButton>
      </Box>
      <Box sx={{ px: 2.5, pb: 1.5 }}>
        <TextField
          value={sorgu}
          onChange={(e) => setSorgu(e.target.value)}
          placeholder="Sohbetlerde ara"
          size="small"
          fullWidth
          slotProps={{
            htmlInput: { 'aria-label': 'Sohbetlerde ara' },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} aria-hidden />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      {gruplu.length === 0 ? (
        <EmptyState title={sorgu ? 'Eşleşen sohbet yok' : 'Henüz sohbet yok'} />
      ) : (
        <List sx={{ px: 1, overflowY: 'auto' }} aria-label="Sohbetler">
          {gruplu.map(({ g, liste }) => (
            <Box component="li" key={g} sx={{ listStyle: 'none' }}>
              <Box component="ul" sx={{ p: 0 }}>
                <ListSubheader disableSticky sx={{ bgcolor: 'transparent', lineHeight: 2.2, fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {g}
                </ListSubheader>
                {liste.map((s) => (
                  <ListItemButton
                    key={s.id}
                    selected={s.id === seciliId}
                    aria-current={s.id === seciliId ? 'true' : undefined}
                    onClick={() => onSec(s.id)}
                    sx={{ borderRadius: 2, mb: 0.25 }}
                  >
                    <ListItemText primary={s.baslik} secondary={dayjs(s.son_mesaj).fromNow()} slotProps={{ primary: { noWrap: true } }} />
                  </ListItemButton>
                ))}
              </Box>
            </Box>
          ))}
        </List>
      )}
    </Drawer>
  );
}
