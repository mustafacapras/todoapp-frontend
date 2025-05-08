import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { toast } from 'react-toastify';
import { categoryApi, taskApi } from '../../services/api';

const CategoryDialog = ({ open, onClose, onSubmit, category = null }) => {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [color, setColor] = useState(category?.color || '#FF6B6B');
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description);
      setColor(category.color);
    } else {
      setName('');
      setDescription('');
      setColor('#FF6B6B');
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, description, color });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            margin="normal"
          />
          <Box sx={{ mt: 2, mb: 1 }}>
            <Button
              startIcon={<PaletteIcon />}
              onClick={() => setShowColorPicker(!showColorPicker)}
              sx={{ color: color }}
            >
              Select Color
            </Button>
          </Box>
          {showColorPicker && (
            <Box sx={{ mt: 2 }}>
              <ChromePicker
                color={color}
                onChange={(color) => setColor(color.hex)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {category ? 'Save Changes' : 'Add Category'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const TaskCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryTaskCounts, setCategoryTaskCounts] = useState({});

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAllCategories();
      setCategories(response.data);
      fetchTaskCounts(response.data);
    } catch (error) {
      setError('Failed to load categories');
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskCounts = async (cats) => {
    try {
      const counts = {};
      for (const category of cats) {
        const tasks = await taskApi.getTasksByCategory(category.name);
        counts[category.name] = tasks.data.length;
      }
      setCategoryTaskCounts(counts);
    } catch (error) {
      console.error('Failed to fetch task counts:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (categoryData) => {
    try {
      await categoryApi.createCategory(categoryData);
      toast.success('Category created successfully');
      fetchCategories();
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create category');
    }
  };

  const handleEditCategory = async (categoryData) => {
    try {
      await categoryApi.updateCategory(selectedCategory.id, categoryData);
      toast.success('Category updated successfully');
      fetchCategories();
      setDialogOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryApi.deleteCategory(categoryId);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const openEditDialog = (category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4">Task Categories</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Organize your tasks with custom categories
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedCategory(null);
            setDialogOpen(true);
          }}
        >
          Add Category
        </Button>
      </Box>

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card
              sx={{
                position: 'relative',
                '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  bgcolor: category.color,
                }}
              />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                      {categoryTaskCounts[category.name] || 0} tasks
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => openEditDialog(category)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteCategory(category.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <CategoryDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedCategory(null);
        }}
        onSubmit={selectedCategory ? handleEditCategory : handleAddCategory}
        category={selectedCategory}
      />
    </Box>
  );
};

export default TaskCategoriesPage; 