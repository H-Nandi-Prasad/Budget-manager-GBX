import { Card } from "@/components/ui/card";
import { Department } from "@/services/departmentService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface ROKTrendAnalysisProps {
  departments: Department[];
  startDate: Date;
  endDate: Date;
}

const ROKTrendAnalysis = ({ departments, startDate, endDate }: ROKTrendAnalysisProps) => {
  // Calculate total budget and spent for each department
  const totalBudget = departments.reduce((sum, dept) => sum + (dept.budget || 0), 0);
  const totalSpent = departments.reduce((sum, dept) => sum + (dept.spent || 0), 0);
  const utilizationRate = (totalSpent / totalBudget) * 100;

  // Generate monthly data based on departments
  const monthlyData = departments.map(dept => ({
    department: dept.name,
    budget: dept.budget || 0,
    spent: dept.spent || 0,
    utilization: dept.spent && dept.budget ? ((dept.spent / dept.budget) * 100).toFixed(1) + '%' : '0%'
  }));

  // Generate insights based on actual data
  const insights = [
    `Overall budget utilization is at ${utilizationRate.toFixed(1)}%`,
    `Total budget allocated: ${totalBudget.toLocaleString()} across ${departments.length} departments`,
    `Total spent: ${totalSpent.toLocaleString()} as of ${endDate.toLocaleDateString()}`,
    departments.length > 0 
      ? `Highest spending department: ${departments.reduce((prev, curr) => 
          (curr.spent || 0) > (prev.spent || 0) ? curr : prev).name}`
      : "No department data available"
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 backdrop-blur-md bg-white/10">
        <h3 className="text-xl font-semibold mb-4 text-white">ROK Budget Trend Analysis</h3>
        <div className="w-full overflow-x-auto">
          <LineChart width={800} height={400} data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
            <XAxis dataKey="department" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: 'none'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="budget" 
              stroke="#8884d8" 
              name="Budget" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="spent" 
              stroke="#82ca9d" 
              name="Spent" 
              strokeWidth={2}
            />
          </LineChart>
        </div>
      </Card>

      <Card className="p-6 backdrop-blur-md bg-white/10">
        <h3 className="text-xl font-semibold mb-4 text-white">ROK Insights</h3>
        <ul className="space-y-2 text-white">
          {insights.map((insight, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2">•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default ROKTrendAnalysis; 