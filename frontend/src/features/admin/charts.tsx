import { Box, Paper, Tooltip, Typography } from '@mui/material';
import { tokens } from '@/app/theme';

/** Hedefe göre durum gösteren gösterge kutusu (FOG-02, FOG-05, FG-12). */
export function StatTile({ etiket, deger, hedef, tamam }: { etiket: string; deger: string; hedef?: string; tamam?: boolean }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
      <Typography variant="body2" color="text.secondary">
        {etiket}
      </Typography>
      <Typography sx={{ fontSize: '2rem', fontWeight: 600, lineHeight: 1.2, mt: 0.5, fontVariantNumeric: 'tabular-nums' }}>{deger}</Typography>
      {hedef && (
        <Typography variant="body2" sx={{ mt: 0.5, color: tamam ? 'success.main' : 'warning.main', fontWeight: 500 }}>
          {tamam ? '✓ Hedef karşılanıyor' : '! Hedefin dışında'} · {hedef}
        </Typography>
      )}
    </Paper>
  );
}

interface Nokta {
  etiket: string;
  deger: number;
  ipucu: string;
}

/** Tek serili dikey çubuk grafik: tek renk, yuvarlatılmış uç, hover ipucu, ekran okuyucu tablosu. */
export function BarChart({ veri, baslik, yukseklik = 200 }: { veri: Nokta[]; baslik: string; yukseklik?: number }) {
  const maks = Math.max(...veri.map((v) => v.deger), 1);
  const tavan = Math.ceil(maks / 50) * 50;
  const cizgiler = [0, 0.5, 1].map((o) => Math.round(tavan * o));
  return (
    <Box>
      <Box sx={{ position: 'relative', height: yukseklik, display: 'flex', gap: '2px', alignItems: 'flex-end', pl: 5 }} aria-hidden>
        {cizgiler.map((c) => (
          <Box key={c} sx={{ position: 'absolute', left: 40, right: 0, bottom: `${(c / tavan) * 100}%`, borderTop: `1px solid ${tokens.cizgi}` }}>
            <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', left: -40, top: -9, width: 34, textAlign: 'right' }}>
              {c}
            </Typography>
          </Box>
        ))}
        {veri.map((v) => (
          <Tooltip key={v.etiket} title={v.ipucu} placement="top">
            <Box sx={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', cursor: 'default', zIndex: 1, '&:hover > div': { bgcolor: tokens.lacivertKoyu } }}>
              <Box sx={{ width: '100%', maxWidth: 28, mx: 'auto', height: `${(v.deger / tavan) * 100}%`, bgcolor: tokens.lacivert, borderRadius: '4px 4px 0 0' }} />
            </Box>
          </Tooltip>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: '2px', pl: 5, mt: 0.75 }} aria-hidden>
        {veri.map((v, i) => (
          <Typography key={v.etiket} variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: 'center', whiteSpace: 'nowrap', visibility: i % 2 === 0 ? 'visible' : 'hidden' }}>
            {v.etiket}
          </Typography>
        ))}
      </Box>
      <table className="sr-only">
        <caption>{baslik}</caption>
        <tbody>
          {veri.map((v) => (
            <tr key={v.etiket}>
              <th scope="row">{v.etiket}</th>
              <td>{v.ipucu}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}

/** Yatay çubuklarla oran dağılımı (tek renk; büyüklük kodlar, kimlik değil). */
export function HBarList({ veri }: { veri: { etiket: string; deger: number }[] }) {
  const toplam = veri.reduce((t, v) => t + v.deger, 0) || 1;
  const maks = Math.max(...veri.map((v) => v.deger), 1);
  return (
    <Box component="dl" sx={{ m: 0 }}>
      {veri.map((v) => (
        <Box key={v.etiket} sx={{ display: 'grid', gridTemplateColumns: '150px 1fr 88px', gap: 2, alignItems: 'center', py: 1 }}>
          <Typography component="dt">{v.etiket}</Typography>
          <Box aria-hidden sx={{ height: 10, borderRadius: '0 4px 4px 0', bgcolor: tokens.lacivert, width: `${(v.deger / maks) * 100}%`, minWidth: 2 }} />
          <Typography component="dd" sx={{ m: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {v.deger} <Box component="span" sx={{ color: 'text.secondary' }}>(%{Math.round((v.deger / toplam) * 100)})</Box>
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
