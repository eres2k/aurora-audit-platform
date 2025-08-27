import React from 'react';
import { Container, Typography, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

export function AuditListPage() {
  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Audits</Typography>
        <Button variant="contained" component={Link} to="/audits/new">
          New Audit
        </Button>
      </Stack>
      <Typography color="text.secondary">No audits yet. Create one to get started.</Typography>
    </Container>
  );
}
