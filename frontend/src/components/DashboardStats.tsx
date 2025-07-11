import { Card, CardContent } from "./ui/card";
import { useCurrency } from "../contexts/CurrencyContext";
import { ArrowDownIcon, ArrowUpIcon, DollarSignIcon } from "lucide-react";
import { useDepartments } from "../contexts/DepartmentsContext";

export const DashboardStats = () => {
  const { formatAmount } = useCurrency();
  const { departments, summary } = useDepartments();

  // Ensure we have valid numbers
  const validBudget = Math.max(0, Math.round(summary?.totalBudget || 0));
  const validSpent = Math.max(0, Math.round(summary?.totalSpent || 0));
  const validRemaining = Math.max(0, Math.round(summary?.totalRemaining || 0));

  // Calculate percentages with validation
  const spentPercentage = validBudget > 0
    ? Math.min(100, Math.max(0, (validSpent / validBudget) * 100))
    : 0;

  const remainingPercentage = validBudget > 0
    ? Math.min(100, Math.max(0, (validRemaining / validBudget) * 100))
    : 0;

  // Format display values
  const displayBudget = formatAmount(validBudget);
  const displaySpent = formatAmount(validSpent);
  const displayRemaining = formatAmount(validRemaining);

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Total Budget</h3>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{displayBudget}</p>
            <p className="text-sm text-muted-foreground">
              Total allocated budget
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Spent</h3>
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-500">{displaySpent}</p>
            <p className="text-sm text-muted-foreground">
              {`${spentPercentage.toFixed(1)}% of total budget`}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Remaining</h3>
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-500">{displayRemaining}</p>
            <p className="text-sm text-muted-foreground">
              {`${remainingPercentage.toFixed(1)}% of total budget`}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Departments</h3>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{departments?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Active departments</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

