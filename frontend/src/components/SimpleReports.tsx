import { useMemo } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getTransactions } from "@/services/transactionService";
import { getDepartments } from "@/services/departmentService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { TransactionChart } from "@/components/TransactionChart";

interface SimpleReportsProps {
  dateRange: { start: Date | null; end: Date | null };
}

export const SimpleReports = ({ dateRange }: SimpleReportsProps) => {
  const { formatAmount } = useCurrency();
  const transactions = getTransactions();
  const departments = getDepartments();

  // Filter transactions based on date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      if (dateRange.start && transactionDate < dateRange.start) return false;
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        if (transactionDate > endDate) return false;
      }
      return true;
    });
  }, [transactions, dateRange]);

  // Calculate basic stats
  const totalRevenue = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(
    filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  // Prepare department data
  const departmentData = useMemo(() => {
    return departments.map(dept => {
      const deptTransactions = filteredTransactions.filter(t => t.department === dept.name);
      const spent = deptTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      return {
        name: dept.name,
        budget: dept.budget,
        spent,
        remaining: dept.budget - spent
      };
    });
  }, [departments, filteredTransactions]);

  // Prepare trend data
  const trendData = useMemo(() => {
    const data = {};
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!data[dateStr]) {
        data[dateStr] = {
          date: dateStr,
          amount: 0
        };
      }
      
      data[dateStr].amount += transaction.amount;
    });
    
    return Object.values(data)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-zinc-800 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-zinc-800">{formatAmount(totalRevenue)}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-zinc-800 mb-2">Total Expenses</h3>
          <p className="text-3xl font-bold text-zinc-800">{formatAmount(totalExpenses)}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-zinc-800 mb-2">Net Profit</h3>
          <p className="text-3xl font-bold text-zinc-800">{formatAmount(totalRevenue - totalExpenses)}</p>
        </div>
      </div>
      
      {/* Trend Chart */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">Transaction Analysis</h3>
        <div className="mt-2">
          <TransactionChart />
        </div>
      </div>
      
      {/* Department Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-800/20">
            <tr>
              <th className="py-3 px-4 text-left text-zinc-800 font-semibold">Department</th>
              <th className="py-3 px-4 text-left text-zinc-800 font-semibold">Budget</th>
              <th className="py-3 px-4 text-left text-zinc-800 font-semibold">Spent</th>
              <th className="py-3 px-4 text-left text-zinc-800 font-semibold">Remaining</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {departmentData.map((dept) => (
              <tr key={dept.name} className="hover:bg-blue-700/10">
                <td className="py-3 px-4 text-zinc-800">{dept.name}</td>
                <td className="py-3 px-4 text-zinc-800">{formatAmount(dept.budget)}</td>
                <td className="py-3 px-4 text-zinc-800">{formatAmount(dept.spent)}</td>
                <td className="py-3 px-4 text-zinc-800">{formatAmount(dept.remaining)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 