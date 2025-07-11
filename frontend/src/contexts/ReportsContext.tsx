import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ApiService from '@/services/api';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from './AuthContext';
import { Report } from '@/types/api.types';

interface ReportsContextType {
  reports: Report[];
  generateReport: (type: string, parameters: any) => Promise<void>;
  refreshReports: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const fetchReports = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await ApiService.getReports();
      setReports(response.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to load reports. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchReports();
    } else {
      setReports([]);
      setError(null);
    }
  }, [isAuthenticated]);

  const generateReport = async (type: string, parameters: any) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const response = await ApiService.generateReport({ type, parameters });
      setReports(prev => [...prev, response.data]);
      toast({
        title: "Success",
        description: "Report generated successfully",
      });
    } catch (err) {
      console.error('Error generating report:', err);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshReports = async () => {
    await fetchReports();
  };

  return (
    <ReportsContext.Provider value={{
      reports,
      generateReport,
      refreshReports,
      isLoading,
      error
    }}>
      {children}
    </ReportsContext.Provider>
  );
}

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
}; 