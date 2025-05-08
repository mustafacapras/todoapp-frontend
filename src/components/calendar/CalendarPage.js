import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { taskApi, categoryApi } from '../../services/api';
import AddTaskModal from '../tasks/AddTaskModal';
import { toast } from 'react-toastify';

const TaskDialog = ({ open, onClose, task }) => {
  if (!task) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{task.title}</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          {task.description}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Due Date: {format(new Date(task.dueDate), 'PPP')}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Priority: {task.priority}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Status: {task.status}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Category: {task.category}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);

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

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, []);

  const handlePreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const handleAddTask = async (taskData) => {
    try {
      await taskApi.createTask(taskData);
      toast.success('Task created successfully');
      fetchTasks();
      setAddTaskModalOpen(false);
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const filteredTasks = selectedCategory === 'all'
    ? tasks
    : tasks.filter(task => task.category === selectedCategory);

  // Get the first day of the month
  const monthStart = startOfMonth(currentDate);
  // Get the last day of the month
  const monthEnd = endOfMonth(currentDate);
  // Get the start of the first week
  const calendarStart = startOfWeek(monthStart);
  // Get the end of the last week
  const calendarEnd = endOfWeek(monthEnd);

  // Get all days to display
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4">Calendar</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Manage your tasks in calendar view
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
              size="small"
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddTaskModalOpen(true)}
          >
            Add Task
          </Button>
        </Box>
      </Box>

      <Card sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handlePreviousMonth}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h5">
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Box
              key={day}
              sx={{
                p: 1,
                textAlign: 'center',
                fontWeight: 'bold',
                color: 'text.secondary',
              }}
            >
              {day}
            </Box>
          ))}

          {calendarDays.map((day) => {
            const dayTasks = filteredTasks.filter(task =>
              isSameDay(new Date(task.dueDate), day)
            );
            const isToday = isSameDay(day, new Date());

            return (
              <Box
                key={day.toString()}
                sx={{
                  p: 1,
                  border: '1px solid',
                  borderColor: isToday ? '#64B5F6' : 'divider',
                  backgroundColor: isToday 
                    ? 'rgba(33, 150, 243, 0.1)'
                    : isSameMonth(day, currentDate)
                      ? 'background.paper'
                      : 'action.hover',
                  minHeight: 100,
                  position: 'relative',
                  opacity: isSameMonth(day, currentDate) ? 1 : 0.5,
                  ...(isToday && {
                    boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.3)',
                    borderRadius: 1,
                  }),
                }}
              >
                <Typography
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    color: isToday 
                      ? '#1976D2'
                      : isSameMonth(day, currentDate) 
                        ? 'text.primary' 
                        : 'text.secondary',
                    fontWeight: isToday 
                      ? 'bold'
                      : isSameMonth(day, currentDate) 
                        ? 'medium' 
                        : 'normal',
                    fontSize: isToday ? '1.1rem' : 'inherit'
                  }}
                >
                  {format(day, 'd')}
                </Typography>
                <Box sx={{ mt: 4 }}>
                  {dayTasks.map((task) => (
                    <Chip
                      key={task.id}
                      label={task.title}
                      size="small"
                      onClick={() => handleTaskClick(task)}
                      sx={{
                        mb: 0.5,
                        width: '100%',
                        backgroundColor: task.isVital ? '#ff6b6b' : 'primary.main',
                        color: 'white',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Card>

      <TaskDialog
        open={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />

      <AddTaskModal
        open={addTaskModalOpen}
        onClose={() => setAddTaskModalOpen(false)}
        onSubmit={handleAddTask}
      />
    </Box>
  );
};

export default CalendarPage; 