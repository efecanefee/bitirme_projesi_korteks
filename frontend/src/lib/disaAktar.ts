import dayjs from './dayjs';

/**
 * Yönetici raporlarının dışa aktarımı (FG-12, İP-8): CSV, PDF (yazdırma görünümü) ve Word.
 * Veri yalnızca mevcut yönetici uç noktalarından gelir; dışa aktarım tamamen tarayıcıda yapılır.
 */
export interface RaporTablosu {
  baslik: string;
  sutunlar: string[];
  satirlar: (string | number | null)[][];
}

export interface Rapor {
  baslik: string;
  /** Başlığın altında: dönem, filtre vb. */
  aciklama?: string;
  /** Özet satırları: "Ortalama yanıt süresi: 2,1 sn" */
  ozet?: { etiket: string; deger: string }[];
  tablolar: RaporTablosu[];
}

export type Bicim = 'csv' | 'pdf' | 'docx';

const zamanDamgasi = () => dayjs().format('YYYY-MM-DD_HH-mm');
export const dosyaAdi = (r: Rapor, uzanti: string) =>
  `korteks_${r.baslik
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' })[c] ?? c)
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')}_${zamanDamgasi()}.${uzanti}`;

function indir(blob: Blob, ad: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = ad;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const hucreMetni = (v: string | number | null) =>
  v === null ? '' : typeof v === 'number' ? v.toLocaleString('tr-TR', { maximumFractionDigits: 3 }) : v;

/**
 * Türkçe Excel'in açtığı biçim: ayraç noktalı virgül, ondalık virgül, başta UTF-8 BOM
 * (BOM olmadan Excel Türkçe karakterleri bozar).
 */
export function csvOlustur(r: Rapor): string {
  const kacis = (s: string) => (/[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const satirlar: string[] = [kacis(r.baslik)];
  if (r.aciklama) satirlar.push(kacis(r.aciklama));
  for (const o of r.ozet ?? []) satirlar.push([o.etiket, o.deger].map(kacis).join(';'));
  for (const t of r.tablolar) {
    satirlar.push('', kacis(t.baslik), t.sutunlar.map(kacis).join(';'));
    for (const s of t.satirlar) satirlar.push(s.map((v) => kacis(hucreMetni(v))).join(';'));
  }
  return '﻿' + satirlar.join('\r\n');
}

const html = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

/** PDF: biçimlendirilmiş yazdırma görünümü açılır; kullanıcı "PDF olarak kaydet"i seçer. */
export function yazdirmaHtml(r: Rapor): string {
  const tablolar = r.tablolar
    .map(
      (t) => `<h2>${html(t.baslik)}</h2><table><thead><tr>${t.sutunlar.map((s) => `<th>${html(s)}</th>`).join('')}</tr></thead><tbody>${t.satirlar
        .map((s) => `<tr>${s.map((v) => `<td${typeof v === 'number' ? ' class="sayi"' : ''}>${html(hucreMetni(v))}</td>`).join('')}</tr>`)
        .join('')}</tbody></table>`,
    )
    .join('');
  const ozet = r.ozet?.length ? `<dl>${r.ozet.map((o) => `<div><dt>${html(o.etiket)}</dt><dd>${html(o.deger)}</dd></div>`).join('')}</dl>` : '';
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${html(r.baslik)}</title><style>
@page{size:A4;margin:16mm}body{font-family:"IBM Plex Sans",system-ui,sans-serif;color:#0B1B2B;font-size:11pt}
header{border-bottom:3px solid #FF5C23;padding-bottom:8px;margin-bottom:16px}h1{font-size:18pt;margin:0}
.alt{color:#3E5366;margin:4px 0 0}h2{font-size:12pt;margin:20px 0 6px}
dl{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:0}dl div{border:1px solid #D6EAF1;border-radius:6px;padding:6px 8px}
dt{font-size:9pt;color:#3E5366}dd{margin:2px 0 0;font-weight:700;font-size:12pt}
table{width:100%;border-collapse:collapse;font-size:10pt}th,td{border:1px solid #D6EAF1;padding:4px 6px;text-align:left;vertical-align:top}
th{background:#C8F3FF}td.sayi{text-align:right;font-variant-numeric:tabular-nums}tr{page-break-inside:avoid}
footer{margin-top:20px;font-size:9pt;color:#3E5366}</style></head><body>
<header><h1>${html(r.baslik)}</h1><p class="alt">${html(r.aciklama ?? '')} · Oluşturulma: ${dayjs().format('D MMMM YYYY HH.mm')}</p></header>
${ozet}${tablolar}<footer>Korteks yönetici paneli · Kişisel veri içermez</footer></body></html>`;
}

function pdfAc(r: Rapor) {
  const pencere = window.open('', '_blank', 'width=900,height=1000');
  if (!pencere) {
    // Açılır pencere engellenirse HTML dosyası olarak indirilir
    indir(new Blob([yazdirmaHtml(r)], { type: 'text/html;charset=utf-8' }), dosyaAdi(r, 'html'));
    return;
  }
  pencere.document.open();
  pencere.document.write(yazdirmaHtml(r));
  pencere.document.close();
  pencere.focus();
  window.setTimeout(() => pencere.print(), 300);
}

/** Word: docx paketi yalnızca bu düğmeye basılınca yüklenir (öğrenci paneli etkilenmez, FOG-01). */
async function wordIndir(r: Rapor) {
  const { AlignmentType, BorderStyle, Document, HeadingLevel, Packer, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType } = await import('docx');
  const kenar = { style: BorderStyle.SINGLE, size: 4, color: 'D6EAF1' };
  const kenarlar = { top: kenar, bottom: kenar, left: kenar, right: kenar };
  const hucre = (metin: string, baslik = false, sag = false) =>
    new TableCell({
      borders: kenarlar,
      shading: baslik ? { type: ShadingType.CLEAR, color: 'auto', fill: 'C8F3FF' } : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [new Paragraph({ alignment: sag ? AlignmentType.RIGHT : AlignmentType.LEFT, children: [new TextRun({ text: metin, bold: baslik, size: 20 })] })],
    });
  const icerik: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: r.baslik, bold: true, size: 36, color: '0B1B2B' })] }),
    new Paragraph({ children: [new TextRun({ text: `${r.aciklama ?? ''} · Oluşturulma: ${dayjs().format('D MMMM YYYY HH.mm')}`, color: '3E5366', size: 20 })] }),
  ];
  for (const o of r.ozet ?? []) icerik.push(new Paragraph({ children: [new TextRun({ text: `${o.etiket}: `, size: 22 }), new TextRun({ text: o.deger, bold: true, size: 22 })] }));
  for (const t of r.tablolar) {
    icerik.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 }, children: [new TextRun({ text: t.baslik, bold: true, size: 26 })] }));
    icerik.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ tableHeader: true, children: t.sutunlar.map((s) => hucre(s, true)) }),
          ...t.satirlar.map((s) => new TableRow({ children: s.map((v) => hucre(hucreMetni(v), false, typeof v === 'number')) })),
        ],
      }),
    );
  }
  const belge = new Document({ creator: 'Korteks', title: r.baslik, styles: { default: { document: { run: { font: 'Calibri' } } } }, sections: [{ children: icerik }] });
  indir(await Packer.toBlob(belge), dosyaAdi(r, 'docx'));
}

export async function disaAktar(r: Rapor, bicim: Bicim) {
  if (bicim === 'csv') indir(new Blob([csvOlustur(r)], { type: 'text/csv;charset=utf-8' }), dosyaAdi(r, 'csv'));
  else if (bicim === 'pdf') pdfAc(r);
  else await wordIndir(r);
}
