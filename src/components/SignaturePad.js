import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@mui/material';
import { uploadFile } from '../services/storage';

const SignaturePad = ({ auditId, onSave }) => {
  const sigRef = useRef();

  const saveSignature = async () => {
    const dataUrl = sigRef.current.toDataURL();
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `signature_${Date.now()}.png`, { type: 'image/png' });
    const path = await uploadFile(file, auditId);
    onSave(path);
  };

  return (
    <>
      <SignatureCanvas
        ref={sigRef}
        canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
      />
      <Button onClick={saveSignature} variant="contained">Save Signature</Button>
    </>
  );
};

export default SignaturePad;
