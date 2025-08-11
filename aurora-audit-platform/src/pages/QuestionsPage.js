import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Upload, Download } from '@mui/icons-material';
import { questionService } from '../services/questionService';
import { importFromExcel, createExcelTemplate } from '../utils/excelHandler';

const QuestionsPage = () => {
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const questions = await importFromExcel(file);
        console.log('Imported questions:', questions);
        // Handle imported questions
      } catch (error) {
        console.error('Import error:', error);
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Questions</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={createExcelTemplate}
          >
            Download Template
          </Button>
          <Button
            variant="contained"
            component="label"
            startIcon={<Upload />}
          >
            Import Excel
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleImport}
            />
          </Button>
        </Box>
      </Box>
      <Paper sx={{ p: 3 }}>
        <Typography>Question management interface will be implemented here</Typography>
      </Paper>
    </Box>
  );
};

export default QuestionsPage;
