import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { supabase } from '../services/db';
import QuestionEditor from '../components/QuestionEditor';
import ImageUpload from '../components/ImageUpload';
import SignaturePad from '../components/SignaturePad';
import PDFExport from '../components/PDFExport';
import ExcelImportExport from '../components/ExcelImportExport';
import { hasRole } from '../services/auth';

const AuditDetail = () => {
  const { id } = useParams();
  const [audit, setAudit] = useState(null);

  useEffect(() => {
    const fetchAudit = async () => {
      const { data } = await supabase.from('audits').select('*').eq('id', id).single();
      setAudit(data);
    };
    fetchAudit();
  }, [id]);

  if (!audit) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4">{audit.title}</Typography>
      <Typography>Status: {audit.status}</Typography>
      {hasRole('admin') || hasRole('auditor') ? <QuestionEditor auditId={id} /> : null}
      <ImageUpload auditId={id} onUpload={(path) => console.log('Uploaded:', path)} />
      <SignaturePad auditId={id} onSave={(path) => console.log('Signed:', path)} />
      <ExcelImportExport auditId={id} />
      <PDFExport audit={audit} />
    </Box>
  );
};

export default AuditDetail;
