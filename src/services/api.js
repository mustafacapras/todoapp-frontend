import axios from 'axios';

//const API_URL = 'https://todoapp-backend.onrender.com/api';
const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['Access-Control-Allow-Origin'] = '*';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/signin', credentials),
  register: (userData) => api.post('/auth/signup', userData),
};

export const userApi = {
  getCurrentUser: () => api.get('/users/me'),
  updateUser: (userData) => api.put('/users/me', userData),
  updatePassword: (passwordData) => api.put('/users/me/password', passwordData),
};

export const taskApi = {
  getAllTasks: () => api.get('/tasks'),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => {
    const finalTaskData = {
      ...taskData,
      vital: Boolean(taskData.isVital)
    };
    console.log('API sending task data:', finalTaskData);
    return api.post('/tasks', finalTaskData);
  },
  updateTask: (id, taskData) => {
    const finalTaskData = {
      ...taskData,
      vital: Boolean(taskData.isVital)
    };
    return api.put(`/tasks/${id}`, finalTaskData);
  },
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  getTasksByCategory: (categoryId) => api.get(`/tasks/category/${categoryId}`),
  getVitalTasks: () => {
    console.log('Fetching vital tasks from API');
    return api.get('/tasks/vital').then(response => {
      console.log('Vital tasks response:', response.data);
      return response;
    }).catch(error => {
      console.error('Error fetching vital tasks:', error);
      throw error;
    });
  },
};

export const categoryApi = {
  getAllCategories: () => api.get('/categories'),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (category) => api.post('/categories', category),
  updateCategory: (id, category) => api.put(`/categories/${id}`, category),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};