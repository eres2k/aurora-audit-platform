import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAudit, saveAudit, SafetyCultureSection } from '../services/blobStore';
import { useAuth } from '../hooks/useAuth';

const SECTION_TEMPLATES: Array<Pick<SafetyCultureSection, 'id' | 'name'>> = [
  { id: 'leadership', name: 'Leadership Commitment' },
  { id: 'communication', name: 'Communication & Learning' },
  { id: 'reporting', name: 'Reporting Confidence' },
  { id: 'training', name: 'Training & Competence' },
  { id: 'engagement', name: 'Employee Engagement' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

type DraftAudit = {
  id?: string;
  title: string;
  facility: string;
  status: 'draft' | 'in_progress' | 'completed';
  summary: string;
  sections: SafetyCultureSection[];
};

const createDefaultAudit = (): DraftAudit => ({
  title: '',
  facility: '',
  status: 'draft',
  summary: '',
  sections: SECTION_TEMPLATES.map((section) => ({ ...section, rating: 3, notes: '' })),
});

const mergeSections = (sections: SafetyCultureSection[] | undefined): SafetyCultureSection[] => {
  const base = SECTION_TEMPLATES.map((template) => {
    const existing = sections?.find((section) => section.id === template.id);
    return existing ?? { ...template, rating: 3, notes: '' };
  });
  const additional = (sections ?? []).filter(
    (section) => !SECTION_TEMPLATES.some((template) => template.id === section.id)
  );
  return [...base, ...additional];
};

export default function AuditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, login, loading: authLoading } = useAuth();

  const [draft, setDraft] = useState<DraftAudit>(createDefaultAudit);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState('');

  const isNew = !id;

  useEffect(() => {
    if (!token) {
      return;
    }

    if (!id) {
      setDraft(createDefaultAudit());
      return;
    }

    let isMounted = true;
    setLoading(true);
    getAudit(token, id)
      .then((audit) => {
        if (!isMounted) return;
        setDraft({
          id: audit.id,
          title: audit.title,
          facility: audit.facility ?? '',
          status: audit.status,
          summary: audit.summary ?? '',
          sections: mergeSections(audit.sections),
        });
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load audit.');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, token]);

  const addSection = () => {
    if (!newSectionName.trim()) return;
    setDraft((current) => ({
      ...current,
      sections: [
        ...current.sections,
        { id: `custom-${Date.now()}`, name: newSectionName.trim(), rating: 3, notes: '' },
      ],
    }));
    setNewSectionName('');
  };

  const removeSection = (sectionId: string) => {
    setDraft((current) => ({
      ...current,
      sections: current.sections.filter((section) => section.id !== sectionId),
    }));
  };

  const updateSection = (sectionId: string, updates: Partial<SafetyCultureSection>) => {
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
    }));
  };

  const handleSave = async () => {
    if (!token) {
      login();
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = await saveAudit(token, {
        ...draft,
        sections: draft.sections.map((section) => ({
          ...section,
          rating: Math.min(Math.max(section.rating, 1), 5),
        })),
      });

      setDraft({
        id: payload.id,
        title: payload.title,
        facility: payload.facility ?? '',
        status: payload.status,
        summary: payload.summary ?? '',
        sections: mergeSections(payload.sections),
      });

      setSuccess('Audit saved successfully.');

      if (isNew && payload.id) {
        navigate(`/audits/${payload.id}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save audit.');
    } finally {
      setSaving(false);
    }
  };

  const averageScore = useMemo(() => {
    if (!draft.sections.length) return 0;
    const total = draft.sections.reduce((sum, section) => sum + (section.rating ?? 0), 0);
    return Math.round((total / draft.sections.length) * 10) / 10;
  }, [draft.sections]);

  if (authLoading) {
    return (
      <Stack spacing={2} alignItems="center" py={6}>
        <Typography variant="body1">Preparing your workspace…</Typography>
      </Stack>
    );
  }

  if (!user || !token) {
    return (
      <Stack spacing={3} alignItems="center" textAlign="center" py={6}>
        <Typography variant="h5" color="primary.main" fontWeight={700}>
          Sign in to design your safety culture audit
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={500}>
          Create or edit assessments once you have authenticated with Netlify Identity.
        </Typography>
        <Button variant="contained" onClick={login}>
          Sign in
        </Button>
      </Stack>
    );
  }

  if (loading) {
    return (
      <Stack spacing={2} alignItems="center" py={6}>
        <Typography variant="body1">Loading audit details…</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" color="primary.main" fontWeight={700} gutterBottom>
          {isNew ? 'New Safety Culture Audit' : draft.title || 'Safety Culture Audit'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Rate each focus area on a 1–5 scale and capture qualitative notes to build an actionable
          culture improvement plan.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Audit title"
              fullWidth
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Quarterly safety climate pulse"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Facility / team"
              fullWidth
              value={draft.facility}
              onChange={(event) => setDraft((current) => ({ ...current, facility: event.target.value }))}
              placeholder="Distribution Center – North"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Status"
              fullWidth
              value={draft.status}
              onChange={(event) =>
                setDraft((current) => ({ ...current, status: event.target.value as DraftAudit['status'] }))
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Executive summary"
              fullWidth
              multiline
              minRows={3}
              value={draft.summary}
              onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
              placeholder="Highlight culture strengths, urgent risks, and follow-up actions."
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between" mb={3}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Focus areas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average score: {averageScore || 'N/A'} / 5
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} width={{ xs: '100%', md: 'auto' }}>
            <TextField
              label="Add new focus area"
              value={newSectionName}
              onChange={(event) => setNewSectionName(event.target.value)}
              placeholder="Psychological safety"
            />
            <Button variant="outlined" onClick={addSection} disabled={!newSectionName.trim()}>
              Add
            </Button>
          </Stack>
        </Stack>

        <Stack spacing={3}>
          {draft.sections.map((section) => {
            const isTemplate = SECTION_TEMPLATES.some((template) => template.id === section.id);
            return (
              <Box key={section.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: { xs: 2, md: 3 } }}>
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle1" fontWeight={600}>
                    {section.name}
                  </Typography>
                  {!isTemplate && (
                    <IconButton color="error" onClick={() => removeSection(section.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
                <Stack spacing={2} mt={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Rating
                    </Typography>
                    <Slider
                      value={section.rating}
                      onChange={(_, value) =>
                        updateSection(section.id, { rating: Array.isArray(value) ? value[0] : (value as number) })
                      }
                      valueLabelDisplay="auto"
                      min={1}
                      max={5}
                      step={1}
                    />
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      {section.rating}/5
                    </Typography>
                  </Stack>
                  <TextField
                    label="Observations and follow-ups"
                    multiline
                    minRows={3}
                    value={section.notes}
                    onChange={(event) => updateSection(section.id, { notes: event.target.value })}
                    placeholder="Record evidence, behaviours, and improvement actions."
                  />
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Paper>

      <Divider />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={() => navigate('/audits')} disabled={saving}>
          Back to list
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save audit'}
        </Button>
      </Stack>
    </Stack>
  );
}
