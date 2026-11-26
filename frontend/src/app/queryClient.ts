import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/api/client';
import { ONBELLEK_OMRU_MS } from './onbellek';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        // Çevrimdışı önbellekte tutulabilmesi için bellekten silinme süresi önbellek ömrüyle aynı
        gcTime: ONBELLEK_OMRU_MS,
        refetchOnWindowFocus: true,
        // 4xx hataları tekrar denenmez; ağ/sunucu hataları 2 kez denenir
        retry: (count, err) => !(err instanceof ApiError && err.status < 500) && count < 2,
      },
      mutations: { retry: false },
    },
  });
}
