import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { Save, Send, CloudOff, CheckCircle } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useOffline } from '../../hooks/useOffline';
import { useAutoSave } from '../../hooks/useAutoSave';
import { auditService } from '../../services/auditService';

const AuditForm = ({ audit, questions = [], onSubmit, onCancel, mode = 'create' }) => {
  const isOffline = useOffline();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [lastSaved, setLastSaved] = useState(null);
  
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    getValues,
  } = useForm({
    defaultValues: {
      title: audit?.title || '',
      description: audit?.description || '',
      location: audit?.metadata?.location || '',
      department: audit?.metadata?.department || '',
    },
  });

  // Auto-save functionality
  const { saveData } = useAutoSave({
    data: getValues(),
    enabled: mode === 'edit' && isDirty && !isOffline,
    onSave: async (data) => {
      try {
        if (audit?.id) {
          await auditService.update(audit.id, { ...data, status: 'draft' });
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    },
    interval: 30000,
  });

  const handleFormSubmit = async (data) => {
    try {
      if (mode === 'edit' && audit?.id) {
        await auditService.update(audit.id, data);
      } else {
        await auditService.create(data);
      }
      
      setSnackbar({
        open: true,
        message: 'Audit saved successfully',
        severity: 'success',
      });
      
      if (onSubmit) {
        onSubmit(data);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error saving audit',
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            {mode === 'create' ? 'New Audit' : 'Edit Audit'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isOffline ? (
              <Chip
                icon={<CloudOff />}
                label="Offline Mode"
                color="warning"
                size="small"
              />
            ) : (
              <Chip
                icon={<CheckCircle />}
                label="Online"
                color="success"
                size="small"
              />
            )}
            {lastSaved && (
              <Typography variant="caption" color="textSecondary">
                Last saved: {lastSaved.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Progress</Typography>
            <Typography variant="body2">50%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={50} />
        </Box>

        {/* Basic Information */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Audit Title"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  required
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Department"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Location"
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Questions Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Audit Questions
        </Typography>
        {questions.length === 0 ? (
          <Alert severity="info">No questions available. Please add questions to this audit.</Alert>
        ) : (
          <Box>
            <Typography variant="body2" color="textSecondary">
              {questions.length} questions to answer
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="outlined"
          startIcon={<Save />}
          onClick={handleSubmit((data) => handleFormSubmit({ ...data, status: 'draft' }))}
        >
          Save as Draft
        </Button>
        <Button
          variant="contained"
          startIcon={<Send />}
          onClick={handleSubmit((data) => handleFormSubmit({ ...data, status: 'completed' }))}
        >
          Submit Audit
        </Button>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuditForm;
