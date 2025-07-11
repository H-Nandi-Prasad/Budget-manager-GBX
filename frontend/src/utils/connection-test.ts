import axios from 'axios';

/**
 * Tests the connection to the backend API
 * @returns Promise with connection status
 */
export const testBackendConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.get('http://localhost:3000/api/health');
    return {
      success: true,
      message: `Backend connection successful. Status: ${response.data.status}`
    };
  } catch (error) {
    console.error('Backend connection error:', error);
    return {
      success: false,
      message: `Backend connection failed: ${error.message}`
    };
  }
};

/**
 * Tests the authentication with the backend
 * @returns Promise with authentication status
 */
export const testAuthentication = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (response.data.data?.token) {
      localStorage.setItem('authToken', response.data.data.token);
      return {
        success: true,
        message: 'Authentication successful. Token stored.'
      };
    } else {
      return {
        success: false,
        message: 'Authentication failed: No token received'
      };
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      message: `Authentication failed: ${error.message}`
    };
  }
}; 