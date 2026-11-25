import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { girisYap, renderRoute } from '@/test/render';
import { AssistantPage } from './AssistantPage';

describe('Asistan (FG-07, FG-09)', () => {
  it('soruyu gönderir, yanıtı ve dayanağını gösterir', async () => {
    girisYap();
    renderRoute(<AssistantPage />, { path: '/asistan', url: '/asistan' });
    await userEvent.type(screen.getByRole('textbox', { name: 'Sorunu yaz' }), 'Olasılıktan geçmek için finalden kaç almam lazım?{Enter}');
    const log = screen.getByRole('log', { name: 'Sohbet' });
    expect(await within(log).findByText(/finalden en az 68/)).toBeInTheDocument();
    const dayanak = screen.getByRole('complementary', { name: 'Yanıtın dayanağı' });
    expect(within(dayanak).getByText('final_gerekli_puan')).toBeInTheDocument();
    expect(within(dayanak).getByText(/yapay zekâ ile üretilir/)).toBeInTheDocument();
  });

  it('üst çubuktan gelen soruyu (?soru=) otomatik gönderir', async () => {
    girisYap();
    renderRoute(<AssistantPage />, { path: '/asistan', url: '/asistan?soru=Mazeret%20s%C4%B1nav%C4%B1na%20hangi%20durumlarda%20girebilirim%3F' });
    expect(await screen.findByText('Ön Lisans ve Lisans Yönetmeliği, Madde 24')).toBeInTheDocument();
  });

  it('geri bildirimi işaretler (FG-11)', async () => {
    girisYap();
    renderRoute(<AssistantPage />, { path: '/asistan', url: '/asistan' });
    await userEvent.click(screen.getByRole('button', { name: 'Bu hafta neyim var?' }));
    const yararli = await screen.findByRole('button', { name: 'Yararlı' });
    await userEvent.click(yararli);
    expect(yararli).toHaveAttribute('aria-pressed', 'true');
  });
});
