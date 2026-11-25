import { delay, http, HttpResponse } from 'msw';
import dayjs from '@/lib/dayjs';
import type {
  Belge,
  BelgeTur,
  DersDetayi,
  DevamOzeti,
  KaynakSistem,
  PanelOzeti,
  SenkronOzeti,
  SohbetMesaji,
  SoruIstegi,
  TokenYaniti,
  YoneticiIstatistik,
} from '@/api/types';
import { API_PREFIX } from '@/api/client';
import { finalGerekliHesapla } from './tools';
import { yanitUret } from './assistant';
import {
  AKTIF_HAFTA,
  DONEM,
  TOPLAM_HAFTA,
  belgeler,
  cevaplanamayanlar,
  dersKayitlari,
  degerlendirmeler,
  devamKayitlari,
  duyurular,
  etkinlikler,
  kullanicilar,
  mesajlar,
  senkronLoglari,
  sohbetler,
  sonSenkron,
} from './data';

const url = (p: string) => `*${API_PREFIX}${p}`;
const gecikme = () => delay(import.meta.env.MODE === 'test' ? 0 : 250 + Math.random() * 250);

// ---------- Oturum (sahte JWT: "mock.<kullanici_id>") ----------

function oturum(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const id = Number(token?.split('.')[1]);
  return kullanicilar.find((k) => k.id === id);
}

const yetkisiz = () => HttpResponse.json({ detail: 'Oturum süresi doldu, tekrar giriş yap.' }, { status: 401 });
const yasak = () => HttpResponse.json({ detail: 'Bu işlem için yetkin yok.' }, { status: 403 });

function devamOzeti(kayitId: number): DevamOzeti {
  const k = dersKayitlari.find((x) => x.id === kayitId)!;
  return {
    ders_kaydi_id: k.id,
    ders_kodu: k.ders.kod,
    ders_adi: k.ders.ad,
    kullanilan: devamKayitlari.filter((d) => d.ders_kaydi_id === k.id && d.durum === 'katilmadi').length,
    sinir: k.ders.devam_siniri,
    kaynak_sistem: 'OBS',
    son_senkron: sonSenkron.OBS,
  };
}

function genelOrtalama() {
  // Önceki dönemlerden gelen GNO (sentetik)
  return 3.12;
}

export const handlers = [
  // ----- Kimlik -----
  http.post(url('/auth/login'), async ({ request }) => {
    await gecikme();
    const { e_posta, sifre } = (await request.json()) as { e_posta: string; sifre: string };
    const k = kullanicilar.find((x) => x.e_posta === e_posta.trim().toLowerCase() && x.sifre === sifre);
    if (!k) return HttpResponse.json({ detail: 'E-posta veya şifre hatalı.' }, { status: 401 });
    const { sifre: _s, ...kullanici } = k;
    void _s;
    return HttpResponse.json<TokenYaniti>({
      access_token: `mock.${k.id}.${Date.now()}`,
      token_type: 'bearer',
      expires_in: 60 * 60 * 8,
      kullanici,
    });
  }),
  http.get(url('/auth/me'), ({ request }) => {
    const k = oturum(request);
    if (!k) return yetkisiz();
    const { sifre: _s, ...kullanici } = k;
    void _s;
    return HttpResponse.json(kullanici);
  }),
  http.post(url('/auth/logout'), () => new HttpResponse(null, { status: 204 })),
  http.put(url('/auth/riza'), async ({ request }) => {
    const k = oturum(request);
    if (!k) return yetkisiz();
    const { metin_surumu, sohbet_degerlendirme } = (await request.json()) as { metin_surumu: string; sohbet_degerlendirme: boolean };
    if (!metin_surumu) return HttpResponse.json({ detail: 'Metin sürümü zorunlu.' }, { status: 422 });
    k.riza = { metin_surumu, sohbet_degerlendirme: !!sohbet_degerlendirme, tarih: new Date().toISOString() };
    const { sifre: _s, ...kullanici } = k;
    void _s;
    return HttpResponse.json(kullanici);
  }),

  // ----- Panel -----
  http.get(url('/panel'), async ({ request }) => {
    if (!oturum(request)) return yetkisiz();
    await gecikme();
    const simdi = dayjs();
    const gun = simdi.isoWeekday();
    const bugunku = dersKayitlari
      .flatMap((k) => k.program.filter((p) => p.gun === gun).map((p) => ({ ...p, ders_kodu: k.ders.kod, ders_adi: k.ders.ad })))
      .sort((a, b) => a.baslangic.localeCompare(b.baslangic));
    const yaklasan = etkinlikler
      .filter((e) => (e.tur === 'sinav' || e.tur === 'odev') && dayjs(e.tarih).isAfter(simdi))
      .sort((a, b) => a.tarih.localeCompare(b.tarih))
      .slice(0, 4);
    const sonNotlar = degerlendirmeler
      .filter((d) => d.puan !== null && d.tarih)
      .sort((a, b) => (b.tarih ?? '').localeCompare(a.tarih ?? ''))
      .slice(0, 2)
      .map((d) => {
        const k = dersKayitlari.find((x) => x.id === d.ders_kaydi_id)!;
        return { etiket: `${k.ders.ad.split(' ')[0]} ${d.tur === 'vize' ? 'vize' : d.baslik.toLocaleLowerCase('tr-TR')} notu`, puan: d.puan as number, kaynak_sistem: d.kaynak_sistem };
      });
    const body: PanelOzeti = {
      bugunku_dersler: bugunku,
      yaklasan,
      devam: dersKayitlari.map((k) => devamOzeti(k.id)).sort((a, b) => b.kullanilan - a.kullanilan),
      notlar: { genel_ortalama: genelOrtalama(), son_notlar: sonNotlar, donem: DONEM },
      duyurular: [...duyurular].sort((a, b) => b.tarih.localeCompare(a.tarih)).slice(0, 3),
      okunmamis_duyuru: duyurular.filter((d) => !d.okundu).length,
      akademik_donem: { ad: 'Güz dönemi', hafta: AKTIF_HAFTA, aciklama: AKTIF_HAFTA >= 8 && AKTIF_HAFTA <= 9 ? 'ara sınav haftası' : null },
    };
    return HttpResponse.json(body);
  }),

  http.get(url('/senkron/ozet'), ({ request }) => {
    if (!oturum(request)) return yetkisiz();
    return HttpResponse.json<SenkronOzeti[]>(
      (['OBS', 'PUSULA', 'PSG'] as const).map((s) => ({ kaynak_sistem: s, son_basarili: sonSenkron[s], durum: 'basarili' })),
    );
  }),

  // ----- Dersler -----
  http.get(url('/dersler'), async ({ request }) => {
    if (!oturum(request)) return yetkisiz();
    await gecikme();
    return HttpResponse.json(dersKayitlari);
  }),
  http.get(url('/dersler/:kod'), async ({ request, params }) => {
    if (!oturum(request)) return yetkisiz();
    await gecikme();
    const kod = decodeURIComponent(String(params.kod));
    const kayit = dersKayitlari.find((k) => k.ders.kod === kod);
    if (!kayit) return HttpResponse.json({ detail: `${kod} kodlu ders kayıtlı derslerin arasında yok.` }, { status: 404 });
    const body: DersDetayi = {
      kayit,
      degerlendirmeler: degerlendirmeler.filter((d) => d.ders_kaydi_id === kayit.id),
      devam: devamKayitlari.filter((d) => d.ders_kaydi_id === kayit.id),
      devam_ozeti: devamOzeti(kayit.id),
      toplam_hafta: TOPLAM_HAFTA,
      pusula_etkinlikleri: etkinlikler
        .filter((e) => e.ders_id === kayit.ders.id && e.kaynak_sistem === 'PUSULA')
        .sort((a, b) => b.tarih.localeCompare(a.tarih)),
      duyurular: duyurular.filter((d) => d.ders_kodu === kod),
      gecme_kosulu: { aciklama: `Dönem sonu notu en az ${kayit.ders.gecme_notu}`, kaynak: 'Yönetmelik, Madde 22' },
    };
    return HttpResponse.json(body);
  }),

  http.get(url('/notlar'), ({ request }) => (oturum(request) ? HttpResponse.json(degerlendirmeler) : yetkisiz())),
  http.get(url('/devam'), ({ request }) =>
    oturum(request) ? HttpResponse.json(dersKayitlari.map((k) => devamOzeti(k.id))) : yetkisiz(),
  ),

  http.get(url('/etkinlikler'), async ({ request }) => {
    if (!oturum(request)) return yetkisiz();
    await gecikme();
    const q = new URL(request.url).searchParams;
    const bas = dayjs(q.get('baslangic'));
    const bit = dayjs(q.get('bitis'));
    const tur = q.get('tur');
    return HttpResponse.json(
      etkinlikler
        .filter((e) => dayjs(e.tarih).isBetween(bas, bit, null, '[]') && (!tur || e.tur === tur))
        .sort((a, b) => a.tarih.localeCompare(b.tarih)),
    );
  }),

  http.get(url('/duyurular'), async ({ request }) => {
    if (!oturum(request)) return yetkisiz();
    await gecikme();
    return HttpResponse.json([...duyurular].sort((a, b) => b.tarih.localeCompare(a.tarih)));
  }),
  http.post(url('/duyurular/:id/okundu'), ({ request, params }) => {
    if (!oturum(request)) return yetkisiz();
    const d = duyurular.find((x) => x.id === Number(params.id));
    if (d) d.okundu = true;
    return new HttpResponse(null, { status: 204 });
  }),

  // ----- Araçlar -----
  http.get(url('/araclar/final-gerekli-puan/:kod'), async ({ request, params }) => {
    if (!oturum(request)) return yetkisiz();
    await gecikme();
    const kayit = dersKayitlari.find((k) => k.ders.kod === decodeURIComponent(String(params.kod)));
    if (!kayit) return HttpResponse.json({ detail: 'Ders bulunamadı.' }, { status: 404 });
    return HttpResponse.json(
      finalGerekliHesapla(kayit.ders, degerlendirmeler.filter((d) => d.ders_kaydi_id === kayit.id), sonSenkron.OBS),
    );
  }),

  // ----- Asistan -----
  http.get(url('/asistan/sohbetler'), ({ request }) => {
    const k = oturum(request);
    if (!k) return yetkisiz();
    return HttpResponse.json([...sohbetler].sort((a, b) => b.son_mesaj.localeCompare(a.son_mesaj)));
  }),
  http.get(url('/asistan/sohbetler/:id/mesajlar'), ({ request, params }) => {
    if (!oturum(request)) return yetkisiz();
    return HttpResponse.json(mesajlar.filter((m) => m.sohbet_id === Number(params.id)));
  }),
  http.post(url('/asistan/mesajlar'), async ({ request }) => {
    if (!oturum(request)) return yetkisiz();
    const baslangic = performance.now();
    const istek = (await request.json()) as SoruIstegi;
    const soru = istek.soru?.trim();
    if (!soru) return HttpResponse.json({ detail: 'Soru boş olamaz.' }, { status: 422 });
    if (soru.length > 1000) return HttpResponse.json({ detail: 'Soru en fazla 1000 karakter olabilir.' }, { status: 422 });
    await delay(import.meta.env.MODE === 'test' ? 0 : 900 + Math.random() * 900);

    let sohbetId = istek.sohbet_id ?? null;
    if (!sohbetId || !sohbetler.some((s) => s.id === sohbetId)) {
      sohbetId = Date.now();
      sohbetler.push({ id: sohbetId, baslik: soru.length > 48 ? `${soru.slice(0, 48)}…` : soru, son_mesaj: new Date().toISOString() });
    }
    const s = sohbetler.find((x) => x.id === sohbetId)!;
    s.son_mesaj = new Date().toISOString();

    const y = yanitUret(soru, istek.ders_kodu);
    const mesaj: SohbetMesaji = {
      id: Date.now() + 1,
      sohbet_id: sohbetId,
      soru,
      ...y,
      geri_bildirim: 0,
      sure_ms: Math.round(performance.now() - baslangic),
      olusturma: new Date().toISOString(),
    };
    mesajlar.push(mesaj);
    return HttpResponse.json(mesaj);
  }),
  http.post(url('/asistan/mesajlar/:id/geri-bildirim'), async ({ request, params }) => {
    if (!oturum(request)) return yetkisiz();
    const { deger } = (await request.json()) as { deger: -1 | 1 };
    const m = mesajlar.find((x) => x.id === Number(params.id));
    if (!m) return HttpResponse.json({ detail: 'Mesaj bulunamadı.' }, { status: 404 });
    m.geri_bildirim = deger;
    return new HttpResponse(null, { status: 204 });
  }),

  // ----- Yönetici (rol kontrolü) -----
  http.get(url('/yonetici/*'), ({ request }) => {
    const k = oturum(request);
    if (!k) return yetkisiz();
    if (k.rol !== 'yonetici') return yasak();
    return undefined; // sonraki eşleşen handler'a geç
  }),
  http.get(url('/yonetici/belgeler'), async () => {
    await gecikme();
    return HttpResponse.json([...belgeler].sort((a, b) => b.yukleme_tarihi.localeCompare(a.yukleme_tarihi)));
  }),
  http.post(url('/yonetici/belgeler'), async ({ request }) => {
    const k = oturum(request);
    if (!k) return yetkisiz();
    if (k.rol !== 'yonetici') return yasak();
    const form = await request.formData();
    const dosya = form.get('dosya');
    const baslik = String(form.get('baslik') ?? '').trim();
    const tur = String(form.get('tur')) as BelgeTur;
    if (!(dosya instanceof File) || !baslik) return HttpResponse.json({ detail: 'Dosya ve başlık zorunlu.' }, { status: 422 });
    await delay(import.meta.env.MODE === 'test' ? 0 : 800);
    const onceki = belgeler.filter((b) => b.baslik === baslik);
    onceki.forEach((b) => (b.aktif_mi = false));
    const yeni: Belge = {
      id: Math.max(...belgeler.map((b) => b.id)) + 1,
      ders_id: null,
      baslik,
      tur,
      surum: onceki.length ? Math.max(...onceki.map((b) => b.surum)) + 1 : 1,
      aktif_mi: true,
      yukleme_tarihi: new Date().toISOString(),
      parca_sayisi: Math.max(1, Math.round(dosya.size / 2500)),
      indeks_durumu: 'isleniyor',
    };
    belgeler.push(yeni);
    setTimeout(() => (yeni.indeks_durumu = 'hazir'), 4000);
    return HttpResponse.json(yeni, { status: 201 });
  }),
  http.patch(url('/yonetici/belgeler/:id'), async ({ request, params }) => {
    const k = oturum(request);
    if (!k) return yetkisiz();
    if (k.rol !== 'yonetici') return yasak();
    const b = belgeler.find((x) => x.id === Number(params.id));
    if (!b) return HttpResponse.json({ detail: 'Belge bulunamadı.' }, { status: 404 });
    const { aktif_mi } = (await request.json()) as { aktif_mi: boolean };
    b.aktif_mi = aktif_mi;
    return HttpResponse.json(b);
  }),
  http.get(url('/yonetici/cevaplanamayan'), () => HttpResponse.json(cevaplanamayanlar)),
  http.patch(url('/yonetici/cevaplanamayan/:id'), ({ request, params }) => {
    const k = oturum(request);
    if (!k || k.rol !== 'yonetici') return yasak();
    const c = cevaplanamayanlar.find((x) => x.id === Number(params.id));
    if (!c) return HttpResponse.json({ detail: 'Kayıt bulunamadı.' }, { status: 404 });
    c.cozuldu = true;
    return HttpResponse.json(c);
  }),
  http.get(url('/yonetici/istatistik'), () => {
    const gunluk = Array.from({ length: 14 }, (_, i) => {
      const t = dayjs().subtract(13 - i, 'day');
      const hafta_ici = t.isoWeekday() <= 5;
      return {
        tarih: t.format('YYYY-MM-DD'),
        soru: Math.round((hafta_ici ? 140 : 55) + Math.sin(i) * 25 + i * 4),
        ortalama_sure_ms: Math.round(2900 + Math.cos(i * 1.3) * 500),
      };
    });
    const canli = mesajlar.length;
    const body: YoneticiIstatistik = {
      toplam_soru: gunluk.reduce((t, g) => t + g.soru, 0) + canli,
      ortalama_sure_ms: 3120,
      p95_sure_ms: 6480,
      olumlu_oran: 0.84,
      bulunamadi_oran: 0.07,
      niyet_dagilimi: [
        { niyet: 'belge', sayi: 612 },
        { niyet: 'kisisel', sayi: 744 },
        { niyet: 'karma', sayi: 158 },
        { niyet: 'bulunamadi', sayi: 112 },
      ],
      gunluk,
    };
    return HttpResponse.json(body);
  }),
  http.get(url('/yonetici/senkron-loglari'), () =>
    HttpResponse.json([...senkronLoglari].sort((a, b) => b.baslangic.localeCompare(a.baslangic))),
  ),
  http.post(url('/yonetici/senkron/:sistem'), async ({ request, params }) => {
    const k = oturum(request);
    if (!k || k.rol !== 'yonetici') return yasak();
    const sistem = String(params.sistem) as KaynakSistem;
    await delay(import.meta.env.MODE === 'test' ? 0 : 1200);
    const simdi = new Date().toISOString();
    sonSenkron[sistem] = simdi;
    const log = { id: Date.now(), kaynak_sistem: sistem, baslangic: dayjs().subtract(1, 'second').toISOString(), bitis: simdi, durum: 'basarili' as const, hata: null };
    senkronLoglari.push(log);
    return HttpResponse.json(log);
  }),
];
