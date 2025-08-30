"use client";

import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';

function ForgotPassword({ open, handleClose }) {
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Simple email validation
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // If validation passes, proceed with submission
    console.log('Password reset requested for:', email);
    handleClose();
    setEmail('');
    setError('');
  };

  const handleInputChange = (event) => {
    setEmail(event.target.value);
    if (error) setError('');
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        handleClose();
        setEmail('');
        setError('');
      }}
      maxWidth="sm"
      fullWidth
    >
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>Reset password</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <DialogContentText sx={{ mb: 2 }}>
            Enter your account&apos;s email address, and we&apos;ll send you a link to
            reset your password.
          </DialogContentText>
          <FormControl fullWidth error={!!error}>
            <InputLabel htmlFor="email" shrink>
              Email address
            </InputLabel>
            <OutlinedInput
              autoFocus
              required
              id="email"
              name="email"
              placeholder="Enter your email address"
              type="email"
              value={email}
              onChange={handleInputChange}
              label="Email address"
              fullWidth
              sx={{ mt: 2 }}
            />
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button 
            onClick={() => {
              handleClose();
              setEmail('');
              setError('');
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" type="submit">
            Continue
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

ForgotPassword.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ForgotPassword;