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

export const getCreatorDashboard = async () => {
  try {
    const ax = authAxios();
    const response = await ax.get(`${API_URL}/creator/dashboard`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch dashboard data' };
  }
};

export const getCreatorCourses = async (filters = {}) => {
  try {
    const ax = authAxios();
    const response = await ax.get(`${API_URL}/creator/courses`, { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch courses' };
  }
};

export const createCourse = async (courseData) => {
  try {
    const ax = authAxios();
    const response = await ax.post(`${API_URL}/creator/courses`, courseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create course' };
  }
};

export const updateCourse = async (courseId, courseData) => {
  try {
    const ax = authAxios();
    const response = await ax.put(`${API_URL}/creator/courses/${courseId}`, courseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update course' };
  }
};

export const uploadCourseThumbnail = async (courseId, file) => {
  try {
    const ax = authAxios();
    
    const formData = new FormData();
    formData.append('thumbnail', file);
    
    const response = await ax.post(
      `${API_URL}/creator/courses/${courseId}/thumbnail`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload thumbnail' };
  }
};

export const getCourseModules = async (courseId) => {
  try {
    const ax = authAxios();
    const response = await ax.get(`${API_URL}/creator/courses/${courseId}/modules`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch modules' };
  }
};

export const addCourseModule = async (courseId, moduleData) => {
  try {
    const ax = authAxios();
    const response = await ax.post(`${API_URL}/creator/courses/${courseId}/modules`, moduleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add module' };
  }
};

export const addModuleLesson = async (moduleId, lessonData) => {
  try {
    const ax = authAxios();
    const response = await ax.post(`${API_URL}/creator/modules/${moduleId}/lessons`, lessonData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add lesson' };
  }
};

export const uploadLessonFile = async (lessonId, file) => {
  try {
    const ax = authAxios();
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await ax.post(
      `${API_URL}/creator/lessons/${lessonId}/file`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload lesson file' };
  }
};

export const publishCourse = async (courseId) => {
  try {
    const ax = authAxios();
    const response = await ax.post(`${API_URL}/creator/courses/${courseId}/publish`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to publish course' };
  }
};

export const getCreatorEarnings = async () => {
  try {
    const ax = authAxios();
    const response = await ax.get(`${API_URL}/creator/earnings`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch earnings data' };
  }
};

export const getCourseStudents = async (courseId) => {
  try {
    const ax = authAxios();
    const response = await ax.get(`${API_URL}/creator/courses/${courseId}/students`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch students data' };
  }
};