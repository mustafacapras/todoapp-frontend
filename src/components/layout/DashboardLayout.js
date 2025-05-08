import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, InputBase, Avatar, Popper, Paper, ClickAwayListener, List, ListItem, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { taskApi } from '../../services/api';

// Icons
import HomeIcon from '@mui/icons-material/Home';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';

const Sidebar = styled(Box)(({ theme }) => ({
  width: 280,
  height: '100vh',
  backgroundColor: '#1A1A1A',
  color: 'white',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
}));

const MenuItem = styled(Box)(({ theme, active }) => ({
  padding: theme.spacing(1.5, 2),
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  backgroundColor: active ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const SearchBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 2),
  borderRadius: 50,
  backgroundColor: '#F5F5F5',
  width: '100%',
  maxWidth: 600,
}));

const SearchResultsList = styled(List)(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: 'white',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  zIndex: 1000,
  maxHeight: '300px',
  overflowY: 'auto',
  marginTop: '4px',
}));

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: <HomeIcon />, label: 'Dashboard' },
    { path: '/vital-tasks', icon: <PriorityHighIcon />, label: 'Vital Task' },
    { path: '/my-tasks', icon: <AssignmentIcon />, label: 'My Task' },
    { path: '/calendar', icon: <CalendarTodayIcon />, label: 'Calendar' },
    { path: '/categories', icon: <CategoryIcon />, label: 'Task Categories' },
    { path: '/settings', icon: <SettingsIcon />, label: 'Settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getCurrentDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date();
    const day = days[date.getDay()];
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return `${day}\n${formattedDate}`;
  };

  const handleCalendarHover = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleCalendarClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setLoading(true);
      const response = await taskApi.getAllTasks();
      const filteredTasks = response.data.filter(task =>
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.description?.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredTasks);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (task) => {
    setShowResults(false);
    setSearchQuery('');
    navigate('/my-tasks');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar>
        <Box sx={{ mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: '#FF6B6B',
              fontSize: '2rem',
              mb: 2
            }}
          >
            {user?.firstName ? user.firstName[0] : <PersonIcon sx={{ fontSize: '2rem' }} />}
          </Avatar>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.500' }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          {menuItems.map((item) => (
            <MenuItem
              key={item.path}
              active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <Typography>{item.label}</Typography>
            </MenuItem>
          ))}
        </Box>

        <MenuItem onClick={handleLogout}>
          <LogoutIcon />
          <Typography>Logout</Typography>
        </MenuItem>
      </Sidebar>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid #eee',
          position: 'relative',
        }}>
          <SearchBar>
            <SearchIcon sx={{ color: 'grey.500', mr: 1 }} />
            <InputBase
              placeholder="Search your task here..."
              sx={{ flex: 1 }}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowResults(true)}
            />
            {showResults && searchResults.length > 0 && (
              <ClickAwayListener onClickAway={() => setShowResults(false)}>
                <SearchResultsList>
                  {searchResults.map((task) => (
                    <ListItem 
                      key={task.id} 
                      button 
                      onClick={() => handleResultClick(task)}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                        } 
                      }}
                    >
                      <ListItemText 
                        primary={task.title}
                        secondary={`Due: ${new Date(task.dueDate).toLocaleDateString()} - ${task.status}`}
                      />
                    </ListItem>
                  ))}
                </SearchResultsList>
              </ClickAwayListener>
            )}
          </SearchBar>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              onMouseEnter={handleCalendarHover}
              onMouseLeave={handleCalendarClose}
            >
              <IconButton onClick={() => navigate('/calendar')}>
                <CalendarTodayIcon />
              </IconButton>
              <Popper
                open={open}
                anchorEl={anchorEl}
                placement="bottom-end"
                sx={{ zIndex: 1300 }}
              >
                <ClickAwayListener onClickAway={handleCalendarClose}>
                  <Paper elevation={4} sx={{ mt: 1 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <StaticDatePicker
                        displayStaticWrapperAs="desktop"
                        value={selectedDate}
                        onChange={(newValue) => {
                          setSelectedDate(newValue);
                        }}
                        renderInput={() => null}
                        sx={{
                          '& .MuiPickersDay-root': {
                            fontSize: '0.875rem',
                          },
                          '& .MuiPickersDay-today': {
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            border: '1px solid #64B5F6',
                            color: '#1976D2',
                            fontWeight: 'bold',
                          },
                          '& .Mui-selected': {
                            backgroundColor: 'rgba(33, 150, 243, 0.8) !important',
                            color: '#fff !important',
                          },
                          '& .MuiPickersCalendarHeader-root': {
                            '& .MuiIconButton-root': {
                              color: '#1976D2',
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Paper>
                </ClickAwayListener>
              </Popper>
            </Box>
            <Typography variant="body2" sx={{ textAlign: 'right', whiteSpace: 'pre-line' }}>
              {getCurrentDate()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1, p: 3, backgroundColor: '#F5F7F9' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout; 