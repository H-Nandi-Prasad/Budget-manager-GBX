import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  id: string;
  date: string;
  department: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface TransactionListProps {
  dateRange: DateRange;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "2024-03-15",
    department: "IT",
    description: "Software Licenses",
    amount: 2500,
    type: "expense"
  },
  {
    id: "2",
    date: "2024-03-14",
    department: "Sales",
    description: "Client Payment",
    amount: 15000,
    type: "income"
  },
  {
    id: "3",
    date: "2024-03-13",
    department: "Marketing",
    description: "Ad Campaign",
    amount: 3500,
    type: "expense"
  },
  {
    id: "4",
    date: "2024-03-12",
    department: "HR",
    description: "Training Materials",
    amount: 1200,
    type: "expense"
  },
  {
    id: "5",
    date: "2024-03-11",
    department: "Operations",
    description: "Equipment Maintenance",
    amount: 800,
    type: "expense"
  }
];

export const TransactionList = ({ dateRange }: TransactionListProps) => {
  // Filter transactions based on date range
  const transactions = mockTransactions;

  return (
    <Card className="backdrop-blur-md bg-white/10">
      <div className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Date</TableHead>
              <TableHead className="text-white">Department</TableHead>
              <TableHead className="text-white">Description</TableHead>
              <TableHead className="text-white text-right">Amount</TableHead>
              <TableHead className="text-white">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id} className="border-white/10">
                <TableCell className="text-white">{transaction.date}</TableCell>
                <TableCell className="text-white">{transaction.department}</TableCell>
                <TableCell className="text-white">{transaction.description}</TableCell>
                <TableCell className="text-white text-right">
                  ${transaction.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === "income"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}; 