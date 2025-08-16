import React from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, MenuItem } from '@mui/material';
import { createAudit } from '../services/db';
import { hasRole } from '../services/auth';

const AuditForm = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    if (!hasRole('admin') && !hasRole('auditor')) return;
    await createAudit({
      ...data,
      status: 'draft',
      createdBy: getUser().id,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField {...register('title')} label="Title" fullWidth margin="normal" />
      <TextField {...register('description')} label="Description" fullWidth margin="normal" multiline />
      <TextField
        {...register('status')}
        select
        label="Status"
        fullWidth
        margin="normal"
      >
        <MenuItem value="draft">Draft</MenuItem>
        <MenuItem value="in_progress">In Progress</MenuItem>
      </TextField>
      <Button type="submit" variant="contained">Create Audit</Button>
    </form>
  );
};

export default AuditForm;
