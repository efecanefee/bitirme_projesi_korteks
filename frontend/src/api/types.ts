/**
 * Korteks API sözleşmesi (istemci tarafı).
 *
 * Alan adları ara rapordaki ER diyagramıyla (Şekil 3) birebir aynıdır ve FastAPI
 * tarafındaki Pydantic şemalarının snake_case Türkçe adlarını izler. Sunucu tarafı
 * bu dosyayla eşleşen OpenAPI belgesi için bkz. ../../docs/openapi.yaml.
 *
 * Tarih/saat alanları ISO 8601 (UTC ofsetli) metin olarak taşınır.
 */

export type KaynakSistem = 'OBS' | 'PUSULA' | 'PSG';
export type Rol = 'ogrenci' | 'yonetici';
export type IsoDateTime = string;
export type IsoDate = string;

// ---------- Kimlik doğrulama (FG-01) ----------

export interface Kullanici {
  id: number;
  ogrenci_no: string | null;
  ad_soyad: string;
  e_posta: string;
  rol: Rol;
  bolum: string | null;
  sinif: number | null;
  /** Son verilen KVKK onayı; yoksa ya da metin sürümü eskiyse istemci onay adımını gösterir. */
  riza: Riza | null;
}

export interface Riza {
  metin_surumu: string;
  tarih: IsoDateTime;
  /** Sohbetlerin anonimleştirilerek değerlendirmede kullanılmasına izin (isteğe bağlı, geri alınabilir). */
  sohbet_degerlendirme: boolean;
}

export interface RizaIstegi {
  metin_surumu: string;
  sohbet_degerlendirme: boolean;
}

export interface GirisIstegi {
  e_posta: string;
  sifre: string;
}

export interface TokenYaniti {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  kullanici: Kullanici;
}

// ---------- Ortak ----------

/** Her öğe hangi sistemden geldiğini ve ne zaman senkronize edildiğini taşır (FG-04). */
export interface KaynakBilgisi {
  kaynak_sistem: KaynakSistem;
  son_senkron: IsoDateTime;
}

export type SenkronDurum = 'basarili' | 'hatali' | 'calisiyor';

export interface SenkronLog {
  id: number;
  kaynak_sistem: KaynakSistem;
  baslangic: IsoDateTime;
  bitis: IsoDateTime | null;
  durum: SenkronDurum;
  hata: string | null;
}

/** Sistem başına son başarılı senkronizasyon özeti (kenar çubuğu, FOG-09). */
export interface SenkronOzeti {
  kaynak_sistem: KaynakSistem;
  son_basarili: IsoDateTime | null;
  durum: SenkronDurum;
}

export interface ApiHata {
  detail: string;
}

export interface Sayfa<T> {
  ogeler: T[];
  toplam: number;
}

// ---------- Dersler ----------

export interface Ders {
  id: number;
  kod: string;
  ad: string;
  kredi: number;
  donem: string;
  ogretim_elemani: string;
  devam_siniri: number;
  gecme_notu: number;
  final_alt_siniri: number | null;
}

export type DersKaydiDurum = 'devam' | 'gecti' | 'kaldi';

export interface DersOturumu {
  gun: 1 | 2 | 3 | 4 | 5 | 6 | 7; // ISO hafta günü, 1 = Pazartesi
  baslangic: string; // "09:00"
  bitis: string; // "10:50"
  yer: string; // "Ayazağa B-204" veya "Sanal sınıf"
  kaynak_sistem: KaynakSistem;
}

export interface DersKaydi {
  id: number;
  ders: Ders;
  durum: DersKaydiDurum;
  harf_notu: string | null;
  program: DersOturumu[];
}

export type DegerlendirmeTur = 'vize' | 'final' | 'odev';

export interface Degerlendirme extends KaynakBilgisi {
  id: number;
  ders_kaydi_id: number;
  tur: DegerlendirmeTur;
  baslik: string;
  agirlik: number; // 0–1
  puan: number | null;
  tarih: IsoDateTime | null;
}

export type DevamDurum = 'katildi' | 'katilmadi' | 'izinli';

export interface Devamsizlik extends KaynakBilgisi {
  id: number;
  ders_kaydi_id: number;
  hafta: number;
  tarih: IsoDate;
  durum: DevamDurum;
}

export interface DevamOzeti {
  ders_kaydi_id: number;
  ders_kodu: string;
  ders_adi: string;
  kullanilan: number;
  sinir: number;
  kaynak_sistem: KaynakSistem;
  son_senkron: IsoDateTime;
}

export type EtkinlikTur = 'sinav' | 'odev' | 'duyuru' | 'materyal' | 'sanal_sinif';

export interface Etkinlik extends KaynakBilgisi {
  id: number;
  ders_id: number | null;
  ders_kodu: string | null;
  tur: EtkinlikTur;
  baslik: string;
  aciklama: string | null;
  tarih: IsoDateTime;
  /** Sınavlar için salon, ödevler için teslim biçimi vb. */
  yer: string | null;
  sure_dk: number | null;
}

export interface Duyuru extends KaynakBilgisi {
  id: number;
  baslik: string;
  ozet: string;
  yayinlayan: string;
  tarih: IsoDateTime;
  ders_kodu: string | null;
  okundu: boolean;
}

export interface DersDetayi {
  kayit: DersKaydi;
  degerlendirmeler: Degerlendirme[];
  devam: Devamsizlik[];
  devam_ozeti: DevamOzeti;
  toplam_hafta: number;
  pusula_etkinlikleri: Etkinlik[];
  duyurular: Duyuru[];
  gecme_kosulu: { aciklama: string; kaynak: string } | null;
}

// ---------- Hesaplama araçları (FG-09) ----------

export interface HesapAdimi {
  etiket: string;
  deger: string;
}

export interface FinalGerekliSonuc {
  ders_kodu: string;
  durum: 'hesaplandi' | 'ulasilamaz' | 'zaten_gecti' | 'veri_yok';
  gerekli: number | null;
  adimlar: HesapAdimi[];
  formul: string;
  kaynak_sistem: KaynakSistem;
  son_senkron: IsoDateTime;
}

// ---------- Panel (FG-04) ----------

export interface PanelOzeti {
  bugunku_dersler: (DersOturumu & { ders_kodu: string; ders_adi: string })[];
  yaklasan: Etkinlik[];
  devam: DevamOzeti[];
  notlar: {
    genel_ortalama: number | null;
    son_notlar: { etiket: string; puan: number; kaynak_sistem: KaynakSistem }[];
    donem: string;
  };
  duyurular: Duyuru[];
  okunmamis_duyuru: number;
  akademik_donem: { ad: string; hafta: number; aciklama: string | null };
}

// ---------- Asistan (FG-07, FG-08, FG-09, FG-11) ----------

export type Niyet = 'belge' | 'kisisel' | 'karma' | 'bulunamadi';

export type YanitKaynagi =
  | {
      tip: 'belge';
      belge_id: number;
      belge_basligi: string;
      belge_turu: BelgeTur;
      madde: string | null;
      sayfa: string | null;
      alinti: string;
      benzerlik: number;
    }
  | {
      tip: 'kisisel_veri';
      baslik: string;
      ozet: string;
      kaynak_sistem: KaynakSistem;
      son_senkron: IsoDateTime;
    }
  | {
      tip: 'arac';
      arac: string;
      formul: string;
    };

export interface SohbetMesaji {
  id: number;
  sohbet_id: number;
  soru: string;
  cevap: string;
  niyet: Niyet;
  kaynaklar: YanitKaynagi[];
  /** "bulunamadı" durumunda yönlendirilecek birim (FG-08). */
  onerilen_birim: string | null;
  geri_bildirim: -1 | 0 | 1;
  sure_ms: number;
  olusturma: IsoDateTime;
}

export interface Sohbet {
  id: number;
  baslik: string;
  son_mesaj: IsoDateTime;
}

export interface SoruIstegi {
  soru: string;
  sohbet_id?: number | null;
  /** Ders sayfasından "Bu dersi asistana sor" ile gelindiyse bağlam. */
  ders_kodu?: string | null;
}

export interface GeriBildirimIstegi {
  deger: -1 | 1;
}

// ---------- Yönetici (FG-06, FG-12) ----------

export type BelgeTur = 'yonetmelik' | 'akademik_takvim' | 'duyuru' | 'sinav_yonergesi' | 'izlence';

export interface Belge {
  id: number;
  ders_id: number | null;
  baslik: string;
  tur: BelgeTur;
  surum: number;
  aktif_mi: boolean;
  yukleme_tarihi: IsoDateTime;
  parca_sayisi: number;
  indeks_durumu: 'bekliyor' | 'isleniyor' | 'hazir' | 'hatali';
}

export interface CevaplanamayanSoru {
  id: number;
  soru: string;
  tarih: IsoDateTime;
  en_yuksek_benzerlik: number;
  tekrar: number;
  cozuldu: boolean;
}

export interface YoneticiIstatistik {
  toplam_soru: number;
  ortalama_sure_ms: number;
  p95_sure_ms: number;
  olumlu_oran: number;
  bulunamadi_oran: number;
  niyet_dagilimi: { niyet: Niyet; sayi: number }[];
  gunluk: { tarih: IsoDate; soru: number; ortalama_sure_ms: number }[];
}
