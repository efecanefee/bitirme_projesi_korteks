import { CalendarX2, ClipboardCheck, CloudOff, Megaphone, NotebookPen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { BildirimTur } from './bildirimUret';

export const TUR_SIMGESI: Record<BildirimTur, LucideIcon> = {
  sinav: ClipboardCheck,
  odev: NotebookPen,
  devam: CalendarX2,
  duyuru: Megaphone,
  senkron: CloudOff,
};

export const TUR_ETIKETI: Record<BildirimTur, string> = {
  sinav: 'Sınav',
  odev: 'Ödev',
  devam: 'Devam',
  duyuru: 'Duyuru',
  senkron: 'Senkronizasyon',
};
