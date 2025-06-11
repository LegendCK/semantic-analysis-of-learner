import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeQuery = async (query) => {
  try {
    const response = await api.post('/api/analyze', { query });
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const submitFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/api/feedback', feedbackData);
    return response.data;
  } catch (error) {
    console.error('Feedback submission error:', error);
    throw error;
  }
};

export const getQueryHistory = async (userId) => {
  try {
    const response = await api.get(`/api/history/${userId}`);
    return response.data;
  } catch (error) {
    console.error('History fetch error:', error);
    throw error;
  }
};
