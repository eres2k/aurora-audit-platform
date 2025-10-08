import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteTemplate, listTemplates, saveTemplate, SafetyTemplate } from '../services/blobStore';
import { useAuth } from '../hooks/useAuth';

const SECTION_OPTIONS = [
  { id: 'leadership', name: 'Leadership Commitment' },
  { id: 'communication', name: 'Communication & Learning' },
  { id: 'reporting', name: 'Reporting Confidence' },
  { id: 'training', name: 'Training & Competence' },
  { id: 'engagement', name: 'Employee Engagement' },
];

interface DraftTemplate {
  name: string;
  description: string;
  sections: string[];
}

const createDraftTemplate = (): DraftTemplate => ({ name: '', description: '', sections: SECTION_OPTIONS.map((section) => section.id) });

export default function TemplateManager() {
  const { user, token, login, loading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<SafetyTemplate[]>([]);
  const [draft, setDraft] = useState<DraftTemplate>(createDraftTemplate);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sectionPicker, setSectionPicker] = useState('');

  useEffect(() => {
    if (!token) {
      setTemplates([]);
      return;
    }
    let isMounted = true;
    listTemplates(token)
      .then((data) => {
        if (isMounted) setTemplates(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load templates.'));

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleAddSection = (sectionId: string) => {
    setDraft((current) => ({
      ...current,
      sections: current.sections.includes(sectionId)
        ? current.sections
        : [...current.sections, sectionId],
    }));
  };

  const handleRemoveSection = (sectionId: string) => {
    setDraft((current) => ({
      ...current,
      sections: current.sections.filter((id) => id !== sectionId),
    }));
  };

  const handleSave = async () => {
    if (!token) {
      login();
      return;
    }
    if (!draft.name.trim()) {
      setError('Template name is required.');
      return;
    }

    try {
      const saved = await saveTemplate(token, {
        name: draft.name,
        description: draft.description,
        sections: draft.sections.map((id) => ({
          id,
          name: SECTION_OPTIONS.find((section) => section.id === id)?.name ?? id,
        })),
      });

      setTemplates((current) => [...current, saved]);
      setDraft(createDraftTemplate());
      setSuccess('Template created.');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create template.');
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!token) return;
    try {
      await deleteTemplate(token, templateId);
      setTemplates((current) => current.filter((template) => template.id !== templateId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete template.');
    }
  };

  if (authLoading) {
    return (
      <Stack spacing={2} alignItems="center" py={6}>
        <Typography variant="body1">Preparing templates…</Typography>
      </Stack>
    );
  }

  if (!user || !token) {
    return (
      <Stack spacing={3} alignItems="center" textAlign="center" py={6}>
        <Typography variant="h5" color="primary.main" fontWeight={700}>
          Sign in to organise reusable templates
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={520}>
          Templates combine focus areas so teams can assess sites consistently.
        </Typography>
        <Button variant="contained" onClick={login}>
          Sign in
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" color="primary.main" fontWeight={700} gutterBottom>
          Safety culture templates
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Reuse proven checklists across teams and deployments.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Template name"
              fullWidth
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              placeholder="Monthly leadership walkthrough"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Description"
              fullWidth
              value={draft.description}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              placeholder="Focuses on leadership visibility and engagement signals."
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              label="Add focus area"
              value={sectionPicker}
              onChange={(event) => {
                const selection = event.target.value as string;
                if (selection) {
                  handleAddSection(selection);
                  setSectionPicker('');
                }
              }}
              helperText="Select a focus area to include in this template"
            >
              <MenuItem value="" disabled>
                Choose focus area
              </MenuItem>
              {SECTION_OPTIONS.map((section) => (
                <MenuItem key={section.id} value={section.id}>
                  {section.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {draft.sections.map((sectionId) => {
                const section = SECTION_OPTIONS.find((option) => option.id === sectionId);
                return (
                  <Chip
                    key={sectionId}
                    label={section?.name ?? sectionId}
                    onDelete={() => handleRemoveSection(sectionId)}
                    sx={{ bgcolor: 'rgba(4,99,128,0.08)' }}
                  />
                );
              })}
            </Stack>
          </Grid>
        </Grid>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="flex-end" mt={3}>
          <Button variant="contained" onClick={handleSave}>
            Save template
          </Button>
        </Stack>
      </Paper>

      <List sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 12px 30px rgba(4,99,128,0.06)' }}>
        {templates.map((template) => (
          <ListItem
            key={template.id}
            alignItems="flex-start"
            secondaryAction={
              <IconButton edge="end" onClick={() => handleDelete(template.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={
                <Typography variant="h6" fontWeight={600}>
                  {template.name}
                </Typography>
              }
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {template.description || 'No description provided.'}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {template.sections.map((section) => (
                      <Chip key={section.id} label={section.name} size="small" />
                    ))}
                  </Stack>
                </>
              }
            />
          </ListItem>
        ))}
        {!templates.length && (
          <ListItem>
            <ListItemText
              primary="No templates created"
              secondary="Create your first template to standardise assessments across teams."
            />
          </ListItem>
        )}
      </List>
    </Stack>
  );
}
