import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.timestringssystem.com',  // Use the actual IP address of your server  // Use the actual IP address of your server
  // baseURL: 'http://10.10.12.132:5002',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API helper functions for reports
export const getTravelerReport = async (page = 1, limit = 30) => {
  try {
    const response = await api.get(`/report/traveler-report?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching traveler report:', error);
    throw error;
  }
};

export const getSenderReport = async (page = 1, limit = 30) => {
  try {
    const response = await api.get(`/report/sender-report?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sender report:', error);
    throw error;
  }
};

export const getSenderConsignmentDetails = async (senderPhone) => {
  try {
    const response = await api.get(`/report/sender-consignment-details/${senderPhone}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sender consignment details:', error);
    throw error;
  }
};

export const getTravelerConsignmentDetails = async (travelerPhone) => {
  try {
    const response = await api.get(`/report/traveler-consignment-details/${travelerPhone}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching traveler consignment details:', error);
    throw error;
  }
};
export const getConsignmentConsolidatedReport = async (page = 1, limit = 30) => {
  try {
    const response = await api.get(`/report/consignment-consolidated-report?page=${page}&limit=${limit}`);
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
