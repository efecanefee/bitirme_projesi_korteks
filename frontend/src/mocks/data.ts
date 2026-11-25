/**
 * Sahte veri servisi (rapor B2 yaklaşımı). Gerçek OBS/Pusula/PSG erişimi gelene kadar
 * adaptörlerle aynı şekle sahip, gerçekçi ama tamamen sentetik veri üretir.
 * Tarihler "bugün"e göre göreli üretilir; demo her gün canlı görünür.
 * İçerikteki kişi adları kurgusaldır.
 */
import dayjs from '@/lib/dayjs';
import type {
  Belge,
  CevaplanamayanSoru,
  DersKaydi,
  Degerlendirme,
  Devamsizlik,
  Duyuru,
  Etkinlik,
  KaynakSistem,
  Kullanici,
  SenkronLog,
  Sohbet,
  SohbetMesaji,
} from '@/api/types';

const bugun = () => dayjs();
export const AKTIF_HAFTA = 9;
export const TOPLAM_HAFTA = 14;
export const DONEM = '2026–2027 Güz';

/** Dönemin 1. haftasının pazartesisi, aktif haftaya göre geriye hesaplanır. */
export const donemBaslangici = () =>
  bugun().startOf('isoWeek').subtract(AKTIF_HAFTA - 1, 'week');

export const sonSenkron: Record<KaynakSistem, string> = {
  OBS: bugun().subtract(23, 'minute').toISOString(),
  PUSULA: bugun().subtract(26, 'minute').toISOString(),
  PSG: bugun().subtract(88, 'minute').toISOString(),
};

// ---------- Kullanıcılar ----------

export const kullanicilar: (Kullanici & { sifre: string })[] = [
  {
    id: 1,
    ogrenci_no: '2303022001',
    ad_soyad: 'Deniz Yılmaz',
    e_posta: 'deniz.yilmaz@ogr.beykent.edu.tr',
    rol: 'ogrenci',
    bolum: 'Bilgisayar Müh.',
    sinif: 3,
    riza: null,
    sifre: 'korteks123',
  },
  {
    id: 2,
    ogrenci_no: null,
    ad_soyad: 'Sistem Yöneticisi',
    e_posta: 'yonetici@beykent.edu.tr',
    rol: 'yonetici',
    bolum: null,
    sinif: null,
    riza: null,
    sifre: 'yonetici123',
  },
];

// ---------- Dersler ----------

const ders = (
  id: number,
  kod: string,
  ad: string,
  kredi: number,
  ogretim_elemani: string,
): DersKaydi['ders'] => ({
  id,
  kod,
  ad,
  kredi,
  donem: DONEM,
  ogretim_elemani,
  devam_siniri: 4,
  gecme_notu: 60,
  final_alt_siniri: null,
});

export const dersKayitlari: DersKaydi[] = [
  {
    id: 11,
    ders: ders(1, 'BİL301', 'Algoritma Analizi', 4, 'Prof. Dr. Murat Şen'),
    durum: 'devam',
    harf_notu: null,
    program: [{ gun: 1, baslangic: '10:00', bitis: '11:50', yer: 'Ayazağa D-301', kaynak_sistem: 'OBS' }],
  },
  {
    id: 12,
    ders: ders(2, 'BİL303', 'Veritabanı Sistemleri', 4, 'Dr. Öğr. Üyesi Elif Arslan'),
    durum: 'devam',
    harf_notu: null,
    program: [{ gun: 3, baslangic: '09:00', bitis: '10:50', yer: 'Ayazağa B-204', kaynak_sistem: 'OBS' }],
  },
  {
    id: 13,
    ders: ders(3, 'BİL305', 'İşletim Sistemleri', 4, 'Doç. Dr. Kerem Öz'),
    durum: 'devam',
    harf_notu: null,
    program: [{ gun: 3, baslangic: '11:00', bitis: '12:50', yer: 'Sanal sınıf', kaynak_sistem: 'PUSULA' }],
  },
  {
    id: 14,
    ders: ders(4, 'BİL307', 'Yazılım Mühendisliği', 3, 'Dr. Öğr. Üyesi Can Demir'),
    durum: 'devam',
    harf_notu: null,
    program: [
      { gun: 3, baslangic: '14:00', bitis: '15:50', yer: 'Ayazağa A-112', kaynak_sistem: 'OBS' },
      { gun: 4, baslangic: '09:00', bitis: '09:50', yer: 'Ayazağa A-112', kaynak_sistem: 'OBS' },
    ],
  },
  {
    id: 15,
    ders: { ...ders(5, 'MAT301', 'Olasılık ve İstatistik', 3, 'Dr. Öğr. Üyesi Selin Aydın') },
    durum: 'devam',
    harf_notu: null,
    program: [{ gun: 2, baslangic: '13:00', bitis: '14:50', yer: 'Ayazağa C-105', kaynak_sistem: 'OBS' }],
  },
];

// ---------- Değerlendirmeler (OBS) ----------

let degId = 100;
const deg = (
  ders_kaydi_id: number,
  tur: Degerlendirme['tur'],
  baslik: string,
  agirlik: number,
  puan: number | null,
  tarih: dayjs.Dayjs | null,
  kaynak: KaynakSistem = 'OBS',
): Degerlendirme => ({
  id: ++degId,
  ders_kaydi_id,
  tur,
  baslik,
  agirlik,
  puan,
  tarih: tarih ? tarih.toISOString() : null,
  kaynak_sistem: kaynak,
  son_senkron: sonSenkron[kaynak],
});

const g = (gun: number, saat = '10:00') => {
  const [h, m] = saat.split(':').map(Number);
  return bugun().startOf('day').add(gun, 'day').hour(h ?? 0).minute(m ?? 0);
};

export const degerlendirmeler: Degerlendirme[] = [
  deg(11, 'vize', 'Ara sınav', 0.3, null, g(1, '10:00')),
  deg(11, 'odev', 'Ödev 1', 0.2, 85, g(-12, '23:59')),
  deg(11, 'final', 'Final sınavı', 0.5, null, null),
  deg(12, 'vize', 'Ara sınav', 0.3, 64, g(-8, '09:00')),
  deg(12, 'odev', 'Ödev 1', 0.1, 82, g(-15, '23:59')),
  deg(12, 'odev', 'ER diyagramı ödevi', 0.1, null, g(3, '23:59')),
  deg(12, 'final', 'Final sınavı', 0.5, null, null),
  deg(13, 'vize', 'Ara sınav', 0.4, 55, g(-6, '13:00')),
  deg(13, 'final', 'Final sınavı', 0.6, null, null),
  deg(14, 'vize', 'Ara sınav', 0.3, 78, g(-9, '14:00')),
  deg(14, 'odev', 'Dönem projesi', 0.3, null, g(20, '23:59')),
  deg(14, 'final', 'Final sınavı', 0.4, null, null),
  deg(15, 'vize', 'Ara sınav', 0.4, 48, g(-8, '13:00')),
  deg(15, 'final', 'Final sınavı', 0.6, null, null),
];

// ---------- Devam (OBS) ----------

const yoklamaDeseni: Record<number, number[]> = {
  11: [4],
  12: [2, 6],
  13: [],
  14: [5],
  15: [3, 5, 7],
};

export const devamKayitlari: Devamsizlik[] = dersKayitlari.flatMap((k) => {
  const gun = k.program[0]?.gun ?? 1;
  return Array.from({ length: AKTIF_HAFTA - 1 }, (_, i) => {
    const hafta = i + 1;
    return {
      id: k.id * 100 + hafta,
      ders_kaydi_id: k.id,
      hafta,
      tarih: donemBaslangici().add(i, 'week').isoWeekday(gun).format('YYYY-MM-DD'),
      durum: (yoklamaDeseni[k.id] ?? []).includes(hafta) ? ('katilmadi' as const) : ('katildi' as const),
      kaynak_sistem: 'OBS' as const,
      son_senkron: sonSenkron.OBS,
    };
  });
});

// ---------- Etkinlikler (PSG sınavları, Pusula ödev/materyal) ----------

let etkId = 500;
const etk = (
  e: Omit<Etkinlik, 'id' | 'son_senkron' | 'tarih' | 'aciklama' | 'yer' | 'sure_dk'> & {
    tarih: dayjs.Dayjs;
    aciklama?: string | null;
    yer?: string | null;
    sure_dk?: number | null;
  },
): Etkinlik => ({
  aciklama: null,
  yer: null,
  sure_dk: null,
  ...e,
  id: ++etkId,
  tarih: e.tarih.toISOString(),
  son_senkron: sonSenkron[e.kaynak_sistem],
});

export const etkinlikler: Etkinlik[] = [
  etk({ ders_id: 1, ders_kodu: 'BİL301', tur: 'sinav', baslik: 'Algoritma Analizi ara sınavı', tarih: g(1, '10:00'), yer: 'Ayazağa D-301', sure_dk: 75, kaynak_sistem: 'PSG' }),
  etk({ ders_id: 2, ders_kodu: 'BİL303', tur: 'odev', baslik: 'ER diyagramı ödevi teslimi', tarih: g(3, '23:59'), yer: 'PDF yükleme', kaynak_sistem: 'PUSULA' }),
  etk({ ders_id: 5, ders_kodu: 'MAT301', tur: 'odev', baslik: 'Problem seti 3', tarih: g(5, '23:59'), yer: 'Pusula ödev alanı', kaynak_sistem: 'PUSULA' }),
  etk({ ders_id: 4, ders_kodu: 'BİL307', tur: 'sinav', baslik: 'Yazılım Mühendisliği kısa sınavı', tarih: g(6, '14:00'), yer: 'Ayazağa A-112', sure_dk: 30, kaynak_sistem: 'PSG' }),
  etk({ ders_id: 3, ders_kodu: 'BİL305', tur: 'odev', baslik: 'Süreç zamanlama simülasyonu', tarih: g(10, '23:59'), yer: 'Kod + rapor', kaynak_sistem: 'PUSULA' }),
  etk({ ders_id: 4, ders_kodu: 'BİL307', tur: 'odev', baslik: 'Dönem projesi teslimi', tarih: g(20, '23:59'), yer: 'GitHub bağlantısı', kaynak_sistem: 'PUSULA' }),
  etk({ ders_id: 2, ders_kodu: 'BİL303', tur: 'sinav', baslik: 'Veritabanı Sistemleri ara sınavı', tarih: g(-8, '09:00'), yer: 'Ayazağa B-204', sure_dk: 90, kaynak_sistem: 'PSG' }),
  etk({ ders_id: 5, ders_kodu: 'MAT301', tur: 'sinav', baslik: 'Olasılık ve İstatistik ara sınavı', tarih: g(-8, '13:00'), yer: 'Ayazağa C-105', sure_dk: 90, kaynak_sistem: 'PSG' }),
  etk({ ders_id: 5, ders_kodu: 'MAT301', tur: 'materyal', baslik: `Hafta ${AKTIF_HAFTA - 1} ders notları.pdf`, tarih: g(-4, '16:20'), kaynak_sistem: 'PUSULA' }),
  etk({ ders_id: 5, ders_kodu: 'MAT301', tur: 'sanal_sinif', baslik: `Sanal sınıf kaydı · Hafta ${AKTIF_HAFTA - 2}`, aciklama: '96 dk · İzlenmedi', tarih: g(-9, '13:00'), kaynak_sistem: 'PUSULA' }),
  etk({ ders_id: 3, ders_kodu: 'BİL305', tur: 'sanal_sinif', baslik: `Sanal sınıf kaydı · Hafta ${AKTIF_HAFTA - 1}`, aciklama: '104 dk · İzlendi', tarih: g(-7, '11:00'), kaynak_sistem: 'PUSULA' }),
  etk({ ders_id: 2, ders_kodu: 'BİL303', tur: 'materyal', baslik: 'Normalizasyon sunumu.pdf', tarih: g(-2, '10:00'), kaynak_sistem: 'PUSULA' }),
  etk({ ders_id: 1, ders_kodu: 'BİL301', tur: 'materyal', baslik: 'Dinamik programlama örnekleri.pdf', tarih: g(-3, '12:00'), kaynak_sistem: 'PUSULA' }),
];

// ---------- Duyurular ----------

export const duyurular: Duyuru[] = [
  { id: 901, baslik: 'Mazeret sınavı başvuruları başladı', ozet: `Başvurular ${g(6).format('D MMMM')} tarihine kadar dilekçeyle yapılır.`, yayinlayan: 'Öğrenci İşleri', tarih: g(-1, '09:30').toISOString(), ders_kodu: null, okundu: false, kaynak_sistem: 'PUSULA', son_senkron: sonSenkron.PUSULA },
  { id: 902, baslik: 'BİL301 sınav salonu değişti', ozet: 'Sınav D-301 salonunda yapılacaktır.', yayinlayan: 'Sınav Koordinatörlüğü', tarih: g(0, '10:12').toISOString(), ders_kodu: 'BİL301', okundu: false, kaynak_sistem: 'PSG', son_senkron: sonSenkron.PSG },
  { id: 903, baslik: 'Bahar dönemi ders kaydı takvimi', ozet: 'Akademik takvim · Kayıtlar 2–6 Şubat 2027', yayinlayan: 'Öğrenci İşleri', tarih: g(-3, '14:00').toISOString(), ders_kodu: null, okundu: false, kaynak_sistem: 'OBS', son_senkron: sonSenkron.OBS },
  { id: 904, baslik: 'MAT301 problem seti 3 yayımlandı', ozet: 'Teslim bir hafta içinde Pusula üzerinden yapılır.', yayinlayan: 'Dr. Öğr. Üyesi Selin Aydın', tarih: g(-2, '17:45').toISOString(), ders_kodu: 'MAT301', okundu: false, kaynak_sistem: 'PUSULA', son_senkron: sonSenkron.PUSULA },
  { id: 905, baslik: 'Kütüphane sınav dönemi çalışma saatleri', ozet: 'Ara sınav haftalarında kütüphane 24 saat açıktır.', yayinlayan: 'Kütüphane', tarih: g(-6, '11:00').toISOString(), ders_kodu: null, okundu: true, kaynak_sistem: 'PUSULA', son_senkron: sonSenkron.PUSULA },
];

// ---------- RAG belgeleri (yönetici paneli + asistan) ----------

export const belgeler: Belge[] = [
  { id: 1, ders_id: null, baslik: 'Ön Lisans ve Lisans Eğitim-Öğretim Yönetmeliği', tur: 'yonetmelik', surum: 3, aktif_mi: true, yukleme_tarihi: g(-40).toISOString(), parca_sayisi: 142, indeks_durumu: 'hazir' },
  { id: 2, ders_id: null, baslik: '2026–2027 Akademik Takvim', tur: 'akademik_takvim', surum: 1, aktif_mi: true, yukleme_tarihi: g(-60).toISOString(), parca_sayisi: 18, indeks_durumu: 'hazir' },
  { id: 3, ders_id: null, baslik: 'Sınav Uygulama Yönergesi', tur: 'sinav_yonergesi', surum: 2, aktif_mi: true, yukleme_tarihi: g(-35).toISOString(), parca_sayisi: 37, indeks_durumu: 'hazir' },
  { id: 4, ders_id: 5, baslik: 'MAT301 Ders İzlencesi', tur: 'izlence', surum: 1, aktif_mi: true, yukleme_tarihi: g(-55).toISOString(), parca_sayisi: 6, indeks_durumu: 'hazir' },
  { id: 5, ders_id: null, baslik: 'Mazeret Sınavı Duyurusu', tur: 'duyuru', surum: 1, aktif_mi: true, yukleme_tarihi: g(-1).toISOString(), parca_sayisi: 2, indeks_durumu: 'hazir' },
  { id: 6, ders_id: null, baslik: 'Ön Lisans ve Lisans Eğitim-Öğretim Yönetmeliği', tur: 'yonetmelik', surum: 2, aktif_mi: false, yukleme_tarihi: g(-400).toISOString(), parca_sayisi: 139, indeks_durumu: 'hazir' },
];

export interface BelgeParcasi {
  belge_id: number;
  madde: string | null;
  sayfa: string | null;
  metin: string;
  anahtar: string[];
}

export const belgeParcalari: BelgeParcasi[] = [
  { belge_id: 1, madde: 'Madde 24', sayfa: '14', anahtar: ['mazeret', 'rapor', 'vefat', 'giremedi', 'giremez'], metin: 'Madde 24 – Haklı ve geçerli mazeret nedeniyle sınava giremeyen öğrenciye, mazeretinin ilgili yönetim kurulunca kabulü hâlinde mazeret sınavı hakkı verilir. Sağlık raporu, birinci derece yakının vefatı ve üniversiteyi resmî olarak temsil haklı mazeret sayılır. Başvuru sınav tarihinden itibaren 5 iş günü içinde belgeyle birlikte dilekçeyle yapılır.' },
  { belge_id: 1, madde: 'Madde 22', sayfa: '13', anahtar: ['geçme', 'geçmek', 'başarı', 'dönem sonu', 'harf'], metin: 'Madde 22 – Bir dersten başarılı sayılmak için dönem sonu notunun en az 60 olması gerekir. Dönem sonu notu ara sınav, ödev ve final notlarının izlencede belirtilen ağırlıklarla toplanmasıyla bulunur.' },
  { belge_id: 1, madde: 'Madde 25', sayfa: '15', anahtar: ['bütünleme', 'büt'], metin: 'Madde 25 – Final sınavına girme hakkı kazanıp dersten başarısız olan veya final sınavına girmeyen öğrenciler bütünleme sınavına girebilir. Bütünleme notu final notunun yerine geçer.' },
  { belge_id: 1, madde: 'Madde 18', sayfa: '10', anahtar: ['devam', 'devamsızlık', 'yoklama', 'hak'], metin: 'Madde 18 – Öğrenciler teorik derslerin en az %70’ine devam etmek zorundadır. Devam koşulunu sağlamayan öğrenci o dersin final ve bütünleme sınavlarına giremez.' },
  { belge_id: 2, madde: null, sayfa: '2', anahtar: ['ders kaydı', 'kayıt', 'bahar', 'şubat'], metin: 'Bahar dönemi ders kayıtları 2–6 Şubat 2027 tarihleri arasında OBS üzerinden yapılır; danışman onayları 9 Şubat 2027’ye kadar tamamlanır.' },
  { belge_id: 2, madde: null, sayfa: '1', anahtar: ['final', 'yarıyıl sonu', 'ocak', 'final tarihleri'], metin: 'Güz dönemi yarıyıl sonu (final) sınavları 4–17 Ocak 2027, bütünleme sınavları 25–31 Ocak 2027 tarihleri arasında yapılır.' },
  { belge_id: 3, madde: 'Madde 9', sayfa: '4', anahtar: ['kimlik', 'sınava geç', 'geç kalma', 'sınav kuralları'], metin: 'Madde 9 – Öğrenciler sınava öğrenci kimlik kartı ile girer. Sınavın ilk 15 dakikasından sonra sınav salonuna öğrenci alınmaz.' },
  { belge_id: 5, madde: null, sayfa: '1', anahtar: ['mazeret', 'başvuru', 'son tarih', 'dilekçe'], metin: `Güz dönemi ara sınav mazeret başvuruları ${g(6).format('D MMMM')} tarihine kadar Öğrenci İşleri’ne dilekçeyle yapılır.` },
];

// ---------- Asistan geçmişi ----------

export const sohbetler: Sohbet[] = [];
export const mesajlar: SohbetMesaji[] = [];

export const cevaplanamayanlar: CevaplanamayanSoru[] = [
  { id: 1, soru: 'Yaz okulunda başka üniversiteden ders alabilir miyim?', tarih: g(-2).toISOString(), en_yuksek_benzerlik: 0.41, tekrar: 7, cozuldu: false },
  { id: 2, soru: 'Kampüs servis saatleri değişti mi?', tarih: g(-1).toISOString(), en_yuksek_benzerlik: 0.22, tekrar: 4, cozuldu: false },
  { id: 3, soru: 'Çift anadal başvurusu için not ortalaması kaç olmalı?', tarih: g(-5).toISOString(), en_yuksek_benzerlik: 0.53, tekrar: 3, cozuldu: false },
  { id: 4, soru: 'Staj defteri ne zaman teslim edilir?', tarih: g(-9).toISOString(), en_yuksek_benzerlik: 0.48, tekrar: 2, cozuldu: true },
];

export const senkronLoglari: SenkronLog[] = (['OBS', 'PUSULA', 'PSG'] as const).flatMap((s, i) =>
  Array.from({ length: 4 }, (_, j) => {
    const bas = dayjs(sonSenkron[s]).subtract(j * 6, 'hour');
    const hatali = s === 'PSG' && j === 1;
    return {
      id: (i + 1) * 100 + j,
      kaynak_sistem: s,
      baslangic: bas.subtract(40, 'second').toISOString(),
      bitis: bas.toISOString(),
      durum: hatali ? ('hatali' as const) : ('basarili' as const),
      hata: hatali ? 'Kaynak sistem zaman aşımı (30 sn). Son başarılı veri gösteriliyor.' : null,
    };
  }),
);
