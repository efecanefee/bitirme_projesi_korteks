import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ara, dizinOlustur, sadelestir, soruMu } from './arama';
import { GlobalArama } from './GlobalArama';
import { dersKayitlari, duyurular } from '@/mocks/data';
import { girisYap, renderRoute } from '@/test/render';

describe('sadelestir ve soruMu', () => {
  it('Türkçe karakterleri ve büyük harfi yok sayar', () => {
    expect(sadelestir('Olasılık ve İSTATİSTİK  Çğş')).toBe('olasilik ve istatistik cgs');
  });

  it('soru gibi görünen sorguları tanır', () => {
    expect(soruMu('Mazeret sınavına kimler girebilir?')).toBe(true);
    expect(soruMu('finalden kaç almam gerekiyor')).toBe(true);
    expect(soruMu('olasılık')).toBe(false);
    expect(soruMu('BİL301')).toBe(false);
  });
});

describe('ara', () => {
  const dizin = dizinOlustur({ dersler: dersKayitlari, duyurular });

  it('Türkçe karakter yazmadan dersi bulur', () => {
    const sonuc = ara(dizin, 'olasilik');
    expect(sonuc[0]?.tur).toBe('ders');
    expect(sonuc[0]?.baslik).toContain('Olasılık');
  });

  it('ders koduyla ve sayfa adıyla bulur', () => {
    expect(ara(dizin, 'bil301').some((s) => s.hedef === `/derslerim/${encodeURIComponent('BİL301')}`)).toBe(true);
    expect(ara(dizin, 'takvim').some((s) => s.tur === 'sayfa' && s.hedef === '/takvim')).toBe(true);
  });

  it('eşleşme yoksa boş döner', () => {
    expect(ara(dizin, 'zzzqqq')).toEqual([]);
  });
});

describe('GlobalArama', () => {
  it('yazarken sonuçları listeler, Enter ile dersi açar', async () => {
    girisYap();
    const { router } = renderRoute(<GlobalArama />);
    const kutu = screen.getByRole('combobox', { name: "Ara veya Korti'ye sor" });
    await userEvent.click(kutu);
    await userEvent.type(kutu, 'olasilik');
    const liste = await screen.findByRole('listbox', { name: 'Arama sonuçları' });
    await waitFor(() => expect(within(liste).getAllByRole('option')[0]).toHaveTextContent('Olasılık'));
    expect(within(liste).getByRole('option', { name: /Korti'ye sor/ })).toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(decodeURIComponent(router.state.location.pathname)).toBe('/derslerim/MAT301'));
  });

  it("soru yazılınca Korti'ye sor satırı en üste çıkar ve asistana gönderir", async () => {
    girisYap();
    const { router } = renderRoute(<GlobalArama />);
    const kutu = screen.getByRole('combobox');
    await userEvent.click(kutu);
    await userEvent.type(kutu, 'Mazeret sınavına kimler girebilir?');
    const liste = await screen.findByRole('listbox');
    expect(within(liste).getAllByRole('option')[0]).toHaveTextContent("Korti'ye sor");
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(router.state.location.pathname).toBe('/asistan'));
    expect(router.state.location.search).toContain('soru=');
  });
});
