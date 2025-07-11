import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import ApiService from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from './AuthContext';
import { Department, DepartmentWithSpent, ApiResponse } from '@/types/api.types';

// Helper function to ensure safe number conversion
const safeNumber = (value: any): number => {
  if (value === undefined || value === null) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : Math.round(num);
};

// Local Department type that includes spent, remaining, and categories
interface DepartmentWithStats extends DepartmentWithSpent {
  remaining: number;
  categories: string[];
}

interface DepartmentSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  departmentCount: number;
}

interface DepartmentsContextType {
  departments: DepartmentWithStats[];
  addDepartment: (department: Omit<Department, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editDepartment: (id: string, updates: Partial<Omit<Department, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  refreshDepartments: () => Promise<void>;
  summary: DepartmentSummary;
  isLoading: boolean;
  error: string | null;
}

const DepartmentsContext = createContext<DepartmentsContextType | undefined>(undefined);

export function DepartmentsProvider({ children }: { children: ReactNode }) {
  const [departments, setDepartments] = useState<DepartmentWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const fetchDepartments = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await ApiService.getDepartments();
      
      // Transform API departments to include remaining and ensure valid numbers
      const transformedDepartments: DepartmentWithStats[] = (response.data as DepartmentWithSpent[]).map(dept => {
        const budget = safeNumber(dept.budget);
        const spent = safeNumber(dept.spent);
        const remaining = Math.max(0, budget - spent);

        return {
          ...dept,
          budget,
          spent,
          remaining,
          categories: (dept as any).categories || []
        };
      });

      setDepartments(transformedDepartments);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to load departments. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to load departments. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDepartments();
    } else {
      setDepartments([]);
      setError(null);
    }
  }, [isAuthenticated]);

  // Calculate summary with safe number handling
  const summary: DepartmentSummary = {
    totalBudget: departments.reduce((sum, dept) => sum + safeNumber(dept.budget), 0),
    totalSpent: departments.reduce((sum, dept) => sum + safeNumber(dept.spent), 0),
    totalRemaining: departments.reduce((sum, dept) => sum + safeNumber(dept.remaining), 0),
    departmentCount: departments.length
  };

  const addDepartment = async (department: Omit<Department, 'id' | 'created_at' | 'updated_at'>) => {
    if (!isAuthenticated) return;

    try {
      const response = await ApiService.createDepartment(department);
      const responseData = response.data as DepartmentWithSpent;
      
      // Ensure valid numbers when adding new department
      const budget = safeNumber(responseData.budget);
      const spent = safeNumber(responseData.spent);
      const remaining = Math.max(0, budget - spent);

      const newDepartment: DepartmentWithStats = {
        ...responseData,
        budget,
        spent,
        remaining,
        categories: (responseData as any).categories || []
      };

      setDepartments(prev => [...prev, newDepartment]);
      toast({
        title: "Success",
        description: "Department added successfully",
      });
    } catch (err) {
      console.error('Error adding department:', err);
      toast({
        title: "Error",
        description: "Failed to add department. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const editDepartment = async (id: string, updates: Partial<Omit<Department, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!isAuthenticated) return;

    try {
      const response = await ApiService.updateDepartment(id, updates);
      const responseData = response.data as DepartmentWithSpent;
      
      // Ensure valid numbers when updating department
      const budget = safeNumber(responseData.budget);
      const spent = safeNumber(responseData.spent);
      const remaining = Math.max(0, budget - spent);

      const updatedDepartment: DepartmentWithStats = {
        ...responseData,
        budget,
        spent,
        remaining,
        categories: (responseData as any).categories || []
      };

      setDepartments(prev => prev.map(dept => 
        dept.id === id ? updatedDepartment : dept
      ));
      toast({
        title: "Success",
        description: "Department updated successfully",
      });
    } catch (err) {
      console.error('Error updating department:', err);
      toast({
        title: "Error",
        description: "Failed to update department. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteDepartment = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      await ApiService.deleteDepartment(id);
      setDepartments(prev => prev.filter(dept => dept.id !== id));
      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting department:', err);
      toast({
        title: "Error",
        description: "Failed to delete department. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const refreshDepartments = async () => {
    await fetchDepartments();
  };

  return (
    <DepartmentsContext.Provider value={{
      departments,
      addDepartment,
      editDepartment,
      deleteDepartment,
      refreshDepartments,
      summary,
      isLoading,
      error
    }}>
      {children}
    </DepartmentsContext.Provider>
  );
}

export const useDepartments = () => {
  const context = useContext(DepartmentsContext);
  if (context === undefined) {
    throw new Error('useDepartments must be used within a DepartmentsProvider');
  }
  return context;
}; 