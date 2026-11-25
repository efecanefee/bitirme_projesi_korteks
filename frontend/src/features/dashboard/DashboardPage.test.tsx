import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { girisYap, renderRoute } from '@/test/render';
import { server } from '@/test/server';
import { DashboardPage } from './DashboardPage';

describe('Birleşik panel (FG-04)', () => {
  it('kartları ve her kartın kaynak sistemini gösterir', async () => {
    girisYap();
    renderRoute(<DashboardPage />);
    expect(await screen.findByText('Algoritma Analizi ara sınavı')).toBeInTheDocument();
    const devam = screen.getByRole('region', { name: 'Devam durumu' });
    expect(within(devam).getByLabelText(/Kaynak: OBS/)).toBeInTheDocument();
    expect(within(devam).getByText('3 / 4 hak')).toBeInTheDocument();
    const yaklasan = screen.getByRole('region', { name: 'Yaklaşan sınav ve ödevler' });
    expect(within(yaklasan).getAllByLabelText(/Kaynak: PSG/).length).toBeGreaterThan(0);
    expect(within(yaklasan).getAllByLabelText(/Kaynak: Pusula/).length).toBeGreaterThan(0);
  });

  it('sunucu hatasında anlaşılır mesaj ve tekrar dene düğmesi gösterir (FOG-09)', async () => {
    girisYap();
    server.use(http.get('*/api/v1/panel', () => HttpResponse.json({ detail: 'Kaynak sistemlere şu an ulaşılamıyor.' }, { status: 503 })));
    renderRoute(<DashboardPage />);
    expect(await screen.findByText('Kaynak sistemlere şu an ulaşılamıyor.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tekrar dene' })).toBeInTheDocument();
  });
});
