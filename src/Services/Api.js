import axios from 'axios';

const api = axios.create({
  baseURL: 'https://65.2.122.144',  // Use the actual IP address of your server
  headers: {
    'Content-Type': 'application/json',
  },
});


export default api;
