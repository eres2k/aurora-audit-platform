import React from 'react';
import { Button } from '@mui/material';
import { uploadFile } from '../services/storage';

const ImageUpload = ({ auditId, onUpload }) => {
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const path = await uploadFile(file, auditId);
      onUpload(path);
    }
  };

  return (
    <Button variant="contained" component="label">
      Upload Image
      <input
        type="file"
        accept="image/*"
        capture="camera"
        hidden
        onChange={handleUpload}
      />
    </Button>
  );
};

export default ImageUpload;
