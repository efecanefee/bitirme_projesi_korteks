import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTheme } from '@mui/material';
import { ColorModeProvider } from './Providers';
import { TEMA_ANAHTARI } from './colorMode';
import { ThemeToggle } from '@/components/layout/Topbar';

function ZeminGoster() {
  const theme = useTheme();
  return <span data-testid="mod">{theme.palette.mode}</span>;
}

function kur() {
  return render(
    <ColorModeProvider>
      <ThemeToggle />
      <ZeminGoster />
    </ColorModeProvider>,
  );
}

describe('açık/koyu tema', () => {
  afterEach(() => localStorage.clear());

  it('kayıtlı tercih yoksa cihaz ayarına uyar (testte açık)', () => {
    kur();
    expect(screen.getByTestId('mod')).toHaveTextContent('light');
    expect(screen.getByRole('button', { name: 'Koyu temaya geç' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('düğme temayı değiştirir ve seçimi hatırlar', async () => {
    const { unmount } = kur();
    await userEvent.click(screen.getByRole('button', { name: 'Koyu temaya geç' }));
    expect(screen.getByTestId('mod')).toHaveTextContent('dark');
    expect(localStorage.getItem(TEMA_ANAHTARI)).toBe('dark');
    unmount();

    // yeniden açılışta seçim korunur
    kur();
    expect(screen.getByTestId('mod')).toHaveTextContent('dark');
    await userEvent.click(screen.getByRole('button', { name: 'Açık temaya geç' }));
    expect(screen.getByTestId('mod')).toHaveTextContent('light');
    expect(localStorage.getItem(TEMA_ANAHTARI)).toBe('light');
  });
});
