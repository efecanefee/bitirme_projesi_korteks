const BASLIKLAR: [RegExp, string][] = [
  [/^\/$/, 'Panel'],
  [/^\/derslerim\/(.+)$/, 'Ders ayrıntısı'],
  [/^\/derslerim$/, 'Derslerim'],
  [/^\/takvim/, 'Takvim'],
  [/^\/notlar/, 'Notlar ve devam'],
  [/^\/asistan/, 'Asistan'],
  [/^\/duyurular/, 'Duyurular'],
  [/^\/ayarlar/, 'Ayarlar'],
  [/^\/gizlilik/, 'Gizlilik ve KVKK'],
  [/^\/yonetim\/belgeler/, 'Belgeler'],
  [/^\/yonetim\/cevaplanamayan/, 'Cevaplanamayan sorular'],
  [/^\/yonetim\/senkronizasyon/, 'Senkronizasyon'],
  [/^\/yonetim/, 'Genel bakış'],
];

/** Her sayfanın sekme başlığı: "Takvim · Korteks" (WCAG 2.4.2). */
export function sayfaBasligi(yol: string): string {
  const eslesen = BASLIKLAR.find(([d]) => d.test(yol));
  if (!eslesen) return 'Korteks';
  const ders = yol.match(/^\/derslerim\/(.+)$/);
  const ad = ders?.[1] ? decodeURIComponent(ders[1]) : eslesen[1];
  return `${ad} · Korteks`;
}
