import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { KortiMascot } from './KortiMascot';
import { KortiFab } from './KortiFab';
import { kortiDurumu, SORU_ODAKLA_OLAYI, useKortiStore } from './kortiStore';
import { KortiCard } from '@/features/dashboard/KortiCard';
import { ColorModeProvider } from '@/app/Providers';

function Konum() {
  const { pathname, search } = useLocation();
  return <span data-testid="konum">{pathname + search}</span>;
}

function kur(url: string, icerik: React.ReactNode = null) {
  return render(
    <ColorModeProvider>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="*" element={<>{icerik}<KortiFab /><Konum /></>} />
        </Routes>
      </MemoryRouter>
    </ColorModeProvider>,
  );
}

afterEach(() => {
  useKortiStore.setState({ kartKapali: false });
  localStorage.clear();
});

describe('Korti maskotu', () => {
  it('ifade asistan yanıtının mevcut niyet alanından gelir', () => {
    expect(kortiDurumu(undefined)).toBe('idle');
    expect(kortiDurumu({ niyet: 'bulunamadi' })).toBe('sad');
    expect(kortiDurumu({ niyet: 'belge' })).toBe('found');
  });

  it('erişilebilir durum etiketi taşır; süs olarak kullanılınca gizlenir', () => {
    const { container, rerender } = render(<KortiMascot state="think" />);
    expect(screen.getByRole('img', { name: 'Korti düşünüyor' })).toBeInTheDocument();
    rerender(<KortiMascot state="think" decorative mini />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('.korti')).toHaveClass('k-mini');
  });
});

describe('paneldeki Korti kartı ve sağ alttaki düğme', () => {
  it('kart açıkken panelde düğme yok; küçültünce düğme çıkar, düğme kartı geri açar', async () => {
    kur('/', <KortiCard yaklasan={[]} />);
    expect(screen.queryByRole('button', { name: 'Korti kartını aç' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Korti kartını küçült' }));
    expect(useKortiStore.getState().kartKapali).toBe(true);
    expect(JSON.parse(localStorage.getItem('korteks.korti')!).state.kartKapali).toBe(true);

    await userEvent.click(screen.getByRole('button', { name: 'Korti kartını aç' }));
    expect(useKortiStore.getState().kartKapali).toBe(false);
  });

  it('diğer sayfalarda düğme asistana götürür', async () => {
    kur('/takvim');
    await userEvent.click(screen.getByRole('button', { name: "Korti'ye sor" }));
    expect(screen.getByTestId('konum')).toHaveTextContent('/asistan');
  });

  it('asistan sayfasında düğme soru kutusuna odaklanma isteği gönderir', async () => {
    let istek = 0;
    const dinle = () => istek++;
    window.addEventListener(SORU_ODAKLA_OLAYI, dinle);
    kur('/asistan');
    await userEvent.click(screen.getByRole('button', { name: "Korti'ye soru yaz" }));
    expect(istek).toBe(1);
    window.removeEventListener(SORU_ODAKLA_OLAYI, dinle);
  });

  it('karttaki hazır soru asistana soruyla birlikte gider', async () => {
    kur('/', <KortiCard yaklasan={[]} />);
    await userEvent.click(screen.getByRole('button', { name: /Kaç devamsızlık hakkım kaldı/ }));
    expect(screen.getByTestId('konum')).toHaveTextContent('/asistan?soru=');
  });
});
