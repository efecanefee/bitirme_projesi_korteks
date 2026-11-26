import { useState, type ReactNode } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Link,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useColorMode, type TemaTercihi } from '@/app/colorMode';
import { useAyarlar, VARSAYILAN_ESIKLER, type YaziBoyutu } from '@/app/ayarlar';
import { useAuthStore } from '@/features/auth/authStore';
import { useKortiStore } from '@/components/korti/kortiStore';
import { izinDurumu, izinIste, tarayiciDestekliyor } from '@/features/notifications/tarayiciBildirimi';

type Sekme = 'gorunum' | 'bildirimler' | 'korti' | 'gizlilik';

function Satir({ baslik, aciklama, id, children }: { baslik: string; aciklama?: string; id: string; children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', gap: 3, alignItems: { sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, py: 2.5, borderTop: 1, borderColor: 'divider', '&:first-of-type': { borderTop: 0, pt: 0 } }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography id={id} sx={{ fontWeight: 600 }}>
          {baslik}
        </Typography>
        {aciklama && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, maxWidth: '60ch' }}>
            {aciklama}
          </Typography>
        )}
      </Box>
      <Box sx={{ flexShrink: 0 }}>{children}</Box>
    </Box>
  );
}

function Gorunum() {
  const { tercih, setTercih } = useColorMode();
  const { yaziBoyutu, hareketAzalt, yuksekKontrast, setGorunum } = useAyarlar();
  return (
    <>
      <Satir id="ayar-tema" baslik="Tema" aciklama="Sistem seçeneği cihazının açık/koyu ayarını izler.">
        <RadioGroup row aria-labelledby="ayar-tema" value={tercih} onChange={(_, v) => setTercih(v as TemaTercihi)}>
          <FormControlLabel value="sistem" control={<Radio />} label="Sistem" />
          <FormControlLabel value="light" control={<Radio />} label="Açık" />
          <FormControlLabel value="dark" control={<Radio />} label="Koyu" />
        </RadioGroup>
      </Satir>
      <Satir id="ayar-yazi" baslik="Yazı boyutu" aciklama="Bütün metinler ve aralıklar orantılı büyür.">
        <ToggleButtonGroup exclusive size="small" value={yaziBoyutu} onChange={(_, v: YaziBoyutu | null) => v && setGorunum({ yaziBoyutu: v })} aria-labelledby="ayar-yazi">
          <ToggleButton value={100} aria-label="Normal">
            <Box component="span" sx={{ fontSize: 14, px: 1 }}>
              Aa
            </Box>
          </ToggleButton>
          <ToggleButton value={112} aria-label="Büyük">
            <Box component="span" sx={{ fontSize: 17, px: 1 }}>
              Aa
            </Box>
          </ToggleButton>
          <ToggleButton value={125} aria-label="Çok büyük">
            <Box component="span" sx={{ fontSize: 20, px: 1 }}>
              Aa
            </Box>
          </ToggleButton>
        </ToggleButtonGroup>
      </Satir>
      <Satir id="ayar-kontrast" baslik="Yüksek kontrast" aciklama="İkincil metinler ve çizgiler daha koyu gösterilir.">
        <Switch checked={yuksekKontrast} onChange={(_, v) => setGorunum({ yuksekKontrast: v })} slotProps={{ input: { 'aria-labelledby': 'ayar-kontrast' } }} />
      </Satir>
      <Satir id="ayar-hareket" baslik="Hareketi azalt" aciklama="Animasyonlar ve Korti'nin hareketleri kapanır. Kapalıyken cihazının ayarı izlenir.">
        <Switch checked={hareketAzalt} onChange={(_, v) => setGorunum({ hareketAzalt: v })} slotProps={{ input: { 'aria-labelledby': 'ayar-hareket' } }} />
      </Satir>
    </>
  );
}

const SINAV_GUNLERI = [1, 3, 7, 10, 14, 21, 30];
const ODEV_GUNLERI = [1, 2, 3, 5, 7, 10];
const DEVAM_HAKLARI = [0, 1, 2, 3];

function Bildirimler() {
  const { esikler, setEsikler, sifirla, tarayiciBildirimi, setTarayiciBildirimi } = useAyarlar();
  const [izin, setIzin] = useState(izinDurumu);
  const secim = (etiket: string, deger: number, secenekler: number[], birim: string, degis: (n: number) => void) => (
    <TextField select size="small" label={etiket} value={deger} onChange={(e) => degis(Number(e.target.value))} sx={{ minWidth: 160 }}>
      {secenekler.map((n) => (
        <MenuItem key={n} value={n}>
          {n === 0 && birim === 'hak' ? 'Hak dolunca' : `${n} ${birim}`}
        </MenuItem>
      ))}
    </TextField>
  );
  return (
    <>
      <Satir id="ayar-sinav" baslik="Sınav hatırlatması" aciklama="Sınavdan kaç gün önce zilde ve panelde uyarı gösterilsin.">
        {secim('Sınavdan önce', esikler.sinavGun, SINAV_GUNLERI, 'gün', (n) => setEsikler({ sinavGun: n }))}
      </Satir>
      <Satir id="ayar-odev" baslik="Ödev hatırlatması" aciklama="Teslim tarihinden kaç gün önce uyarılsın.">
        {secim('Teslimden önce', esikler.odevGun, ODEV_GUNLERI, 'gün', (n) => setEsikler({ odevGun: n }))}
      </Satir>
      <Satir id="ayar-devam" baslik="Devamsızlık uyarısı" aciklama="Kaç devam hakkı kalınca uyarılsın. Hak dolduğunda her zaman uyarılırsın.">
        {secim('Kalan hak', esikler.devamHak, DEVAM_HAKLARI, 'hak', (n) => setEsikler({ devamHak: n }))}
      </Satir>
      <Satir
        id="ayar-tarayici"
        baslik="Tarayıcı bildirimleri"
        aciklama={tarayiciDestekliyor() ? 'Sunucuda bildirim servisi olmadığı için yalnızca Korteks açıkken gelir.' : 'Bu tarayıcı bildirimleri desteklemiyor.'}
      >
        <Switch
          checked={tarayiciBildirimi && izin === 'granted'}
          disabled={!tarayiciDestekliyor() || izin === 'denied'}
          onChange={async (_, v) => {
            if (!v) return setTarayiciBildirimi(false);
            const sonuc = await izinIste();
            setIzin(sonuc);
            setTarayiciBildirimi(sonuc === 'granted');
          }}
          slotProps={{ input: { 'aria-labelledby': 'ayar-tarayici' } }}
        />
      </Satir>
      {izin === 'denied' && tarayiciDestekliyor() && (
        <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
          Tarayıcı bildirimleri engellenmiş. Açmak için tarayıcının site ayarlarından Korteks&apos;e izin ver.
        </Alert>
      )}
      <Button variant="outlined" onClick={sifirla} disabled={JSON.stringify(esikler) === JSON.stringify(VARSAYILAN_ESIKLER)}>
        Varsayılanlara dön (sınav {VARSAYILAN_ESIKLER.sinavGun} gün, ödev {VARSAYILAN_ESIKLER.odevGun} gün, {VARSAYILAN_ESIKLER.devamHak} hak)
      </Button>
    </>
  );
}

function KortiAyarlari() {
  const { kartKapali, setKartKapali } = useKortiStore();
  return (
    <>
      <Satir id="ayar-korti-kart" baslik="Paneldeki Korti kartı" aciklama="Kapalıyken Korti sağ alttaki düğmeden açılır.">
        <Switch checked={!kartKapali} onChange={(_, v) => setKartKapali(!v)} slotProps={{ input: { 'aria-labelledby': 'ayar-korti-kart' } }} />
      </Satir>
    </>
  );
}

/** Ayarlar sayfası (WCAG 2.1 AA, FG-13). İTAM'daki sekmeli ayar düzeni; tercihler yalnızca bu cihazda tutulur. */
export function AyarlarPage() {
  const ogrenci = useAuthStore((s) => s.kullanici?.rol === 'ogrenci');
  const [params, setParams] = useSearchParams();
  const sekmeler: { id: Sekme; etiket: string }[] = ogrenci
    ? [
        { id: 'gorunum', etiket: 'Görünüm' },
        { id: 'bildirimler', etiket: 'Bildirimler' },
        { id: 'korti', etiket: 'Korti' },
        { id: 'gizlilik', etiket: 'Gizlilik' },
      ]
    : [{ id: 'gorunum', etiket: 'Görünüm' }];
  const istenen = params.get('sekme') as Sekme | null;
  const sekme: Sekme = sekmeler.some((s) => s.id === istenen) ? (istenen as Sekme) : 'gorunum';

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h1">Ayarlar</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, mb: 3 }}>
        Tercihlerin yalnızca bu cihazda tutulur.
      </Typography>
      <Tabs value={sekme} onChange={(_, v: Sekme) => setParams({ sekme: v }, { replace: true })} aria-label="Ayar bölümleri" variant="scrollable" sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        {sekmeler.map((s) => (
          <Tab key={s.id} value={s.id} label={s.etiket} id={`sekme-${s.id}`} aria-controls={`panel-${s.id}`} />
        ))}
      </Tabs>
      <Paper variant="outlined" role="tabpanel" id={`panel-${sekme}`} aria-labelledby={`sekme-${sekme}`} sx={{ p: 3, borderRadius: 3 }}>
        {sekme === 'gorunum' && <Gorunum />}
        {sekme === 'bildirimler' && <Bildirimler />}
        {sekme === 'korti' && <KortiAyarlari />}
        {sekme === 'gizlilik' && (
          <Stack spacing={1.5}>
            <Typography>KVKK onayın, sohbet değerlendirme iznin ve cihazdaki veriler Gizlilik sayfasında yönetilir.</Typography>
            <Link component={RouterLink} to="/gizlilik" underline="hover">
              Gizlilik ve KVKK sayfasına git
            </Link>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
