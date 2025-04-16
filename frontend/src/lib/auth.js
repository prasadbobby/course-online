export const getUserFromLocalStorage = () => {
    // Check if running on client side
    if (typeof window === 'undefined') {
      return null;
    }
    
    // First, try to get from localStorage
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
    
    // If not in localStorage, try sessionStorage
    const sessionUser = sessionStorage.getItem('user');
    
    if (sessionUser) {
      try {
        return JSON.parse(sessionUser);
      } catch (error) {
        console.error('Failed to parse user from sessionStorage:', error);
        sessionStorage.removeItem('user');
      }
    }
    
    return null;
  };
  
  export const getToken = () => {
    // Check if running on client side
    if (typeof window === 'undefined') {
      return null;
    }
    
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };