import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/auditService';

const AuditDetailPage = () => {
  const { id } = useParams();
  
  const { data: audit, isLoading } = useQuery({
    queryKey: ['audit', id],
    queryFn: () => auditService.getById(id),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {audit?.title}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Details will be implemented here</Typography>
      </Paper>
    </Box>
  );
};

export default AuditDetailPage;
