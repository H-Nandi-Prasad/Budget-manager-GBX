// Simple local storage based service for now
// This should be replaced with a proper backend service when available

export interface Transaction {
  id: string;
  department: string;
  amount: number;
  description: string;
  date: string;
  category?: string;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  // IT Department Transactions
  {
    id: "t1",
    department: "IT",
    amount: -25000,
    description: "Annual Microsoft License Renewal",
    date: "2024-03-15",
    category: "Software Licenses"
  },
  {
    id: "t2",
    department: "IT",
    amount: -18000,
    description: "Cloud Infrastructure - Q1",
    date: "2024-03-10",
    category: "Cloud Services"
  },
  {
    id: "t3",
    department: "IT",
    amount: -15000,
    description: "Cybersecurity Software Suite",
    date: "2024-03-05",
    category: "Cybersecurity"
  },

  // Marketing Department Transactions
  {
    id: "t4",
    department: "Marketing",
    amount: -20000,
    description: "Q2 Digital Marketing Campaign",
    date: "2024-03-14",
    category: "Digital Marketing"
  },
  {
    id: "t5",
    department: "Marketing",
    amount: -15000,
    description: "Industry Conference Sponsorship",
    date: "2024-03-08",
    category: "Events"
  },

  // Sales Department Transactions
  {
    id: "t6",
    department: "Sales",
    amount: -12000,
    description: "Sales Team Training Workshop",
    date: "2024-03-12",
    category: "Training"
  },
  {
    id: "t7",
    department: "Sales",
    amount: 45000,
    description: "Enterprise Client Contract",
    date: "2024-03-15",
    category: "Commissions"
  },

  // HR Department Transactions
  {
    id: "t8",
    department: "HR",
    amount: -8000,
    description: "Employee Wellness Program",
    date: "2024-03-07",
    category: "Employee Benefits"
  },
  {
    id: "t9",
    department: "HR",
    amount: -6000,
    description: "Recruitment Platform Subscription",
    date: "2024-03-13",
    category: "HR Software"
  },

  // Operations Department Transactions
  {
    id: "t10",
    department: "Operations",
    amount: -12000,
    description: "Office Equipment Upgrade",
    date: "2024-03-11",
    category: "Equipment"
  },
  {
    id: "t11",
    department: "Operations",
    amount: -8000,
    description: "Building Maintenance",
    date: "2024-03-09",
    category: "Maintenance"
  }
];

export const saveTransaction = (transaction: Omit<Transaction, 'id'>) => {
  const transactions = getTransactions();
  const newTransaction = {
    ...transaction,
    id: Math.random().toString(36).substr(2, 9)
  };
  transactions.push(newTransaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  return newTransaction;
};

export const getTransactions = (): Transaction[] => {
  const transactions = localStorage.getItem('transactions');
  if (!transactions) {
    localStorage.setItem('transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    return INITIAL_TRANSACTIONS;
  }
  return JSON.parse(transactions);
};

export const deleteTransaction = (id: string) => {
  const transactions = getTransactions();
  const updatedTransactions = transactions.filter(t => t.id !== id);
  localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  return updatedTransactions;
};

// Clear all transactions
export const clearTransactions = () => {
  localStorage.removeItem('transactions');
};
