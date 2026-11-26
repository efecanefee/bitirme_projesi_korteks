/**
 * KVKK aydınlatma metni – TASLAK.
 *
 * Üniversiteden resmî metin gelene kadar kullanılır. 6698 sayılı Kanun'un 10. maddesindeki
 * aydınlatma unsurlarını (veri sorumlusu, amaç, aktarım, toplama yöntemi ve hukuki sebep,
 * 11. madde hakları) kapsar. Köşeli parantezli alanlar üniversite tarafından doldurulacaktır.
 *
 * Metin değiştiğinde SURUM artırılır; istemci eski sürümü onaylamış öğrenciden yeniden onay ister.
 */

export const KVKK_SURUM = 'taslak-2026-11-26';
export const KVKK_TASLAK = true;

export interface Bolum {
  baslik: string;
  paragraflar?: string[];
  maddeler?: string[];
}

export const KVKK_BASLIK = 'Korteks Kişisel Verilerin Korunması Aydınlatma Metni';

export const KVKK_BOLUMLER: Bolum[] = [
  {
    baslik: '1. Veri sorumlusu',
    paragraflar: [
      'Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusu sıfatıyla İstanbul Beykent Üniversitesi tarafından işlenmektedir. [Adres, KEP adresi ve iletişim bilgileri üniversite tarafından eklenecektir.]',
      'Korteks, Bilgisayar Mühendisliği Bölümü tasarım projesi kapsamında geliştirilen ve PSG, Pusula ve OBS sistemlerindeki bilgilerinizi tek panelde gösteren bir öğrenci platformudur.',
    ],
  },
  {
    baslik: '2. İşlenen kişisel veriler',
    maddeler: [
      'Kimlik ve iletişim: ad soyad, öğrenci numarası, üniversite e-posta adresi, bölüm ve sınıf.',
      'Eğitim bilgileri: kayıtlı dersler, ders programı, sınav ve ödev notları, devamsızlık kayıtları, sınav tarihleri ve salonları, ders duyuruları.',
      'Asistan kullanım bilgileri: asistana sorduğunuz sorular, verilen yanıtlar, yanıtların dayandığı kaynaklar, yanıt süresi ve yanıtlara verdiğiniz geri bildirim.',
      'İşlem güvenliği bilgileri: oturum açma zamanları ve sistem kayıtları.',
    ],
  },
  {
    baslik: '3. İşleme amaçları',
    maddeler: [
      'PSG, Pusula ve OBS bilgilerinizi tek panelde, kaynak sistem ve güncelleme zamanıyla göstermek.',
      'Akademik sorularınızı yönetmelik ve akademik takvim gibi belgelere dayanarak yanıtlamak.',
      'Finalden gereken puan, kalan devamsızlık hakkı ve yaklaşan sınavlar gibi hesaplamaları yalnızca sizin verinizle yapmak.',
      'Platformun güvenliğini sağlamak, hataları tespit etmek ve performansını ölçmek.',
      'Yalnızca ayrıca izin vermeniz hâlinde: sohbet kayıtlarını anonimleştirerek asistanın doğruluğunu değerlendirmek.',
    ],
  },
  {
    baslik: '4. Toplama yöntemi ve hukuki sebep',
    paragraflar: [
      'Eğitim bilgileriniz, üniversitenin PSG, Pusula ve OBS sistemlerinden yalnızca okuma yetkisiyle ve otomatik yollarla alınır; sizin şifrenizle sayfa kazıma yapılmaz ve kaynak sistem şifreniz saklanmaz. Asistan kullanım bilgileri, platformu kullanırken elektronik ortamda toplanır.',
      "Verileriniz KVKK'nın 5. maddesinde sayılan hukuki sebeplere dayanılarak işlenir. Sohbet kayıtlarının değerlendirmede kullanılması ise yalnızca açık rızanıza dayanır ve bu rızayı istediğiniz zaman geri alabilirsiniz. [Her amaç için dayanılan hukuki sebep üniversitenin hukuk birimi tarafından teyit edilecektir.]",
    ],
  },
  {
    baslik: '5. Yapay zekâ hizmeti ve aktarım',
    paragraflar: [
      'Asistan, yanıt üretmek için bir büyük dil modeli hizmetinden yararlanır. Bu hizmete adınız ve öğrenci numaranız gönderilmez. Kişisel hesaplamalar üniversite sunucusunda yapılır; dil modeline yalnızca sorunuzun metni, ilgili belge parçaları ve hesaplamanın sonucu iletilir.',
      "Dil modeli hizmet sağlayıcısının sunucuları yurt dışında bulunabilir. Bu durumda aktarım KVKK'nın 9. maddesindeki şartlara uygun olarak yapılır. [Hizmet sağlayıcı ve aktarım dayanağı üniversite tarafından belirtilecektir.]",
      'Kişisel verileriniz, yasal zorunluluklar dışında üçüncü kişilerle paylaşılmaz ve ticari amaçla kullanılmaz.',
    ],
  },
  {
    baslik: '6. Saklama süresi',
    paragraflar: [
      'Eğitim bilgileriniz kaynak sistemlerle eşitlenerek tutulur ve platform kullanımınız sona erdiğinde silinir. Sohbet geçmişiniz [süre üniversite tarafından belirlenecektir] boyunca saklanır; değerlendirmede kullanılan kayıtlar kimliğinizle ilişkilendirilemeyecek biçimde anonimleştirilir.',
      'Bağlantınız koptuğunda son verilerinizi gösterebilmek için ders, not, devam, sınav ve duyuru bilgileriniz en fazla 7 gün süreyle yalnızca kendi cihazınızda (tarayıcı depolamasında) tutulur. Çıkış yaptığınızda, onayınızı geri aldığınızda veya Gizlilik sayfasındaki "Cihazdaki verileri sil" düğmesine bastığınızda bu kopya silinir. Tema, bildirim eşikleri gibi arayüz tercihleri de cihazınızda tutulur ve kişisel veri içermez.',
    ],
  },
  {
    baslik: '7. KVKK 11. madde kapsamındaki haklarınız',
    maddeler: [
      'Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse buna ilişkin bilgi talep etme,',
      'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,',
      'Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,',
      'Eksik veya yanlış işlenmişse düzeltilmesini isteme,',
      "KVKK'nın 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,",
      'Düzeltme ve silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme,',
      'Münhasıran otomatik sistemlerle analiz edilmesi sonucunda aleyhinize bir sonuç çıkmasına itiraz etme,',
      'Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme.',
    ],
  },
  {
    baslik: '8. Başvuru',
    paragraflar: [
      'Haklarınızla ilgili taleplerinizi [üniversitenin KVKK başvuru adresi ve yöntemi] üzerinden iletebilirsiniz. Sohbet kayıtlarının değerlendirmede kullanılmasına ilişkin izninizi Korteks içinde "Gizlilik ve KVKK" sayfasından istediğiniz zaman geri alabilirsiniz.',
      'Asistanın yanıtları yapay zekâ ile üretilir ve bilgi amaçlıdır; resmî bilgi kaynak sistemlerdedir ve akademik kararlar size aittir.',
    ],
  },
];
