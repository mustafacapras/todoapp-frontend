import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { userApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const SettingsPage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [profileSuccessSnackbar, setProfileSuccessSnackbar] = useState(false);
  const [passwordSuccessSnackbar, setPasswordSuccessSnackbar] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!profileData.firstName || !profileData.lastName) {
      toast.error('Please fill in all fields');
      return;
    }
    setProfileDialogOpen(true);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    setPasswordDialogOpen(true);
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      await userApi.updateUser({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      });
      
      setProfileDialogOpen(false);
      setProfileSuccessSnackbar(true);
      
      // Show success message with custom styling
      toast.success('Profile updated successfully! 👍', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: <CheckCircleOutlineIcon style={{ color: '#4CAF50' }} />,
        style: {
          backgroundColor: '#ffffff',
          color: '#333333',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          fontSize: '16px'
        }
      });

      // Update local user data without page reload
      const updatedUser = {
        ...user,
        firstName: profileData.firstName,
        lastName: profileData.lastName
      };
      // Update the user context if needed
      if (typeof updateUser === 'function') {
        updateUser(updatedUser);
      }

    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      setLoading(true);
      await userApi.updatePassword({
        newPassword: passwordData.newPassword
      });
      
      setPasswordDialogOpen(false);
      setPasswordSuccessSnackbar(true);
      
      // Clear password fields
      setPasswordData({
        newPassword: '',
        confirmPassword: '',
      });

      // Delay logout and navigation
      setTimeout(() => {
        logout();
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Password update error:', error);
      toast.error(error.response?.data || 'Failed to update password');
      setPasswordDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Manage your account settings and change your password
      </Typography>

      <Stack spacing={4}>
        {/* Profile Settings */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Update your name and surname
            </Typography>

            <Box component="form" onSubmit={handleProfileSubmit} sx={{ maxWidth: 400 }}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  disabled={loading}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your new password below
            </Typography>

            <Box component="form" onSubmit={handlePasswordSubmit} sx={{ maxWidth: 400 }}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  disabled={loading}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {/* Profile Update Confirmation Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
      >
        <DialogTitle>Confirm Profile Update</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to update your profile information?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateProfile} variant="contained" disabled={loading}>
            {loading ? 'Updating...' : 'Confirm Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Update Confirmation Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => !loading && setPasswordDialogOpen(false)}
      >
        <DialogTitle>Confirm Password Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change your password? You will be logged out after the change.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPasswordDialogOpen(false)} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdatePassword} 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Updating...' : 'Confirm Change'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Success Snackbar */}
      <Snackbar
        open={profileSuccessSnackbar}
        autoHideDuration={2000}
        onClose={() => setProfileSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          icon={<CheckIcon fontSize="inherit" />}
          sx={{
            width: '100%',
            alignItems: 'center',
            backgroundColor: '#4caf50',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          Profile updated successfully!
        </Alert>
      </Snackbar>

      {/* Password Success Snackbar */}
      <Snackbar
        open={passwordSuccessSnackbar}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          icon={<CheckIcon fontSize="inherit" />}
          sx={{
            width: '100%',
            alignItems: 'center',
            backgroundColor: '#4caf50',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          Password updated successfully! Redirecting to login...
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage; 