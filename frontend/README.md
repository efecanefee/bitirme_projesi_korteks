# Korteks – İstemci (Frontend)

Korteks'in React + TypeScript istemcisi. Ara rapordaki arayüz taslaklarına (Şekil 5) paralel olarak
birleşik paneli, ders ayrıntısını, takvimi, notları, duyuruları, yapay zekâ asistanını ve yönetici
panelini içerir. İş paketleri: **İP-4** (birleşik panel MVP) ve **İP-7** (asistanın platforma
entegrasyonu).

## Hızlı başlangıç

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Varsayılan olarak **sahte veri servisi (MSW)** açıktır; sunucu olmadan bütün ekranlar çalışır.

| Hesap | E-posta | Şifre |
|---|---|---|
| Öğrenci | deniz.yilmaz@ogr.beykent.edu.tr | korteks123 |
| Yönetici | yonetici@beykent.edu.tr | yonetici123 |

Gerçek FastAPI sunucusuna bağlanmak için `.env.development` içinde `VITE_USE_MOCKS=false` yapın.
İstekler `/api/v1` altına gider ve Vite proxy'si ile `VITE_PROXY_TARGET` adresine (varsayılan
`http://localhost:8000`) yönlenir.

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Tip kontrolü + üretim derlemesi (`dist/`, PWA dahil) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript kontrolü |
| `npm test` | Birim ve bileşen testleri (Vitest + React Testing Library) |
| `npm run test:e2e` | Uçtan uca testler (Playwright, masaüstü + mobil) |

## Teknolojiler

Rapordaki Tablo 6 ile uyumludur.

- **React 19 + TypeScript + Vite**, **MUI** bileşen kütüphanesi, **PWA** (vite-plugin-pwa)
- **TanStack Query**: sunucu durumu, önbellek, yeniden deneme
- **React Router**: sayfalar, rol bazlı yönlendirme
- **Zustand**: oturum (sessionStorage; sekme kapanınca silinir)
- **React Hook Form + Zod**: form doğrulama
- **MSW**: sahte veri servisi (rapor B2 yaklaşımı); testlerde de aynı handler'lar kullanılır
- **Vitest, React Testing Library, Playwright**: testler

## Klasör yapısı

```
src/
  api/            Sözleşme ve istemci
    types.ts        ER diyagramıyla birebir tipler (docs/openapi.yaml ile eş)
    client.ts       fetch sarmalayıcı: JWT, 401'de çıkış, FastAPI hata gövdesi
    endpoints.ts    Tüm uç noktalar
    queries.ts      React Query kancaları ve sorgu anahtarları
  app/            Tema, sağlayıcılar, yönlendirme
  components/     Ortak bileşenler (SourceTag, SectionCard, yerleşim)
  features/       Ekranlar: auth, dashboard, courses, calendar, grades,
                  announcements, assistant, admin
  features/legal/ KVKK aydınlatma metni (kvkkMetni.ts), onay adımı, gizlilik sayfası
  lib/            Tarih, biçimlendirme, iCalendar, etiketler
  mocks/          Sahte veri servisi
    data.ts         Sentetik öğrenci verisi (tarihler bugüne göre göreli)
    handlers.ts     API taklidi (rol kontrolü dahil)
    tools.ts        final_gerekli_puan başvuru uygulaması (rapor 5.3)
    assistant.ts    Niyet sınıflandırma + belge arama + bulunamadı akışının taklidi
  test/           Test kurulumu
e2e/              Playwright senaryoları
```

## Sunucu ekibi için sözleşme

Uç noktaların ve şemaların tamamı **`../docs/openapi.yaml`** dosyasındadır. Alan adları ER
diyagramındaki Türkçe snake_case adlardır (`kaynak_sistem`, `ders_kaydi_id`, `son_senkron` …).
FastAPI tarafındaki Pydantic modelleri bu adlarla yazılırsa istemcide hiçbir değişiklik gerekmez.
Sözleşme değiştiğinde `openapi.yaml`, `src/api/types.ts` ve `src/mocks/handlers.ts` birlikte
güncellenir.

Önemli kurallar:

- Tüm uç noktalar `/api/v1` altındadır; `/auth/login` dışındakiler `Authorization: Bearer <JWT>` ister.
- Hata gövdesi `{"detail": "..."}` biçimindedir ve mesaj doğrudan kullanıcıya gösterilir; Türkçe ve
  çözüm önerir şekilde yazılmalıdır.
- `/yonetici/*` uç noktaları yalnızca `rol = yonetici` için açıktır, diğerlerine 403 döner.
- Her öğrenci verisi `kaynak_sistem` ve `son_senkron` taşır; panel bu alanlarla kaynak etiketini ve
  güncelleme saatini gösterir (FG-04).
- Asistan yanıtında `kaynaklar` dizisi üç türden oluşur: `belge` (RAG parçası, madde, benzerlik),
  `kisisel_veri` (OBS/PSG/Pusula verisi) ve `arac` (hesaplama aracı ve formülü). Kaynak yoksa
  `niyet = "bulunamadi"` ve `onerilen_birim` doldurulur (FG-08).
- `cevap` düz metindir; istemci yalnızca `**kalın**` ve `- ` maddelerini biçimlendirir, HTML yorumlamaz.

## Gereksinim karşılıkları

| Gereksinim | İstemcideki karşılığı |
|---|---|
| FG-01 Kimlik doğrulama | Giriş ekranı, JWT, `RequireAuth` ile rol bazlı yönlendirme |
| KVKK aydınlatma ve rıza | `/kvkk` aydınlatma metni (taslak), ilk girişte onay adımı, `/gizlilik` sayfasında sohbet değerlendirme izni |
| FG-04 Birleşik panel | Panel; her kartta kaynak sistem etiketi ve senkron saati |
| FG-05 Mobil / PWA | Duyarlı yerleşim, çekmece menü, yüklenebilir PWA |
| FG-06 Belge yükleme | Yönetici › Belgeler: yükleme, sürüm, aktif/pasif |
| FG-07 Kaynaklı yanıt | Yanıt altındaki kaynak çipleri + “Yanıtın dayanağı” paneli |
| FG-08 Bulunamadı | Tahmin yerine ilgili birim önerisi; soru yönetici paneline düşer |
| FG-09 Hesaplama araçları | Ders sayfasında “Finalden alman gereken”, asistanda “Hesabı göster” |
| FG-11 Geri bildirim | “Yararlı / Yararlı değil” düğmeleri |
| FG-12 Yönetici istatistikleri | Yönetici › Genel bakış, Cevaplanamayan sorular |
| FG-13 Hatırlatma (isteğe bağlı) | Takvimden ve ders sayfasından `.ics` dışa aktarma |
| FOG-01 Panel ≤ 2 sn | Panel tek istekle (`/panel`) yüklenir; diğer sayfalar ayrı parçalarda |
| FOG-06 Güvenlik | Oturum sessionStorage'da, nginx güvenlik başlıkları, kişisel veri PWA önbelleğine alınmaz |
| FOG-09 Dış sistem kesintisi | Kenar çubuğunda son senkron saatleri; hata durumunda tekrar dene |
| FOG-10 Taşınabilirlik | `docker compose up`; Chrome ve mobil görünümde e2e testleri |
| WCAG 2.1 AA | Klavye odak halkası, “İçeriğe geç” bağlantısı, ARIA etiketleri, azaltılmış hareket desteği |

## KVKK metni

`src/features/legal/kvkkMetni.ts` içindeki metin **taslaktır**. Üniversiteden resmî metin geldiğinde bu dosya
güncellenir, `KVKK_TASLAK = false` yapılır ve `KVKK_SURUM` değiştirilir; istemci tüm öğrencilerden yeniden onay ister.

## Docker

```bash
docker compose up --build    # kök dizinde; istemci http://localhost:8080
```

İstemci imajı nginx ile sunulur ve `/api/` isteklerini `backend:8000` servisine yönlendirir.
`backend/` klasörü sunucu ekibi tarafından eklenecektir.

---

<p align="center"><b>Hazırlayan: Bolu Ayısı</b></p>
<p align="center"><b>"Yağız hayratıdır"</b></p>
<p align="center">🦕</p>
