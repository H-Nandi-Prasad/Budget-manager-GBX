import { Department } from "@/services/departmentService";
import { useCurrency } from "@/contexts/CurrencyContext";

interface AnalysisReportProps {
  departments: Department[];
  startDate: Date;
  endDate: Date;
}

interface ReportMetrics {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  utilizationRate: number;
}

interface DepartmentRanking {
  department: Department;
  score: number;
  efficiency: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

const calculateMetrics = (departments: Department[]): ReportMetrics => {
  const totalBudget = departments.reduce((sum, dept) => sum + (dept.budget || 0), 0);
  const totalSpent = departments.reduce((sum, dept) => sum + (dept.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const utilizationRate = (totalSpent / totalBudget) * 100;
  
  return { totalBudget, totalSpent, totalRemaining, utilizationRate };
};

const analyzeDepartmentPerformance = (departments: Department[]): DepartmentRanking[] => {
  return departments.map(dept => {
    const budget = dept.budget || 0;
    const spent = dept.spent || 0;
    const remaining = budget - spent;
    const utilizationRate = (spent / budget) * 100;
    
    // Calculate efficiency score (0-100)
    const efficiency = Math.min(100, (remaining / budget) * 100);
    
    // Calculate risk level based on spending patterns
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (utilizationRate > 90) riskLevel = 'high';
    else if (utilizationRate > 70) riskLevel = 'medium';
    
    // Generate AI-powered recommendations
    const recommendations: string[] = [];
    if (utilizationRate > 90) {
      recommendations.push("Consider budget reallocation or additional funding");
      recommendations.push("Review spending patterns for potential optimizations");
    } else if (utilizationRate < 30) {
      recommendations.push("Evaluate underutilized resources");
      recommendations.push("Consider reallocating unused budget");
    }
    
    if (remaining < (budget * 0.1)) {
      recommendations.push("Monitor spending closely to avoid budget overruns");
    }
    
    // Calculate overall score (0-100)
    const score = Math.round(
      (efficiency * 0.4) + // Efficiency weight
      ((100 - utilizationRate) * 0.3) + // Budget utilization weight
      (riskLevel === 'low' ? 30 : riskLevel === 'medium' ? 20 : 10) // Risk level weight
    );
    
    return {
      department: dept,
      score,
      efficiency,
      riskLevel,
      recommendations
    };
  }).sort((a, b) => b.score - a.score); // Sort by score descending
};

const generateDepartmentAnalysis = (departments: Department[], formatAmount: (amount: number) => string): string => {
  return departments.map(dept => {
    const deptBudget = dept.budget || 0;
    const deptSpent = dept.spent || 0;
    const deptRemaining = deptBudget - deptSpent;
    const deptUtilization = (deptSpent / deptBudget) * 100;
    
    return `${dept.name},${formatAmount(deptBudget)},${formatAmount(deptSpent)},${formatAmount(deptRemaining)},${deptUtilization.toFixed(2)}%`;
  }).join('\n');
};

const generateMonthlyTrends = (startDate: Date, endDate: Date, metrics: ReportMetrics, formatAmount: (amount: number) => string): string => {
  const trends: string[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const monthStr = currentDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    const monthlyBudget = metrics.totalBudget / 12;
    const monthlySpent = metrics.totalSpent / 12;
    const monthlyRemaining = monthlyBudget - monthlySpent;
    const monthlyUtilization = (monthlySpent / monthlyBudget) * 100;
    
    trends.push(`${monthStr},${formatAmount(monthlyBudget)},${formatAmount(monthlySpent)},${formatAmount(monthlyRemaining)},${monthlyUtilization.toFixed(2)}%`);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return trends.join('\n');
};

const generateAIAnalysis = (rankings: DepartmentRanking[]): string => {
  const topPerforming = rankings[0];
  const needsAttention = rankings[rankings.length - 1];
  
  return [
    "AI-Powered Analysis",
    "Top Performing Department",
    `Department: ${topPerforming.department.name}`,
    `Score: ${topPerforming.score}`,
    `Efficiency: ${topPerforming.efficiency.toFixed(2)}%`,
    `Risk Level: ${topPerforming.riskLevel}`,
    "Recommendations:",
    ...topPerforming.recommendations.map(rec => `- ${rec}`),
    "\n",
    "Department Needing Attention",
    `Department: ${needsAttention.department.name}`,
    `Score: ${needsAttention.score}`,
    `Efficiency: ${needsAttention.efficiency.toFixed(2)}%`,
    `Risk Level: ${needsAttention.riskLevel}`,
    "Recommendations:",
    ...needsAttention.recommendations.map(rec => `- ${rec}`),
    "\n",
    "Department Rankings",
    "Rank,Department,Score,Efficiency,Risk Level",
    ...rankings.map((rank, index) => 
      `${index + 1},${rank.department.name},${rank.score},${rank.efficiency.toFixed(2)}%,${rank.riskLevel}`
    )
  ].join('\n');
};

export const generateAnalysisReport = ({ departments, startDate, endDate }: AnalysisReportProps) => {
  const { formatAmount } = useCurrency();
  const metrics = calculateMetrics(departments);
  const departmentRankings = analyzeDepartmentPerformance(departments);
  
  const sections = [
    // Header
    "Financial Analysis Report",
    `Report Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}\n`,
    
    // Summary
    "Summary",
    `Total Budget,${formatAmount(metrics.totalBudget)}`,
    `Total Spent,${formatAmount(metrics.totalSpent)}`,
    `Total Remaining,${formatAmount(metrics.totalRemaining)}`,
    `Utilization Rate,${metrics.utilizationRate.toFixed(2)}%\n`,
    
    // Department Analysis
    "Department Analysis",
    "Department,Budget,Spent,Remaining,Utilization Rate",
    generateDepartmentAnalysis(departments, formatAmount),
    "\n",
    
    // Monthly Trends
    "Monthly Trends",
    "Month,Budget,Spent,Remaining,Utilization Rate",
    generateMonthlyTrends(startDate, endDate, metrics, formatAmount),
    "\n",
    
    // AI Analysis
    generateAIAnalysis(departmentRankings)
  ];

  return sections.join('\n');
};

export const downloadAnalysisReport = async (csvContent: string): Promise<void> => {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    await new Promise(resolve => setTimeout(resolve, 100));
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading report:', error);
    throw new Error('Failed to download the report. Please try again.');
  }
}; 