import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Star as StarIcon } from '@mui/icons-material';
import TaskList from './TaskList';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import { taskApi } from '../../services/api';
import { toast } from 'react-toastify';

const VitalTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Use the dedicated endpoint for vital tasks
      const response = await taskApi.getVitalTasks();
      console.log('Fetched tasks:', response.data); // Debug log
      if (response.data) {
        setTasks(response.data);
      } else {
        setTasks([]);
      }
      setError('');
    } catch (error) {
      console.error('Failed to fetch vital tasks:', error);
      setError('Failed to load vital tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (taskData) => {
    try {
      // Ensure the task is marked as vital
      const vitalTaskData = {
        ...taskData,
        isVital: true,
        status: taskData.status || 'TODO',
        priority: taskData.priority || 'HIGH',
        category: taskData.category || 'Other'
      };
      console.log('Creating vital task with data:', vitalTaskData);
      const response = await taskApi.createTask(vitalTaskData);
      console.log('Created vital task response:', response);
      
      // Immediately fetch tasks after creation
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to ensure backend processing
      await fetchTasks();
      
      setIsAddModalOpen(false);
      toast.success('Vital task created successfully!');
    } catch (error) {
      console.error('Failed to create vital task:', error);
      toast.error('Failed to create vital task. Please try again.');
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      // Ensure the task remains vital when editing
      const updatedTaskData = {
        ...taskData,
        isVital: true,
        category: taskData.category || 'Other'
      };
      await taskApi.updateTask(selectedTask.id, updatedTaskData);
      
      // Immediately fetch tasks after update
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to ensure backend processing
      await fetchTasks();
      
      setIsEditModalOpen(false);
      setSelectedTask(null);
      toast.success('Vital task updated successfully!');
    } catch (error) {
      console.error('Failed to update vital task:', error);
      toast.error('Failed to update vital task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this vital task?')) {
      try {
        await taskApi.deleteTask(taskId);
        await fetchTasks(); // Refresh the list after deleting
        toast.success('Vital task deleted successfully!');
      } catch (error) {
        console.error('Failed to delete vital task:', error);
        toast.error('Failed to delete vital task. Please try again.');
      }
    }
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" component="h1">
              Vital Tasks
            </Typography>
            <StarIcon sx={{ color: '#ffd700', fontSize: 32 }} />
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddModalOpen(true)}
            sx={{
              bgcolor: '#ffd700',
              color: 'black',
              '&:hover': {
                bgcolor: '#ffc400',
              },
            }}
          >
            Add Vital Task
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
            }}
          >
            <CircularProgress />
          </Box>
        ) : tasks.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No vital tasks found. Add some important tasks to track here!
          </Alert>
        ) : (
          <TaskList
            tasks={tasks}
            onEditTask={openEditModal}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </Box>

      <AddTaskModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTask}
        defaultIsVital={true}
      />

      {selectedTask && (
        <EditTaskModal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTask(null);
          }}
          onSubmit={handleEditTask}
          task={selectedTask}
        />
      )}
    </Container>
  );
};

export default VitalTasksPage; 