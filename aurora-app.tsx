import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Container,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Paper,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Fab,
  Badge,
  LinearProgress,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  Stack,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Assignment,
  QuestionAnswer,
  Settings,
  Person,
  ExitToApp,
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  CloudUpload,
  CloudDownload,
  PhotoCamera,
  PictureAsPdf,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
  Search,
  FilterList,
  Sort,
  Refresh,
  MoreVert,
  ChevronLeft,
  ChevronRight,
  FirstPage,
  LastPage,
  ContentCopy,
  Share,
  Print,
  Archive,
  Unarchive,
  Lock,
  LockOpen,
  Visibility,
  VisibilityOff,
  AttachFile,
  InsertDriveFile,
  Folder,
  FolderOpen,
  Description,
  Code,
  Timeline,
  TrendingUp,
  Group,
  Business,
  LocationOn,
  CalendarToday,
  AccessTime,
  Check,
  Close,
  ExpandMore,
  ExpandLess,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Notifications,
  NotificationsActive,
  NotificationsOff,
  DarkMode,
  LightMode,
  Language,
  Palette,
  Security,
  VerifiedUser,
  AdminPanelSettings,
  SupervisorAccount,
  ManageAccounts,
  PersonAdd,
  GroupAdd,
  Upload,
  Download,
  Sync,
  SyncDisabled,
  WifiOff,
  Wifi,
  Battery20,
  BatteryFull,
  SignalWifiOff,
  SignalWifi4Bar,
  PhotoLibrary,
  CameraAlt,
  Image,
  BrokenImage,
  Collections,
  Crop,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ZoomIn,
  ZoomOut,
  RotateLeft,
  RotateRight,
  Flip,
  CropRotate,
  Tune,
  Brush,
  FormatPaint,
  Gesture,
  Create,
  BorderColor,
  HighlightOff,
  CheckBox,
  CheckBoxOutlineBlank,
  RadioButtonUnchecked,
  RadioButtonChecked,
  Star,
  StarBorder,
  StarHalf,
  ThumbUp,
  ThumbDown,
  ThumbUpOffAlt,
  ThumbDownOffAlt,
  Comment,
  Forum,
  QuestionMark,
  Help,
  HelpOutline,
  ContactSupport,
  SupportAgent,
  BugReport,
  Build,
  Engineering,
  Construction,
  HomeRepairService,
  Handyman,
  CleaningServices,
  Plumbing,
  ElectricalServices,
  CarpenterOutlined,
  RoofingOutlined
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { DataGrid } from '@mui/x-data-grid';

// Initialize Netlify Identity
const netlifyIdentity = typeof window !== 'undefined' ? require('netlify-identity-widget') : null;

// Main App Component
export default function AuroraAuditPlatform() {
  const [darkMode, setDarkMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedView, setSelectedView] = useState('dashboard');
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [newAuditDialog, setNewAuditDialog] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isMobile = useMediaQuery('(max-width:600px)');

  // Initialize Netlify Identity
  useEffect(() => {
    if (netlifyIdentity) {
      netlifyIdentity.init();
      netlifyIdentity.on('login', (user) => {
        setUser(user);
        netlifyIdentity.close();
        showNotification('Successfully logged in!', 'success');
      });
      netlifyIdentity.on('logout', () => {
        setUser(null);
        showNotification('Logged out successfully', 'info');
      });
    }

    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load sample data
    loadSampleData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Create theme
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#2196F3',
            light: '#64B5F6',
            dark: '#1976D2',
          },
          secondary: {
            main: '#FF9800',
            light: '#FFB74D',
            dark: '#F57C00',
          },
          success: {
            main: '#4CAF50',
          },
          warning: {
            main: '#FF9800',
          },
          error: {
            main: '#F44336',
          },
          background: {
            default: darkMode ? '#121212' : '#F5F5F5',
            paper: darkMode ? '#1E1E1E' : '#FFFFFF',
          },
        },
        typography: {
          h1: {
            fontSize: '2.5rem',
            fontWeight: 600,
          },
          h2: {
            fontSize: '2rem',
            fontWeight: 500,
          },
          h3: {
            fontSize: '1.75rem',
            fontWeight: 500,
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: 8,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              },
            },
          },
        },
      }),
    [darkMode]
  );

  // Load sample data
  const loadSampleData = () => {
    // Sample audits
    setAudits([
      {
        id: '1',
        title: 'Q1 2025 Safety Audit',
        status: 'in_progress',
        progress: 65,
        assignedTo: 'John Doe',
        dueDate: new Date('2025-03-31'),
        department: 'Operations',
        location: 'Main Facility',
        priority: 'high',
        questionsCompleted: 13,
        totalQuestions: 20,
      },
      {
        id: '2',
        title: 'Annual Compliance Review',
        status: 'completed',
        progress: 100,
        assignedTo: 'Jane Smith',
        dueDate: new Date('2025-02-28'),
        department: 'Legal',
        location: 'Corporate Office',
        priority: 'medium',
        questionsCompleted: 50,
        totalQuestions: 50,
      },
      {
        id: '3',
        title: 'Equipment Maintenance Check',
        status: 'draft',
        progress: 0,
        assignedTo: 'Mike Johnson',
        dueDate: new Date('2025-04-15'),
        department: 'Maintenance',
        location: 'Warehouse A',
        priority: 'low',
        questionsCompleted: 0,
        totalQuestions: 30,
      },
    ]);

    // Sample questions
    setQuestions([
      { id: '1', text: 'Are all emergency exits clearly marked?', type: 'boolean', category: 'Safety' },
      { id: '2', text: 'Number of fire extinguishers on floor', type: 'number', category: 'Safety' },
      { id: '3', text: 'Last inspection date', type: 'date', category: 'Compliance' },
      { id: '4', text: 'Inspector comments', type: 'text', category: 'General' },
      { id: '5', text: 'Upload photos of issues', type: 'file', category: 'Documentation' },
    ]);

    // Sample templates
    setTemplates([
      { id: '1', name: 'Safety Inspection', description: 'Standard safety audit template', questionCount: 25 },
      { id: '2', name: 'Quality Control', description: 'Product quality assessment', questionCount: 30 },
      { id: '3', name: 'Compliance Review', description: 'Regulatory compliance check', questionCount: 40 },
    ]);
  };

  // Show notification
  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  // Handle login
  const handleLogin = () => {
    if (netlifyIdentity) {
      netlifyIdentity.open();
    } else {
      // Fallback for demo
      setUser({ email: 'demo@aurora.com', user_metadata: { full_name: 'Demo User' } });
      showNotification('Demo login successful', 'success');
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (netlifyIdentity && user) {
      netlifyIdentity.logout();
    } else {
      setUser(null);
    }
  };

  // Render dashboard
  const renderDashboard = () => (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="600">
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Audits
                  </Typography>
                  <Typography variant="h4" fontWeight="600">
                    {audits.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <Assignment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    In Progress
                  </Typography>
                  <Typography variant="h4" fontWeight="600">
                    {audits.filter(a => a.status === 'in_progress').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <Timeline />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Completed
                  </Typography>
                  <Typography variant="h4" fontWeight="600">
                    {audits.filter(a => a.status === 'completed').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Templates
                  </Typography>
                  <Typography variant="h4" fontWeight="600">
                    {templates.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                  <Description />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Audits */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="600">
              Recent Audits
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setNewAuditDialog(true)}
            >
              New Audit
            </Button>
          </Box>
          
          <DataGrid
            rows={audits}
            columns={[
              { field: 'title', headerName: 'Title', flex: 1 },
              { 
                field: 'status', 
                headerName: 'Status', 
                width: 130,
                renderCell: (params) => (
                  <Chip
                    label={params.value}
                    size="small"
                    color={
                      params.value === 'completed' ? 'success' :
                      params.value === 'in_progress' ? 'warning' :
                      'default'
                    }
                  />
                )
              },
              { 
                field: 'progress', 
                headerName: 'Progress', 
                width: 130,
                renderCell: (params) => (
                  <Box display="flex" alignItems="center" width="100%">
                    <LinearProgress
                      variant="determinate"
                      value={params.value}
                      sx={{ flexGrow: 1, mr: 1 }}
                    />
                    <Typography variant="body2">{params.value}%</Typography>
                  </Box>
                )
              },
              { field: 'assignedTo', headerName: 'Assigned To', width: 150 },
              { field: 'department', headerName: 'Department', width: 150 },
              { 
                field: 'priority', 
                headerName: 'Priority', 
                width: 100,
                renderCell: (params) => (
                  <Chip
                    label={params.value}
                    size="small"
                    color={
                      params.value === 'high' ? 'error' :
                      params.value === 'medium' ? 'warning' :
                      'default'
                    }
                  />
                )
              },
              {
                field: 'actions',
                headerName: 'Actions',
                width: 120,
                renderCell: (params) => (
                  <Box>
                    <IconButton size="small" onClick={() => setSelectedAudit(params.row)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small">
                      <DeleteIcon />
                    </IconButton>
                    <IconButton size="small">
                      <PictureAsPdf />
                    </IconButton>
                  </Box>
                )
              }
            ]}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection
            disableSelectionOnClick
            autoHeight
          />
        </CardContent>
      </Card>
    </Box>
  );

  // Render audits view
  const renderAudits = () => (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="600">
        Audit Management
      </Typography>
      
      <Card>
        <CardContent>
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <TextField
              placeholder="Search audits..."
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ flexGrow: 1, maxWidth: 400 }}
            />
            <Button variant="outlined" startIcon={<FilterList />}>
              Filter
            </Button>
            <Button variant="outlined" startIcon={<Sort />}>
              Sort
            </Button>
            <Button variant="outlined" startIcon={<CloudDownload />}>
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setNewAuditDialog(true)}
            >
              New Audit
            </Button>
          </Box>

          <Grid container spacing={3}>
            {audits.map((audit) => (
              <Grid item xs={12} md={6} lg={4} key={audit.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Typography variant="h6" fontWeight="500">
                        {audit.title}
                      </Typography>
                      <Chip
                        label={audit.priority}
                        size="small"
                        color={
                          audit.priority === 'high' ? 'error' :
                          audit.priority === 'medium' ? 'warning' :
                          'default'
                        }
                      />
                    </Box>
                    
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="textSecondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" fontWeight="500">
                          {audit.questionsCompleted}/{audit.totalQuestions}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={audit.progress}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Stack spacing={1} mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2">{audit.assignedTo}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Business fontSize="small" color="action" />
                        <Typography variant="body2">{audit.department}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2">{audit.location}</Typography>
                      </Box>
                    </Stack>

                    <Box display="flex" gap={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => setSelectedAudit(audit)}
                        fullWidth
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PictureAsPdf />}
                        fullWidth
                      >
                        Export
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  // Render questions view
  const renderQuestions = () => (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="600">
        Question Management
      </Typography>
      
      <Card>
        <CardContent>
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <Button variant="contained" startIcon={<Add />}>
              Add Question
            </Button>
            <Button variant="outlined" startIcon={<CloudUpload />}>
              Import Excel
            </Button>
            <Button variant="outlined" startIcon={<CloudDownload />}>
              Export Excel
            </Button>
            <Button variant="outlined" startIcon={<ContentCopy />}>
              Duplicate
            </Button>
          </Box>

          <DataGrid
            rows={questions}
            columns={[
              { field: 'text', headerName: 'Question', flex: 1 },
              { field: 'type', headerName: 'Type', width: 120 },
              { field: 'category', headerName: 'Category', width: 150 },
              {
                field: 'required',
                headerName: 'Required',
                width: 100,
                renderCell: (params) => (
                  params.value ? <CheckCircle color="success" /> : <Cancel color="action" />
                )
              },
              {
                field: 'actions',
                headerName: 'Actions',
                width: 120,
                renderCell: () => (
                  <Box>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small">
                      <ContentCopy />
                    </IconButton>
                    <IconButton size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )
              }
            ]}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection
            disableSelectionOnClick
            autoHeight
          />
        </CardContent>
      </Card>
    </Box>
  );

  // Render main content based on selected view
  const renderContent = () => {
    switch (selectedView) {
      case 'dashboard':
        return renderDashboard();
      case 'audits':
        return renderAudits();
      case 'questions':
        return renderQuestions();
      default:
        return renderDashboard();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ display: 'flex' }}>
          {/* App Bar */}
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setDrawerOpen(!drawerOpen)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              
              <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 600 }}>
                Aurora Audit Platform
              </Typography>

              {/* Online/Offline Indicator */}
              <Chip
                icon={isOnline ? <Wifi /> : <WifiOff />}
                label={isOnline ? 'Online' : 'Offline'}
                size="small"
                color={isOnline ? 'success' : 'warning'}
                sx={{ mr: 2 }}
              />

              {/* Theme Toggle */}
              <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>

              {/* Notifications */}
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              {/* User Menu */}
              {user ? (
                <>
                  <IconButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{ ml: 2 }}
                  >
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {user.user_metadata?.full_name?.[0] || user.email[0].toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                  >
                    <MenuItem onClick={() => setAnchorEl(null)}>
                      <Person sx={{ mr: 1 }} /> Profile
                    </MenuItem>
                    <MenuItem onClick={() => setAnchorEl(null)}>
                      <Settings sx={{ mr: 1 }} /> Settings
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ExitToApp sx={{ mr: 1 }} /> Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button color="inherit" onClick={handleLogin} sx={{ ml: 2 }}>
                  Login
                </Button>
              )}
            </Toolbar>
          </AppBar>

          {/* Side Drawer */}
          <Drawer
            variant={isMobile ? 'temporary' : 'persistent'}
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              width: 240,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 240,
                boxSizing: 'border-box',
                mt: 8,
              },
            }}
          >
            <List>
              <ListItemButton
                selected={selectedView === 'dashboard'}
                onClick={() => {
                  setSelectedView('dashboard');
                  if (isMobile) setDrawerOpen(false);
                }}
              >
                <ListItemIcon>
                  <Dashboard />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
              
              <ListItemButton
                selected={selectedView === 'audits'}
                onClick={() => {
                  setSelectedView('audits');
                  if (isMobile) setDrawerOpen(false);
                }}
              >
                <ListItemIcon>
                  <Assignment />
                </ListItemIcon>
                <ListItemText primary="Audits" />
              </ListItemButton>
              
              <ListItemButton
                selected={selectedView === 'questions'}
                onClick={() => {
                  setSelectedView('questions');
                  if (isMobile) setDrawerOpen(false);
                }}
              >
                <ListItemIcon>
                  <QuestionAnswer />
                </ListItemIcon>
                <ListItemText primary="Questions" />
              </ListItemButton>
              
              <ListItemButton
                selected={selectedView === 'templates'}
                onClick={() => {
                  setSelectedView('templates');
                  if (isMobile) setDrawerOpen(false);
                }}
              >
                <ListItemIcon>
                  <Description />
                </ListItemIcon>
                <ListItemText primary="Templates" />
              </ListItemButton>
              
              <Divider sx={{ my: 1 }} />
              
              <ListItemButton>
                <ListItemIcon>
                  <CloudUpload />
                </ListItemIcon>
                <ListItemText primary="Import" />
              </ListItemButton>
              
              <ListItemButton>
                <ListItemIcon>
                  <CloudDownload />
                </ListItemIcon>
                <ListItemText primary="Export" />
              </ListItemButton>
              
              <ListItemButton>
                <ListItemIcon>
                  <PictureAsPdf />
                </ListItemIcon>
                <ListItemText primary="Reports" />
              </ListItemButton>
              
              <Divider sx={{ my: 1 }} />
              
              <ListItemButton>
                <ListItemIcon>
                  <Settings />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </List>
          </Drawer>

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              mt: 8,
              ml: drawerOpen && !isMobile ? '240px' : 0,
              transition: 'margin-left 0.3s',
            }}
          >
            <Container maxWidth="xl">
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                  <CircularProgress size={60} />
                </Box>
              ) : (
                renderContent()
              )}
            </Container>
          </Box>

          {/* Floating Action Button for Mobile */}
          {isMobile && (
            <Fab
              color="primary"
              aria-label="add"
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
              }}
              onClick={() => setNewAuditDialog(true)}
            >
              <Add />
            </Fab>
          )}

          {/* New Audit Dialog */}
          <Dialog
            open={newAuditDialog}
            onClose={() => setNewAuditDialog(false)}
            maxWidth="md"
            fullWidth
            fullScreen={isMobile}
          >
            <DialogTitle>
              Create New Audit
              <IconButton
                onClick={() => setNewAuditDialog(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Audit Title"
                  variant="outlined"
                  required
                />
                <TextField
                  fullWidth
                  label="Description"
                  variant="outlined"
                  multiline
                  rows={3}
                />
                <FormControl fullWidth>
                  <InputLabel>Template</InputLabel>
                  <Select label="Template">
                    {templates.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Assigned To"
                  variant="outlined"
                />
                <DatePicker
                  label="Due Date"
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select label="Priority">
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setNewAuditDialog(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={() => {
                  showNotification('Audit created successfully!', 'success');
                  setNewAuditDialog(false);
                }}
              >
                Create Audit
              </Button>
            </DialogActions>
          </Dialog>

          {/* Notification Snackbar */}
          <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={() => setNotification({ ...notification, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <Alert
              onClose={() => setNotification({ ...notification, open: false })}
              severity={notification.severity}
              variant="filled"
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}