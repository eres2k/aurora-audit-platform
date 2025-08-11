import * as XLSX from 'xlsx';

export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Transform Excel data to question format
        const questions = jsonData.map((row) => ({
          text: row['Question'] || row['Text'],
          type: row['Type'] || 'text',
          category: row['Category'] || 'General',
          required: row['Required'] === 'Yes' || row['Required'] === true,
          options: row['Options'] ? row['Options'].split(',').map(o => o.trim()) : [],
          order: row['Order'] || 0,
        }));
        
        resolve(questions);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const exportToExcel = (data, filename = 'export.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, filename);
};

export const createExcelTemplate = () => {
  const template = [
    {
      Question: 'Sample Question 1',
      Type: 'text',
      Category: 'General',
      Required: 'Yes',
      Options: '',
      Order: 1,
    },
    {
      Question: 'Sample Question 2',
      Type: 'select',
      Category: 'Safety',
      Required: 'No',
      Options: 'Option1, Option2, Option3',
      Order: 2,
    },
  ];
  
  exportToExcel(template, 'question_template.xlsx');
};
