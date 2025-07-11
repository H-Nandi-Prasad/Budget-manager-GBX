import { DashboardStats } from "@/components/DashboardStats";
import { BudgetChart } from "@/components/BudgetChart";
import { RecentTransactions } from "@/components/RecentTransactions";

const Index = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Budget Dashboard</h1>
      <div className="space-y-8">
        <DashboardStats />
        <BudgetChart />
        <RecentTransactions />
      </div>
    </div>
  );
};

export default Index;

