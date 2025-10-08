import React, { useState } from 'react';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';

import { buildSafetyCultureAuditDraft } from '../data/safetyCultureTemplate';

export default function TemplateManager() {
  const [title, setTitle] = useState('Safety Culture Assessment');
  const [copied, setCopied] = useState(false);

  const template = buildSafetyCultureAuditDraft({ title });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(template, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Unable to copy template', error);
      setCopied(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Safety Culture Template Builder</Typography>
      <Typography variant="body1" color="text.secondary">
        Configure the base title for your Safety Culture audit template. The full template includes leadership, reporting, and
        engagement focus areas with reflective prompts and guidance.
      </Typography>

      <TextField label="Template title" value={title} onChange={(event) => setTitle(event.target.value)} fullWidth />

      <Button variant="contained" onClick={handleCopy} sx={{ alignSelf: 'flex-start' }}>
        Copy template JSON
      </Button>

      {copied && <Alert severity="success">Template copied to clipboard. Paste it into your knowledge base or toolkit.</Alert>}

      <TextField
        label="Template preview"
        value={JSON.stringify(template, null, 2)}
        multiline
        minRows={12}
        fullWidth
        InputProps={{ readOnly: true }}
      />
    </Stack>
  );
}
