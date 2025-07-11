import { Card } from "@/components/ui/card";
import { Department } from "@/types/department";

interface AnalyticsSummaryProps {
  departments: Department[];
  startDate: Date;
  endDate: Date;
}

export const AnalyticsSummary = ({ departments, startDate, endDate }: AnalyticsSummaryProps) => {
  const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0);
  const totalSpent = departments.reduce((sum, dept) => sum + dept.spent, 0);
  const remainingBudget = totalBudget - totalSpent;
  const spendingPercentage = (totalSpent / totalBudget) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="p-4 backdrop-blur-md bg-white/10">
        <h3 className="text-lg font-semibold mb-2">Total Budget</h3>
        <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
      </Card>
      <Card className="p-4 backdrop-blur-md bg-white/10">
        <h3 className="text-lg font-semibold mb-2">Total Spent</h3>
        <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
        <p className="text-sm text-gray-500">{spendingPercentage.toFixed(1)}% of budget</p>
      </Card>
      <Card className="p-4 backdrop-blur-md bg-white/10">
        <h3 className="text-lg font-semibold mb-2">Remaining Budget</h3>
        <p className="text-2xl font-bold">${remainingBudget.toLocaleString()}</p>
      </Card>
    </div>
  );
}; 