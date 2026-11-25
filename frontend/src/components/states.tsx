import type { ReactNode } from 'react';
import { Alert, Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import { ApiError } from '@/api/client';

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Stack spacing={1.5} sx={{ px: 3, pb: 2.5 }} aria-busy="true" aria-label="Yükleniyor">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} variant="rounded" height={36} />
      ))}
    </Stack>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const mesaj =
    error instanceof ApiError
      ? error.message
      : 'Veriler yüklenemedi. Bağlantını kontrol edip tekrar dene.';
  return (
    <Alert
      severity="error"
      variant="outlined"
      sx={{ mx: 3, mb: 2.5 }}
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Tekrar dene
          </Button>
        ) : undefined
      }
    >
      {mesaj}
    </Alert>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <Box sx={{ py: 4, px: 3, textAlign: 'center' }}>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {children && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {children}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}
