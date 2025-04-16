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

export const fetchCourses = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/courses`, { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch courses' };
  }
};

export const fetchFeaturedCourses = async () => {
  try {
    const response = await axios.get(`${API_URL}/courses`, { 
      params: { sort: 'popular', limit: 8 } 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch featured courses' };
  }
};

export const fetchCategories = async () => {
  // This is a mock function since we don't have a categories endpoint
  // In a real app, this would make an API call
  return [
    { name: 'Development', slug: 'development', courseCount: 125, icon: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg> },
    { name: 'Business', slug: 'business', courseCount: 98, icon: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H6"/><path d="M12 18V6"/></svg> },
    { name: 'Finance', slug: 'finance', courseCount: 85, icon: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg> },
    { name: 'IT & Software', slug: 'it-software', courseCount: 116, icon: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"/><path d="m10 13-2 2 2 2"/><path d="m14 13 2 2-2 2"/></svg> },
    { name: 'Marketing', slug: 'marketing', courseCount: 75, icon: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z"/><path d="M9 6v12"/><path d="M15 12H9"/><path d="M15 16H9"/><path d="M15 8H9"/></svg> },
    { name: 'Design', slug: 'design', courseCount: 64, icon: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V6c0-1.1-.9-2-2-2H5a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2"/><path d="M21 12H9"/><path d="m15 16 4-4-4-4"/></svg> },
  ];
};

export const fetchCourseBySlug = async (slug) => {
  try {
    const ax = authAxios();
    const response = await ax.get(`${API_URL}/courses/${slug}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch course details' };
  }
};

export const enrollInCourse = async (courseId) => {
  try {
    const ax = authAxios();
    const response = await ax.post(`${API_URL}/courses/${courseId}/enroll`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to enroll in course' };
  }
};

export const getCourseReviews = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}/courses/${courseId}/reviews`);
    return { reviews: response.data };
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch course reviews' };
  }
};

export const addCourseReview = async (courseId, rating, comment) => {
  try {
    const ax = authAxios();
    const response = await ax.post(`${API_URL}/courses/${courseId}/review`, {
      rating,
      comment
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add review' };
  }
};

export const getCourseContent = async (courseId) => {
  try {
    const ax = authAxios();
    const response = await ax.get(`${API_URL}/enrollments/course/${courseId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch course content' };
  }
};