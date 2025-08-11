import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditService } from '../services/auditService';
import CreateAuditDialog from '../components/audit/CreateAuditDialog';

const AuditsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: audits, isLoading } = useQuery({
    queryKey: ['audits'],
    queryFn: auditService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: auditService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['audits']);
    },
  });

  const handleView = (id) => {
    navigate(`/audits/${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this audit?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      in_progress: 'primary',
      completed: 'success',
      archived: 'warning',
    };
    return colors[status] || 'default';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Audits</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New Audit
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {audits?.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell>{audit.title}</TableCell>
                <TableCell>
                  <Chip
                    label={audit.status}
                    color={getStatusColor(audit.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(audit.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>{audit.assignedTo}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleView(audit.id)}>
                    <Visibility />
                  </IconButton>
                  <IconButton onClick={() => handleView(audit.id)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(audit.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <CreateAuditDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </Box>
  );
};

export default AuditsPage;
