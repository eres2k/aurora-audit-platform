import React from 'react';
import { Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import { AuditForm } from '../components/audit/AuditForm';

export function AuditFormPage() {
  const { id } = useParams();
  return (
    <Container sx={{ py: 4 }}>
      <AuditForm auditId={id} />
    </Container>
  );
}
