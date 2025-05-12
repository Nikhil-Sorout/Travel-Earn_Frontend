import axios from 'axios';

const api = axios.create({
  baseURL: 'https://65.2.122.144', // Replace with your actual base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
