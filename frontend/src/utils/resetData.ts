import { clearTransactions, getTransactions } from '@/services/transactionService';
import { clearDepartments, getDepartments } from '@/services/departmentService';

export const resetAllData = () => {
  // First clear all existing data
  clearTransactions();
  clearDepartments();
  localStorage.clear();
  
  // Then force initialization of new data
  getDepartments(); // This will create initial departments
  getTransactions(); // This will create initial transactions
}; 