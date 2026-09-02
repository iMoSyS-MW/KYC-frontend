import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Home from './components/Home';
import KycGroup from './components/KycGroup';
import KycCorporate from './components/KycCorporate';
import KycIndividual from './components/KycIndividual';
import KycIndividualUpdate from './components/KycIndividualUpdate';
import KycGroupUpdate from './components/KycGroupUpdate';
import KycCorporateUpdate from './components/KycCorporateUpdate';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { ConfirmationDialogProvider } from './context/ConfirmationDialogContext';
import { defaultToastrOptions } from './lib/security';

declare global {
  interface Window {
    toastr: any;
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#006437',
      light: '#00cc5f',
      dark: '#00331b',
    },
    secondary: {
      main: '#00331b',
    },
    background: {
      default: '#e4edec',
      paper: '#ffffff',
    },
    text: {
      primary: '#00331b',
      secondary: '#666666',
    },
    error: {
      main: '#ca0027',
    },
    warning: {
      main: '#b73514',
    },
    success: {
      main: '#019819',
    },
    info: {
      main: '#006dcc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, color: '#00331b' },
    h2: { fontSize: '2rem', fontWeight: 700, color: '#00331b' },
    h3: { fontSize: '1.75rem', fontWeight: 700, color: '#00331b' },
    h4: { fontSize: '1.5rem', fontWeight: 700, color: '#00331b' },
    h5: { fontSize: '1.25rem', fontWeight: 700, color: '#00331b' },
    h6: { fontSize: '1.1rem', fontWeight: 700, color: '#00331b' },
    body1: { fontSize: '1rem', lineHeight: 1.5, color: '#00331b' },
    body2: { fontSize: '0.875rem', lineHeight: 1.5, color: '#666666' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 2px 8px rgba(0, 100, 55, 0.25)' },
        },
        contained: {
          '&:hover': { boxShadow: '0 4px 12px rgba(0, 100, 55, 0.35)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e0e0e0',
          '&:hover': { boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#006437' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#006437', borderWidth: 2 },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' },
      },
    },
  },
});

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLandingPage = location.pathname === '/';
  const showHeader = !isAdminRoute;

  const getPageTitle = () => {
    if (isLandingPage) return 'KYC Form Selection';
    if (location.pathname === '/kyc/group') return 'Group KYC Form';
    if (location.pathname === '/kyc/corporate') return 'Corporate KYC Form';
    if (location.pathname === '/kyc/individual') return 'Individual KYC Form';
    if (location.pathname.startsWith('/kyc/update/individual')) return 'Update Individual KYC';
    if (location.pathname.startsWith('/kyc/update/group')) return 'Update Group KYC';
    if (location.pathname.startsWith('/kyc/update/corporate')) return 'Update Corporate KYC';
    return 'KYC Form Selection';
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {showHeader && <Header title={getPageTitle()} />}

      {isAdminRoute ? (
        <Box sx={{ mt: 0, mb: 0, height: '100vh' }}>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
          </Routes>
        </Box>
      ) : (
        <Box>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/kyc/group" element={<KycGroup />} />
            <Route path="/kyc/corporate" element={<KycCorporate />} />
            <Route path="/kyc/individual" element={<KycIndividual />} />
            <Route path="/kyc/update/individual/:token" element={<KycIndividualUpdate />} />
            <Route path="/kyc/update/group/:token" element={<KycGroupUpdate />} />
            <Route path="/kyc/update/corporate/:token" element={<KycCorporateUpdate />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      )}
    </Box>
  );
}

function App() {
  useEffect(() => {
    const configureToastr = () => {
      if (window.toastr) {
        window.toastr.options = defaultToastrOptions;
      } else {
        setTimeout(configureToastr, 100);
      }
    };
    configureToastr();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ConfirmationDialogProvider>
          <Router>
            <AppContent />
          </Router>
        </ConfirmationDialogProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
