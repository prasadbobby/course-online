import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const registerUser = async (fullName, email, password, role) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      fullName,
      email,
      password,
      role
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, {
      email
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send reset email' };
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      password
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Password reset failed' };
  }
};

export const googleAuth = async (tokenId) => {
  try {
    const response = await axios.post(`${API_URL}/auth/google`, {
      tokenId
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Google authentication failed' };
  }
};