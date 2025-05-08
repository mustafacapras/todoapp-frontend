import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Flag as FlagIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import AddTaskModal from '../tasks/AddTaskModal';
import { taskApi } from '../../services/api';

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const TaskCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  transition: 'transform 0.2s, box-shadow 0.2s',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  },
}));

const StatusIndicator = styled('div')(({ color }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: color,
  marginRight: 8,
}));

const StatBox = ({ title, value, color, icon: Icon }) => (
  <StatsCard>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
          }}
        >
          <Icon sx={{ color: color, fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: color }}>
            {value}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ mt: 2, position: 'relative', height: 4, backgroundColor: `${color}15`, borderRadius: 2 }}>
        <Box
          sx={{
            position: 'absolute',
            width: `${value}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 2,
            transition: 'width 1s ease-in-out',
          }}
        />
      </Box>
    </CardContent>
  </StatsCard>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getAllTasks();
      const allTasks = response.data;
      setCompletedTasks(allTasks.filter(task => task.status === 'COMPLETED'));
      setTasks(allTasks.filter(task => task.status !== 'COMPLETED'));
      setError('');
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (taskData) => {
    try {
      await taskApi.createTask(taskData);
      await fetchTasks();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      setError('Failed to create task. Please try again.');
    }
  };

  const calculateTaskStats = () => {
    const total = tasks.length + completedTasks.length;
    if (total === 0) return { completed: 0, inProgress: 0, notStarted: 0 };

    const completed = (completedTasks.length / total) * 100;
    const inProgress = (tasks.filter(task => task.status === 'IN_PROGRESS').length / total) * 100;
    const notStarted = (tasks.filter(task => task.status === 'TODO').length / total) * 100;

    return {
      completed: Math.round(completed),
      inProgress: Math.round(inProgress),
      notStarted: Math.round(notStarted)
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return '#ef5350';
      case 'MEDIUM':
        return '#fb8c00';
      case 'LOW':
        return '#66bb6a';
      default:
        return '#90a4ae';
    }
  };

  const stats = calculateTaskStats();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            Welcome back, {user?.firstName} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your tasks today
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddModalOpen(true)}
          sx={{
            borderRadius: '12px',
            px: 3,
            py: 1.5,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            backgroundColor: theme => theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme => theme.palette.primary.dark,
            },
          }}
        >
          Add New Task
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <StatBox
            title="Completed Tasks"
            value={stats.completed}
            color="#4CAF50"
            icon={CheckCircleIcon}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatBox
            title="In Progress"
            value={stats.inProgress}
            color="#2196F3"
            icon={AccessTimeIcon}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatBox
            title="Not Started"
            value={stats.notStarted}
            color="#FF5252"
            icon={FlagIcon}
          />
        </Grid>
      </Grid>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Today's Tasks
        </Typography>
        <Grid container spacing={3}>
          {tasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <TaskCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <StatusIndicator color={getPriorityColor(task.priority)} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {task.isVital && <StarIcon sx={{ color: '#ffd700', mr: 1, verticalAlign: 'text-bottom' }} />}
                        {task.title}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {task.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AccessTimeIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      size="small"
                      label={task.priority}
                      sx={{
                        backgroundColor: `${getPriorityColor(task.priority)}15`,
                        color: getPriorityColor(task.priority),
                        fontWeight: 500,
                      }}
                    />
                    <Chip
                      size="small"
                      label={task.status.replace('_', ' ')}
                      sx={{
                        backgroundColor: '#f5f5f5',
                        color: 'text.secondary',
                      }}
                    />
                  </Box>
                </CardContent>
              </TaskCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      {completedTasks.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#4CAF50' }}>
            Completed Tasks
          </Typography>
          <Grid container spacing={3}>
            {completedTasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task.id}>
                <TaskCard sx={{ opacity: 0.8 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CheckCircleIcon sx={{ color: '#4CAF50', mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {task.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {task.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Completed on {format(new Date(task.updatedAt), 'MMM dd, yyyy')}
                    </Typography>
                  </CardContent>
                </TaskCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <AddTaskModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTask}
      />
    </Box>
  );
};

export default DashboardPage; 