import axios from 'axios';

const api = axios.create({
  //baseURL: 'http://localhost:5000/api', // Adjust base URL for production 
  baseURL: 'https://task-manager-gxzo.onrender.com/api', // Adjust base URL for production
});

// Add a request interceptor to add the JWT token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
