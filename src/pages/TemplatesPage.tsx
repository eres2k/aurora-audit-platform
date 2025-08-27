import React from 'react';
import { Container, Typography } from '@mui/material';

export function TemplatesPage() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Templates
      </Typography>
      <Typography color="text.secondary">
        Manage reusable audit templates here.
      </Typography>
    </Container>
  );
}
