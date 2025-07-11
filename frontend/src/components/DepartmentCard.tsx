import { useState } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { PieChart, Pie, Cell } from 'recharts';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Edit2, Trash2 } from 'lucide-react';

interface DepartmentCardProps {
  id: number;
  name: string;
  budget: number;
  spent: number;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function DepartmentCard({ id, name, budget, spent, onEdit, onDelete }: DepartmentCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { formatAmount } = useCurrency();
  
  const remaining = budget - spent;
  const spentPercentage = (spent / budget) * 100;
  
  const data = [
    { name: 'Spent', value: spent },
    { name: 'Remaining', value: remaining }
  ];
  
  const COLORS = ['#FF8042', '#00C49F'];

  return (
    <Card className="p-4 shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{name}</h3>
          <p className="text-gray-600">Budget: {formatAmount(budget)}</p>
          <p className="text-gray-600">Spent: {formatAmount(spent)}</p>
          <p className="text-gray-600">Remaining: {formatAmount(remaining)}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(id)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <AlertDialog.Root open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <AlertDialog.Trigger asChild>
              <Button
                variant="ghost"
                size="icon"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
              <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
              <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
                <AlertDialog.Title className="text-lg font-semibold mb-4">
                  Delete Department
                </AlertDialog.Title>
                <AlertDialog.Description className="text-gray-600 mb-4">
                  Are you sure you want to delete this department? This action cannot be undone.
                </AlertDialog.Description>
                <div className="flex justify-end gap-4">
                  <AlertDialog.Cancel asChild>
                    <Button variant="outline">Cancel</Button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action asChild>
                    <Button 
                      variant="destructive"
                      onClick={() => onDelete(id)}
                    >
                      Delete
                    </Button>
                  </AlertDialog.Action>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>
        </div>
      </div>
      <div className="flex justify-center">
        <PieChart width={200} height={200}>
          <Pie
            data={data}
            cx={100}
            cy={100}
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${spentPercentage}%` }}
          />
        </div>
        <p className="text-center mt-2">{spentPercentage.toFixed(1)}% spent</p>
      </div>
    </Card>
  );
} 