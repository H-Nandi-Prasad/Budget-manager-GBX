import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactions } from "@/contexts/TransactionContext";
import { useDepartments } from "@/contexts/DepartmentsContext";

interface AddExpenseDialogProps {
  children: React.ReactNode;
}

export function AddExpenseDialog({ children }: AddExpenseDialogProps) {
  const { addTransaction } = useTransactions();
  const { departments } = useDepartments();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    department: "",
    amount: "",
    description: "",
    category: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (!formData.department) {
      setError("Please select a department");
      return;
    }
    if (!formData.category) {
      setError("Please select a category");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (!formData.description) {
      setError("Please enter a description");
      return;
    }

    try {
      // Convert amount to negative number for expenses
      const expenseAmount = -Math.abs(parseFloat(formData.amount));
      
      await addTransaction({
        department: formData.department,
        amount: expenseAmount,
        description: formData.description,
        date: new Date().toISOString(),
        category: formData.category,
      });

      // Reset form and close dialog
      setFormData({
        department: "",
        amount: "",
        description: "",
        category: "",
      });
      setOpen(false);
    } catch (err) {
      setError("Failed to add expense. Please try again.");
    }
  };

  const handleDepartmentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      department: value,
      category: "" // Reset category when department changes
    }));
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-slate-900/95 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.department}
              onValueChange={handleDepartmentChange}
              required
            >
              <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/95 border-white/20">
                {departments.map((dept) => (
                  <SelectItem
                    key={dept.name}
                    value={dept.name}
                    className="text-white hover:bg-white/10"
                  >
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
              required
              disabled={!formData.department}
            >
              <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/95 border-white/20">
                {formData.department &&
                  departments
                    .find((dept) => dept.name === formData.department)
                    ?.categories.map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="text-white hover:bg-white/10"
                      >
                        {category}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="bg-white/10 border-white/20 text-white"
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="bg-white/10 border-white/20 text-white"
              placeholder="Enter description"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setError("");
                setFormData({
                  department: "",
                  amount: "",
                  description: "",
                  category: "",
                });
              }}
              className="bg-white/10 border-white/20 hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 