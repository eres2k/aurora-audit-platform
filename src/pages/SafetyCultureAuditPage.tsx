import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { AuthContext } from '../contexts/AuthContext';
import {
  SafetyCultureAuditData,
  createEmptySafetyCultureAudit,
  fetchSafetyCultureAudit,
  saveSafetyCultureAudit,
} from '../services/safetyCultureAudit';

const ratingChoices = [
  { value: 5, label: '5 - Leading (world class)' },
  { value: 4, label: '4 - Proactive (ahead of requirements)' },
  { value: 3, label: '3 - Managed (meets expectations)' },
  { value: 2, label: '2 - Reactive (responds after issues)' },
  { value: 1, label: '1 - Vulnerable (significant gaps)' },
];

export function SafetyCultureAuditPage() {
  const { user, login } = useContext(AuthContext);
  const [audit, setAudit] = useState<SafetyCultureAuditData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!user) {
        setAudit(null);
        return;
      }
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const existing = await fetchSafetyCultureAudit();
        if (!ignore) {
          setAudit(existing ?? createEmptySafetyCultureAudit());
        }
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setError(err instanceof Error ? err.message : 'Unable to load audit');
          setAudit(createEmptySafetyCultureAudit());
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [user]);

  const updateField = (field: keyof SafetyCultureAuditData, value: string) => {
    setAudit((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : prev,
    );
  };

  const updateSection = (sectionId: string, updates: Partial<{ rating: number | null; notes: string }>) => {
    setAudit((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    ...updates,
                  }
                : section,
            ),
          }
        : prev,
    );
  };

  const handleRatingChange = (sectionId: string) => (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    updateSection(sectionId, { rating: value ? Number(value) : null });
  };

  const handleNotesChange = (sectionId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSection(sectionId, { notes: event.target.value });
  };

  const handleSave = async () => {
    if (!audit) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = await saveSafetyCultureAudit(audit);
      setAudit(payload);
      setSuccess('Safety Culture audit saved successfully.');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unable to save audit');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Container sx={{ py: 6 }}>
        <Paper sx={{ p: 4 }}>
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="h4">Safety Culture Audit</Typography>
            <Typography>
              Sign in with Netlify Identity to create and manage your Safety Culture audit copy.
            </Typography>
            <Button variant="contained" onClick={login}>
              Sign in with Netlify
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Typography variant="h3">Safety Culture Audit</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Capture the current state of your organisation&apos;s safety culture and track improvements
          over time. Data is securely stored using Netlify Blobs and scoped to your Netlify
          Identity account.
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {!loading && audit && (
          <Paper sx={{ p: 4 }}>
            <Stack spacing={4}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Facility / Team"
                    fullWidth
                    value={audit.facilityName}
                    onChange={(event) => updateField('facilityName', event.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Auditor"
                    fullWidth
                    value={audit.auditorName}
                    onChange={(event) => updateField('auditorName', event.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Audit Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={audit.auditDate}
                    onChange={(event) => updateField('auditDate', event.target.value)}
                  />
                </Grid>
              </Grid>

              <Stack spacing={3}>
                {audit.sections.map((section) => (
                  <Paper variant="outlined" key={section.id} sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Typography variant="h6">{section.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rate the maturity of this element of your safety culture and capture any
                        relevant examples or gaps.
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth>
                            <InputLabel id={`${section.id}-rating-label`}>Rating</InputLabel>
                            <Select
                              labelId={`${section.id}-rating-label`}
                              label="Rating"
                              value={section.rating ? String(section.rating) : ''}
                              onChange={handleRatingChange(section.id)}
                              displayEmpty
                            >
                              <MenuItem value="">
                                <em>Select rating</em>
                              </MenuItem>
                              {ratingChoices.map((choice) => (
                                <MenuItem key={choice.value} value={String(choice.value)}>
                                  {choice.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={8}>
                          <TextField
                            label="Notes"
                            multiline
                            minRows={3}
                            fullWidth
                            value={section.notes}
                            onChange={handleNotesChange(section.id)}
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  </Paper>
                ))}
              </Stack>

              <TextField
                label="Overall observations"
                multiline
                minRows={3}
                value={audit.overallObservations}
                onChange={(event) => updateField('overallObservations', event.target.value)}
              />

              <TextField
                label="Immediate actions / follow ups"
                multiline
                minRows={3}
                value={audit.immediateActions}
                onChange={(event) => updateField('immediateActions', event.target.value)}
              />

              {audit.updatedAt && (
                <Typography variant="caption" color="text.secondary">
                  Last saved {new Date(audit.updatedAt).toLocaleString()}
                </Typography>
              )}

              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Safety Culture Audit'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setAudit(createEmptySafetyCultureAudit())}
                  disabled={saving}
                >
                  Start new copy
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )}

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
      </Stack>
    </Container>
  );
}

