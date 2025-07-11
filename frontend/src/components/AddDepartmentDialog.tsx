import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { PlusCircle } from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import { useCurrency } from "../contexts/CurrencyContext";

interface AddDepartmentDialogProps {
  onAddDepartment: (name: string, budget: number, spent: number) => void;
  existingDepartments: string[];
}

const AddDepartmentDialog = ({ onAddDepartment, existingDepartments }: AddDepartmentDialogProps) => {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [spent, setSpent] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [error, setError] = useState("");
  const { validateAmount } = useCurrency();

  const validateNumber = (value: string): number | null => {
    if (!value) return null;
    
    try {
      // Remove any non-numeric characters
      const cleanValue = value.replace(/[^\d]/g, '');
      const num = parseInt(cleanValue, 10);
      
      if (isNaN(num) || !isFinite(num)) {
        return null;
      }
      
      return num;
    } catch (error) {
      console.error('Error validating number:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate and parse numbers
    const budgetNum = validateNumber(budget);
    const spentNum = spent ? validateNumber(spent) : 0;
    
    // Validate inputs
    if (!name) {
      setError('Department name is required');
      return;
    }

    if (budgetNum === null || budgetNum <= 0) {
      setError('Budget must be a positive whole number');
      return;
    }

    if (spentNum === null || spentNum < 0) {
      setError('Spent amount must be a non-negative whole number');
      return;
    }

    if (spentNum > budgetNum) {
      setError('Spent amount cannot exceed budget');
      return;
    }

    const uppercaseName = name.toUpperCase();
    
    if (existingDepartments.includes(uppercaseName)) {
      toast({
        title: "Department Already Exists",
        description: `The department "${uppercaseName}" already exists. You can edit it from the department list.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await onAddDepartment(uppercaseName, budgetNum, spentNum);
      
      // Reset form
      setName("");
      setBudget("");
      setSpent("");
      setOpen(false);
      setError("");
      
      toast({
        title: "Department Added",
        description: `Department "${uppercaseName}" has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating department:', error);
      setError('Failed to create department. Please try again.');
    }
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive integers
    if (value === '' || /^\d+$/.test(value)) {
      setBudget(value);
      setError('');
    }
  };

  const handleSpentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive integers
    if (value === '' || /^\d+$/.test(value)) {
      setSpent(value);
      setError('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter department name"
              required
            />
            <p className="text-sm text-muted-foreground">
              Department names will be converted to uppercase
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Budget Amount</Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={handleBudgetChange}
              placeholder="Enter budget amount"
              min="0"
              step="1"
              required
            />
            <p className="text-sm text-muted-foreground">
              Budget must be a whole number
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="spent">Initial Spent Amount</Label>
            <Input
              id="spent"
              type="number"
              value={spent}
              onChange={handleSpentChange}
              placeholder="Enter initial spent amount (optional)"
              min="0"
              step="1"
            />
            <p className="text-sm text-muted-foreground">
              Leave empty to start with 0 (must be a whole number if provided)
            </p>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add Department</Button>
          </div>
          {error && (
            <div className="mt-2 text-sm text-red-500">
              {error}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDepartmentDialog; 