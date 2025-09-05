import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { TextField, Button, List, ListItem, ListItemText } from "@mui/material";

export default function TemplateManager() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [newTemplate, setNewTemplate] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data } = await supabase.from('templates').select('*');
    setTemplates(data || []);
  };

  const addTemplate = async () => {
    await supabase.from('templates').insert(newTemplate);
    fetchTemplates();
  };

  return (
    <div>
      <h2>Templates</h2>
      <TextField label="Name" value={newTemplate.name} onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })} />
      <TextField label="Description" value={newTemplate.description} onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })} />
      <Button onClick={addTemplate}>Add Template</Button>
      <List>
        {templates.map(t => <ListItem key={t.id}><ListItemText primary={t.name} /></ListItem>)}
      </List>
    </div>
  );
}
