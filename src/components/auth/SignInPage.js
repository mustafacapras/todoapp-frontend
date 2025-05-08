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
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authApi from '../../services/api/authApi';
import loginImage from '../../assets/images/login.svg';

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

const SignInPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
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
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.login({
        email: formData.email,
        password: formData.password
      });
      
      if (response.data && response.data.token) {
        setShowSuccess(true);
        login(response.data.token);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        throw new Error('Token not received');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Snackbar
        open={showSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          marginTop: 4
        }}
      >
        <Alert 
          severity="success" 
          variant="filled"
          sx={{ 
            width: '100%',
            fontSize: '1.1rem',
            padding: '12px 24px',
            backgroundColor: '#4CAF50',
            color: 'white',
            '& .MuiAlert-icon': {
              fontSize: '24px'
            },
            boxShadow: '0 8px 16px rgba(76, 175, 80, 0.2)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            '& .MuiAlert-message': {
              padding: '4px 0'
            }
          }}
        >
          Login successful! Welcome back 👋
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
            Sign In
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <CustomTextField
              name="email"
              label="Enter Email"
              icon={PersonIcon}
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
              {isLoading ? 'Signing in...' : 'Login'}
            </Button>

            <Box textAlign="center">
              <Typography variant="body2" component="span">
                Don't have an account?{' '}
              </Typography>
              <Link
                to="/register"
                style={{
                  color: '#2196f3',
                  textDecoration: 'none',
                }}
              >
                Create One
              </Link>
            </Box>
          </Box>
        </Box>

        <Box
          flex={1}
          display={{ xs: 'none', md: 'block' }}
          component="img"
          src={loginImage}
          alt="Login illustration"
          sx={{ maxWidth: '100%', height: 'auto' }}
        />
      </Box>
    </Container>
  );
};

export default SignInPage; 