import axios from 'axios';

const api = axios.create({
  baseURL: 'https://travelandearn.host', // Replace with your actual base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
