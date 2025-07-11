import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Briefcase, ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useTransactions } from "@/contexts/TransactionContext";
import { useDepartments } from "@/contexts/DepartmentsContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getDepartmentColor } from "@/utils/colors";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";

const Dashboard = () => {
  const { transactions, refreshTransactions, totalIncome, totalExpenses, netChange } = useTransactions();
  const { departments: departmentContext } = useDepartments();
  const { formatAmount } = useCurrency();
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");

  // Calculate monthly trends from actual transactions
  const monthlyTrends = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // e.g., "2024-05"
    if (!acc[key]) {
      acc[key] = { month: key, income: 0, expenses: 0 };
    }
    if (transaction.amount > 0) {
      acc[key].income += transaction.amount;
    } else {
      acc[key].expenses += Math.abs(transaction.amount);
    }
    return acc;
  }, {} as Record<string, { month: string; income: number; expenses: number }>);
  const monthlyData = Object.values(monthlyTrends).sort((a, b) => a.month.localeCompare(b.month));

  // Calculate department data from actual departments
  const departmentData = departmentContext.map(dept => ({
    name: dept.name,
    budget: dept.budget || 0,
    spent: dept.spent || 0,
    remaining: dept.remaining || 0,
    color: getDepartmentColor(dept.name).bg
  }));

  // Calculate category distribution from actual transactions
  const categoryDistribution = transactions.reduce((acc, transaction) => {
    const category = transaction.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += Math.abs(transaction.amount);
    return acc;
  }, {} as Record<string, number>);
  const categoryData = Object.entries(categoryDistribution).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  // Calculate recent activity from actual transactions
  const recentActivity = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)
    .map(transaction => ({
      type: transaction.amount > 0 ? 'income' : 'expense',
      amount: Math.abs(transaction.amount),
      description: transaction.description,
      date: new Date(transaction.date).toLocaleString('default', { 
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      })
    }));

  // Sample data for demonstration
  const sampleMonthlyData = [
    { month: 'Jan', Income: 30000, Expenses: 25000 },
    { month: 'Feb', Income: 45000, Expenses: 38000 },
    { month: 'Mar', Income: 65000, Expenses: 55000 },
    { month: 'Apr', Income: 85000, Expenses: 72000 },
    { month: 'May', Income: 100000, Expenses: 85000 },
    { month: 'Jun', Income: 120000, Expenses: 98000 },
  ];

  const sampleCategoryData = [
    { name: 'Marketing', value: 250000 },
    { name: 'Operations', value: 180000 },
    { name: 'IT', value: 150000 },
    { name: 'HR', value: 120000 },
    { name: 'Sales', value: 200000 }
  ];

  // Use sample data if no transactions exist
  const monthlyDataSample = transactions.length > 0 ? Object.entries(monthlyTrends).map(([month, data]) => ({
    month,
    income: data.income,
    expenses: data.expenses
  })) : sampleMonthlyData;

  const categoryDataSample = transactions.length > 0 ? Object.entries(categoryDistribution).map(([name, value]) => ({
    name,
    value
  })) : sampleCategoryData;

  // Sample recent activity
  const sampleRecentActivity = [
    {
      type: 'income',
      amount: 25000,
      description: 'Client Payment - Project Alpha',
      date: '2:30 PM'
    },
    {
      type: 'expense',
      amount: 15000,
      description: 'Marketing Campaign - Q2',
      date: '1:45 PM'
    },
    {
      type: 'income',
      amount: 35000,
      description: 'Consulting Services',
      date: '11:20 AM'
    },
    {
      type: 'expense',
      amount: 8000,
      description: 'Office Supplies',
      date: '10:15 AM'
    }
  ];

  // Use sample data if no transactions exist
  const recentActivitySample = transactions.length > 0 ? transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)
    .map(transaction => ({
      type: transaction.amount > 0 ? 'income' : 'expense',
      amount: Math.abs(transaction.amount),
      description: transaction.description,
      date: new Date(transaction.date).toLocaleString('default', { 
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      })
    })) : sampleRecentActivity;

  // Helper function to determine progress bar color based on utilization
  const getUtilizationColor = (spent: number, budget: number) => {
    if (!budget || budget === 0) return 'bg-green-500';
    const percentage = (spent / budget) * 100;
    if (isNaN(percentage)) return 'bg-green-500';
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
          Dashboard
        </h1>
        <div className="flex gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/90 backdrop-blur-md border-white/20">
              <SelectItem value="week" className="text-white hover:bg-white/10">This Week</SelectItem>
              <SelectItem value="month" className="text-white hover:bg-white/10">This Month</SelectItem>
              <SelectItem value="quarter" className="text-white hover:bg-white/10">This Quarter</SelectItem>
              <SelectItem value="year" className="text-white hover:bg-white/10">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white/10 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatAmount(departmentContext.reduce((sum, dept) => sum + (dept.budget || 0), 0))}
            </div>
            <div className="flex items-center text-xs text-white/70">
              Combined budget across all departments
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Budget Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatAmount(departmentContext.reduce((sum, dept) => sum + (dept.spent || 0), 0))}
            </div>
            <div className="flex items-center text-xs text-white/70">
              Total amount spent across all departments
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/70">Budget Remaining</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatAmount(departmentContext.reduce((sum, dept) => sum + (dept.remaining || 0), 0))}
            </div>
            <div className="flex items-center text-xs text-white/70">
              Available budget across all departments
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  height={300}
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis 
                    stroke="#9CA3AF"
                    domain={[0, 120000]}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '6px',
                    }}
                    labelStyle={{ color: '#9CA3AF' }}
                    itemStyle={{ color: '#E5E7EB' }}
                    formatter={(value) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#10B981' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#EF4444' }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Department Budget Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentData.map((dept) => {
                const budget = dept.budget || 0;
                const spent = dept.spent || 0;
                const utilizationPercentage = budget === 0 ? 0 : (spent / budget) * 100;
                return (
                  <div key={dept.name} className="space-y-2">
                    <div className="flex justify-between text-sm text-white/70">
                      <span>{dept.name}</span>
                      <div className="flex items-center gap-2">
                        <span>{formatAmount(spent)} / {formatAmount(budget)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          utilizationPercentage >= 90 ? 'bg-red-500/20 text-red-400' :
                          utilizationPercentage >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {utilizationPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${getUtilizationColor(spent, budget)}`}
                        style={{ 
                          width: `${Math.min(100, utilizationPercentage)}%`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData.map(item => ({
                      ...item,
                      value: Number(item.value) || 0
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white'
                    }}
                    itemStyle={{ color: 'white' }}
                    labelStyle={{ color: 'white' }}
                    formatter={(value: any) => [formatAmount(Number(value) || 0), '']}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivitySample.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${activity.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {activity.type === 'income' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-400" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{activity.description}</p>
                      <p className="text-sm text-white/50">{activity.date}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${activity.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {formatAmount(activity.type === 'income' ? activity.amount : -activity.amount)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 
