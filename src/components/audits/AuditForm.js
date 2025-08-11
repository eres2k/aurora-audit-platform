// src/components/audit/AuditForm.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Radio,
  RadioGroup,
  IconButton,
  Chip,
  Alert,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Fab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Badge,
  Snackbar,
} from '@mui/material';
import {
  Save,
  Send,
  AddAPhoto,
  Delete,
  Edit,
  ExpandMore,
  CloudUpload,
  CloudOff,
  CheckCircle,
  Warning,
  Info,
  AttachFile,
  Close,
  NavigateNext,
  NavigateBefore,
  Add,
  Remove,
  Visibility,
  Download,
  Timer,
  Assignment,
  Comment,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useDropzone } from 'react-dropzone';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { auditService } from '../../services/auditService';
import { fileService } from '../../services/fileService';
import { useOffline } from '../../hooks/useOffline';
import { useAutoSave } from '../../hooks/useAutoSave';

// Question Types Component
const QuestionField = ({ question, control, errors, watch, attachments, onAddAttachment, onRemoveAttachment }) => {
  const watchedValues = watch();
  
  // Check conditional logic
  const isVisible = useMemo(() => {
    if (!question.conditionalLogic) return true;
    
    const { showIf } = question.conditionalLogic;
    if (!showIf) return true;
    
    const dependentValue = watchedValues[`question_${showIf.questionId}`];
    
    switch (showIf.operator) {
      case 'equals':
        return dependentValue === showIf.value;
      case 'not_equals':
        return dependentValue !== showIf.value;
      case 'contains':
        return dependentValue?.includes(showIf.value);
      case 'greater_than':
        return dependentValue > showIf.value;
      case 'less_than':
        return dependentValue < showIf.value;
      case 'is_empty':
        return !dependentValue || dependentValue === '';
      case 'is_not_empty':
        return dependentValue && dependentValue !== '';
      default:
        return true;
    }
  }, [question.conditionalLogic, watchedValues]);

  if (!isVisible) return null;

  const fieldName = `question_${question.id}`;
  const questionAttachments = attachments[question.id] || [];

  const renderField = () => {
    switch (question.type) {
      case 'text':
        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue=""
            rules={{ 
              required: question.required ? 'This field is required' : false,
              pattern: question.validation?.pattern ? {
                value: new RegExp(question.validation.pattern),
                message: 'Invalid format'
              } : undefined
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={question.text}
                error={!!errors[fieldName]}
                helperText={errors[fieldName]?.message}
                multiline={question.multiline}
                rows={question.multiline ? 3 : 1}
                required={question.required}
              />
            )}
          />
        );

      case 'number':
        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue=""
            rules={{ 
              required: question.required ? 'This field is required' : false,
              min: question.validation?.min ? {
                value: question.validation.min,
                message: `Minimum value is ${question.validation.min}`
              } : undefined,
              max: question.validation?.max ? {
                value: question.validation.max,
                message: `Maximum value is ${question.validation.max}`
              } : undefined
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label={question.text}
                error={!!errors[fieldName]}
                helperText={errors[fieldName]?.message}
                required={question.required}
                inputProps={{
                  min: question.validation?.min,
                  max: question.validation?.max,
                }}
              />
            )}
          />
        );

      case 'boolean':
        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...field}
                    checked={field.value}
                    color="primary"
                  />
                }
                label={question.text}
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue=""
            rules={{ required: question.required ? 'Please select an option' : false }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors[fieldName]}>
                <InputLabel required={question.required}>{question.text}</InputLabel>
                <Select {...field} label={question.text}>
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {question.options?.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {errors[fieldName] && (
                  <FormHelperText>{errors[fieldName].message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        );

      case 'multiselect':
        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue={[]}
            rules={{ 
              required: question.required ? 'Please select at least one option' : false 
            }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors[fieldName]}>
                <InputLabel required={question.required}>{question.text}</InputLabel>
                <Select
                  {...field}
                  multiple
                  label={question.text}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {question.options?.map((option) => (
                    <MenuItem key={option} value={option}>
                      <Checkbox checked={field.value.indexOf(option) > -1} />
                      <ListItemText primary={option} />
                    </MenuItem>
                  ))}
                </Select>
                {errors[fieldName] && (
                  <FormHelperText>{errors[fieldName].message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        );

      case 'radio':
        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue=""
            rules={{ required: question.required ? 'Please select an option' : false }}
            render={({ field }) => (
              <FormControl error={!!errors[fieldName]}>
                <Typography variant="body1" gutterBottom>
                  {question.text} {question.required && '*'}
                </Typography>
                <RadioGroup {...field}>
                  {question.options?.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
                {errors[fieldName] && (
                  <FormHelperText>{errors[fieldName].message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue={null}
            rules={{ required: question.required ? 'Please select a date' : false }}
            render={({ field }) => (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  {...field}
                  label={question.text}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors[fieldName]}
                      helperText={errors[fieldName]?.message}
                      required={question.required}
                    />
                  )}
                />
              </LocalizationProvider>
            )}
          />
        );

      case 'scale':
        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue={question.validation?.min || 1}
            rules={{ required: question.required ? 'Please select a value' : false }}
            render={({ field }) => (
              <Box>
                <Typography variant="body1" gutterBottom>
                  {question.text} {question.required && '*'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography>{question.validation?.min || 1}</Typography>
                  <Slider
                    {...field}
                    min={question.validation?.min || 1}
                    max={question.validation?.max || 10}
                    step={1}
                    marks
                    valueLabelDisplay="on"
                    sx={{ flexGrow: 1 }}
                  />
                  <Typography>{question.validation?.max || 10}</Typography>
                </Box>
                {errors[fieldName] && (
                  <FormHelperText error>{errors[fieldName].message}</FormHelperText>
                )}
              </Box>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      {renderField()}
      
      {/* Attachment Section */}
      {question.allowAttachments && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AttachFile fontSize="small" />
            <Typography variant="body2">Attachments</Typography>
            <IconButton size="small" onClick={() => onAddAttachment(question.id)}>
              <Add />
            </IconButton>
          </Box>
          
          {questionAttachments.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {questionAttachments.map((attachment, index) => (
                <Chip
                  key={index}
                  label={attachment.name}
                  size="small"
                  onDelete={() => onRemoveAttachment(question.id, index)}
                  icon={attachment.type?.startsWith('image/') ? <AddAPhoto /> : <AttachFile />}
                />
              ))}
            </Box>
          )}
        </Box>
      )}
      
      {question.helpText && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          {question.helpText}
        </Typography>
      )}
    </Box>
  );
};

// Photo Upload Component
const PhotoUpload = ({ photos, onAdd, onRemove }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    onDrop: onAdd,
    multiple: true
  });

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.3s',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          }
        }}
      >
        <input {...getInputProps()} />
        <AddAPhoto sx={{ fontSize: 48, color: 'action.active', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop photos here' : 'Drag & drop photos here'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          or click to select files
        </Typography>
      </Box>

      {photos.length > 0 && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {photos.map((photo, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Card>
                <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                  <Box
                    component="img"
                    src={photo.preview || photo.url}
                    alt={`Photo ${index + 1}`}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'error.light' },
                    }}
                    size="small"
                    onClick={() => onRemove(index)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
                {photo.caption && (
                  <CardContent>
                    <Typography variant="caption">{photo.caption}</Typography>
                  </CardContent>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

// Main AuditForm Component
const AuditForm = ({ audit, questions, onSubmit, onCancel, mode = 'create' }) => {
  const queryClient = useQueryClient();
  const isOffline = useOffline();
  const [activeStep, setActiveStep] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [attachments, setAttachments] = useState({});
  const [showValidation, setShowValidation] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [notes, setNotes] = useState('');
  const [signature, setSignature] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    getValues,
    setValue,
    trigger,
  } = useForm({
    defaultValues: {
      title: audit?.title || '',
      description: audit?.description || '',
      location: audit?.metadata?.location || '',
      department: audit?.metadata?.department || '',
      assignedTo: audit?.assignedTo || '',
      status: audit?.status || 'draft',
      ...audit?.responses?.reduce((acc, response) => {
        acc[`question_${response.questionId}`] = response.answer;
        return acc;
      }, {}) || {},
    },
  });

  // Group questions by category
  const groupedQuestions = useMemo(() => {
    if (!questions) return {};
    return questions.reduce((acc, question) => {
      const category = question.category || 'General';
      if (!acc[category]) acc[category] = [];
      acc[category].push(question);
      return acc;
    }, {});
  }, [questions]);

  const categories = Object.keys(groupedQuestions);

  // Auto-save functionality
  const { saveData } = useAutoSave({
    data: getValues(),
    enabled: autoSaveEnabled && isDirty,
    onSave: async (data) => {
      try {
        if (mode === 'edit' && audit?.id) {
          await auditService.update(audit.id, { ...data, status: 'draft' });
          setLastSaved(new Date());
          setSnackbar({
            open: true,
            message: 'Auto-saved successfully',
            severity: 'success',
          });
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    },
    interval: 30000, // Auto-save every 30 seconds
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (mode === 'edit' && audit?.id) {
        return await auditService.update(audit.id, data);
      } else {
        return await auditService.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['audits']);
      setSnackbar({
        open: true,
        message: 'Audit saved successfully',
        severity: 'success',
      });
      if (onSubmit) onSubmit();
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error',
      });
    },
  });

  // Handle form submission
  const handleFormSubmit = async (data) => {
    // Transform question responses
    const responses = Object.entries(data)
      .filter(([key]) => key.startsWith('question_'))
      .map(([key, value]) => ({
        questionId: key.replace('question_', ''),
        answer: value,
        attachments: attachments[key.replace('question_', '')] || [],
        timestamp: new Date().toISOString(),
      }));

    const auditData = {
      title: data.title,
      description: data.description,
      status: data.status,
      assignedTo: data.assignedTo,
      responses,
      photos,
      notes,
      signature,
      metadata: {
        location: data.location,
        department: data.department,
        completionPercentage: calculateProgress(),
        lastModified: new Date().toISOString(),
      },
    };

    saveMutation.mutate(auditData);
  };

  // Calculate progress
  const calculateProgress = () => {
    const allQuestions = Object.values(groupedQuestions).flat();
    const requiredQuestions = allQuestions.filter(q => q.required);
    const values = getValues();
    
    const answeredRequired = requiredQuestions.filter(q => {
      const value = values[`question_${q.id}`];
      return value !== undefined && value !== '' && value !== null;
    }).length;

    return requiredQuestions.length > 0
      ? Math.round((answeredRequired / requiredQuestions.length) * 100)
      : 100;
  };

  // Handle step navigation
  const handleNext = async () => {
    const currentCategoryQuestions = groupedQuestions[categories[activeStep]];
    const fieldsToValidate = currentCategoryQuestions.map(q => `question_${q.id}`);
    
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setActiveStep((prev) => Math.min(prev + 1, categories.length - 1));
    } else {
      setShowValidation(true);
      setSnackbar({
        open: true,
        message: 'Please complete all required fields',
        severity: 'warning',
      });
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  // Handle photo upload
  const handlePhotoAdd = useCallback((acceptedFiles) => {
    const newPhotos = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      caption: '',
      timestamp: new Date().toISOString(),
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  }, []);

  const handlePhotoRemove = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Handle attachments
  const handleAddAttachment = async (questionId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      setAttachments(prev => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), ...files],
      }));
    };
    input.click();
  };

  const handleRemoveAttachment = (questionId, index) => {
    setAttachments(prev => ({
      ...prev,
      [questionId]: prev[questionId].filter((_, i) => i !== index),
    }));
  };

  // Progress indicator
  const progress = calculateProgress();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            {mode === 'create' ? 'New Audit' : 'Edit Audit'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isOffline ? (
              <Chip
                icon={<CloudOff />}
                label="Offline Mode"
                color="warning"
                size="small"
              />
            ) : (
              <Chip
                icon={<CheckCircle />}
                label="Online"
                color="success"
                size="small"
              />
            )}
            {lastSaved && (
              <Typography variant="caption" color="textSecondary">
                Last saved: {lastSaved.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Progress</Typography>
            <Typography variant="body2">{progress}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} />
        </Box>

        {/* Basic Information */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Audit Title"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  required
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="assignedTo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Assigned To"
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Location"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Department"
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Questions Stepper */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Audit Questions
        </Typography>
        
        <Stepper activeStep={activeStep} orientation="vertical">
          {categories.map((category, index) => (
            <Step key={category}>
              <StepLabel
                optional={
                  <Typography variant="caption">
                    {groupedQuestions[category].length} questions
                  </Typography>
                }
              >
                {category}
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  {groupedQuestions[category].map((question) => (
                    <QuestionField
                      key={question.id}
                      question={question}
                      control={control}
                      errors={errors}
                      watch={watch}
                      attachments={attachments}
                      onAddAttachment={handleAddAttachment}
                      onRemoveAttachment={handleRemoveAttachment}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={index === categories.length - 1}
                  >
                    {index === categories.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {activeStep === categories.length - 1 && (
          <Alert severity="success" sx={{ mt: 2 }}>
            All questions completed! You can now add photos and notes before submitting.
          </Alert>
        )}
      </Paper>

      {/* Photo Upload Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Photos & Evidence
        </Typography>
        <PhotoUpload
          photos={photos}
          onAdd={handlePhotoAdd}
          onRemove={handlePhotoRemove}
        />
      </Paper>

      {/* Notes Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Additional Notes
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Add any additional observations or comments..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Paper>

      {/* Auto-save Toggle */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">Auto-save</Typography>
            <Typography variant="body2" color="textSecondary">
              Automatically save your progress every 30 seconds
            </Typography>
          </Box>
          <Switch
            checked={autoSaveEnabled}
            onChange={(e) => setAutoSaveEnabled(e.target.checked)}
          />
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="outlined"
          startIcon={<Save />}
          onClick={handleSubmit((data) => handleFormSubmit({ ...data, status: 'draft' }))}
        >
          Save as Draft
        </Button>
        <Button
          variant="contained"
          startIcon={<Send />}
          onClick={handleSubmit((data) => handleFormSubmit({ ...data, status: 'completed' }))}
          disabled={progress < 100}
        >
          Submit Audit
        </Button>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuditForm;
