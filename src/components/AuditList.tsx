import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { listAudits, SafetyCultureAudit } from '../services/blobStore';
import { useAuth } from '../hooks/useAuth';

type StatusFilter = 'all' | 'draft' | 'in_progress' | 'completed';

const STATUS_LABELS: Record<Exclude<StatusFilter, 'all'>, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const statusColor: Record<Exclude<StatusFilter, 'all'>, 'default' | 'primary' | 'success' | 'warning'> = {
  draft: 'default',
  in_progress: 'warning',
  completed: 'success',
};

export default function AuditList() {
  const { user, token, login, loading: authLoading } = useAuth();
  const [audits, setAudits] = useState<SafetyCultureAudit[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setAudits([]);
      return;
    }

    let isMounted = true;
    setLoading(true);
    listAudits(token)
      .then((data) => {
        if (isMounted) {
          const sorted = [...data].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          setAudits(sorted);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to load audits');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      const matchesSearch = audit.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'all' || audit.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [audits, search, status]);

  if (authLoading) {
    return (
      <Stack spacing={2} alignItems="center" py={6}>
        <CircularProgress />
        <Typography variant="body1">Checking your session…</Typography>
      </Stack>
    );
  }

  if (!user || !token) {
    return (
      <Stack spacing={3} alignItems="center" textAlign="center" py={6}>
        <Typography variant="h4" color="primary.main" fontWeight={700}>
          Welcome to your Safety Culture workspace
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={520}>
          Sign in with Netlify Identity to create audits, capture findings, and sync everything using
          Netlify Blobs storage.
        </Typography>
        <Button variant="contained" size="large" onClick={login}>
          Sign in to start auditing
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
        <Box>
          <Typography variant="h4" color="primary.main" fontWeight={700}>
            Safety Culture Audits
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track leadership commitment, communication, reporting confidence, and more in one place.
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/audits/new"
          variant="contained"
          color="primary"
          size="large"
        >
          New Safety Audit
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          label="Search by title"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ flex: 1 }}
        />
        <TextField
          select
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value as StatusFilter)}
          sx={{ width: { xs: '100%', md: 220 } }}
          SelectProps={{ native: true }}
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </TextField>
      </Stack>

      {error && (
        <Box bgcolor="error.light" color="error.contrastText" px={3} py={2} borderRadius={2}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}

      {loading ? (
        <Stack spacing={2} alignItems="center" py={4}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading your audits…
          </Typography>
        </Stack>
      ) : filteredAudits.length === 0 ? (
        <Stack spacing={2} alignItems="center" py={6} textAlign="center">
          <Typography variant="h6">No audits found</Typography>
          <Typography variant="body2" color="text.secondary" maxWidth={400}>
            Create your first safety culture audit or adjust the filters to see existing assessments.
          </Typography>
          <Button component={RouterLink} to="/audits/new" variant="outlined">
            Create audit
          </Button>
        </Stack>
      ) : (
        <Grid container spacing={3}>
          {filteredAudits.map((audit) => (
            <Grid item xs={12} md={6} key={audit.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Typography variant="h6" fontWeight={600}>
                      {audit.title}
                    </Typography>
                    <Chip
                      label={STATUS_LABELS[audit.status as Exclude<StatusFilter, 'all'>]}
                      color={statusColor[audit.status as Exclude<StatusFilter, 'all'>]}
                      size="small"
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {audit.summary || 'No executive summary captured yet.'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Updated {new Date(audit.updatedAt).toLocaleString()}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" mt={2}>
                    {audit.sections.slice(0, 3).map((section) => (
                      <Chip
                        key={section.id}
                        label={`${section.name}: ${section.rating}/5`}
                        size="small"
                        sx={{ bgcolor: 'rgba(4,99,128,0.08)' }}
                      />
                    ))}
                  </Stack>
                </CardContent>
                <CardActions sx={{ px: 3, pb: 3 }}>
                  <Button component={RouterLink} to={`/audits/${audit.id}`} variant="contained" fullWidth>
                    Open audit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}