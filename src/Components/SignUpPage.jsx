"use client";

import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  FormLabel,
  FormControl,
  Link,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormHelperText,
  Chip,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CloudUpload,
  Close,
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
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.75rem',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '0.75rem',
          padding: '4px 8px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            fontSize: '0.75rem',
            padding: '6px 8px',
            height: '1em',
          },
          '& .MuiFormHelperText-root': {
            fontSize: '0.65rem',
            marginTop: '2px',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          '& .MuiSelect-select': {
            padding: '6px 32px 6px 8px',
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          fontWeight: 'bold',
          marginBottom: '2px',
          color: '#374151',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    role: '',
    companyName: '',
    registrationNumber: '',
    taxId: '',
    industryType: '',
    street: '',
    city: '',
    country: '',
    website: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [kycFiles, setKycFiles] = useState([]);

  const industryTypes = [
    'Retail', 'Manufacturing', 'Technology', 'Healthcare', 'Finance',
    'Education', 'Construction', 'Transportation', 'Hospitality', 'Other'
  ];

  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
    'France', 'India', 'Japan', 'Brazil', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setLogoFile(file);
  };

  const handleKycUpload = (e) => {
    const files = Array.from(e.target.files);
    setKycFiles(prev => [...prev, ...files]);
  };

  const removeKycFile = (index) => {
    setKycFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.role) newErrors.role = 'Please select a role';
    
    if (formData.role && formData.role !== 'Admin') {
      if (!formData.companyName) newErrors.companyName = 'Company name is required';
      if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration number is required';
      if (!formData.taxId) newErrors.taxId = 'Tax ID is required';
      if (!formData.industryType) newErrors.industryType = 'Industry type is required';
      if (!formData.street) newErrors.street = 'Street address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.country) newErrors.country = 'Country is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }
    
    setTimeout(() => {
      console.log('Sign up data:', { ...formData, logoFile, kycFiles });
      setIsSubmitting(false);
      alert('Account created successfully!');
    }, 1000);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const showCompanyForm = formData.role && formData.role !== 'Admin';

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 1,
          px: 1,
        }}
      >
        <Container maxWidth="sm" sx={{ p: 0 }}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
            }}
          >
            <Typography component="h1" variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
              Create Account
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', fontSize: '0.8rem', color: '#374151' }}>
                Personal Information
              </Typography>
              
              <Grid container spacing={1} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.fullName}>
                    <FormLabel>Full Name *</FormLabel>
                    <TextField
                      name="fullName"
                      placeholder="Nikshan"
                      value={formData.fullName}
                      onChange={handleChange}
                      error={!!errors.fullName}
                      helperText={errors.fullName}
                      size="small"
                    />
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.email}>
                    <FormLabel>Email Address *</FormLabel>
                    <TextField
                      name="email"
                      type="email"
                      placeholder="Nikshan@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      size="small"
                    />
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.mobile}>
                    <FormLabel>Mobile Number *</FormLabel>
                    <TextField
                      name="mobile"
                      placeholder="+94 77 123 4567"
                      value={formData.mobile}
                      onChange={handleChange}
                      error={!!errors.mobile}
                      helperText={errors.mobile}
                      size="small"
                    />
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.password}>
                    <FormLabel>Password *</FormLabel>
                    <TextField
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••"
                      value={formData.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password}
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleClickShowPassword}
                              edge="end"
                              size="small"
                              sx={{ fontSize: '0.9rem' }}
                            >
                              {showPassword ? <VisibilityOff fontSize="inherit" /> : <Visibility fontSize="inherit" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle2" sx={{ mb: 1, mt: 1.5, fontWeight: 'bold', fontSize: '0.8rem', color: '#374151' }}>
                Role & Company Selection
              </Typography>
              
              <Grid container spacing={1} sx={{ mb: 1 }}>
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.role}>
                    <FormLabel>Select Role *</FormLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      displayEmpty
                      size="small"
                    >
                      <MenuItem value=""><em>Select your role</em></MenuItem>
                      <MenuItem value="Corporate">Corporate</MenuItem>
                      <MenuItem value="Dealer">Dealer</MenuItem>
                      <MenuItem value="Marketing Agency">Marketing Agency</MenuItem>
                      <MenuItem value="Admin">Admin (Platform-level)</MenuItem>
                    </Select>
                    {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                  </FormControl>
                </Grid>
              </Grid>
              
              {showCompanyForm && (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 1, mt: 1.5, fontWeight: 'bold', fontSize: '0.8rem', color: '#374151' }}>
                    Company Details
                  </Typography>
                  
                  <Grid container spacing={1} sx={{ mb: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={!!errors.companyName}>
                        <FormLabel>Company Name *</FormLabel>
                        <TextField
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          size="small"
                        />
                        {errors.companyName && <FormHelperText>{errors.companyName}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={!!errors.registrationNumber}>
                        <FormLabel>Registration Number *</FormLabel>
                        <TextField
                          name="registrationNumber"
                          value={formData.registrationNumber}
                          onChange={handleChange}
                          size="small"
                        />
                        {errors.registrationNumber && <FormHelperText>{errors.registrationNumber}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={!!errors.taxId}>
                        <FormLabel>Tax ID / VAT / GST *</FormLabel>
                        <TextField
                          name="taxId"
                          value={formData.taxId}
                          onChange={handleChange}
                          size="small"
                        />
                        {errors.taxId && <FormHelperText>{errors.taxId}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={!!errors.industryType}>
                        <FormLabel>Industry Type *</FormLabel>
                        <Select
                          name="industryType"
                          value={formData.industryType}
                          onChange={handleChange}
                          displayEmpty
                          size="small"
                        >
                          <MenuItem value=""><em>Select industry</em></MenuItem>
                          {industryTypes.map(type => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                          ))}
                        </Select>
                        {errors.industryType && <FormHelperText>{errors.industryType}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormLabel>Address *</FormLabel>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl fullWidth error={!!errors.street}>
                        <TextField
                          name="street"
                          placeholder="Street address"
                          value={formData.street}
                          onChange={handleChange}
                          size="large"
                        />
                        {errors.street && <FormHelperText>{errors.street}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={15} sm={6}>
                      <FormControl fullWidth error={!!errors.city}>
                        <TextField
                          name="city"
                          placeholder="City"
                          value={formData.city}
                          onChange={handleChange}
                          size="small"
                        />
                        {errors.city && <FormHelperText>{errors.city}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={!!errors.country}>
                        <Select
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          displayEmpty
                          size="small"
                        >
                          <MenuItem value=""><em>Select country</em></MenuItem>
                          {countries.map(country => (
                            <MenuItem key={country} value={country}>{country}</MenuItem>
                          ))}
                        </Select>
                        {errors.country && <FormHelperText>{errors.country}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <FormLabel>Website (Optional)</FormLabel>
                        <TextField
                          name="website"
                          placeholder="https://yourcompany.com"
                          value={formData.website}
                          onChange={handleChange}
                          size="small"
                        />
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <FormLabel>Upload Logo (Optional)</FormLabel>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<CloudUpload sx={{ fontSize: '0.9rem' }} />}
                          size="small"
                          fullWidth
                          sx={{ justifyContent: 'flex-start' }}
                        >
                          {logoFile ? logoFile.name : 'Select Logo'}
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleLogoUpload}
                          />
                        </Button>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <FormLabel>Upload KYC Documents (Optional)</FormLabel>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<CloudUpload sx={{ fontSize: '0.9rem' }} />}
                          size="small"
                          fullWidth
                          sx={{ justifyContent: 'flex-start' }}
                        >
                          Add Files
                          <input
                            type="file"
                            hidden
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleKycUpload}
                          />
                        </Button>
                        {kycFiles.length > 0 && (
                          <Box sx={{ mt: 0.5 }}>
                            {kycFiles.map((file, index) => (
                              <Chip
                                key={index}
                                label={file.name}
                                onDelete={() => removeKycFile(index)}
                                size="small"
                                sx={{ m: 0.25, fontSize: '0.65rem', height: '24px' }}
                                deleteIcon={<Close sx={{ fontSize: '0.9rem' }} />}
                              />
                            ))}
                          </Box>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                </>
              )}
              
              <FormControlLabel
                control={<Checkbox color="primary" size="small" />}
                label="I agree to the Terms and Conditions"
                sx={{ mb: 1, mt: 1, '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                sx={{ mb: 1, py: 0.5, fontSize: '0.8rem' }}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" component="span" sx={{ fontSize: '0.75rem' }}>
                  Already have an account?{' '}
                </Typography>
                <Link href="/SignInPage" variant="body2" fontWeight="bold" sx={{ fontSize: '0.75rem' }}>
                  Sign in
                </Link>
              </Box>
            </Box>
          </Paper>
          
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1, fontSize: '0.65rem' }}>
            © {new Date().getFullYear()} DATTREO. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default SignUpPage;