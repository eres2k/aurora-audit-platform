import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useAuth } from '../hooks/useAuth';
import { fetchAudit, updateAudit } from '../services/safetyCultureAudits';
import { SafetyCultureAudit, SafetyCultureResponse } from '../types/safetyCulture';

const STATUS_OPTIONS: Array<{ value: SafetyCultureAudit['status']; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const RESPONSE_OPTIONS: Array<{ value: SafetyCultureResponse | ''; label: string }> = [
  { value: '', label: 'Select rating' },
  { value: 'meets_expectations', label: 'Strong performance' },
  { value: 'needs_improvement', label: 'Needs improvement' },
  { value: 'not_applicable', label: 'Not applicable' },
];

export default function AuditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, login, getToken } = useAuth();
  const [audit, setAudit] = useState<SafetyCultureAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const initialise = async () => {
      if (!user) {
        setLoading(false);
        setAudit(null);
        return;
      }
      if (!id) {
        setError('Missing audit identifier.');
        setLoading(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token) {
          throw new Error('Authentication token not available. Please sign in again.');
        }
        const result = await fetchAudit(token, id);
        setAudit(result);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load audit';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void initialise();
  }, [getToken, id, user]);

  const handleStatusChange = (status: SafetyCultureAudit['status']) => {
    setAudit((current) => (current ? { ...current, status } : current));
  };

  const handleSummaryChange = (summary: string) => {
    setAudit((current) => (current ? { ...current, summary } : current));
  };

  const handleTitleChange = (title: string) => {
    setAudit((current) => (current ? { ...current, title } : current));
  };

  const handleResponseChange = (
    sectionId: string,
    questionId: string,
    updates: Partial<{ response: SafetyCultureResponse | null; notes: string }>,
  ) => {
    setAudit((current) => {
      if (!current) {
        return current;
      }

      const updatedSections = current.sections.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }
        return {
          ...section,
          questions: section.questions.map((question) => {
            if (question.id !== questionId) {
              return question;
            }
            return {
              ...question,
              ...updates,
            };
          }),
        };
      });

      return { ...current, sections: updatedSections };
    });
  };

  const completedQuestions = useMemo(() => {
    if (!audit) {
      return 0;
    }
    return audit.sections.reduce((total, section) => {
      return (
        total +
        section.questions.filter((question) => question.response && question.response !== '').length
      );
    }, 0);
  }, [audit]);

  const totalQuestions = audit?.sections.reduce((count, section) => count + section.questions.length, 0) ?? 0;

  const handleSave = async () => {
    if (!audit) {
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not available. Please sign in again.');
      }
      const updated = await updateAudit(token, audit);
      setAudit(updated);
      setSuccess('Safety Culture audit updated successfully.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save audit';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Alert severity="info">
        You need to sign in with Netlify Identity to access this Safety Culture audit.{' '}
        <Button color="inherit" onClick={login} sx={{ ml: 1 }}>
          Sign in
        </Button>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <CircularProgress />
        <Typography>Loading Safety Culture audit…</Typography>
      </Stack>
    );
  }

  if (!audit) {
    return (
      <Alert severity="error">
        {error ?? 'The requested Safety Culture audit could not be found.'}
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button variant="text" onClick={() => navigate(-1)}>
          Back to audits
        </Button>
        <Chip label={`Questions completed: ${completedQuestions}/${totalQuestions}`} color="primary" />
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <TextField
            label="Audit title"
            value={audit.title}
            onChange={(event) => handleTitleChange(event.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              value={audit.status}
              onChange={(event) => handleStatusChange(event.target.value as SafetyCultureAudit['status'])}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TextField
        label="Executive summary"
        placeholder="Capture overarching insights, systemic issues, and priority actions."
        value={audit.summary ?? ''}
        onChange={(event) => handleSummaryChange(event.target.value)}
        minRows={3}
        multiline
        fullWidth
      />

      <Stack spacing={3}>
        {audit.sections.map((section) => (
          <Card key={section.id} variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {section.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {section.description}
              </Typography>

              <Stack spacing={3}>
                {section.questions.map((question) => (
                  <Box key={question.id}>
                    <Typography variant="subtitle1" gutterBottom>
                      {question.prompt}
                    </Typography>
                    {question.guidance && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {question.guidance}
                      </Typography>
                    )}
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel id={`${question.id}-response`}>Rating</InputLabel>
                          <Select
                            labelId={`${question.id}-response`}
                            label="Rating"
                            value={question.response ?? ''}
                            onChange={(event) =>
                              handleResponseChange(section.id, question.id, {
                                response: (event.target.value as SafetyCultureResponse | '') || null,
                              })
                            }
                          >
                            {RESPONSE_OPTIONS.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <TextField
                          label="Evidence and next actions"
                          value={question.notes}
                          onChange={(event) =>
                            handleResponseChange(section.id, question.id, {
                              notes: event.target.value,
                            })
                          }
                          multiline
                          minRows={2}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </Stack>
    </Stack>
  );
}
