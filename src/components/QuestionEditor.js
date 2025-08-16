import React, { useState } from 'react';
import { TextField, Button, MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import { supabase } from '../services/db';

const QuestionEditor = ({ auditId }) => {
  const { register, handleSubmit } = useForm();
  const [type, setType] = useState('text');

  const onSubmit = async (data) => {
    await supabase.from('questions').insert({
      ...data,
      type,
      auditId,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField {...register('text')} label="Question Text" fullWidth margin="normal" />
      <TextField
        select
        value={type}
        onChange={(e) => setType(e.target.value)}
        label="Type"
        fullWidth
        margin="normal"
      >
        <MenuItem value="text">Text</MenuItem>
        <MenuItem value="number">Number</MenuItem>
        <MenuItem value="boolean">Yes/No</MenuItem>
        <MenuItem value="select">Select</MenuItem>
      </TextField>
      <Button type="submit" variant="contained">Add Question</Button>
    </form>
  );
};

export default QuestionEditor;
