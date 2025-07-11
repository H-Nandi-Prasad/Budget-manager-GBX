import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Department } from "@/services/departmentService";

interface DepartmentSpendingChartProps {
  data: Department[];
}

export const DepartmentSpendingChart = ({ data: departments }: DepartmentSpendingChartProps) => {
  const { formatAmount, validateAmount } = useCurrency();

  console.log('Processing department data for chart:', departments);

  const chartData = departments.map(dept => {
    // Validate numeric values
    const budget = validateAmount(dept.budget) ? dept.budget : 0;
    const spent = validateAmount(dept.spent) ? dept.spent : 0;
    const remaining = budget - spent;

    console.log(`Department ${dept.name} values:`, {
      budget,
      spent,
      remaining,
      isValidBudget: validateAmount(dept.budget),
      isValidSpent: validateAmount(dept.spent)
    });

    return {
      name: dept.name,
      budget: budget,
      spent: spent,
      remaining: remaining,
      utilization: budget > 0 ? ((spent / budget) * 100).toFixed(1) + '%' : '0%'
    };
  });

  const yAxisFormatter = (value: number) => {
    if (!validateAmount(value)) {
      console.warn('Invalid value for Y-axis formatting:', value);
      return '$0.00';
    }
    return formatAmount(value);
  };

  const tooltipFormatter = (value: number) => {
    if (!validateAmount(value)) {
      console.warn('Invalid value for tooltip formatting:', value);
      return '$0.00';
    }
    return formatAmount(value);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="name" stroke="#fff" />
        <YAxis tickFormatter={yAxisFormatter} stroke="#fff" />
        <Tooltip
          formatter={tooltipFormatter}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            color: '#fff'
          }}
        />
        <Legend />
        <Bar 
          dataKey="budget" 
          name="Total Budget" 
          fill="#8884d8" 
          opacity={0.7}
        />
        <Bar 
          dataKey="spent" 
          name="Amount Spent" 
          fill="#EF4444"
        />
        <Bar 
          dataKey="remaining" 
          name="Remaining" 
          fill="#ffc658"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
