import React from 'react';
import { Container, Typography } from '@mui/material';

export function QuestionsPage() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Question Management
      </Typography>
      <Typography color="text.secondary">
        Create and organize questions for your audit templates.
      </Typography>
    </Container>
  );
}
