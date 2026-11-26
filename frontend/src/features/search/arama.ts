import dayjs from '@/lib/dayjs';
import type { Degerlendirme, DersKaydi, Duyuru, Etkinlik, KaynakSistem } from '@/api/types';
import { saat, saatTr } from '@/lib/format';

/** Türkçe karakterleri ve büyük/küçük harfi yok sayan biçim: "Olasılık" → "olasilik". */
export function sadelestir(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' })[c] ?? c)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const SORU_KELIMELERI = /(^|\s)(nasil|kac|hangi|ne zaman|neden|nedir|nerede|kimler?|var mi|mi|mı|mu|mü|miyim|misin|mısın|olur mu|gerekir mi|gerekiyor)(\s|$|\?)/;

/** Sorgu bir soruya benziyorsa "Korti'ye sor" satırı listenin en üstüne çıkar. */
export function soruMu(sorgu: string): boolean {
  const s = sadelestir(sorgu);
  if (!s) return false;
  return sorgu.trim().endsWith('?') || SORU_KELIMELERI.test(s) || s.split(' ').length >= 5;
}

export type SonucTur = 'sayfa' | 'ders' | 'etkinlik' | 'duyuru' | 'not';

export interface AramaSonucu {
  id: string;
  tur: SonucTur;
  baslik: string;
  alt: string;
  hedef: string;
  kaynak_sistem?: KaynakSistem;
  son_senkron?: string;
  /** Önizleme panelinde gösterilecek satırlar */
  ayrinti: { etiket: string; deger: string }[];
  /** Eşleşmede kullanılan metin (sadeleştirilmiş) */
  metin: string;
}

export const GRUP_ETIKETI: Record<SonucTur, string> = {
  sayfa: 'Sayfalar',
  ders: 'Dersler',
  etkinlik: 'Sınav ve ödevler',
  duyuru: 'Duyurular',
  not: 'Notlar',
};

const SAYFALAR: { baslik: string; hedef: string; anahtar: string }[] = [
  { baslik: 'Panel', hedef: '/', anahtar: 'panel ana sayfa ozet' },
  { baslik: 'Derslerim', hedef: '/derslerim', anahtar: 'dersler ders programi haftalik' },
  { baslik: 'Takvim', hedef: '/takvim', anahtar: 'takvim sinav odev tarih' },
  { baslik: 'Notlar ve devam', hedef: '/notlar', anahtar: 'notlar devam devamsizlik ortalama final' },
  { baslik: 'Asistan', hedef: '/asistan', anahtar: 'asistan korti soru sohbet' },
  { baslik: 'Duyurular', hedef: '/duyurular', anahtar: 'duyurular haber' },
  { baslik: 'Ayarlar', hedef: '/ayarlar', anahtar: 'ayarlar tema bildirim yazi boyutu' },
  { baslik: 'Gizlilik ve KVKK', hedef: '/gizlilik', anahtar: 'gizlilik kvkk riza' },
];

const GUN = ['', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const ETKINLIK_TURU: Record<Etkinlik['tur'], string> = { sinav: 'Sınav', odev: 'Ödev', duyuru: 'Duyuru', materyal: 'Materyal', sanal_sinif: 'Sanal sınıf' };

export interface AramaVerisi {
  dersler?: DersKaydi[];
  etkinlikler?: Etkinlik[];
  duyurular?: Duyuru[];
  notlar?: Degerlendirme[];
}

/** Aranabilir dizin: yalnızca öğrencinin cihazda zaten bulunan verisi (LLM'e bir şey gitmez). */
export function dizinOlustur({ dersler = [], etkinlikler = [], duyurular = [], notlar = [] }: AramaVerisi): AramaSonucu[] {
  const dizin: AramaSonucu[] = SAYFALAR.map((s) => ({
    id: `sayfa-${s.hedef}`,
    tur: 'sayfa',
    baslik: s.baslik,
    alt: 'Sayfa',
    hedef: s.hedef,
    ayrinti: [],
    metin: sadelestir(`${s.baslik} ${s.anahtar}`),
  }));

  const dersAdi = new Map<number, DersKaydi>();
  for (const k of dersler) {
    dersAdi.set(k.id, k);
    const program = k.program.map((p) => `${GUN[p.gun]} ${saatTr(p.baslangic)}–${saatTr(p.bitis)}, ${p.yer}`);
    dizin.push({
      id: `ders-${k.ders.kod}`,
      tur: 'ders',
      baslik: k.ders.ad,
      alt: `${k.ders.kod} · ${k.ders.ogretim_elemani}`,
      hedef: `/derslerim/${encodeURIComponent(k.ders.kod)}`,
      kaynak_sistem: 'OBS',
      ayrinti: [
        { etiket: 'Kod', deger: `${k.ders.kod} · ${k.ders.kredi} kredi` },
        { etiket: 'Öğretim elemanı', deger: k.ders.ogretim_elemani },
        ...program.map((p, i) => ({ etiket: i === 0 ? 'Program' : '', deger: p })),
      ],
      metin: sadelestir(`${k.ders.ad} ${k.ders.kod} ${k.ders.ogretim_elemani}`),
    });
  }

  for (const e of etkinlikler) {
    if (e.tur !== 'sinav' && e.tur !== 'odev') continue;
    const t = dayjs(e.tarih);
    dizin.push({
      id: `etkinlik-${e.id}`,
      tur: 'etkinlik',
      baslik: e.baslik,
      alt: [ETKINLIK_TURU[e.tur], t.format('D MMMM dddd'), saatTr(saat(e.tarih)), e.ders_kodu].filter(Boolean).join(' · '),
      hedef: e.ders_kodu ? `/derslerim/${encodeURIComponent(e.ders_kodu)}` : '/takvim',
      kaynak_sistem: e.kaynak_sistem,
      son_senkron: e.son_senkron,
      ayrinti: [
        { etiket: 'Tür', deger: ETKINLIK_TURU[e.tur] },
        { etiket: 'Tarih', deger: `${t.format('D MMMM YYYY dddd')}, ${saatTr(saat(e.tarih))}` },
        ...(e.yer ? [{ etiket: e.tur === 'sinav' ? 'Salon' : 'Teslim', deger: e.yer }] : []),
        ...(e.sure_dk ? [{ etiket: 'Süre', deger: `${e.sure_dk} dk` }] : []),
      ],
      metin: sadelestir(`${e.baslik} ${e.ders_kodu ?? ''} ${ETKINLIK_TURU[e.tur]} ${e.yer ?? ''} ${t.format('D MMMM')}`),
    });
  }

  for (const d of duyurular) {
    dizin.push({
      id: `duyuru-${d.id}`,
      tur: 'duyuru',
      baslik: d.baslik,
      alt: `${d.yayinlayan} · ${dayjs(d.tarih).format('D MMMM')}`,
      hedef: '/duyurular',
      kaynak_sistem: d.kaynak_sistem,
      son_senkron: d.son_senkron,
      ayrinti: [
        { etiket: 'Yayınlayan', deger: d.yayinlayan },
        { etiket: 'Tarih', deger: dayjs(d.tarih).format('D MMMM YYYY, HH.mm') },
        { etiket: 'Özet', deger: d.ozet },
      ],
      metin: sadelestir(`${d.baslik} ${d.ozet} ${d.yayinlayan} ${d.ders_kodu ?? ''}`),
    });
  }

  for (const n of notlar) {
    if (n.puan === null) continue;
    const k = dersAdi.get(n.ders_kaydi_id);
    dizin.push({
      id: `not-${n.id}`,
      tur: 'not',
      baslik: `${k?.ders.ad ?? 'Ders'} · ${n.baslik}`,
      alt: `${n.puan} puan · ağırlık %${Math.round(n.agirlik * 100)}`,
      hedef: '/notlar',
      kaynak_sistem: n.kaynak_sistem,
      son_senkron: n.son_senkron,
      ayrinti: [
        { etiket: 'Puan', deger: String(n.puan) },
        { etiket: 'Ağırlık', deger: `%${Math.round(n.agirlik * 100)}` },
      ],
      metin: sadelestir(`${k?.ders.ad ?? ''} ${k?.ders.kod ?? ''} ${n.baslik} not puan ${n.tur}`),
    });
  }
  return dizin;
}

/** Puanlama: başta eşleşme > kelime başında > içinde; sorgudaki her kelime bulunmalı. */
function puan(s: AramaSonucu, kelimeler: string[]): number {
  let toplam = 0;
  const baslik = sadelestir(s.baslik);
  for (const k of kelimeler) {
    const i = s.metin.indexOf(k);
    if (i < 0) return 0;
    if (baslik.startsWith(k)) toplam += 6;
    else if (baslik.includes(` ${k}`)) toplam += 4;
    else if (i === 0 || s.metin[i - 1] === ' ') toplam += 3;
    else toplam += 1;
  }
  return toplam + (s.tur === 'sayfa' ? 0.5 : 0);
}

export function ara(dizin: AramaSonucu[], sorgu: string, enFazla = 6): AramaSonucu[] {
  const kelimeler = sadelestir(sorgu).split(' ').filter(Boolean);
  if (kelimeler.length === 0) return [];
  return dizin
    .map((s) => ({ s, p: puan(s, kelimeler) }))
    .filter((x) => x.p > 0)
    .sort((a, b) => b.p - a.p)
    .slice(0, enFazla * 3)
    .reduce<AramaSonucu[]>((acc, { s }) => {
      // Her gruptan en fazla `enFazla` sonuç
      if (acc.filter((x) => x.tur === s.tur).length < enFazla) acc.push(s);
      return acc;
    }, []);
}
