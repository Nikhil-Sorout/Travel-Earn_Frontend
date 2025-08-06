import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.timestringssystem.com',  // Use the actual IP address of your server  // Use the actual IP address of your server
  // baseURL: 'http://192.168.65.0:5002',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API helper functions for reports
export const getTravelerReport = async () => {
  try {
    const response = await api.get('/report/travel-history');
    return response.data;
  } catch (error) {
    console.error('Error fetching traveler report:', error);
    throw error;
  }
};

export const getSenderReport = async () => {
  try {
    const response = await api.get('/report/consignment-history');
    return response.data;
  } catch (error) {
    console.error('Error fetching sender report:', error);
    throw error;
  }
};
export const getConsignmentConsolidatedReport = async (page = 1, limit = 100) => {
  try {
    const response = await api.get(`/report/consignment-consolidated-aggregation?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching consignment consolidated report:', error);
    throw error;
  }
};

export const getBusinessIntelligenceReport = async () => {
  try {
    const response = await api.get('/report/business-intelligence');
    return response.data;
  } catch (error) {
    console.error('Error fetching business intelligence report:', error);
    throw error;
  }
};

export const getTravelDetailsReport = async () => {
  try {
    const response = await api.get('/report/travel-details');
    return response.data;
  } catch (error) {
    console.error('Error fetching travel details report:', error);
    throw error;
  }
};

export default api;
