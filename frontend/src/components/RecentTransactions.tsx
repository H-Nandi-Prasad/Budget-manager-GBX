
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

const transactions = [
  {
    id: 1,
    department: "IT",
    amount: -12500,
    description: "Hardware Supplies",
    date: "2025-04-18",
  },
  {
    id: 2,
    department: "Marketing",
    amount: -8700,
    description: "Digital Campaign",
    date: "2025-04-17",
  },
  {
    id: 3,
    department: "HR",
    amount: -5000,
    description: "Training Program",
    date: "2025-04-16",
  },
  {
    id: 4,
    department: "Sales",
    amount: 25000,
    description: "Budget Allocation",
    date: "2025-04-15",
  },
];

export const RecentTransactions = () => {
  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center">
              <div className={`flex h-9 w-9 items-center justify-center rounded ${
                transaction.amount > 0 ? "bg-success/20" : "bg-destructive/20"
              }`}>
                {transaction.amount > 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-success" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-destructive" />
                )}
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">
                  {transaction.department} • {transaction.date}
                </p>
              </div>
              <div className="ml-auto font-medium">
                {transaction.amount > 0 ? "+" : ""}
                ${Math.abs(transaction.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

