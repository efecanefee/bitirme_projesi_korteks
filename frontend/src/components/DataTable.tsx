import { useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { karsilastir } from '@/lib/siralama';
import { Box, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TableSortLabel, type SxProps, type Theme } from '@mui/material';

export type Yon = 'asc' | 'desc';

export interface Sutun<T> {
  id: string;
  baslik: string;
  hucre: (satir: T) => ReactNode;
  /** Sıralama ve dışa aktarma için ham değer; verilmezse sütun sıralanamaz */
  deger?: (satir: T) => string | number | null;
  align?: 'left' | 'right';
}

interface Props<T> {
  satirlar: T[];
  sutunlar: Sutun<T>[];
  anahtar: (satir: T) => string | number;
  /** Tablonun erişilebilir adı */
  etiket: string;
  varsayilanSiralama?: { id: string; yon: Yon };
  /** Aynı sayfada birden fazla tablo varsa adres satırı parametrelerinin ön eki */
  onEk?: string;
  sayfaBoyutlari?: number[];
  satirSx?: (satir: T) => SxProps<Theme>;
}

/**
 * Ortak tablo (İTAM'daki sıralanabilir tablo + satır sayısı + sayfalama deseni).
 * Sıralama ve sayfa adres satırında tutulur; bağlantı paylaşılınca aynı görünüm açılır.
 */
export function DataTable<T>({ satirlar, sutunlar, anahtar, etiket, varsayilanSiralama, onEk = '', sayfaBoyutlari = [10, 25, 50], satirSx }: Props<T>) {
  const [params, setParams] = useSearchParams();
  const p = (ad: string) => `${onEk}${ad}`;
  const siralaId = params.get(p('sirala')) ?? varsayilanSiralama?.id ?? null;
  const yon: Yon = (params.get(p('yon')) as Yon | null) ?? varsayilanSiralama?.yon ?? 'asc';
  const adet = sayfaBoyutlari.includes(Number(params.get(p('adet')))) ? Number(params.get(p('adet'))) : sayfaBoyutlari[0]!;
  const sutun = sutunlar.find((s) => s.id === siralaId && s.deger);

  const sirali = useMemo(() => {
    if (!sutun?.deger) return satirlar;
    const d = sutun.deger;
    const carpan = yon === 'asc' ? 1 : -1;
    return [...satirlar].sort((a, b) => carpan * karsilastir(d(a), d(b)));
  }, [satirlar, sutun, yon]);

  const sayfaSayisi = Math.max(1, Math.ceil(sirali.length / adet));
  const sayfa = Math.min(Math.max(0, Number(params.get(p('sayfa')) ?? 1) - 1), sayfaSayisi - 1);
  const gorunen = sirali.slice(sayfa * adet, sayfa * adet + adet);

  const guncelle = (degisen: Record<string, string | null>) => {
    const yeni = new URLSearchParams(params);
    for (const [k, v] of Object.entries(degisen)) {
      if (v === null) yeni.delete(p(k));
      else yeni.set(p(k), v);
    }
    setParams(yeni, { replace: true });
  };

  const sirala = (id: string) => {
    const ayni = siralaId === id;
    guncelle({ sirala: id, yon: ayni && yon === 'asc' ? 'desc' : 'asc', sayfa: null });
  };

  return (
    <>
      <Box sx={{ overflowX: 'auto' }}>
        <Table aria-label={etiket}>
          <TableHead>
            <TableRow>
              {sutunlar.map((s, i) => {
                const aktif = siralaId === s.id && !!s.deger;
                return (
                  <TableCell
                    key={s.id}
                    align={s.align}
                    aria-sort={aktif ? (yon === 'asc' ? 'ascending' : 'descending') : undefined}
                    sx={{ ...(i === 0 ? { pl: 3 } : {}), ...(i === sutunlar.length - 1 ? { pr: 3 } : {}) }}
                  >
                    {s.deger ? (
                      <TableSortLabel active={aktif} direction={aktif ? yon : 'asc'} onClick={() => sirala(s.id)}>
                        {s.baslik}
                      </TableSortLabel>
                    ) : (
                      s.baslik
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {gorunen.map((r) => (
              <TableRow key={anahtar(r)} hover sx={satirSx?.(r)}>
                {sutunlar.map((s, i) => (
                  <TableCell key={s.id} align={s.align} sx={{ ...(i === 0 ? { pl: 3 } : {}), ...(i === sutunlar.length - 1 ? { pr: 3 } : {}) }}>
                    {s.hucre(r)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      {sirali.length > sayfaBoyutlari[0]! && (
        <TablePagination
          component="div"
          count={sirali.length}
          page={sayfa}
          rowsPerPage={adet}
          rowsPerPageOptions={sayfaBoyutlari}
          onPageChange={(_, s) => guncelle({ sayfa: s === 0 ? null : String(s + 1) })}
          onRowsPerPageChange={(e) => guncelle({ adet: e.target.value, sayfa: null })}
          labelRowsPerPage="Sayfa başına"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
          getItemAriaLabel={(t) => (t === 'next' ? 'Sonraki sayfa' : t === 'previous' ? 'Önceki sayfa' : t === 'first' ? 'İlk sayfa' : 'Son sayfa')}
          sx={{ borderTop: 1, borderColor: 'divider' }}
        />
      )}
    </>
  );
}
