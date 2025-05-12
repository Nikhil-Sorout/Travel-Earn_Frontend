import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.timestringssystem.com',  // Use the actual IP address of your server
  headers: {
    'Content-Type': 'application/json',
  },
});


export default api;
