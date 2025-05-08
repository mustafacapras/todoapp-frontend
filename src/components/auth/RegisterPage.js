import React, { useState, memo } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authApi from '../../services/api/authApi';
import registerImage from '../../assets/images/register.svg';

const CustomTextField = memo(({ name, label, type = 'text', icon: Icon, value, onChange, showPassword, onTogglePassword, disabled }) => (
  <TextField
    fullWidth
    name={name}
    label={label}
    type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
    value={value}
    onChange={onChange}
    disabled={disabled}
    sx={{ mb: 2 }}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <Icon color="action" />
        </InputAdornment>
      ),
      endAdornment: type === 'password' ? (
        <InputAdornment position="end">
          <IconButton onClick={onTogglePassword} edge="end">
            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        </InputAdornment>
      ) : null
    }}
  />
));

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await authApi.register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password
      );
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Snackbar
        open={showSuccess}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          variant="filled"
          sx={{ 
            width: '100%',
            fontSize: '1.1rem',
            padding: '12px 24px',
            '& .MuiAlert-icon': {
              fontSize: '24px'
            },
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          Registration successful! Redirecting to login page...
        </Alert>
      </Snackbar>
      
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          gap: 4,
          py: 4,
        }}
      >
        <Box flex={1} sx={{ maxWidth: 480 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Sign Up
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <CustomTextField
              name="firstName"
              label="Enter First Name"
              icon={PersonIcon}
              value={formData.firstName}
              onChange={handleChange}
              disabled={isLoading}
            />
            <CustomTextField
              name="lastName"
              label="Enter Last Name"
              icon={PersonIcon}
              value={formData.lastName}
              onChange={handleChange}
              disabled={isLoading}
            />
            <CustomTextField
              name="email"
              label="Enter Email"
              icon={EmailIcon}
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            <CustomTextField
              name="password"
              label="Enter Password"
              type="password"
              icon={LockIcon}
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />
            <CustomTextField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              icon={LockIcon}
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mb: 2,
                bgcolor: '#ff6b6b',
                '&:hover': { bgcolor: '#ff5252' },
                height: 48,
              }}
            >
              {isLoading ? 'Signing up...' : 'Register'}
            </Button>

            <Box textAlign="center">
              <Typography variant="body2" component="span">
                Already have an account?{' '}
              </Typography>
              <Link
                to="/"
                style={{
                  color: '#2196f3',
                  textDecoration: 'none',
                }}
              >
                Sign In
              </Link>
            </Box>
          </Box>
        </Box>

        <Box
          flex={1}
          display={{ xs: 'none', md: 'block' }}
          component="img"
          src={registerImage}
          alt="Register illustration"
          sx={{ maxWidth: '100%', height: 'auto' }}
        />
      </Box>
    </Container>
  );
};

export default RegisterPage; 