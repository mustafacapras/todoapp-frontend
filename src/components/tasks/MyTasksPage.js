import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import { taskApi } from '../../services/api';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return '#66bb6a';
      case 'IN_PROGRESS':
        return '#fb8c00';
      case 'TODO':
        return '#90a4ae';
      default:
        return '#90a4ae';
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        },
        ...(task.isVital && {
          border: '1px solid #ffd700',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: '#ffd700',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
          },
        }),
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            {task.isVital && <StarIcon sx={{ color: '#ffd700' }} />}
            {task.title}
          </Typography>
          <IconButton size="small" onClick={handleClick}>
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* Description */}
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

        {/* Due Date */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CalendarIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {format(new Date(task.dueDate), 'MMM dd, yyyy')}
          </Typography>
        </Box>

        {/* Tags */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            icon={<FlagIcon sx={{ fontSize: '1rem !important', color: 'inherit' }} />}
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
              backgroundColor: `${getStatusColor(task.status)}15`,
              color: getStatusColor(task.status),
              fontWeight: 500,
            }}
          />
          {task.category && (
            <Chip
              size="small"
              label={task.category}
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          )}
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => {
          onEdit(task);
          handleClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          onDelete(task.id);
          handleClose();
        }} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

const KanbanColumn = ({ title, tasks, onEdit, onDelete, color }) => (
  <Paper
    sx={{
      p: 2,
      borderRadius: 2,
      backgroundColor: 'background.default',
      height: '100%',
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      mb: 2,
      pb: 2,
      borderBottom: '2px solid',
      borderColor: color
    }}>
      <Typography variant="h6" sx={{ color: color, fontWeight: 600 }}>
        {title}
      </Typography>
      <Chip
        size="small"
        label={tasks.length}
        sx={{ ml: 1, backgroundColor: `${color}15`, color: color }}
      />
    </Box>
    <Box sx={{ flex: 1, overflowY: 'auto' }}>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Box>
  </Paper>
);

const MyTasksPage = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async () => {
    try {
      const response = await taskApi.getAllTasks();
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to load tasks');
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
      toast.success('Task created successfully');
      fetchTasks();
      setAddModalOpen(false);
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      await taskApi.updateTask(selectedTask.id, taskData);
      toast.success('Task updated successfully');
      fetchTasks();
      setEditModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskApi.deleteTask(taskId);
        toast.success('Task deleted successfully');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };

  const todoTasks = tasks.filter(task => task.status === 'TODO');
  const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>My Tasks</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddModalOpen(true)}
          sx={{
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            px: 3,
            py: 1,
          }}
        >
          Add Task
        </Button>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: 3,
        height: 'calc(100vh - 200px)',
      }}>
        <KanbanColumn
          title="To Do"
          tasks={todoTasks}
          onEdit={openEditModal}
          onDelete={handleDeleteTask}
          color="#90a4ae"
        />
        <KanbanColumn
          title="In Progress"
          tasks={inProgressTasks}
          onEdit={openEditModal}
          onDelete={handleDeleteTask}
          color="#fb8c00"
        />
        <KanbanColumn
          title="Completed"
          tasks={completedTasks}
          onEdit={openEditModal}
          onDelete={handleDeleteTask}
          color="#66bb6a"
        />
      </Box>

      <AddTaskModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddTask}
      />

      <EditTaskModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleEditTask}
        task={selectedTask}
      />
    </Box>
  );
};

export default MyTasksPage; 