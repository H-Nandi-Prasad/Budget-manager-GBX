import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, ArrowUpIcon, ArrowDownIcon, Search, Filter, SortAsc, Calendar, Trash2, Plus, RefreshCw, Download, AlertCircle } from "lucide-react";
import { TransactionChart } from "@/components/TransactionChart";
import { getDepartments } from "@/services/departmentService";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddTransactionDialog from "@/components/AddTransactionDialog";
import { getDepartmentColor } from "@/utils/colors";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDepartments } from "@/contexts/DepartmentsContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 10;

const Transactions = () => {
  const { transactions, removeTransaction, refreshTransactions, totalIncome, totalExpenses, netChange } = useTransactions();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "department">("date");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { formatAmount } = useCurrency();
  const { departments: departmentContext } = useDepartments();
  const [isLoading, setIsLoading] = useState(true);

  const departments = useMemo(() => 
    departmentContext.map(dept => ({
      id: dept.id,
      name: dept.name,
      categories: Array.isArray((dept as any).categories) ? (dept as any).categories : []
    })), [departmentContext]);

  // Memoized filtered transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(term) ||
        t.department.toLowerCase().includes(term)
      );
    }

    // Apply department filter
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(t => t.department === selectedDepartment);
    }

    // Apply period filter
    const now = new Date();
    switch (selectedPeriod) {
      case "today":
        filtered = filtered.filter(t => new Date(t.date).toDateString() === now.toDateString());
        break;
      case "week":
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        filtered = filtered.filter(t => new Date(t.date) >= weekAgo);
        break;
      case "month":
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filtered = filtered.filter(t => new Date(t.date) >= monthAgo);
        break;
    }

    // Apply amount range filter
    if (minAmount) {
      filtered = filtered.filter(t => t.amount >= parseFloat(minAmount));
    }
    if (maxAmount) {
      filtered = filtered.filter(t => t.amount <= parseFloat(maxAmount));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortBy === "amount") {
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      } else {
        return sortOrder === "asc" 
          ? a.department.localeCompare(b.department)
          : b.department.localeCompare(a.department);
      }
    });

    return filtered;
  }, [transactions, searchTerm, selectedDepartment, selectedPeriod, sortOrder, sortBy, minAmount, maxAmount]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  // Handle transaction deletion
  const handleDeleteTransaction = useCallback((id: string) => {
    removeTransaction(id);
  }, [removeTransaction]);

  // Handle export
  const handleExport = useCallback(() => {
    const csv = [
      ['Date', 'Department', 'Description', 'Amount', 'Category'].join(','),
      ...filteredTransactions.map(t => [
        t.date,
        t.department,
        t.description,
        t.amount,
        t.category || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [filteredTransactions]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await refreshTransactions();
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [refreshTransactions]);

  const getStatusColor = (amount: number) => {
    if (amount > 0) {
      return {
        bg: "bg-green-500/20",
        text: "text-green-400",
        border: "border-green-500/30"
      };
    } else {
      return {
        bg: "bg-red-500/20",
        text: "text-red-400",
        border: "border-red-500/30"
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/30 rounded-full filter blur-[80px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-purple-500/30 rounded-full filter blur-[80px] translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-emerald-500/30 rounded-full filter blur-[80px] translate-y-1/2" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black tracking-tight text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            Transactions
          </h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={handleExport}
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <AddTransactionDialog 
              departments={departments}
              onSuccess={refreshTransactions}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="backdrop-blur-lg bg-white/10 rounded-xl p-4 border border-white/20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/70" />
            <Input
              placeholder="Search transactions..."
              className="pl-8 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/90 backdrop-blur-md border-white/20">
              <SelectItem value="all" className="text-white hover:bg-white/10">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.name} value={dept.name} className="text-white hover:bg-white/10">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: getDepartmentColor(dept.name).bg || '#3B82F6' }} />
                    {dept.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/90 backdrop-blur-md border-white/20">
              <SelectItem value="all" className="text-white hover:bg-white/10">All Time</SelectItem>
              <SelectItem value="today" className="text-white hover:bg-white/10">Today</SelectItem>
              <SelectItem value="week" className="text-white hover:bg-white/10">This Week</SelectItem>
              <SelectItem value="month" className="text-white hover:bg-white/10">This Month</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min Amount"
              className="bg-white/10 border-white/20 text-white"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
            <span className="text-white/50">to</span>
            <Input
              type="number"
              placeholder="Max Amount"
              className="bg-white/10 border-white/20 text-white"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={(value: "date" | "amount" | "department") => setSortBy(value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/90 backdrop-blur-md border-white/20">
              <SelectItem value="date" className="text-white hover:bg-white/10">Date</SelectItem>
              <SelectItem value="amount" className="text-white hover:bg-white/10">Amount</SelectItem>
              <SelectItem value="department" className="text-white hover:bg-white/10">Department</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            <SortAsc className={`h-4 w-4 ${sortOrder === "desc" ? "transform rotate-180" : ""}`} />
          </Button>
        </div>

        {/* Stats and Chart */}
        <div className="grid gap-6">
          <Card className="backdrop-blur-lg bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Transaction Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <p className="text-white/70 font-medium">Total Income</p>
                  <p className="text-2xl font-bold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
                    {formatAmount(totalIncome)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-white/70 font-medium">Total Expenses</p>
                  <p className="text-2xl font-bold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
                    {formatAmount(totalExpenses)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-white/70 font-medium">Net Change</p>
                  <p className="text-2xl font-bold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
                    {formatAmount(netChange)}
                  </p>
                </div>
              </div>
              <TransactionChart />
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card className="backdrop-blur-lg bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-3 w-[150px]" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-[100px]" />
                    </div>
                  ))}
                </div>
              ) : paginatedTransactions.length === 0 ? (
                <div className="text-center py-8 text-white/70 bg-white/5 rounded-lg">
                  No transactions found. Add your first transaction using the button above.
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${getStatusColor(transaction.amount).bg}`}>
                          {transaction.amount > 0 ? (
                            <ArrowUpIcon className={`h-4 w-4 ${getStatusColor(transaction.amount).text}`} />
                          ) : (
                            <ArrowDownIcon className={`h-4 w-4 ${getStatusColor(transaction.amount).text}`} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>{transaction.description}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={`${getStatusColor(transaction.amount).border} text-white/70 border-white/20`}>
                              {transaction.department}
                            </Badge>
                            <span className="text-white/50 text-sm">
                              {new Date(transaction.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className={`text-lg font-semibold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatAmount(transaction.amount)}
                        </p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this transaction? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center text-white/70">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
