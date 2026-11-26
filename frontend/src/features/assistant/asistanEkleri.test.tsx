import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dayjs from '@/lib/dayjs';
import { ColorModeProvider } from '@/app/Providers';
import { SohbetGecmisi } from './SohbetGecmisi';
import { CevrimdisiSeridi } from '@/components/layout/CevrimdisiSeridi';
import { saklanabilir } from '@/app/onbellek';
import type { Query } from '@tanstack/react-query';

const sar = (el: React.ReactElement) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ColorModeProvider>{el}</ColorModeProvider>
    </QueryClientProvider>,
  );

describe('Sohbet geçmişi paneli (FG-11)', () => {
  const sohbetler = [
    { id: 1, baslik: 'Mazeret sınavı koşulları', son_mesaj: dayjs().toISOString() },
    { id: 2, baslik: 'MAT301 final puanı', son_mesaj: dayjs().subtract(1, 'day').toISOString() },
    { id: 3, baslik: 'Ders kaydı tarihleri', son_mesaj: dayjs().subtract(40, 'day').toISOString() },
  ];

  it('sohbetleri tarihe göre gruplar ve başlıkta Türkçe karakter duyarsız arar', async () => {
    const onSec = vi.fn();
    sar(<SohbetGecmisi acik onKapat={() => {}} sohbetler={sohbetler} seciliId={1} onSec={onSec} />);
    const liste = screen.getByRole('list', { name: 'Sohbetler' });
    expect(within(liste).getByText('Bugün')).toBeInTheDocument();
    expect(within(liste).getByText('Dün')).toBeInTheDocument();
    expect(within(liste).getByText('Daha eski')).toBeInTheDocument();
    await userEvent.type(screen.getByRole('textbox', { name: 'Sohbetlerde ara' }), 'sinav');
    expect(screen.getByText('Mazeret sınavı koşulları')).toBeInTheDocument();
    expect(screen.queryByText('Ders kaydı tarihleri')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('Mazeret sınavı koşulları'));
    expect(onSec).toHaveBeenCalledWith(1);
  });
});

describe('Çevrimdışı şerit (FOG-09)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('çevrimiçiyken görünmez, çevrimdışıyken durum mesajı gösterir', () => {
    const { unmount } = sar(<CevrimdisiSeridi />);
    expect(screen.queryByText(/Çevrimdışısın/)).not.toBeInTheDocument();
    unmount();
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    sar(<CevrimdisiSeridi />);
    expect(screen.getByRole('status')).toHaveTextContent('Çevrimdışısın');
  });
});

describe('Önbellek filtresi', () => {
  const q = (anahtar: unknown[], status = 'success') => ({ queryKey: anahtar, state: { status } }) as unknown as Query;
  it('öğrenci sorgularını saklar; yönetici, kimlik ve hatalı sorguları saklamaz', () => {
    expect(saklanabilir(q(['panel']))).toBe(true);
    expect(saklanabilir(q(['dersler', 'MAT301']))).toBe(true);
    expect(saklanabilir(q(['yonetici', 'belgeler']))).toBe(false);
    expect(saklanabilir(q(['me']))).toBe(false);
    expect(saklanabilir(q(['panel'], 'error'))).toBe(false);
  });
});
