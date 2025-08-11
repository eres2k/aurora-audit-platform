import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { auditService } from '../../services/auditService';
import { templateService } from '../../services/templateService';

const CreateAuditDialog = ({ open, onClose }) => {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset } = useForm();
  
  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: templateService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: auditService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['audits']);
      reset();
      onClose();
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Create New Audit</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Controller
              name="title"
              control={control}
              defaultValue=""
              rules={{ required: 'Title is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Audit Title"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            
            <Controller
              name="description"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            />
            
            <Controller
              name="templateId"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Template</InputLabel>
                  <Select {...field} label="Template">
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {templates?.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            
            <Controller
              name="location"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField {...field} label="Location" fullWidth />
              )}
            />
            
            <Controller
              name="department"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField {...field} label="Department" fullWidth />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={createMutation.isLoading}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateAuditDialog;
