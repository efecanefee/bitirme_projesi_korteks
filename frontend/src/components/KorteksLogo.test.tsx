import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KorteksLogo } from './KorteksLogo';
import { BrandLogo } from './BrandLogo';
import { ColorModeProvider } from '@/app/Providers';

describe('Korteks logosu', () => {
  it('erişilebilir adla ve orana uygun genişlikte çizilir', () => {
    render(<KorteksLogo size={40} />);
    const logo = screen.getByRole('img', { name: 'Korteks' });
    // yatay logo 412.99 x 120: kılavuzdaki 120 px alt sınırın üstünde kalır
    expect(Number(logo.getAttribute('width'))).toBeGreaterThanOrEqual(120);
    render(<KorteksLogo variant="mark" size={32} title="İşaret" />);
    expect(screen.getByRole('img', { name: 'İşaret' })).toHaveAttribute('width', '32');
  });

  it('aynı sayfadaki birden fazla logo çakışan id üretmez', () => {
    const { container } = render(
      <>
        <KorteksLogo />
        <KorteksLogo />
      </>,
    );
    const idler = [...container.querySelectorAll('[id]')].map((e) => e.id);
    expect(idler.length).toBeGreaterThan(0);
    expect(new Set(idler).size).toBe(idler.length);
  });

  it('BrandLogo tema moduna göre sürüm seçer', () => {
    const { container } = render(
      <ColorModeProvider>
        <BrandLogo />
      </ColorModeProvider>,
    );
    // açık tema: yazı lacivert
    expect(container.innerHTML).toContain('#0B1B2B');
  });
});
