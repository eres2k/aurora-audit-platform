import React from 'react';
import { Button } from '@mui/material';
import * as XLSX from 'xlsx';
import { supabase } from '../services/db';

const ExcelImportExport = ({ auditId }) => {
  const exportToExcel = async () => {
    const { data: questions } = await supabase.from('questions').select('*').eq('auditId', auditId);
    const ws = XLSX.utils.json_to_sheet(questions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');
    XLSX.writeFile(wb, `audit_${auditId}.xlsx`);
  };

  const importFromExcel = async (e) => {
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws);
    await supabase.from('questions').insert(json.map(q => ({ ...q, auditId })));
  };

  return (
    <>
      <Button onClick={exportToExcel} variant="contained">Export to Excel</Button>
      <Button component="label" variant="contained">
        Import from Excel
        <input type="file" accept=".xlsx" hidden onChange={importFromExcel} />
      </Button>
    </>
  );
};

export default ExcelImportExport;
