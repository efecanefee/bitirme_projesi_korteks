# Korteks

PSG, Pusula ve OBS'yi tek panelde birleştiren entegre öğrenci platformu ve yapay zekâ asistanı.

İstanbul Beykent Üniversitesi, Bilgisayar Mühendisliği Bölümü, Tasarım Projesi (2026–2027).

## Proje

Öğrenciler ders, not, devamsızlık, duyuru ve sınav takvimi bilgilerine üç ayrı sistemden ulaşıyor. Korteks bu verileri tek bir web/mobil uyumlu panelde toplar ve öğrencinin sorularını doğal dille yanıtlayan bir asistan sunar:

- Belgeye dayalı sorular (yönetmelik, akademik takvim, duyurular): RAG ile, kaynak gösterilerek yanıtlanır.
- Kişisel sorular (final için gereken puan, kalan devamsızlık hakkı): öğrencinin kendi verisi üzerinde deterministik hesaplama araçlarıyla çözülür.

## Teknolojiler

- İstemci: React + TypeScript (Vite)
- Sunucu: Python 3.12, FastAPI
- Veri: PostgreSQL + pgvector, Redis
- Dağıtım: Docker Compose

## Ekip

| Üye | Rol |
|---|---|
| Yağız Türkmen | Arayüz (Frontend) Geliştirici |
| Efecan Efe | Sunucu, Entegrasyon ve Veri Geliştirici |
| Ahmet Kahraman | Yapay Zekâ Geliştirici |

Danışman: Dr. Öğr. Üyesi Ayşe Kale

## Depo yapısı

| Klasör | İçerik |
|---|---|
| `frontend/` | React + TypeScript istemci (bkz. [frontend/README.md](frontend/README.md)) |
| `backend/` | FastAPI sunucu (sunucu ekibi) |
| `docs/openapi.yaml` | İstemci–sunucu API sözleşmesi |
| `docker-compose.yml` | Tek komutla kurulum: `docker compose up --build` |

## Durum

- Gereksinim analizi ve ön tasarım tamamlandı.
- İstemci: tüm ekranlar sahte veri servisiyle çalışıyor (İP-4, İP-7 arayüz kısmı); API sözleşmesi `docs/openapi.yaml`.
