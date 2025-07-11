import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useCurrency } from "../contexts/CurrencyContext";
import { useDepartments } from "../contexts/DepartmentsContext";

export const BudgetChart = () => {
  const { formatAmount } = useCurrency();
  const { departments } = useDepartments();

  // If no departments, show empty state
  if (!departments || departments.length === 0) {
    return (
      <Card className="bg-white/20 backdrop-blur-md border border-white/20 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
            Department Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-white/60">No departments available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data using the department stats
  const data = departments.map(dept => {
    // Ensure numbers are valid
    const budget = Math.max(0, Math.round(dept.budget || 0));
    const spent = Math.max(0, Math.round(dept.spent || 0));
    const remaining = Math.max(0, budget - spent);

    return {
      department: dept.name,
      budget,
      spent,
      remaining
    };
  });

  // Convert departments to the expected format with colors
  const chartData = departments.map((dept, index) => ({
    ...dept,
    color: index === 0 ? 'rgba(59, 130, 246, 0.8)' : // Blue
           index === 1 ? 'rgba(249, 115, 22, 0.8)' : // Orange
           index === 2 ? 'rgba(16, 185, 129, 0.8)' : // Emerald
           `hsl(${210 + index * 30}, 80%, 60%)` // Generate colors for additional departments
  }));

  // Custom formatter for tooltip values
  const customFormatter = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return '$0';
    }
    return formatAmount(Math.round(value));
  };

  return (
    <Card className="bg-white/20 backdrop-blur-md border border-white/20 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
          Department Budget Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis
                dataKey="department"
                stroke="#fff"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
                tick={{ fill: '#fff' }}
              />
              <YAxis
                stroke="#fff"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={customFormatter}
                padding={{ top: 20, bottom: 20 }}
                tick={{ fill: '#fff' }}
              />
              <Tooltip
                formatter={customFormatter}
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  padding: "8px 12px",
                  color: '#fff'
                }}
                cursor={{ stroke: 'rgba(255, 255, 255, 0.4)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ paddingTop: '8px', color: '#fff' }}
                formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="budget"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorBudget)"
                name="Budget"
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="spent"
                stroke="#F97316"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSpent)"
                name="Spent"
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartData.map((dept) => (
            <div key={dept.id} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: dept.color }}></div>
              <span className="text-sm font-medium text-white">{dept.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

