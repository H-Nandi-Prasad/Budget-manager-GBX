export interface Transaction {
  id: string;
  department: string;
  amount: number;
  description: string;
  date: string;
  category?: string;
}

export interface Department {
  id: string;
  name: string;
  budget: number;
  spent: number;
  description?: string;
  manager?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DepartmentWithSpent extends Department {
  spent: number;
}

export interface Report {
  id: string;
  type: string;
  parameters: {
    startDate?: string;
    endDate?: string;
    department?: string;
    [key: string]: any;
  };
  generatedAt: string;
  data: any;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
} 