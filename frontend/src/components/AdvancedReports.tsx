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
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AdvancedReportsProps {
  dateRange: { start: Date | null; end: Date | null };
}

export const AdvancedReports = ({ dateRange }: AdvancedReportsProps) => {
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

  // Calculate department spending
  const departmentSpending = useMemo(() => {
    const spending = departments.map((dept) => {
      const spent = filteredTransactions
        .filter((t) => t.department === dept.name)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      return {
        name: dept.name,
        budget: dept.budget,
        spent: spent,
        remaining: dept.budget - spent,
        percentage: (spent / dept.budget) * 100,
      };
    });
    
    return spending.sort((a, b) => b.spent - a.spent);
  }, [departments, filteredTransactions]);

  // Calculate monthly spending trends
  const monthlyTrends = useMemo(() => {
    const trends = {};
    
    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!trends[monthYear]) {
        trends[monthYear] = {
          month: new Date(date.getFullYear(), date.getMonth(), 1)
            .toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          expenses: 0,
          income: 0,
        };
      }
      
      if (transaction.amount < 0) {
        trends[monthYear].expenses += Math.abs(transaction.amount);
      } else {
        trends[monthYear].income += transaction.amount;
      }
    });
    
    return Object.values(trends).sort((a: any, b: any) => {
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime();
    });
  }, [filteredTransactions]);

  // Calculate category distribution
  const categoryDistribution = useMemo(() => {
    const categories = {};
    
    filteredTransactions.forEach((transaction) => {
      const category = transaction.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += Math.abs(transaction.amount);
    });
    
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => (b.value as number) - (a.value as number));
  }, [filteredTransactions]);

  const COLORS = [
    '#3B82F6', '#F97316', '#22C55E', '#8B5CF6', 
    '#EC4899', '#EAB308', '#EF4444', '#06B6D4'
  ];

  return (
    <div className="space-y-8">
      {/* Department Budget vs Spending */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">Budget vs Spending by Department</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={departmentSpending}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#27272a' }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis 
                tickFormatter={(value) => formatAmount(value)}
                tick={{ fill: '#27272a' }}
              />
              <Tooltip 
                formatter={(value) => formatAmount(value as number)}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '8px', 
                  color: '#27272a'
                }}
              />
              <Legend wrapperStyle={{ color: '#27272a' }} />
              <Bar dataKey="budget" name="Budget" fill="#3B82F6" />
              <Bar dataKey="spent" name="Spent" fill="#F97316" />
              <Bar dataKey="remaining" name="Remaining" fill="#22C55E" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">Monthly Spending Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyTrends}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" tick={{ fill: '#27272a' }} />
              <YAxis 
                tickFormatter={(value) => formatAmount(value)}
                tick={{ fill: '#27272a' }}
              />
              <Tooltip 
                formatter={(value) => formatAmount(value as number)}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '8px', 
                  color: '#27272a'
                }}
              />
              <Legend wrapperStyle={{ color: '#27272a' }} />
              <Bar dataKey="income" name="Income" fill="#22C55E" />
              <Bar dataKey="expenses" name="Expenses" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-zinc-800 mb-4">Spending by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatAmount(value as number)}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '8px', 
                    color: '#27272a'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-zinc-800 mb-4">Budget Utilization Percentage</h3>
          <div className="space-y-6">
            {departmentSpending.map((dept) => (
              <div key={dept.name} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-800 font-medium">{dept.name}</span>
                  <span className="text-zinc-800">{dept.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="h-2.5 rounded-full"
                    style={{ 
                      width: `${Math.min(dept.percentage, 100)}%`,
                      backgroundColor: dept.percentage > 90 ? '#EF4444' : dept.percentage > 70 ? '#F97316' : '#22C55E'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 