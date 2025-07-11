import { Button } from "../components/ui/button";
import { PlusCircle, Edit, Trash, BarChart2, Download, TrendingUp, TrendingDown, DollarSign, Briefcase } from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import { useDepartments } from "../contexts/DepartmentsContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Department {
  name: string;
  budget: number;
  spent: number;
  remaining: number;
  categories: string[];
  id: string;
}

interface PerformanceMetrics {
  utilization: number;
  efficiency: number;
  status: 'High' | 'Medium' | 'Low';
}

const Departments = () => {
  const { departments, addDepartment, editDepartment, deleteDepartment } = useDepartments();
  const { formatAmount } = useCurrency();
  const { toast } = useToast();
  
  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  // Form states
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptBudget, setNewDeptBudget] = useState(0);
  const [editDeptName, setEditDeptName] = useState("");
  const [editDeptBudget, setEditDeptBudget] = useState(0);
  const [editDeptSpent, setEditDeptSpent] = useState(0);
  const [originalName, setOriginalName] = useState("");
  const [deleteDeptId, setDeleteDeptId] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [newCategory, setNewCategory] = useState("");
  
  // Performance metrics
  const calculatePerformance = (dept: Department): PerformanceMetrics => {
    const utilization = (dept.spent / dept.budget) * 100;
    const efficiency = ((dept.budget - dept.spent) / dept.budget) * 100;
    return {
      utilization,
      efficiency,
      status: utilization > 80 ? 'High' : utilization > 50 ? 'Medium' : 'Low'
    };
  };

  // Generate trend data
  const generateTrendData = (dept: Department) => {
    return Array(6).fill(0).map((_, i) => {
      const month = new Date(new Date().setMonth(new Date().getMonth() - 5 + i));
      const monthName = month.toLocaleString('default', { month: 'short' });
      const scalingFactor = 0.7 + (i * 0.06);
      return {
        month: monthName,
        spent: Math.round(dept.spent * scalingFactor),
        budget: dept.budget
      };
    });
  };

  // Handle department management
  const handleAddDepartment = () => {
    if (newDeptName && newDeptBudget > 0) {
      addDepartment({
        name: newDeptName,
        budget: newDeptBudget,
        spent: 0,
        remaining: newDeptBudget,
        categories: []
      });
      setNewDeptName("");
      setNewDeptBudget(0);
      setIsAddOpen(false);
      toast({
        title: "Department Added",
        description: `${newDeptName} has been added successfully.`,
      });
    }
  };

  const handleEditDepartment = () => {
    if (editDeptName && editDeptBudget > 0 && editDeptSpent >= 0) {
      editDepartment(originalName, {
        name: editDeptName,
        budget: editDeptBudget,
        spent: editDeptSpent,
        remaining: editDeptBudget - editDeptSpent,
        categories: departments.find(d => d.name === originalName)?.categories || []
      });
      setIsEditOpen(false);
      toast({
        title: "Department Updated",
        description: `${editDeptName} has been updated successfully.`,
      });
    }
  };

  const handleDeleteDepartment = (id: string) => {
    setDeleteDeptId(id);
    setIsDeleteOpen(true);
  };

  const handleCategoryManagement = (dept: Department) => {
    setSelectedDepartment(dept.name);
    setIsCategoryOpen(true);
  };

  const handleOpenEditDialog = (dept: Department) => {
    setOriginalName(dept.name);
    setEditDeptName(dept.name);
    setEditDeptBudget(dept.budget);
    setEditDeptSpent(dept.spent);
    setIsEditOpen(true);
  };

  // Submit handlers
  const submitNewCategory = () => {
    if (newCategory && selectedDepartment) {
      const department = departments.find(d => d.name === selectedDepartment);
      if (department) {
        const updatedCategories = [...(department.categories || []), newCategory];
        editDepartment(selectedDepartment, {
          ...department,
          categories: updatedCategories
        });
        toast({
          title: "Category Added",
          description: `The category "${newCategory}" has been added to ${selectedDepartment}.`,
        });
        setNewCategory("");
      }
    }
  };

  const confirmDeleteDepartment = () => {
    deleteDepartment(deleteDeptId);
    toast({
      title: "Department Deleted",
      description: `The department has been deleted.`,
    });
    setIsDeleteOpen(false);
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
            Departments
          </h1>
          <Button 
            onClick={() => setIsAddOpen(true)} 
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Department
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
            <TabsTrigger value="performance" className="text-white">Performance</TabsTrigger>
            <TabsTrigger value="trends" className="text-white">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {departments.map(dept => {
                const performance = calculatePerformance(dept);
                return (
                  <Card key={dept.name} className="bg-white/10 border-white/20">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl text-white">{dept.name}</CardTitle>
                        <p className="text-sm text-white/70">Budget: {formatAmount(dept.budget)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-white/20 text-white hover:bg-white/10"
                          onClick={() => handleOpenEditDialog(dept)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-white/20 text-white hover:bg-white/10"
                          onClick={() => handleCategoryManagement(dept)}
                        >
                          <BarChart2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-white/20 text-white hover:bg-white/10"
                          onClick={() => handleDeleteDepartment(dept.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-white/70">Spent</p>
                            <p className="text-lg font-semibold text-white">{formatAmount(dept.spent)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-white/70">Remaining</p>
                            <p className="text-lg font-semibold text-white">{formatAmount(dept.remaining)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-white/70">Utilization</p>
                            <p className="text-lg font-semibold text-white">{performance.utilization.toFixed(1)}%</p>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              performance.status === 'High' ? 'bg-red-500' : 
                              performance.status === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${performance.efficiency}%` }}
                          />
                        </div>
                        {dept.categories && dept.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {dept.categories.map(category => (
                              <span 
                                key={category}
                                className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/70"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {departments.map(dept => {
                const performance = calculatePerformance(dept);
                return (
                  <Card key={dept.name} className="bg-white/10 border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white">{dept.name} Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-white/70">Budget Utilization</p>
                            <p className="text-2xl font-bold text-white">{performance.utilization.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-white/70">Efficiency</p>
                            <p className="text-2xl font-bold text-white">{performance.efficiency.toFixed(1)}%</p>
                          </div>
                        </div>
                        <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              performance.status === 'High' ? 'bg-red-500' : 
                              performance.status === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${performance.utilization}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {departments.map(dept => {
                const trendData = generateTrendData(dept);
                return (
                  <Card key={dept.name} className="bg-white/10 border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white">{dept.name} Budget Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                            <XAxis 
                              dataKey="month" 
                              stroke="rgba(255,255,255,0.7)" 
                              tick={{ fill: 'rgba(255,255,255,0.7)' }}
                            />
                            <YAxis 
                              stroke="rgba(255,255,255,0.7)" 
                              tick={{ fill: 'rgba(255,255,255,0.7)' }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(0,0,0,0.8)', 
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white'
                              }} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="spent" 
                              stroke="#ef4444" 
                              strokeWidth={2}
                              dot={{ fill: '#ef4444', strokeWidth: 2 }}
                              activeDot={{ r: 6, fill: '#ef4444' }}
                              name="Spent"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="budget" 
                              stroke="#22c55e" 
                              strokeWidth={2}
                              dot={{ fill: '#22c55e', strokeWidth: 2 }}
                              activeDot={{ r: 6, fill: '#22c55e' }}
                              name="Budget"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Department Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-slate-800 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Department Name</Label>
              <Input 
                id="name" 
                value={newDeptName} 
                onChange={(e) => setNewDeptName(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-white">Budget</Label>
              <Input 
                id="budget" 
                type="number"
                value={newDeptBudget} 
                onChange={(e) => setNewDeptBudget(Number(e.target.value))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAddOpen(false)} variant="outline" className="border-white/20 text-white hover:bg-white/10">Cancel</Button>
            <Button onClick={handleAddDepartment} className="bg-blue-500 hover:bg-blue-600">Add Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-slate-800 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName" className="text-white">Department Name</Label>
              <Input 
                id="editName" 
                value={editDeptName} 
                onChange={(e) => setEditDeptName(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editBudget" className="text-white">Budget</Label>
              <Input 
                id="editBudget" 
                type="number"
                value={editDeptBudget} 
                onChange={(e) => setEditDeptBudget(Number(e.target.value))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSpent" className="text-white">Spent</Label>
              <Input 
                id="editSpent" 
                type="number"
                value={editDeptSpent} 
                onChange={(e) => setEditDeptSpent(Number(e.target.value))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsEditOpen(false)} variant="outline" className="border-white/20 text-white hover:bg-white/10">Cancel</Button>
            <Button onClick={handleEditDepartment} className="bg-blue-500 hover:bg-blue-600">Update Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Management Dialog */}
      <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
        <DialogContent className="bg-slate-800 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Manage Categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="department" className="text-white">Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {departments.map(dept => (
                    <SelectItem key={dept.name} value={dept.name} className="text-white">
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-white">New Category</Label>
              <Input 
                id="category" 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            {selectedDepartment && (
              <div className="space-y-2">
                <Label className="text-white">Existing Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {departments.find(d => d.name === selectedDepartment)?.categories?.map(category => (
                    <span 
                      key={category}
                      className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/70"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsCategoryOpen(false)} variant="outline" className="border-white/20 text-white hover:bg-white/10">Cancel</Button>
            <Button onClick={submitNewCategory} className="bg-blue-500 hover:bg-blue-600">Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-slate-800 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to delete this department? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button onClick={() => setIsDeleteOpen(false)} variant="outline" className="border-white/20 text-white hover:bg-white/10">Cancel</Button>
            <Button onClick={confirmDeleteDepartment} variant="destructive" className="bg-red-500 hover:bg-red-600">Delete Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Departments;
