import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import * as XLSX from 'xlsx';
import { deleteQuestion, listQuestions, saveQuestion, SafetyQuestion } from '../services/blobStore';
import { useAuth } from '../hooks/useAuth';

const CATEGORY_OPTIONS = [
  { value: 'leadership', label: 'Leadership' },
  { value: 'communication', label: 'Communication' },
  { value: 'reporting', label: 'Reporting' },
  { value: 'training', label: 'Training' },
  { value: 'engagement', label: 'Engagement' },
];

interface DraftQuestion {
  prompt: string;
  category: string;
  guidance: string;
}

const createDraftQuestion = (): DraftQuestion => ({ prompt: '', category: CATEGORY_OPTIONS[0].value, guidance: '' });

export default function QuestionEditor() {
  const { user, token, login, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<SafetyQuestion[]>([]);
  const [draft, setDraft] = useState<DraftQuestion>(createDraftQuestion);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setQuestions([]);
      return;
    }

    let isMounted = true;
    setLoading(true);
    listQuestions(token)
      .then((data) => {
        if (!isMounted) return;
        setQuestions(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load questions.');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleAdd = async () => {
    if (!token) {
      login();
      return;
    }
    if (!draft.prompt.trim()) {
      setError('Provide a question prompt before saving.');
      return;
    }
    try {
      const saved = await saveQuestion(token, draft);
      setQuestions((current) => [...current, saved]);
      setDraft(createDraftQuestion());
      setSuccess('Question added.');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add question.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await deleteQuestion(token, id);
      setQuestions((current) => current.filter((question) => question.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete question.');
    }
  };

  const exportQuestions = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      questions.map(({ prompt, category, guidance }) => ({ prompt, category, guidance }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');
    XLSX.writeFile(workbook, 'safety-culture-questions.xlsx');
  };

  const importQuestions = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!token) {
      login();
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet) as Array<Partial<DraftQuestion>>;

        const imported = await Promise.all(
          json
            .filter((row) => row.prompt)
            .map((row) =>
              saveQuestion(token, {
                prompt: String(row.prompt),
                category: String(row.category ?? CATEGORY_OPTIONS[0].value),
                guidance: String(row.guidance ?? ''),
              })
            )
        );

        setQuestions((current) => [...current, ...imported]);
        setSuccess(`Imported ${imported.length} questions.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to import questions.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  if (authLoading) {
    return (
      <Stack spacing={2} alignItems="center" py={6}>
        <Typography variant="body1">Loading session…</Typography>
      </Stack>
    );
  }

  if (!user || !token) {
    return (
      <Stack spacing={3} alignItems="center" textAlign="center" py={6}>
        <Typography variant="h5" color="primary.main" fontWeight={700}>
          Sign in to manage your question bank
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={480}>
          Build reusable interview prompts and culture signals once you authenticate with Netlify Identity.
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
          Safety culture question bank
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Curate consistent prompts to assess leadership, communication, and engagement behaviours.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <TextField
          label="Question prompt"
          fullWidth
          value={draft.prompt}
          onChange={(event) => setDraft((current) => ({ ...current, prompt: event.target.value }))}
          placeholder="How does leadership reinforce safety expectations during daily huddles?"
        />
        <TextField
          select
          label="Category"
          value={draft.category}
          onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
          sx={{ minWidth: { xs: '100%', md: 220 } }}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <TextField
        label="Guidance / evidence to capture"
        multiline
        minRows={3}
        value={draft.guidance}
        onChange={(event) => setDraft((current) => ({ ...current, guidance: event.target.value }))}
        placeholder="Look for positive reinforcement, public recognition, and rapid escalation of hazards."
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Button variant="contained" onClick={handleAdd} disabled={loading}>
          Add question
        </Button>
        <Button variant="outlined" onClick={exportQuestions} disabled={!questions.length}>
          Export to Excel
        </Button>
        <Button variant="outlined" component="label">
          Import from Excel
          <input type="file" accept=".xlsx,.xls" hidden onChange={importQuestions} />
        </Button>
      </Stack>

      <List sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 12px 30px rgba(4,99,128,0.06)' }}>
        {questions.map((question) => (
          <ListItem
            key={question.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => handleDelete(question.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={question.prompt}
              secondary={
                <>
                  <Typography component="span" variant="caption" color="primary.main">
                    {question.category}
                  </Typography>
                  {question.guidance && (
                    <Typography component="span" variant="caption" color="text.secondary" display="block">
                      {question.guidance}
                    </Typography>
                  )}
                </>
              }
            />
          </ListItem>
        ))}
        {!questions.length && (
          <ListItem>
            <ListItemText
              primary="No questions yet"
              secondary="Add your first prompt to start building a reusable checklist."
            />
          </ListItem>
        )}
      </List>
    </Stack>
  );
}
