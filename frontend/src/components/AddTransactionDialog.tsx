import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { PlusCircle } from "lucide-react";
import { getDepartmentCategories } from "../services/departmentService";
import ApiService from '../services/api';

interface AddTransactionDialogProps {
  departments: { id: string | number; name: string; categories: string[] }[];
  children?: React.ReactNode;
  onSuccess?: () => void;
}

const AddTransactionDialog = ({ departments, children, onSuccess }: AddTransactionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    const dept = departments.find(d => d.name === value);
    setCategories(dept?.categories || []);
    setCategory(""); // Reset category when department changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const selectedDept = departments.find(d => d.name === department);
      if (!selectedDept || !selectedDept.id) {
        setError("Department not found. Please select a valid department.");
        return;
      }
      const transaction = {
        description,
        amount: parseFloat(amount),
        department: selectedDept.name,
        department_id: Number(selectedDept.id),
        category: category || undefined,
        date: new Date().toISOString(),
      };
      // Only send the fields expected by the backend
      const apiPayload = {
        description: transaction.description,
        amount: transaction.amount,
        department_id: transaction.department_id,
        category: transaction.category ? transaction.category : null,
        date: transaction.date,
      };
      await ApiService.createTransaction(apiPayload);
      // Reset form
      setDescription("");
      setAmount("");
      setDepartment("");
      setCategory("");
      setOpen(false);
      // Call onSuccess callback if provided
      onSuccess?.();
    } catch (error) {
      // Optionally handle error (e.g., show toast)
      setError('Error creating transaction. Please try again.');
      console.error('Error creating transaction:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Add Transaction</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div className="space-y-4 overflow-y-auto flex-1 pb-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter transaction description"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (negative for expenses)"
                step="0.01"
                required
              />
              <p className="text-sm text-muted-foreground">
                Use negative values for expenses (e.g., -100)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={handleDepartmentChange} name="department">
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.name} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {categories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory} name="category">
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="border-t pt-4 flex justify-end bg-white/5 sticky bottom-0 z-10">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow">Submit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionDialog; 