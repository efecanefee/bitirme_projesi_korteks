import { useEffect } from 'react';
import { useAyarlar } from '@/app/ayarlar';
import type { Bildirim } from './bildirimUret';
import { useBildirimStore } from './bildirimStore';

/**
 * Tarayıcı bildirimi (Notification API). Sunucuda push servisi olmadığı için yalnızca uygulama
 * açıkken ya da bir sekmede arka plandayken çalışır; iOS'ta ana ekrana eklenmiş PWA gerekir.
 * Uygulama kapalıyken bildirim için sunucu taraflı push gerekir (Efecan ile konuşulacak).
 */
export const tarayiciDestekliyor = () => typeof window !== 'undefined' && 'Notification' in window;

export const izinDurumu = (): NotificationPermission => (tarayiciDestekliyor() ? Notification.permission : 'denied');

/** İlk girişte gösterilir mi: destek var, izin henüz sorulmamış ve kullanıcı karar vermemiş. */
export function izinPenceresiGerekli(izinSoruldu: boolean) {
  return tarayiciDestekliyor() && izinDurumu() === 'default' && !izinSoruldu;
}

/** İzin penceresi yalnızca kullanıcının bastığı bir düğmeden açılmalı (tarayıcı kuralı). */
export async function izinIste(): Promise<NotificationPermission> {
  if (!tarayiciDestekliyor()) return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

async function goster(b: Bildirim) {
  const secenek: NotificationOptions = {
    body: b.aciklama,
    tag: b.id,
    icon: '/icons/icon-192.png',
    badge: '/favicon-48x48.png',
    data: { hedef: b.hedef },
  };
  try {
    const n = new Notification(b.baslik, secenek);
    n.onclick = () => {
      window.focus();
      window.location.assign(b.hedef);
    };
  } catch {
    // Android Chrome doğrudan oluşturmaya izin vermez; service worker üzerinden gösterilir.
    // Tıklanınca sayfayı açan işleyici public/bildirim-sw.js içindedir.
    const kayit = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    await kayit?.showNotification(b.baslik, secenek);
  }
}

/** Kritik ve "yaklaşıyor" düzeyindeki yeni bildirimleri bir kez tarayıcı bildirimi olarak gönderir. */
export function useTarayiciBildirimleri(liste: Bildirim[]) {
  const acik = useAyarlar((s) => s.tarayiciBildirimi);
  const gonderilen = useBildirimStore((s) => s.gonderilen);
  const gonderildi = useBildirimStore((s) => s.gonderildi);

  useEffect(() => {
    if (!acik || izinDurumu() !== 'granted') return;
    const yeni = liste.filter((b) => b.onem !== 'bilgi' && gonderilen[b.id] !== b.imza).slice(0, 3);
    for (const b of yeni) {
      gonderildi(b.id, b.imza);
      void goster(b).catch(() => {
        /* tarayıcı reddederse uygulama içi zil yine çalışır */
      });
    }
  }, [acik, liste, gonderilen, gonderildi]);
}
