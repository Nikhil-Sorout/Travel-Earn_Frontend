import axios from 'axios';

const api = axios.create({
  baseURL: 'https://travel-earn-backend.onrender.com', // Replace with your backend base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;