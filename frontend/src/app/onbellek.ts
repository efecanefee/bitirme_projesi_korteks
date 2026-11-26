import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type { Query } from '@tanstack/react-query';
import { del, get, set } from 'idb-keyval';
import { KVKK_SURUM } from '@/features/legal/kvkkMetni';

/**
 * Çevrimdışı önbellek (FOG-09, FG-05; 26.11.2026 kararı: 7 gün).
 *
 * Sorgu sonuçları cihazın IndexedDB'sine yazılır; bağlantı kopunca panel son veriyi tarihiyle
 * gösterir. Çıkış yapılınca, KVKK onayı geri alınınca ya da başka bir kullanıcı giriş yapınca silinir.
 * Yönetici verisi ve oturum bilgisi önbelleğe yazılmaz.
 */
export const ONBELLEK_ANAHTARI = 'korteks.onbellek';
const SAHIP_ANAHTARI = 'korteks.onbellek.sahip';
export const ONBELLEK_OMRU_MS = 7 * 24 * 60 * 60 * 1000;
/** Metin sürümü değişince eski önbellek kullanılmaz */
export const ONBELLEK_SURUMU = `v1-${KVKK_SURUM}`;

const idbDestekli = () => typeof indexedDB !== 'undefined';

export const onbellekDeposu = {
  getItem: async (k: string) => (idbDestekli() ? ((await get<string>(k)) ?? null) : null),
  setItem: async (k: string, v: string) => {
    if (idbDestekli()) await set(k, v);
  },
  removeItem: async (k: string) => {
    if (idbDestekli()) await del(k);
  },
};

export const persister = createAsyncStoragePersister({ storage: onbellekDeposu, key: ONBELLEK_ANAHTARI, throttleTime: 1000 });

/** Yalnızca başarılı öğrenci sorguları saklanır (yönetici ve kimlik sorguları hariç). */
export function saklanabilir(q: Query): boolean {
  const ilk = q.queryKey[0];
  return q.state.status === 'success' && ilk !== 'yonetici' && ilk !== 'me';
}

export async function onbellegiTemizle() {
  try {
    localStorage.removeItem(SAHIP_ANAHTARI);
  } catch {
    /* yok say */
  }
  await onbellekDeposu.removeItem(ONBELLEK_ANAHTARI).catch(() => undefined);
}

/** Girişte çağrılır: önbellek başka bir kullanıcıya aitse silinir; silindiyse true döner. */
export async function onbellekSahibiniAyarla(kullaniciId: number): Promise<boolean> {
  let onceki: string | null = null;
  try {
    onceki = localStorage.getItem(SAHIP_ANAHTARI);
  } catch {
    /* yok say */
  }
  const baskasi = onceki !== null && onceki !== String(kullaniciId);
  if (baskasi) await onbellegiTemizle();
  try {
    localStorage.setItem(SAHIP_ANAHTARI, String(kullaniciId));
  } catch {
    /* yok say */
  }
  return baskasi;
}
