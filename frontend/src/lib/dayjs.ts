import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import isoWeek from 'dayjs/plugin/isoWeek';
import relativeTime from 'dayjs/plugin/relativeTime';
import isBetween from 'dayjs/plugin/isBetween';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.extend(isoWeek);
dayjs.extend(relativeTime);
dayjs.extend(isBetween);
dayjs.extend(localizedFormat);
dayjs.extend(updateLocale);
dayjs.locale('tr');
// TDK kısaltmaları (taslakla aynı: "Kas, Per", "Cmt")
dayjs.updateLocale('tr', { weekdaysShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'] });

export default dayjs;
