import { Card } from "@/components/ui/card";
import { Department } from "@/services/departmentService";
import { useCurrency } from "@/contexts/CurrencyContext";

interface AnalyticsSummaryProps {
  departments: Department[];
  startDate: Date;
  endDate: Date;
}

export const AnalyticsSummary = ({ departments, startDate, endDate }: AnalyticsSummaryProps) => {
  const { formatAmount } = useCurrency();

  const totalBudget = departments.reduce((sum, dept) => sum + (dept.budget || 0), 0);
  const totalSpent = departments.reduce((sum, dept) => sum + (dept.spent || 0), 0);
  const remainingBudget = totalBudget - totalSpent;
  const spendingPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const stats = [
    {
      title: "Total Budget",
      value: formatAmount(totalBudget),
      description: `For period ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
    },
    {
      title: "Total Spent",
      value: formatAmount(totalSpent),
      description: "Across all departments"
    },
    {
      title: "Remaining Budget",
      value: formatAmount(remainingBudget),
      description: `${spendingPercentage.toFixed(1)}% of budget utilized`
    },
    {
      title: "Active Departments",
      value: departments.length.toString(),
      description: "Currently being tracked"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6 backdrop-blur-md bg-white/10 border-white/20">
          <h3 className="text-sm font-medium text-white/70">{stat.title}</h3>
          <div className="mt-2 flex items-baseline">
            <div className="text-2xl font-semibold text-white">{stat.value}</div>
          </div>
          <p className="mt-2 text-sm text-white/50">{stat.description}</p>
        </Card>
      ))}
    </div>
  );
};
