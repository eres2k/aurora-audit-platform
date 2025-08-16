import React from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { getUser, logout } from '../services/auth';
import { useForm } from 'react-hook-form';
import { supabase } from '../services/db';

const Profile = () => {
  const user = getUser();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    await supabase.from('users').update({ preferences: data }).eq('id', user.id);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4">Profile</Typography>
      <Typography>Email: {user.email}</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField {...register('theme')} label="Theme" defaultValue="light" margin="normal" />
        <TextField {...register('language')} label="Language" defaultValue="en" margin="normal" />
        <Button type="submit" variant="contained">Save</Button>
      </form>
      <Button onClick={logout} variant="outlined" color="error">Logout</Button>
    </Box>
  );
};

export default Profile;
