import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TextField,
  Button,
  Stack,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { PhotoUpload } from '../common/PhotoUpload';
import { QuestionEditor } from './QuestionEditor';
import { useAudit } from '../../hooks/useAudit';

const auditSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  template: z.string().optional(),
  questions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    type: z.enum(['text', 'number', 'boolean', 'select', 'date', 'file']),
    answer: z.any().optional(),
    attachments: z.array(z.string()).optional(),
  })),
});

export function AuditForm({ auditId }: { auditId?: string }) {
  const [activeStep, setActiveStep] = React.useState(0);
  const { createAudit, updateAudit, audit } = useAudit(auditId);
  
  const { control, handleSubmit, watch, setValue } = useForm({
    resolver: zodResolver(auditSchema),
    defaultValues: audit || {
      title: '',
      description: '',
      questions: [],
    },
  });

  const onSubmit = async (data: z.infer<typeof auditSchema>) => {
    try {
      if (auditId) {
        await updateAudit.mutateAsync({ id: auditId, ...data });
      } else {
        await createAudit.mutateAsync(data);
      }
    } catch (error) {
      console.error('Failed to save audit:', error);
    }
  };

  const steps = ['Basic Information', 'Questions', 'Review & Submit'];

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        {auditId ? 'Edit Audit' : 'New Audit'}
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {activeStep === 0 && (
            <>
              <Controller
                name="title"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Audit Title"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                  />
                )}
              />
            </>
          )}
          
          {activeStep === 1 && (
            <QuestionEditor
              questions={watch('questions')}
              onChange={(questions) => setValue('questions', questions)}
            />
          )}
          
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6">Review Your Audit</Typography>
              <pre>{JSON.stringify(watch(), null, 2)}</pre>
            </Box>
          )}
          
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button
              disabled={activeStep === 0}
              onClick={() => setActiveStep((prev) => prev - 1)}
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button type="submit" variant="contained" color="primary">
                Submit Audit
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => setActiveStep((prev) => prev + 1)}
              >
                Next
              </Button>
            )}
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
}
