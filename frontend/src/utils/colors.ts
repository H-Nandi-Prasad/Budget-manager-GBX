// Predefined colors for departments
export const DEPARTMENT_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
  { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
  { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
  { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
];

export const getDepartmentColor = (departmentName: string) => {
  // Create a consistent index based on the department name
  const index = departmentName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length];
}; 