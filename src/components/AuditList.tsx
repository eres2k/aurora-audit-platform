import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';

import { useAuth } from '../hooks/useAuth';
import {
  createSafetyCultureAudit,
  deleteAudit,
  listAudits,
} from '../services/safetyCultureAudits';
import { SafetyCultureAudit } from '../types/safetyCulture';

export default function AuditList() {
  const { user, login, logout, getToken } = useAuth();
  const navigate = useNavigate();
  const [audits, setAudits] = useState<SafetyCultureAudit[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAudits = useCallback(async () => {
    if (!user) {
      setAudits([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not available. Please sign in again.');
      }
      const data = await listAudits(token);
      setAudits(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load audits';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [getToken, user]);

  useEffect(() => {
    void loadAudits();
  }, [loadAudits]);

  const handleCreate = async () => {
    if (!user) {
      login();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not available. Please sign in again.');
      }
      const newAudit = await createSafetyCultureAudit(token);
      setAudits((current) => [newAudit, ...current]);
      navigate(`/audits/${newAudit.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create audit';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (auditId: string) => {
    const confirmed = window.confirm('Delete this audit? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not available. Please sign in again.');
      }
      await deleteAudit(token, auditId);
      setAudits((current) => current.filter((audit) => audit.id !== auditId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete audit';
      setError(message);
    }
  };

  const filteredAudits = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return audits;
    }
    return audits.filter((audit) =>
      [audit.title, audit.summary ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [audits, search]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Safety Culture Audits
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create evidence-based copies of the Safety Culture assessment, capture insights, and track progress over time with Netlify Identity and Blobs-backed storage.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {user ? (
            <Button variant="outlined" onClick={logout} data-testid="logout-button">
              Sign out
            </Button>
          ) : (
            <Button variant="contained" onClick={login} data-testid="login-button">
              Sign in
            </Button>
          )}
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} mb={2}>
        <TextField
          label="Search audits"
          placeholder="Search by title or summary"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fullWidth
        />
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            disabled={loading}
          >
            New Safety Culture Copy
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadAudits}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {!user && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Sign in with Netlify Identity to start creating Safety Culture audits and persist them to Netlify Blobs.
        </Alert>
      )}

      {loading && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Loading audits…</Typography>
        </Stack>
      )}

      {filteredAudits.length === 0 && user && !loading ? (
        <Alert severity="info">No audits yet. Create your first Safety Culture copy to begin.</Alert>
      ) : (
        <List>
          {filteredAudits.map((audit) => (
            <ListItem
              key={audit.id}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(audit.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  <Button component={RouterLink} to={`/audits/${audit.id}`} variant="text">
                    {audit.title}
                  </Button>
                }
                secondary={`Status: ${audit.status.replace('_', ' ')} • Last updated ${new Date(audit.updatedAt).toLocaleString()}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
