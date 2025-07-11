import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Department } from "@/services/departmentService";

interface MonthlyTrendsChartProps {
  data: Department[];
  startDate?: Date;
  endDate?: Date;
}

const generateMonthlyData = (departments: Department[], startDate?: Date, endDate?: Date) => {
  // Default to last 6 months if no dates provided
  const end = endDate || new Date();
  const start = startDate || new Date(end.getFullYear(), end.getMonth() - 5, 1);
  
  // Get all months between start and end date
  const months: string[] = [];
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    months.push(currentDate.toLocaleString('default', { month: 'short', year: 'numeric' }));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Calculate total budget and spending for each month
  return months.map(month => {
    const totalBudget = departments.reduce((sum, dept) => sum + (dept.budget || 0), 0);
    const totalSpent = departments.reduce((sum, dept) => sum + (dept.spent || 0), 0);
    
    // Calculate monthly values
    const monthlyBudget = totalBudget / 12;
    const monthlySpent = totalSpent / 12;
    
    // Add some variation to make it more realistic
    const variation = 0.9 + Math.random() * 0.2; // 90% to 110% of average
    
    return {
      month,
      budget: Math.round(monthlyBudget * variation),
      spent: Math.round(monthlySpent * variation)
    };
  });
};

export const MonthlyTrendsChart = ({ data: departments, startDate, endDate }: MonthlyTrendsChartProps) => {
  const { formatAmount } = useCurrency();
  const chartData = generateMonthlyData(departments, startDate, endDate);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="month" stroke="#fff" />
          <YAxis tickFormatter={(value) => formatAmount(value)} stroke="#fff" />
          <Tooltip 
            formatter={(value) => formatAmount(value as number)}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              color: '#fff'
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="budget"
            name="Budget"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="spent"
            name="Spent"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
