"use client";

import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Divider,
  FormLabel,
  FormControl,
  Link,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google,
  Facebook
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '0.875rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            fontSize: '0.875rem',
            padding: '10px 14px',
          },
        },
      },
    },
  },
});

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simple validation
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      console.log('Sign in attempted with:', { email, password, rememberMe });
      setIsSubmitting(false);
      // Here you would handle successful login
      alert('Sign in successful!');
    }, 1000);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 2,
          px: 1,
        }}
      >
        <Container maxWidth="xs" sx={{ padding: 0 }}>
          <Paper
            elevation={8}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
            }}
          >
            <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
              Sign in
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <FormControl fullWidth sx={{ mb: 1.5 }}>
                <FormLabel htmlFor="email" sx={{ mb: 0.5, fontSize: '0.875rem', fontWeight: 'bold' }}>
                  Email
                </FormLabel>
                <TextField
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 1 }}>
                <FormLabel htmlFor="password" sx={{ mb: 0.5, fontSize: '0.875rem', fontWeight: 'bold' }}>
                  Password
                </FormLabel>
                <TextField
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
              
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label="Remember me"
                sx={{ mb: 1, '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                sx={{ mb: 2, py: 0.75 }}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
              
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Link href="/ForgotPassword" variant="body2" sx={{ fontSize: '0.875rem' }}>
                  Forgot your password?
                </Link>
              </Box>
              
              <Divider sx={{ my: 2, fontSize: '0.75rem' }}>or</Divider>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Google fontSize="small" />}
                  size="small"
                  sx={{ py: 0.5 }}
                >
                  Sign in with Google
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Facebook fontSize="small" />}
                  size="small"
                  sx={{ py: 0.5 }}
                >
                  Sign in with Facebook
                </Button>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" component="span" sx={{ fontSize: '0.875rem' }}>
                  Don't have an account?{' '}
                </Typography>
                <Link href="/SignUpPage" variant="body2" fontWeight="bold" sx={{ fontSize: '0.875rem' }}>
                  Sign up
                </Link>
              </Box>
            </Box>
          </Paper>
          
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2, fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} DATTREO. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default SignInPage;