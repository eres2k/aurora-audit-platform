import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { TextField, Button, List, ListItem, ListItemText } from "@mui/material";
import * as XLSX from 'xlsx';

export default function QuestionEditor() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState({ text: "", type: "text" });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const { data } = await supabase.from('questions').select('*');
    setQuestions(data || []);
  };

  const addQuestion = async () => {
    await supabase.from('questions').insert(newQuestion);
    fetchQuestions();
  };

  const exportQuestions = () => {
    const ws = XLSX.utils.json_to_sheet(questions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    XLSX.writeFile(wb, "questions.xlsx");
  };

  const importQuestions = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        supabase.from('questions').insert(json);
        fetchQuestions();
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div>
      <h2>Question Editor</h2>
      <TextField label="Question Text" value={newQuestion.text} onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })} />
      <Button onClick={addQuestion}>Add Question</Button>
      <Button onClick={exportQuestions}>Export to Excel</Button>
      <input type="file" accept=".xlsx" onChange={importQuestions} />
      <List>
        {questions.map(q => <ListItem key={q.id}><ListItemText primary={q.text} /></ListItem>)}
      </List>
    </div>
  );
}
