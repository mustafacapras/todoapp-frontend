import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { categoryApi } from '../../services/api';

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  dueDate: Yup.date().required('Due date is required'),
  priority: Yup.string().required('Priority is required'),
  status: Yup.string().required('Status is required'),
  category: Yup.string().required('Category is required'),
});

const AddTaskModal = ({ open, onClose, onSubmit, defaultIsVital = false }) => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAllCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setError('Failed to load categories. Please try again.');
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      dueDate: new Date(),
      priority: 'MEDIUM',
      status: 'TODO',
      category: '',
      isVital: defaultIsVital,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        console.log('Form values before submit:', values); // Debug log
        const taskData = {
          ...values,
          isVital: defaultIsVital || values.isVital,
          status: values.status || 'TODO',
          priority: values.priority || 'MEDIUM'
        };
        console.log('Creating task with data:', taskData); // Debug log
        await onSubmit(taskData);
        resetForm();
        onClose();
      } catch (error) {
        console.error('Task creation error:', error);
        setError('Failed to create task. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Reset form when modal is opened
  useEffect(() => {
    if (open) {
      formik.resetForm({
        values: {
          ...formik.initialValues,
          isVital: defaultIsVital,
        },
      });
    }
  }, [open, defaultIsVital]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{defaultIsVital ? 'Add Vital Task' : 'Add New Task'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              id="title"
              name="title"
              label="Title"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
            />

            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Due Date"
                value={formik.values.dueDate}
                onChange={(value) => formik.setFieldValue('dueDate', value)}
                textField={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}
                    helperText={formik.touched.dueDate && formik.errors.dueDate}
                  />
                )}
              />
            </LocalizationProvider>

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                id="priority"
                name="priority"
                value={formik.values.priority}
                onChange={formik.handleChange}
                label="Priority"
              >
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                id="status"
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                label="Status"
              >
                <MenuItem value="TODO">Todo</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                id="category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                label="Category"
                error={formik.touched.category && Boolean(formik.errors.category)}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {!defaultIsVital && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.isVital}
                    onChange={(e) =>
                      formik.setFieldValue('isVital', e.target.checked)
                    }
                    name="isVital"
                  />
                }
                label="Mark as Vital Task"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
          >
            {defaultIsVital ? 'Add Vital Task' : 'Add Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddTaskModal; 