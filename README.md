# Korteks

PSG, Pusula ve OBS'yi tek panelde birleştiren entegre öğrenci platformu ve yapay zekâ asistanı.

İstanbul Beykent Üniversitesi, Bilgisayar Mühendisliği Bölümü, Tasarım Projesi (2026–2027).

## Proje

Öğrenciler ders, not, devamsızlık, duyuru ve sınav takvimi bilgilerine üç ayrı sistemden ulaşıyor. Korteks bu verileri tek bir web/mobil uyumlu panelde toplar ve öğrencinin sorularını doğal dille yanıtlayan bir asistan sunar:

- Belgeye dayalı sorular (yönetmelik, akademik takvim, duyurular): RAG ile, kaynak gösterilerek yanıtlanır.
- Kişisel sorular (final için gereken puan, kalan devamsızlık hakkı): öğrencinin kendi verisi üzerinde deterministik hesaplama araçlarıyla çözülür.

## Teknolojiler (planlanan)

- İstemci: React + TypeScript (Vite)
- Sunucu: Python 3.12, FastAPI
- Veri: PostgreSQL + pgvector, Redis
- Dağıtım: Docker Compose

## Ekip

| Üye | Rol |
|---|---|
| Yağız Türkmen | Arayüz (Frontend) Geliştirici |
| Efecan Efe | Sunucu ve Entegrasyon Geliştirici |
| Ahmet Kahraman | Yapay Zekâ ve Veri Geliştirici |

Danışman: Dr. Öğr. Üyesi Ayşe Kale

## Durum

Ara sınav aşaması: gereksinim analizi ve ön tasarım tamamlandı, geliştirme 2. yarıda başlıyor.
