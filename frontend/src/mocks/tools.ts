import type { Degerlendirme, Ders, FinalGerekliSonuc } from '@/api/types';
import { sayi } from '@/lib/format';

/**
 * Raporun 5.3 bölümündeki final_gerekli_puan sözde kodunun birebir uygulaması.
 * Gerçek sistemde bu hesap SUNUCUDA yapılır (deterministik araç); burada sahte veri
 * servisi ve sunucu ekibi için başvuru uygulaması olarak durur.
 *
 *   mevcut  = Σ (puan · ağırlık), final hariç
 *   gerekli = maks((eşik − mevcut) / a_f, alt)
 *   gerekli > 100 ise "ulaşılamaz"
 */
export function finalGerekliHesapla(
  ders: Pick<Ders, 'kod' | 'gecme_notu' | 'final_alt_siniri'>,
  notlar: Degerlendirme[],
  sonSenkron: string,
): FinalGerekliSonuc {
  const final = notlar.find((n) => n.tur === 'final');
  const diger = notlar.filter((n) => n.tur !== 'final');
  const temel = { ders_kodu: ders.kod, kaynak_sistem: 'OBS' as const, son_senkron: sonSenkron };

  if (!final || diger.length === 0 || diger.every((n) => n.puan === null)) {
    return { ...temel, durum: 'veri_yok', gerekli: null, adimlar: [], formul: '' };
  }

  const aF = final.agirlik;
  const girilen = diger.filter((n) => n.puan !== null);
  const mevcut = girilen.reduce((t, n) => t + (n.puan as number) * n.agirlik, 0);
  const esik = ders.gecme_notu;
  const alt = ders.final_alt_siniri ?? 0;
  const ham = (esik - mevcut) / aF;
  const gerekli = Math.max(ham, alt);
  const yuvarla = (x: number) => Math.round(x * 100) / 100;

  const adimlar = [
    ...girilen.map((n) => ({
      etiket: `${n.baslik} katkısı (${n.puan} × ${sayi(n.agirlik)})`,
      deger: sayi(yuvarla((n.puan as number) * n.agirlik), 1),
    })),
    { etiket: 'Geçme notu', deger: String(esik) },
    { etiket: 'Gereken final katkısı', deger: sayi(yuvarla(Math.max(esik - mevcut, 0)), 1) },
    {
      etiket: `Gereken final notu (${sayi(yuvarla(Math.max(esik - mevcut, 0)), 1)} ÷ ${sayi(aF)})`,
      deger: String(Math.max(Math.ceil(gerekli), 0)),
    },
  ];
  if (alt > 0 && ham < alt) adimlar.push({ etiket: 'Yönetmelik final alt sınırı', deger: String(alt) });

  const formul = `(${esik} − ${girilen.map((n) => `${n.puan} × ${sayi(n.agirlik)}`).join(' − ')}) ÷ ${sayi(aF)} = ${Math.max(Math.ceil(gerekli), 0)}`;

  if (gerekli > 100) return { ...temel, durum: 'ulasilamaz', gerekli: null, adimlar, formul };
  if (gerekli <= 0) return { ...temel, durum: 'zaten_gecti', gerekli: 0, adimlar, formul };
  return { ...temel, durum: 'hesaplandi', gerekli: Math.ceil(gerekli), adimlar, formul };
}
