import axios from 'axios';
import { getToken } from '../utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Set up axios instance with authorization header
const authAxios = () => {
  const token = getToken();
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
};

export const getLesson = async (lessonId) => {
  try {
    const ax = authAxios();
    const response = await ax.get(`${API_URL}/lessons/${lessonId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch lesson' };
  }
};

export const completeLesson = async (lessonId) => {
  try {
    const ax = authAxios();
    const response = await ax.post(`${API_URL}/lessons/${lessonId}/complete`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark lesson as complete' };
  }
};

export const updateLessonProgress = async (lessonId, data) => {
  try {
    const ax = authAxios();
    const response = await ax.post(`${API_URL}/lessons/${lessonId}/progress`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update lesson progress' };
  }
};

export const submitQuiz = async (lessonId, data) => {
  try {
    const ax = authAxios();
    const response = await ax.post(`${API_URL}/lessons/${lessonId}/quiz`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to submit quiz' };
  }
};

export const submitAssignment = async (lessonId, data) => {
  try {
    const ax = authAxios();
    const response = await ax.post(`${API_URL}/lessons/${lessonId}/assignment`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to submit assignment' };
  }
};