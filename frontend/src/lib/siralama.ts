/** Ham değerleri Türkçe sıraya göre karşılaştırır; boş değerler sona gider. */
export function karsilastir(a: string | number | null, b: string | number | null): number {
  if (a === null || a === '') return b === null || b === '' ? 0 : 1;
  if (b === null || b === '') return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'tr-TR', { numeric: true, sensitivity: 'base' });
}
