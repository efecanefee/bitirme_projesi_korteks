import { Box, Paper, Stack, Typography } from '@mui/material';
import type { SohbetMesaji, YanitKaynagi } from '@/api/types';
import { BELGE_TURU } from '@/lib/labels';
import { SourceTag } from '@/components/SourceTag';
import { saat, sayi } from '@/lib/format';

function KaynakKarti({ k }: { k: YanitKaynagi }) {
  const kart = { p: 2.25, borderRadius: 2.5 } as const;
  if (k.tip === 'belge') {
    return (
      <Paper variant="outlined" sx={kart}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Belge · {BELGE_TURU[k.belge_turu]}
          </Typography>
          <Box
            component="span"
            title="Sorunun bu parçaya anlamsal benzerliği (0–1)"
            sx={{ fontSize: 13, fontWeight: 600, color: 'success.main', bgcolor: '#E8F3EE', px: 1, py: 0.25, borderRadius: 1.5 }}
          >
            Benzerlik {sayi(k.benzerlik)}
          </Box>
        </Stack>
        <Typography sx={{ fontWeight: 600, lineHeight: 1.4 }}>{k.belge_basligi}</Typography>
        <Box sx={{ mt: 1.25, pl: 1.5, borderLeft: 3, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            {k.alinti.length >= 160 ? `${k.alinti}…` : k.alinti}
          </Typography>
        </Box>
        {(k.madde || k.sayfa) && (
          <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>
            {[k.madde, k.sayfa ? `s. ${k.sayfa}` : null].filter(Boolean).join(' · ')}
          </Typography>
        )}
      </Paper>
    );
  }
  if (k.tip === 'kisisel_veri') {
    return (
      <Paper variant="outlined" sx={kart}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Kişisel veri
          </Typography>
          <SourceTag sistem={k.kaynak_sistem} />
        </Stack>
        <Typography sx={{ fontWeight: 600 }}>{k.baslik}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {k.ozet} · Senkron {saat(k.son_senkron)}
        </Typography>
      </Paper>
    );
  }
  return (
    <Paper variant="outlined" sx={kart}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Hesaplama aracı
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 13 }}>
          {k.arac}
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {k.formul}
      </Typography>
    </Paper>
  );
}

export function SourcesPanel({ mesaj }: { mesaj: SohbetMesaji | undefined }) {
  return (
    <Paper
      variant="outlined"
      component="aside"
      aria-label="Yanıtın dayanağı"
      sx={{ borderRadius: 3, p: 3, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
    >
      <Typography variant="h2" component="h2">
        Yanıtın dayanağı
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
        Son yanıtta kullanılan kaynaklar
      </Typography>
      <Stack spacing={1.5} aria-live="polite">
        {!mesaj && (
          <Typography variant="body2" color="text.secondary">
            Bir soru sorduğunda yanıtın dayandığı belge maddeleri, kişisel veriler ve hesaplamalar burada görünür.
          </Typography>
        )}
        {mesaj && mesaj.kaynaklar.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Bu yanıt için uygun kaynak bulunamadı; asistan tahmin üretmedi.
          </Typography>
        )}
        {mesaj?.kaynaklar.map((k, i) => <KaynakKarti key={i} k={k} />)}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto', pt: 3 }}>
        Asistanın yanıtları yapay zekâ ile üretilir. Kesin bilgi için kaynak sistemi kontrol et.
      </Typography>
    </Paper>
  );
}
