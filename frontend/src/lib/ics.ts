import dayjs from './dayjs';

export interface IcsEtkinlik {
  baslik: string;
  baslangic: string;
  sureDk: number;
  aciklama?: string;
}

const kacis = (s: string) => s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');
const utc = (d: dayjs.Dayjs) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** RFC 5545 iCalendar metni üretir; Google/Outlook/Apple takvimine içe aktarılabilir. */
export function icsOlustur(liste: IcsEtkinlik[]): string {
  const satirlar = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Korteks//TR', 'CALSCALE:GREGORIAN'];
  for (const e of liste) {
    const bas = dayjs(e.baslangic);
    satirlar.push(
      'BEGIN:VEVENT',
      `UID:${utc(bas)}-${encodeURIComponent(e.baslik).slice(0, 40)}@korteks`,
      `DTSTAMP:${utc(dayjs())}`,
      `DTSTART:${utc(bas)}`,
      `DTEND:${utc(bas.add(e.sureDk, 'minute'))}`,
      `SUMMARY:${kacis(e.baslik)}`,
      ...(e.aciklama ? [`DESCRIPTION:${kacis(e.aciklama)}`] : []),
      'END:VEVENT',
    );
  }
  satirlar.push('END:VCALENDAR');
  return satirlar.join('\r\n');
}

export function indirIcs(dosyaAdi: string, liste: IcsEtkinlik[]) {
  const blob = new Blob([icsOlustur(liste)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = dosyaAdi;
  a.click();
  URL.revokeObjectURL(url);
}
