import { Alert, Box, Typography } from '@mui/material';
import { KVKK_BOLUMLER, KVKK_SURUM, KVKK_TASLAK } from './kvkkMetni';

export function KvkkText() {
  return (
    <Box>
      {KVKK_TASLAK && (
        <Alert role="note" severity="warning" variant="outlined" sx={{ mb: 3, bgcolor: 'vurguZemin' }}>
          Bu metin taslaktır ve resmî aydınlatma metni değildir. Köşeli parantezli bölümler
          üniversite tarafından tamamlanacaktır.
        </Alert>
      )}
      {KVKK_BOLUMLER.map((b) => (
        <Box component="section" key={b.baslik} sx={{ mb: 3 }}>
          <Typography variant="h3" component="h2" sx={{ mb: 1 }}>
            {b.baslik}
          </Typography>
          {b.paragraflar?.map((p, i) => (
            <Typography key={i} sx={{ mb: 1, maxWidth: '72ch' }}>
              {p}
            </Typography>
          ))}
          {b.maddeler && (
            <Box component="ul" sx={{ m: 0, pl: 3, maxWidth: '72ch' }}>
              {b.maddeler.map((m, i) => (
                <Typography component="li" key={i} sx={{ mb: 0.5 }}>
                  {m}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      ))}
      <Typography variant="caption" color="text.secondary">
        Metin sürümü: {KVKK_SURUM}
      </Typography>
    </Box>
  );
}
