import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ApiService from '@/services/api';
import { useToast } from "@/components/ui/use-toast";
import { User } from '@/types/api.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  resetAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const resetAuthState = () => {
    console.log('AuthProvider - Resetting auth state');
    localStorage.removeItem('authToken');
    setUser(null);
    setIsLoading(false);
  };

  const fetchProfile = async (token: string) => {
    try {
      console.log('AuthProvider - Fetching profile...');
      const response = await ApiService.getProfile();
      console.log('AuthProvider - Profile fetch successful:', response);
      setUser(response.data);
      return true;
    } catch (error) {
      console.error('AuthProvider - Profile fetch failed:', error);
      resetAuthState();
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    console.log('AuthProvider - Token found:', !!token);

    if (!token) {
      console.log('AuthProvider - No token found');
      setIsLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      console.log('AuthProvider - Loading timeout reached');
      resetAuthState();
    }, 2000);

    fetchProfile(token).finally(() => {
      clearTimeout(timeoutId);
      setIsLoading(false);
    });

    return () => clearTimeout(timeoutId);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('AuthProvider - Attempting login...');
      const response = await ApiService.login({ email, password });
      console.log('AuthProvider - Login successful:', response);
      localStorage.setItem('authToken', response.data.token);
      setUser(response.data.user);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (err: any) {
      console.error('AuthProvider - Login error:', err);
      resetAuthState();
      
      // Get the specific error message from the response
      const errorMessage = err.response?.data?.message || 'Failed to login. Please try again.';
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      console.log('AuthProvider - Attempting registration...');
      const response = await ApiService.register({ email, password, name });
      console.log('AuthProvider - Registration successful:', response);
      localStorage.setItem('authToken', response.data.token);
      setUser(response.data.user);
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    } catch (err) {
      console.error('AuthProvider - Registration error:', err);
      resetAuthState();
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('AuthProvider - Logging out...');
    resetAuthState();
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      resetAuthState
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 