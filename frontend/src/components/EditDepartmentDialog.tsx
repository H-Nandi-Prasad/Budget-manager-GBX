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
import { Pencil } from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import { useCurrency } from "../contexts/CurrencyContext";

interface EditDepartmentDialogProps {
  department: {
    name: string;
    budget: number;
    spent: number;
  };
  onEditDepartment: (name: string, budget: number, spent: number) => void;
  existingDepartments: string[];
}

const EditDepartmentDialog = ({ department, onEditDepartment, existingDepartments }: EditDepartmentDialogProps) => {
  const [name, setName] = useState(department.name);
  const [budget, setBudget] = useState(department.budget.toString());
  const [spent, setSpent] = useState(department.spent.toString());
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { validateAmount } = useCurrency();

  const validateNumber = (value: string): number | null => {
    if (!value) return null;
    
    try {
      // Remove any non-numeric characters except decimal point
      const cleanValue = value.replace(/[^\d.]/g, '');
      const num = parseInt(cleanValue, 10);
      
      if (isNaN(num) || !isFinite(num)) {
        return null;
      }
      
      return Math.round(num);
    } catch (error) {
      console.error('Error validating number:', error);
      return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate and parse numbers
    const budgetNumber = validateNumber(budget);
    const spentNumber = validateNumber(spent);
    const uppercaseName = name.trim().toUpperCase();
    
    // Validate name
    if (!uppercaseName) {
      toast({
        title: "Invalid Department Name",
        description: "Department name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    // Validate budget
    if (budgetNumber === null || budgetNumber <= 0) {
      toast({
        title: "Invalid Budget",
        description: "Budget must be a positive whole number.",
        variant: "destructive",
      });
      return;
    }

    // Validate spent amount
    if (spentNumber === null || spentNumber < 0) {
      toast({
        title: "Invalid Spent Amount",
        description: "Spent amount must be a non-negative whole number.",
        variant: "destructive",
      });
      return;
    }

    // Check if the new name already exists
    if (existingDepartments.includes(uppercaseName) && uppercaseName !== department.name) {
      toast({
        title: "Department Already Exists",
        description: `The department "${uppercaseName}" already exists. Please choose a different name.`,
        variant: "destructive",
      });
      return;
    }

    // Check if spent is greater than budget
    if (spentNumber > budgetNumber) {
      toast({
        title: "Invalid Spent Amount",
        description: "The spent amount cannot be greater than the budget.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      onEditDepartment(uppercaseName, budgetNumber, spentNumber);
      setOpen(false);
    } catch (error) {
      console.error('Error updating department:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update department. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive integers
    if (value === '' || /^\d+$/.test(value)) {
      setBudget(value);
    }
  };

  const handleSpentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive integers
    if (value === '' || /^\d+$/.test(value)) {
      setSpent(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
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
            <Label htmlFor="spent">Spent Amount</Label>
            <Input
              id="spent"
              type="number"
              value={spent}
              onChange={handleSpentChange}
              placeholder="Enter spent amount"
              min="0"
              step="1"
              required
            />
            <p className="text-sm text-muted-foreground">
              Spent amount must be a whole number
            </p>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDepartmentDialog; 