import axios from 'axios';
import { toast } from 'sonner';

// Configure axios interceptor to handle authentication errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized or 419 Session Expired
    if (error.response?.status === 401 || error.response?.status === 419) {
      const message = error.response?.data?.message || 'Session expired. Please login again.';
      
      // Clear all authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('staff_id');
      localStorage.removeItem('role');
      sessionStorage.clear();
      
      // Show toast notification
      toast.error(message);
      
      // Redirect to login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axios;
