import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const researchCompany = async (companyName) => {
  try {
    const response = await axios.post(`${API_URL}/research`, { companyName });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Failed to analyze company.');
    }
    throw new Error('Network error or server is unavailable.');
  }
};
