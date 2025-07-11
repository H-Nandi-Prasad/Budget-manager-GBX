import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { MonthlyTrendsChart } from "@/components/MonthlyTrendsChart";
import { DateRangeFilter } from "@/components/reports/DateRangeFilter";
import { AnalyticsSummary } from "@/components/reports/AnalyticsSummary";
import { YearOverYearComparison } from "@/components/reports/YearOverYearComparison";
import { useDepartments } from "@/contexts/DepartmentsContext";
import { useEffect, useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

const Reports = () => {
  const { departments } = useDepartments();
  const { formatAmount } = useCurrency();
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() - 6)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  useEffect(() => {
    // Debug logging
    console.log("Reports component rendering");
    console.log("Departments data:", departments);
  }, [departments]);
  
  const handleDateRangeChange = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

  const generateAIInsights = (data: any[], type: 'yearly' | 'monthly') => {
    const insights = [];
    
    if (type === 'yearly') {
      const currentYear = data[data.length - 1];
      const previousYear = data[data.length - 2];
      const growthRate = ((currentYear.total - previousYear.total) / previousYear.total) * 100;
      
      insights.push(
        `Year-over-Year Growth: ${growthRate.toFixed(2)}%`,
        growthRate > 0 ? "Positive growth trend detected" : "Negative growth trend detected",
        `Current year total: ${formatAmount(currentYear.total)}`,
        `Previous year total: ${formatAmount(previousYear.total)}`
      );
    } else {
      const monthlyData = data.map(item => ({
        month: item.month,
        value: item.value,
        trend: item.trend
      }));
      
      const averageGrowth = monthlyData.reduce((sum, item) => sum + item.trend, 0) / monthlyData.length;
      const highestMonth = monthlyData.reduce((prev, curr) => curr.value > prev.value ? curr : prev);
      const lowestMonth = monthlyData.reduce((prev, curr) => curr.value < prev.value ? curr : prev);
      
      insights.push(
        `Average Monthly Growth: ${averageGrowth.toFixed(2)}%`,
        `Highest performing month: ${highestMonth.month} (${formatAmount(highestMonth.value)})`,
        `Lowest performing month: ${lowestMonth.month} (${formatAmount(lowestMonth.value)})`,
        averageGrowth > 0 ? "Overall positive trend" : "Overall negative trend"
      );
    }
    
    return insights;
  };

  const handleExportYearlyAnalysis = () => {
    const yearlyData = departments.map(dept => ({
      department: dept.name,
      budget: dept.budget,
      spent: dept.spent,
      remaining: dept.budget - dept.spent,
      utilization: ((dept.spent / dept.budget) * 100).toFixed(2) + '%'
    }));

    const insights = generateAIInsights(yearlyData, 'yearly');
    
    const csvContent = [
      "Yearly Budget Analysis Report",
      `Generated on: ${new Date().toLocaleDateString()}\n`,
      "Department Analysis",
      "Department,Budget,Spent,Remaining,Utilization",
      ...yearlyData.map(dept => 
        `${dept.department},${formatAmount(dept.budget)},${formatAmount(dept.spent)},${formatAmount(dept.remaining)},${dept.utilization}`
      ),
      "\nAI-Powered Insights",
      ...insights
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `yearly_budget_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportMonthlyTrends = () => {
    const monthlyData = departments.flatMap(dept => {
      const monthlySpent = dept.spent / 12;
      const monthlyBudget = dept.budget / 12;
      return Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i).toLocaleString('default', { month: 'long' }),
        department: dept.name,
        budget: monthlyBudget,
        spent: monthlySpent,
        trend: ((monthlySpent - monthlyBudget) / monthlyBudget) * 100
      }));
    });

    const insights = generateAIInsights(monthlyData, 'monthly');
    
    const csvContent = [
      "Monthly Trends Analysis Report",
      `Generated on: ${new Date().toLocaleDateString()}\n`,
      "Monthly Analysis",
      "Month,Department,Budget,Spent,Trend",
      ...monthlyData.map(item => 
        `${item.month},${item.department},${formatAmount(item.budget)},${formatAmount(item.spent)},${item.trend.toFixed(2)}%`
      ),
      "\nAI-Powered Insights",
      ...insights
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `monthly_trends_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            Financial Reports & Analytics
          </h1>
        </div>

        <div className="backdrop-blur-lg bg-white/10 rounded-xl p-6 border border-white/20">
          <DateRangeFilter 
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>
        
        <div className="backdrop-blur-lg bg-white/10 rounded-xl p-6 border border-white/20">
          <AnalyticsSummary 
            departments={departments}
            startDate={startDate}
            endDate={endDate}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Yearly Budget Analysis */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Yearly Budget Analysis</CardTitle>
              <Button 
                onClick={handleExportYearlyAnalysis}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Analysis
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <YearOverYearComparison data={departments} />
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Monthly Trends</CardTitle>
              <Button 
                onClick={handleExportMonthlyTrends}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Trends
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <MonthlyTrendsChart 
                  data={departments}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
