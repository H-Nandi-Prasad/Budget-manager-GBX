import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import ApiService from '@/services/api';
import { useToast } from "@/components/ui/use-toast";
import { useDepartments } from './DepartmentsContext';
import { useAuth } from './AuthContext';
import { Transaction } from '@/types/api.types';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  totalIncome: number;
  totalExpenses: number;
  netChange: number;
  isLoading: boolean;
  error: string | null;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { refreshDepartments } = useDepartments();
  const { isAuthenticated } = useAuth();

  // Fetch transactions from the API
  const fetchTransactions = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await ApiService.getTransactions();
      setTransactions(
        response.data.map(t => ({
          ...t,
          department: t.department || t.department_name
        }))
      );
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to load transactions. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setError(null);
    }
  }, [isAuthenticated]);

  // Calculate totals
  const totalIncome = transactions.reduce((sum, t) => t.amount > 0 ? sum + t.amount : sum, 0);
  const totalExpenses = transactions.reduce((sum, t) => t.amount < 0 ? sum + Math.abs(t.amount) : sum, 0);
  const netChange = totalIncome - totalExpenses;

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!isAuthenticated) return;

    try {
      const response = await ApiService.createTransaction(transaction);
      setTransactions(prev => [...prev, response.data]);
      
      // Update department spending
      if (transaction.amount < 0) {
        await refreshDepartments();
      }
      
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
    } catch (err) {
      console.error('Error adding transaction:', err);
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const removeTransaction = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      await ApiService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      // Refresh departments to update spending
      await refreshDepartments();
      
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    } catch (err) {
      console.error('Error removing transaction:', err);
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  // Memoize refreshTransactions to prevent infinite useEffect loops
  const refreshTransactions = useCallback(async () => {
    await fetchTransactions();
  }, [isAuthenticated]);

  return (
    <TransactionContext.Provider value={{
      transactions,
      addTransaction,
      removeTransaction,
      refreshTransactions,
      totalIncome,
      totalExpenses,
      netChange,
      isLoading,
      error
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}; 