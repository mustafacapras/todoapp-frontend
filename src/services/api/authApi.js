import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

const authApi = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/signin`, { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response || error);
      throw error;
    }
  },

  register: async (firstName, lastName, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        firstName,
        lastName,
        email,
        password
      });
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response || error);
      throw error;
    }
  }
};

export default authApi; 