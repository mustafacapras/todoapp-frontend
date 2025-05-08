import axios from 'axios';

//const API_URL = 'https://todoapp-backend.onrender.com/api';
const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 403 || error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/signin', credentials);
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
};

export const userApi = {
  getCurrentUser: () => api.get('/users/me'),
  updateUser: (userData) => api.put('/users/me', userData),
  updatePassword: (passwordData) => api.put('/users/me/password', passwordData),
};

export const taskApi = {
  getAllTasks: () => api.get('/tasks'),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  getTasksByCategory: (categoryId) => api.get(`/tasks/category/${categoryId}`),
  getVitalTasks: () => api.get('/tasks/vital'),
};

export const categoryApi = {
  getAllCategories: () => api.get('/categories'),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (category) => api.post('/categories', category),
  updateCategory: (id, category) => api.put(`/categories/${id}`, category),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};