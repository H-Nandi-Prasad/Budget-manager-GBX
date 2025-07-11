import axios from 'axios';
import { Transaction, Department, Report, User, AuthResponse, ApiResponse, PaginatedResponse } from '../types/api.types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
console.log('API Service - Base URL:', API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // Reduced timeout to 5 seconds
});

// Helper function to ensure safe number conversion
const safeNumber = (value: any): number => {
  if (value === undefined || value === null) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : Math.round(num);
};

// Helper function to process department data
const processDepartmentData = (data: any) => {
  if (!data) return data;

  // If it's an array, process each item
  if (Array.isArray(data)) {
    return data.map(item => processDepartmentData(item));
  }

  // If it's a department object
  if (data.budget !== undefined || data.spent !== undefined) {
    return {
      ...data,
      budget: safeNumber(data.budget),
      spent: safeNumber(data.spent)
    };
  }

  return data;
};

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    console.log('API Service - Request interceptor - Token found:', !!token);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Service - Request interceptor - Added token to headers');
    }
    console.log('API Service - Request interceptor - URL:', config.url);

    // Process department-related requests
    if (config.url?.includes('/departments') && config.data) {
      // Process the data directly since it's already an object
      config.data = processDepartmentData(config.data);
    }
    return config;
  },
  (error) => {
    console.error('API Service - Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log('API Service - Response interceptor - Success:', response.config.url);

    // Process department-related responses
    if (response.config.url?.includes('/departments')) {
      response.data.data = processDepartmentData(response.data.data);
    }
    return response;
  },
  (error) => {
    console.error('API Service - Response interceptor error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    // Handle network errors
    if (!error.response) {
      console.error('API Service - Network error, server may be down');
      return Promise.reject(new Error('Network error. Please check if the server is running.'));
    }
    
    // Handle 401 errors
    if (error.response.status === 401) {
      console.log('API Service - Unauthorized, clearing token');
      localStorage.removeItem('authToken');
    }
    
    return Promise.reject(error);
  }
);

// API Service class
class ApiService {
  // Auth endpoints
  static async login(credentials: { email: string; password: string }): Promise<ApiResponse<AuthResponse>> {
    console.log('API Service - Login attempt');
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      console.log('API Service - Login successful');
      return response.data;
    } catch (error) {
      console.error('API Service - Login error:', error);
      throw error;
    }
  }

  static async register(userData: { email: string; password: string; name: string }): Promise<ApiResponse<AuthResponse>> {
    console.log('API Service - Register attempt');
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
      console.log('API Service - Register successful');
      return response.data;
    } catch (error) {
      console.error('API Service - Register error:', error);
      throw error;
    }
  }

  static async getProfile(): Promise<ApiResponse<User>> {
    console.log('API Service - Get profile attempt');
    try {
      const response = await api.get<ApiResponse<User>>('/auth/profile');
      console.log('API Service - Get profile successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Service - Get profile error:', error);
      throw error;
    }
  }

  // Transaction endpoints
  static async getTransactions(params?: { page?: number; limit?: number; department?: string }): Promise<PaginatedResponse<Transaction>> {
    console.log('API Service - Get transactions attempt');
    try {
      const response = await api.get<PaginatedResponse<Transaction>>('/transactions', { params });
      return response.data;
    } catch (error) {
      console.error('API Service - Get transactions error:', error);
      throw error;
    }
  }

  static async createTransaction(transaction: {
    description: string;
    amount: number;
    department_id: number;
    category?: string | null;
    date: string;
  }): Promise<ApiResponse<Transaction>> {
    console.log('API Service - Create transaction attempt');
    try {
      const response = await api.post<ApiResponse<Transaction>>('/transactions', transaction);
      return response.data;
    } catch (error) {
      console.error('API Service - Create transaction error:', error);
      throw error;
    }
  }

  static async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<ApiResponse<Transaction>> {
    console.log('API Service - Update transaction attempt');
    try {
      const response = await api.put<ApiResponse<Transaction>>(`/transactions/${id}`, transaction);
      return response.data;
    } catch (error) {
      console.error('API Service - Update transaction error:', error);
      throw error;
    }
  }

  static async deleteTransaction(id: string): Promise<ApiResponse<void>> {
    console.log('API Service - Delete transaction attempt');
    try {
      const response = await api.delete<ApiResponse<void>>(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Service - Delete transaction error:', error);
      throw error;
    }
  }

  // Department endpoints
  static async getDepartments(): Promise<ApiResponse<Department[]>> {
    console.log('API Service - Get departments attempt');
    try {
      const response = await api.get<ApiResponse<Department[]>>('/departments');
      return response.data;
    } catch (error) {
      console.error('API Service - Get departments error:', error);
      throw error;
    }
  }

  static async createDepartment(department: Omit<Department, 'id'>): Promise<ApiResponse<Department>> {
    console.log('API Service - Create department attempt');
    try {
      const response = await api.post<ApiResponse<Department>>('/departments', department);
      return response.data;
    } catch (error) {
      console.error('API Service - Create department error:', error);
      throw error;
    }
  }

  static async updateDepartment(id: string, department: Partial<Department>): Promise<ApiResponse<Department>> {
    console.log('API Service - Update department attempt');
    try {
      const response = await api.put<ApiResponse<Department>>(`/departments/${id}`, department);
      return response.data;
    } catch (error) {
      console.error('API Service - Update department error:', error);
      throw error;
    }
  }

  static async deleteDepartment(id: string): Promise<ApiResponse<void>> {
    console.log('API Service - Delete department attempt');
    try {
      const response = await api.delete<ApiResponse<void>>(`/departments/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Service - Delete department error:', error);
      throw error;
    }
  }

  // Reports endpoints
  static async getReports(params?: { startDate?: string; endDate?: string; department?: string }): Promise<ApiResponse<Report[]>> {
    console.log('API Service - Get reports attempt');
    try {
      const response = await api.get<ApiResponse<Report[]>>('/reports', { params });
      return response.data;
    } catch (error) {
      console.error('API Service - Get reports error:', error);
      throw error;
    }
  }

  static async generateReport(reportData: { type: string; parameters: any }): Promise<ApiResponse<Report>> {
    console.log('API Service - Generate report attempt');
    try {
      const response = await api.post<ApiResponse<Report>>('/reports/generate', reportData);
      return response.data;
    } catch (error) {
      console.error('API Service - Generate report error:', error);
      throw error;
    }
  }

  // User endpoints
  static async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    console.log('API Service - Update profile attempt');
    try {
      const response = await api.put<ApiResponse<User>>('/users/profile', userData);
      return response.data;
    } catch (error) {
      console.error('API Service - Update profile error:', error);
      throw error;
    }
  }

  static async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    console.log('API Service - Change password attempt');
    try {
      const response = await api.put<ApiResponse<void>>('/users/password', passwordData);
      return response.data;
    } catch (error) {
      console.error('API Service - Change password error:', error);
      throw error;
    }
  }
}

export default ApiService; 