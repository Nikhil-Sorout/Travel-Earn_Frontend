import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5002', // Replace with your backend base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;