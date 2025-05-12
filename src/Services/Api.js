import axios from 'axios';

const api = axios.create({
  baseURL: 'http://65.2.122.144:5002', // Replace with your actual base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;