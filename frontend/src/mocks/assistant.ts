/**
 * Asistan orkestratörünün sahte sürümü (raporda Şekil 4 akışı):
 *   soru → niyet sınıflandırma → (belge: hibrit arama + eşik) | (kişisel: araç) → yanıt
 * Gerçek sınıflandırma/RAG sunucuda (İP-5, İP-6) yapılır; bu dosya arayüzün tüm
 * yanıt türlerini (belge, kişisel, karma, bulunamadı) gösterebilmesi içindir.
 */
import dayjs from '@/lib/dayjs';
import type { DersKaydi, Niyet, SohbetMesaji, YanitKaynagi } from '@/api/types';
import { saat, saatTr } from '@/lib/format';
import { finalGerekliHesapla } from './tools';
import {
  belgeler,
  belgeParcalari,
  cevaplanamayanlar,
  dersKayitlari,
  degerlendirmeler,
  devamKayitlari,
  etkinlikler,
  sonSenkron,
} from './data';

export const BENZERLIK_ESIGI = 0.6;

const kucuk = (s: string) => s.toLocaleLowerCase('tr-TR');

function dersBul(soru: string, dersKodu?: string | null): DersKaydi | undefined {
  if (dersKodu) return dersKayitlari.find((k) => k.ders.kod === dersKodu);
  const q = kucuk(soru);
  return dersKayitlari.find((k) => {
    const ad = kucuk(k.ders.ad);
    const ilkKelime = ad.split(' ')[0] ?? ad;
    return (
      q.includes(kucuk(k.ders.kod)) ||
      q.includes(ad) ||
      q.includes(ilkKelime.slice(0, Math.max(5, ilkKelime.length - 2)))
    );
  });
}

function belgeAra(soru: string) {
  const q = kucuk(soru);
  return belgeParcalari
    .map((p) => {
      const isabet = p.anahtar.filter((a) => q.includes(a)).length;
      const benzerlik = isabet === 0 ? 0.18 + Math.random() * 0.2 : Math.min(0.97, 0.7 + isabet * 0.08);
      return { p, benzerlik: Math.round(benzerlik * 100) / 100 };
    })
    .filter(({ p }) => belgeler.find((b) => b.id === p.belge_id)?.aktif_mi)
    .sort((a, b) => b.benzerlik - a.benzerlik)
    .slice(0, 5);
}

interface Parca {
  metin: string;
  kaynaklar: YanitKaynagi[];
}

function finalYaniti(k: DersKaydi): Parca {
  const notlar = degerlendirmeler.filter((d) => d.ders_kaydi_id === k.id);
  const s = finalGerekliHesapla(k.ders, notlar, sonSenkron.OBS);
  const girilen = notlar.filter((n) => n.tur !== 'final' && n.puan !== null);
  const final = notlar.find((n) => n.tur === 'final');
  const ozet = girilen.map((n) => `${n.baslik} ${n.puan}`).join(' · ');
  const kaynaklar: YanitKaynagi[] = [
    { tip: 'kisisel_veri', baslik: `${k.ders.kod} · notlar`, ozet: ozet || 'Henüz not girilmedi', kaynak_sistem: 'OBS', son_senkron: sonSenkron.OBS },
  ];
  if (s.formul) kaynaklar.push({ tip: 'arac', arac: 'final_gerekli_puan', formul: s.formul });

  let metin: string;
  switch (s.durum) {
    case 'veri_yok':
      metin = `${k.ders.kod} için henüz final öncesi notun girilmemiş, bu yüzden hesap yapamıyorum. Ara sınav notun OBS'ye girildiğinde tekrar sorabilirsin.`;
      break;
    case 'ulasilamaz':
      metin = `${k.ders.kod}'de mevcut notlarınla finalden 100 alsan bile geçme notu olan ${k.ders.gecme_notu}'a ulaşılamıyor. Bütünleme koşulları için yönetmeliğin 25. maddesine bakabilirsin.`;
      break;
    case 'zaten_gecti':
      metin = `${k.ders.kod}'de mevcut notların geçme notunu zaten karşılıyor; finalde yönetmelikteki alt sınır dışında ek puan gerekmiyor.`;
      break;
    default:
      metin = `${k.ders.kod}'de ${ozet.toLocaleLowerCase('tr-TR')}. Final %${Math.round((final?.agirlik ?? 0) * 100)} ağırlıklı ve geçme notu ${k.ders.gecme_notu} olduğu için **finalden en az ${s.gerekli}** alman gerekiyor.`;
  }
  return { metin, kaynaklar };
}

function devamYaniti(k: DersKaydi): Parca {
  const kayit = devamKayitlari.filter((d) => d.ders_kaydi_id === k.id);
  const kullanilan = kayit.filter((d) => d.durum === 'katilmadi').length;
  const kalan = k.ders.devam_siniri - kullanilan;
  const metin =
    kalan <= 0
      ? `${k.ders.kod}'de devam hakkının tamamını (${k.ders.devam_siniri}) kullandın. Bir devamsızlık daha olursa final sınavına giremezsin; danışmanınla görüşmeni öneririm.`
      : kalan === 1
        ? `${k.ders.kod}'de ${k.ders.devam_siniri} devam hakkından ${kullanilan} tanesini kullandın. Bir devamsızlık daha yaparsan devam hakkın dolacak ve final sınavına giremezsin.`
        : `${k.ders.kod}'de ${k.ders.devam_siniri} devam hakkının ${kullanilan} tanesini kullandın, ${kalan} hakkın kaldı.`;
  return {
    metin,
    kaynaklar: [
      { tip: 'kisisel_veri', baslik: `${k.ders.kod} · devam`, ozet: `Devamsızlık ${kullanilan} / ${k.ders.devam_siniri}`, kaynak_sistem: 'OBS', son_senkron: sonSenkron.OBS },
    ],
  };
}

function yaklasanYaniti(): Parca {
  const simdi = dayjs();
  const liste = etkinlikler
    .filter((e) => (e.tur === 'sinav' || e.tur === 'odev') && dayjs(e.tarih).isAfter(simdi) && dayjs(e.tarih).isBefore(simdi.add(7, 'day')))
    .sort((a, b) => a.tarih.localeCompare(b.tarih));
  if (liste.length === 0) return { metin: 'Önümüzdeki 7 günde sınav veya ödev teslimin görünmüyor.', kaynaklar: [] };
  const satirlar = liste.map((e) => `- ${dayjs(e.tarih).format('D MMMM dddd')} ${saatTr(saat(e.tarih))}: ${e.baslik}${e.yer ? ` (${e.yer})` : ''}`);
  return {
    metin: `Önümüzdeki 7 günde ${liste.length} işin var:\n${satirlar.join('\n')}`,
    kaynaklar: [
      { tip: 'kisisel_veri', baslik: 'Yaklaşan sınav ve ödevler', ozet: `${liste.length} etkinlik · PSG ve Pusula`, kaynak_sistem: 'PSG', son_senkron: sonSenkron.PSG },
      { tip: 'arac', arac: 'yaklasan_etkinlikler', formul: 'tarih ∈ [bugün, bugün + 7 gün], tür ∈ {sınav, ödev}' },
    ],
  };
}

function salonYaniti(k: DersKaydi | undefined): Parca | null {
  const sinav = etkinlikler
    .filter((e) => e.tur === 'sinav' && dayjs(e.tarih).isAfter(dayjs()) && (!k || e.ders_id === k.ders.id))
    .sort((a, b) => a.tarih.localeCompare(b.tarih))[0];
  if (!sinav) return null;
  return {
    metin: `${sinav.baslik} ${dayjs(sinav.tarih).format('D MMMM dddd')} saat ${saatTr(saat(sinav.tarih))}'da **${sinav.yer}** salonunda, süresi ${sinav.sure_dk} dakika.`,
    kaynaklar: [
      { tip: 'kisisel_veri', baslik: `${sinav.ders_kodu} · sınav bilgisi`, ozet: `${sinav.yer} · ${sinav.sure_dk} dk`, kaynak_sistem: 'PSG', son_senkron: sonSenkron.PSG },
    ],
  };
}

export function yanitUret(soru: string, dersKodu?: string | null) {
  const q = kucuk(soru);
  const k = dersBul(soru, dersKodu);
  const parcalar: Parca[] = [];
  let kisisel = false;

  if (/(final|geçmek|geçebil|kaç alma)/.test(q) && /(kaç|gerek|lazım|geç)/.test(q)) {
    kisisel = true;
    const hedef = k ? [k] : dersKayitlari.filter((d) => degerlendirmeler.some((n) => n.ders_kaydi_id === d.id && n.tur !== 'final' && n.puan !== null));
    hedef.slice(0, k ? 1 : 3).forEach((d) => parcalar.push(finalYaniti(d)));
  }
  if (/(devam|devamsızlık|hakkım)/.test(q) && !/yönetmelik/.test(q)) {
    kisisel = true;
    if (k) parcalar.push(devamYaniti(k));
    else dersKayitlari.filter((d) => devamKayitlari.some((x) => x.ders_kaydi_id === d.id && x.durum === 'katilmadi')).forEach((d) => parcalar.push(devamYaniti(d)));
  }
  if (/(bu hafta|yaklaşan|neyim var|teslim)/.test(q)) {
    kisisel = true;
    parcalar.push(yaklasanYaniti());
  }
  if (/(salon|nerede|hangi sınıf)/.test(q)) {
    const s = salonYaniti(k);
    if (s) {
      kisisel = true;
      parcalar.push(s);
    }
  }

  // Belge araması: kişisel bir araç devreye girmediyse veya soru açıkça kural soruyorsa
  const sonuclar = belgeAra(soru);
  const enIyi = sonuclar[0];
  const kuralSorusu = /(yönetmelik|kural|hangi durum|kimler|ne zaman|nasıl başvur|şart|koşul)/.test(q);
  let belgeKullanildi = false;
  if (enIyi && enIyi.benzerlik >= BENZERLIK_ESIGI && (!kisisel || kuralSorusu)) {
    belgeKullanildi = true;
    const ilgili = sonuclar.filter((s) => s.benzerlik >= BENZERLIK_ESIGI).slice(0, 2);
    parcalar.push({
      metin: ilgili.map((s) => s.p.metin.replace(/^Madde \d+ – /, '')).join('\n\n'),
      kaynaklar: ilgili.map(({ p, benzerlik }) => {
        const b = belgeler.find((x) => x.id === p.belge_id)!;
        return {
          tip: 'belge' as const,
          belge_id: b.id,
          belge_basligi: b.baslik,
          belge_turu: b.tur,
          madde: p.madde,
          sayfa: p.sayfa,
          alinti: p.metin.slice(0, 160),
          benzerlik,
        };
      }),
    });
  }

  let niyet: Niyet;
  if (parcalar.length === 0) {
    niyet = 'bulunamadi';
    const var_ = cevaplanamayanlar.find((c) => kucuk(c.soru) === q);
    if (var_) var_.tekrar += 1;
    else
      cevaplanamayanlar.unshift({
        id: Date.now(),
        soru,
        tarih: new Date().toISOString(),
        en_yuksek_benzerlik: enIyi?.benzerlik ?? 0,
        tekrar: 1,
        cozuldu: false,
      });
  } else niyet = kisisel && belgeKullanildi ? 'karma' : kisisel ? 'kisisel' : 'belge';

  const cevap =
    niyet === 'bulunamadi'
      ? 'Bu sorunun yanıtını erişebildiğim belgelerde ve senin verilerinde bulamadım. Tahmin yürütmek yerine ilgili birime sormanı öneririm.'
      : parcalar.map((p) => p.metin).join('\n\n');

  return {
    cevap,
    niyet,
    kaynaklar: parcalar.flatMap((p) => p.kaynaklar),
    onerilen_birim: niyet === 'bulunamadi' ? 'Öğrenci İşleri Daire Başkanlığı · ogrenciisleri@beykent.edu.tr' : null,
  } satisfies Pick<SohbetMesaji, 'cevap' | 'niyet' | 'kaynaklar' | 'onerilen_birim'>;
}

