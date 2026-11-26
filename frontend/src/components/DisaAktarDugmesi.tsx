import { useState } from 'react';
import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { disaAktar, type Bicim, type Rapor } from '@/lib/disaAktar';

const SECENEKLER: { bicim: Bicim; etiket: string; aciklama: string; simge: typeof Download }[] = [
  { bicim: 'csv', etiket: 'CSV (Excel)', aciklama: 'Türkçe karakterlerle açılır', simge: FileSpreadsheet },
  { bicim: 'pdf', etiket: 'PDF', aciklama: 'Yazdırma penceresinden kaydet', simge: Printer },
  { bicim: 'docx', etiket: 'Word (.docx)', aciklama: 'Tez eklerine konabilir', simge: FileText },
];

/** Yönetici raporlarını CSV, PDF ve Word olarak indirir (26.11.2026 kararı). */
export function DisaAktarDugmesi({ rapor, disabled }: { rapor: () => Rapor; disabled?: boolean }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [bekleyen, setBekleyen] = useState<Bicim | null>(null);
  const sec = async (b: Bicim) => {
    setBekleyen(b);
    try {
      await disaAktar(rapor(), b);
    } finally {
      setBekleyen(null);
      setAnchor(null);
    }
  };
  return (
    <>
      <Button variant="outlined" startIcon={<Download size={16} />} onClick={(e) => setAnchor(e.currentTarget)} disabled={disabled} aria-haspopup="menu" loading={bekleyen !== null}>
        Dışa aktar
      </Button>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        {SECENEKLER.map(({ bicim, etiket, aciklama, simge: Simge }) => (
          <MenuItem key={bicim} onClick={() => void sec(bicim)} disabled={bekleyen !== null}>
            <ListItemIcon>
              <Simge size={18} aria-hidden />
            </ListItemIcon>
            <ListItemText primary={etiket} secondary={aciklama} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
