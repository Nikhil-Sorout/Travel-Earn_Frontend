import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.timestringssystem.com',  // Use the actual IP address of your server
  // baseURL: 'http://localhost:5002',  // Use the actual IP address of your server
  headers: {
    'Content-Type': 'application/json',
  },
});

// API helper functions for reports
export const getTravelerReport = async () => {
  try {
    const response = await api.get('/api/travel-history');
    return response.data;
  } catch (error) {
    console.error('Error fetching traveler report:', error);
    throw error;
  }
};

export const getSenderReport = async () => {
  try {
    const response = await api.get('/api/consignment-history');
    return response.data;
  } catch (error) {
    console.error('Error fetching sender report:', error);
    throw error;
  }
};

export const getConsignmentConsolidatedReport = async () => {
  try {
    const response = await api.get('/api/consignment-consolidated');
    return response.data;
  } catch (error) {
    console.error('Error fetching consignment consolidated report:', error);
    throw error;
  }
};

export default api;
