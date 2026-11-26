import dayjs from '@/lib/dayjs';
import type { DevamOzeti, Duyuru, Etkinlik, KaynakSistem, SenkronOzeti } from '@/api/types';
import { devamSeviyesi, type Esikler } from '@/app/ayarlar';
import { SISTEM_ETIKETI, kalanGun, saat, saatTr } from '@/lib/format';

export type BildirimTur = 'sinav' | 'odev' | 'devam' | 'duyuru' | 'senkron';
export type BildirimOnem = 'kritik' | 'uyari' | 'bilgi';

export interface Bildirim {
  /** Kalıcı kimlik: aynı kayıttan her seferinde aynı bildirim üretilir */
  id: string;
  /**
   * Bildirimin durumunu özetler. Kapatılan bildirim, imzası değişince (örn. sınav yaklaşıp
   * "bilgi"den "kritik"e geçince ya da bir devam hakkı daha gidince) yeniden görünür.
   */
  imza: string;
  tur: BildirimTur;
  onem: BildirimOnem;
  baslik: string;
  aciklama: string;
  /** Sıralama için ilgili zaman (sınav/ödev tarihi, duyuru tarihi) */
  zaman: string;
  /** Tıklanınca açılacak sayfa */
  hedef: string;
  kaynak_sistem: KaynakSistem;
  son_senkron?: string;
}

export interface BildirimGirdisi {
  etkinlikler?: Etkinlik[];
  devam?: DevamOzeti[];
  duyurular?: Duyuru[];
  senkron?: SenkronOzeti[];
  esikler: Esikler;
  simdi?: dayjs.Dayjs;
}

const ONEM_SIRASI: Record<BildirimOnem, number> = { kritik: 0, uyari: 1, bilgi: 2 };

/** Kalan güne göre önem: bugün/yarın kritik, 3 gün içi uyarı, daha uzak bilgi. */
function tarihOnemi(gun: number): BildirimOnem {
  if (gun <= 1) return 'kritik';
  if (gun <= 3) return 'uyari';
  return 'bilgi';
}

/**
 * Mevcut API verisinden bildirim listesi üretir (FG-13). Yeni uç nokta kullanılmaz; hesap yapılmaz,
 * yalnızca sunucudan gelen tarih ve devam sayıları eşiklerle karşılaştırılır.
 */
export function bildirimleriUret({ etkinlikler = [], devam = [], duyurular = [], senkron = [], esikler, simdi = dayjs() }: BildirimGirdisi): Bildirim[] {
  const liste: Bildirim[] = [];
  const bugun = simdi.startOf('day');

  for (const e of etkinlikler) {
    if (e.tur !== 'sinav' && e.tur !== 'odev') continue;
    const t = dayjs(e.tarih);
    if (t.isBefore(simdi)) continue;
    const gun = t.startOf('day').diff(bugun, 'day');
    const esik = e.tur === 'sinav' ? esikler.sinavGun : esikler.odevGun;
    if (gun > esik) continue;
    const onem = tarihOnemi(gun);
    const kalan = kalanGun(e.tarih, simdi);
    const ne = kalan === 'Bugün' || kalan === 'Yarın' ? kalan.toLocaleLowerCase('tr-TR') : `${kalan} sonra`;
    liste.push({
      id: `${e.tur}-${e.id}`,
      imza: onem,
      tur: e.tur,
      onem,
      baslik: e.baslik,
      aciklama: [e.tur === 'sinav' ? `Sınav ${ne}` : `Teslim ${ne}`, saatTr(saat(e.tarih)), e.yer].filter(Boolean).join(' · '),
      zaman: e.tarih,
      hedef: e.ders_kodu ? `/derslerim/${encodeURIComponent(e.ders_kodu)}` : '/takvim',
      kaynak_sistem: e.kaynak_sistem,
      son_senkron: e.son_senkron,
    });
  }

  for (const d of devam) {
    const kalan = d.sinir - d.kullanilan;
    const seviye = devamSeviyesi(kalan, esikler.devamHak);
    if (seviye === 'yolunda') continue;
    liste.push({
      id: `devam-${d.ders_kaydi_id}`,
      imza: String(kalan),
      tur: 'devam',
      onem: seviye === 'doldu' ? 'kritik' : 'uyari',
      baslik: seviye === 'doldu' ? `${d.ders_adi}: devam hakkın doldu` : `${d.ders_adi}: ${kalan} devam hakkın kaldı`,
      aciklama:
        seviye === 'doldu'
          ? 'Sınırı aşan öğrenci final sınavına giremez; danışmanınla görüş.'
          : `${d.sinir} hakkın ${d.kullanilan} tanesi kullanıldı.`,
      zaman: d.son_senkron,
      hedef: `/derslerim/${encodeURIComponent(d.ders_kodu)}`,
      kaynak_sistem: d.kaynak_sistem,
      son_senkron: d.son_senkron,
    });
  }

  for (const d of duyurular) {
    if (d.okundu) continue;
    liste.push({
      id: `duyuru-${d.id}`,
      imza: 'yeni',
      tur: 'duyuru',
      onem: 'bilgi',
      baslik: d.baslik,
      aciklama: [d.yayinlayan, d.ders_kodu].filter(Boolean).join(' · '),
      zaman: d.tarih,
      hedef: '/duyurular',
      kaynak_sistem: d.kaynak_sistem,
      son_senkron: d.son_senkron,
    });
  }

  for (const s of senkron) {
    if (s.durum !== 'hatali') continue;
    liste.push({
      id: `senkron-${s.kaynak_sistem}`,
      imza: s.son_basarili ?? 'hic',
      tur: 'senkron',
      onem: 'uyari',
      baslik: `${SISTEM_ETIKETI[s.kaynak_sistem]} verisi güncellenemedi`,
      aciklama: s.son_basarili ? `Son başarılı güncelleme ${dayjs(s.son_basarili).format('D MMMM, HH.mm')}; gösterilen veri bu tarihe aittir.` : 'Bu sistemden henüz veri alınamadı.',
      zaman: s.son_basarili ?? simdi.toISOString(),
      hedef: '/',
      kaynak_sistem: s.kaynak_sistem,
    });
  }

  return liste.sort((a, b) => {
    const o = ONEM_SIRASI[a.onem] - ONEM_SIRASI[b.onem];
    if (o !== 0) return o;
    // Sınav ve ödevlerde en yakın önce; duyurularda en yeni önce
    const ileri = a.tur === 'sinav' || a.tur === 'odev';
    return ileri ? a.zaman.localeCompare(b.zaman) : b.zaman.localeCompare(a.zaman);
  });
}
