import { Fragment, type ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Asistan yanıtları için küçük, güvenli biçimlendirici: paragraf, "- " madde ve **kalın**.
 * HTML yorumlamaz (XSS'e karşı); LLM çıktısı her zaman düz metin olarak işlenir.
 */
function satirIci(metin: string): ReactNode[] {
  return metin.split(/(\*\*[^*]+\*\*)/g).map((parca, i) =>
    parca.startsWith('**') && parca.endsWith('**') ? <strong key={i}>{parca.slice(2, -2)}</strong> : <Fragment key={i}>{parca}</Fragment>,
  );
}

export function RichText({ text }: { text: string }) {
  const bloklar = text.split(/\n{2,}/);
  return (
    <>
      {bloklar.map((blok, i) => {
        const satirlar = blok.split('\n');
        const maddeler = satirlar.filter((s) => s.startsWith('- '));
        const giris = satirlar.filter((s) => !s.startsWith('- '));
        return (
          <Box key={i} sx={{ '& + &': { mt: 1.5 } }}>
            {giris.length > 0 && <Typography sx={{ fontSize: '1rem', lineHeight: 1.65 }}>{satirIci(giris.join(' '))}</Typography>}
            {maddeler.length > 0 && (
              <Box component="ul" sx={{ m: 0, mt: giris.length ? 0.75 : 0, pl: 2.5 }}>
                {maddeler.map((m, j) => (
                  <Typography component="li" key={j} sx={{ fontSize: '1rem', lineHeight: 1.65 }}>
                    {satirIci(m.slice(2))}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        );
      })}
    </>
  );
}
