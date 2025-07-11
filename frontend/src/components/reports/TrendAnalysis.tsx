import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { month: "Jan", expenses: 45000, revenue: 60000, profit: 15000 },
  { month: "Feb", expenses: 48000, revenue: 65000, profit: 17000 },
  { month: "Mar", expenses: 52000, revenue: 70000, profit: 18000 },
  { month: "Apr", expenses: 51000, revenue: 72000, profit: 21000 },
  { month: "May", expenses: 55000, revenue: 75000, profit: 20000 },
  { month: "Jun", expenses: 58000, revenue: 80000, profit: 22000 },
];

export const TrendAnalysis = () => {
  return (
    <Card className="bg-white/10 border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Financial Trends Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="month" 
                stroke="#fff"
                tick={{ fill: '#fff' }}
              />
              <YAxis 
                tickFormatter={(value) => `$${value/1000}k`} 
                stroke="#fff"
                tick={{ fill: '#fff' }}
              />
              <Tooltip 
                formatter={(value) => `$${value.toLocaleString()}`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff'
                }}
              />
              <Legend 
                wrapperStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#22C55E" name="Revenue" />
              <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Expenses" />
              <Line type="monotone" dataKey="profit" stroke="#8B5CF6" name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
