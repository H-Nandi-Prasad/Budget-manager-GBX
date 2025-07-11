export interface Department {
  id?: string;
  name: string;
  budget: number;
  spent: number;
  categories: string[];
  remaining?: number;
  // No categories property needed
}

const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: '1',
    name: 'IT',
    budget: 600000,
    spent: 400000,
    remaining: 200000,
    categories: ['Hardware', 'Software', 'Infrastructure', 'Training']
  },
  {
    id: '2',
    name: 'HR',
    budget: 300000,
    spent: 200000,
    remaining: 100000,
    categories: ['Recruitment', 'Training', 'Benefits', 'Events']
  },
  {
    id: '3',
    name: 'Marketing',
    budget: 450000,
    spent: 300000,
    remaining: 150000,
    categories: ['Digital', 'Print', 'Events', 'Research']
  },
  {
    id: '4',
    name: 'Sales',
    budget: 500000,
    spent: 350000,
    remaining: 150000,
    categories: ['Commissions', 'Travel', 'Entertainment', 'Tools']
  },
  {
    id: '5',
    name: 'R&D',
    budget: 550000,
    spent: 250000,
    remaining: 300000,
    categories: ['Research', 'Prototyping', 'Testing', 'Patents']
  }
];

export const saveDepartment = (department: Department) => {
  const departments = getDepartments();
  departments.push(department);
  localStorage.setItem('departments', JSON.stringify(departments));
  return department;
};

export const getDepartments = (): Department[] => {
  const departments = localStorage.getItem('departments');
  if (!departments) {
    localStorage.setItem('departments', JSON.stringify(INITIAL_DEPARTMENTS));
    return INITIAL_DEPARTMENTS;
  }
  return JSON.parse(departments);
};

export const updateDepartment = (name: string, updates: Partial<Department>) => {
  const departments = getDepartments();
  const index = departments.findIndex(d => d.name === name);
  if (index !== -1) {
    departments[index] = { ...departments[index], ...updates };
    localStorage.setItem('departments', JSON.stringify(departments));
    return departments[index];
  }
  return null;
};

export const deleteDepartment = (name: string) => {
  const departments = getDepartments();
  const updatedDepartments = departments.filter(d => d.name !== name);
  localStorage.setItem('departments', JSON.stringify(updatedDepartments));
  return updatedDepartments;
};

// Clear all departments
export const clearDepartments = () => {
  localStorage.removeItem('departments');
};

export function getDepartmentCategories(departmentName: string): string[] {
  const department = getDepartments().find(d => d.name === departmentName);
  return department?.categories || [];
} 