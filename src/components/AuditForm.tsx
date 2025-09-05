import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabase";
import { TextField, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import Dropzone from "react-dropzone";

export default function AuditForm() {
  const { id } = useParams();
  const [audit, setAudit] = useState<any>({ title: "", description: "", status: "draft" });
  const [questions, setQuestions] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (id) fetchAudit();
    fetchQuestions();
  }, [id]);

  const fetchAudit = async () => {
    const { data } = await supabase.from('audits').select('*').eq('id', id).single();
    setAudit(data);
  };

  const fetchQuestions = async () => {
    const { data } = await supabase.from('questions').select('*');
    setQuestions(data || []);
  };

  const saveAudit = async () => {
    const { data } = await supabase.from('audits').upsert(audit);
    // Handle attachments upload to Supabase storage
    for (const file of attachments) {
      await supabase.storage.from('attachments').upload(`${data.id}/${file.name}`, file);
    }
  };

  return (
    <div>
      <TextField label="Title" value={audit.title} onChange={(e) => setAudit({ ...audit, title: e.target.value })} />
      <TextField label="Description" value={audit.description} onChange={(e) => setAudit({ ...audit, description: e.target.value })} />
      <FormControl>
        <InputLabel>Status</InputLabel>
        <Select value={audit.status} onChange={(e) => setAudit({ ...audit, status: e.target.value })}>
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </Select>
      </FormControl>
      <Dropzone onDrop={(files) => setAttachments(files)}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <p>Drop files here</p>
          </div>
        )}
      </Dropzone>
      <Button onClick={saveAudit}>Save</Button>
    </div>
  );
}
