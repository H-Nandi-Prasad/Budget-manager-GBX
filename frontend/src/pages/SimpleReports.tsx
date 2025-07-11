import React, { useState, useEffect } from 'react';
import { useDepartments } from "@/contexts/DepartmentsContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const SimpleReports = () => {
  const { departments, summary } = useDepartments();
  const { formatAmount } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [timePeriod, setTimePeriod] = useState('monthly');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  
  // Derived data states
  const [monthlyData, setMonthlyData] = useState([]);
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [departmentRankingData, setDepartmentRankingData] = useState([]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Use the centralized summary data
  const { totalBudget, totalSpent, totalRemaining } = summary;

  // Calculate all derived data whenever departments change
  useEffect(() => {
    if (!departments || departments.length === 0) return;

    // Generate ranking data
    const rankings = departments.map(dept => {
      const efficiency = ((dept.budget - dept.spent) / dept.budget) * 100;
      const performanceScore = efficiency > 0 ? 100 - Math.min(efficiency, 30) : 70;
      return {
        name: dept.name,
        budget: dept.budget,
        spent: dept.spent,
        remaining: dept.budget - dept.spent,
        efficiency: efficiency.toFixed(1),
        performanceScore
      };
    }).sort((a, b) => b.performanceScore - a.performanceScore);
    
    setDepartmentRankingData(rankings);

    // Generate trend data based on department data
    // For demonstration purposes, we'll create synthetic time-series data 
    // that's proportional to the current department totals
    
    // Monthly data (last 6 months)
    const monthly = Array(6).fill(0).map((_, i) => {
      const month = new Date(new Date().setMonth(new Date().getMonth() - 5 + i));
      const monthName = month.toLocaleString('default', { month: 'short' });
      
      // Create a scaling factor that gradually increases to match current totals
      const scalingFactor = 0.7 + (i * 0.06);
      
      return {
        month: monthName,
        budget: Math.round(totalBudget * scalingFactor / 6), // Divide annual budget by 6 months
        spent: Math.round(totalSpent * (scalingFactor - 0.05) / 6) // Slightly less spending
      };
    });
    
    setMonthlyData(monthly);
    
    // Quarterly data (last 4 quarters)
    const quarterly = Array(4).fill(0).map((_, i) => {
      const quarter = `Q${i + 1}`;
      const budgetShare = totalBudget / 4; // Equal distribution 
      
      // Make Q4 have higher spending, Q1 lower
      let spentMultiplier;
      if (i === 0) spentMultiplier = 0.85; // Q1: Underspent
      else if (i === 3) spentMultiplier = 0.95; // Q4: Almost on budget
      else spentMultiplier = 0.9; // Q2, Q3: Standard spending
      
      return {
        quarter,
        budget: Math.round(budgetShare),
        spent: Math.round(budgetShare * spentMultiplier)
      };
    });
    
    setQuarterlyData(quarterly);
    
    // Yearly data (last 4 years)
    const yearly = Array(4).fill(0).map((_, i) => {
      const year = new Date().getFullYear() - 3 + i;
      
      // Each year, budget and spending increases by ~10%
      const yearFactor = 0.7 + (i * 0.1);
      
      return {
        year: year.toString(),
        budget: Math.round(totalBudget * yearFactor),
        spent: Math.round(totalSpent * yearFactor)
      };
    });
    
    setYearlyData(yearly);
    
  }, [departments]);
  
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate AI report analysis based on current data
  const generateAIReport = () => {
    if (!departments || departments.length === 0) return;
    
    setIsGeneratingReport(true);
    
    setTimeout(() => {
      // Get top performing department
      const topDept = departmentRankingData[0];
      
      // Get department with highest budget utilization
      const highestUtilization = [...departmentRankingData].sort((a, b) => 
        (b.spent / b.budget * 100) - (a.spent / a.budget * 100))[0];
      
      // Get department with most remaining budget
      const mostRemaining = [...departmentRankingData].sort((a, b) => 
        b.remaining - a.remaining)[0];
      
      // Calculate overall budget utilization
      const overallUtilization = (totalSpent / totalBudget * 100).toFixed(1);
      
      // Use the time period data for trend analysis
      const currentData = getCurrentData();
      const dataPoints = currentData.length;
      
      // Calculate trend direction by comparing first and last data points
      const firstPoint = currentData[0];
      const lastPoint = currentData[dataPoints - 1];
      const spendingTrend = lastPoint.spent > firstPoint.spent ? "increasing" : "decreasing";
      const budgetTrend = lastPoint.budget > firstPoint.budget ? "increasing" : "decreasing";
      
      // Calculate month-over-month/quarter-over-quarter/year-over-year growth
      const growthRate = ((lastPoint.spent - firstPoint.spent) / firstPoint.spent * 100).toFixed(1);
      
      const periodText = timePeriod === 'monthly' 
        ? 'month-over-month' 
        : timePeriod === 'quarterly' 
          ? 'quarter-over-quarter' 
          : 'year-over-year';
      
      // Generate text report
      const report = {
        title: `Financial Performance Analysis - ${new Date().toLocaleDateString()}`,
        summary: `Overall, the organization has utilized ${overallUtilization}% of its total budget of ${formatAmount(totalBudget)}. The remaining budget is ${formatAmount(totalRemaining)}.`,
        highlights: [
          `${topDept.name} is the top performing department with a performance score of ${topDept.performanceScore.toFixed(1)}/100.`,
          `${highestUtilization.name} has the highest budget utilization at ${(highestUtilization.spent / highestUtilization.budget * 100).toFixed(1)}%.`,
          `${mostRemaining.name} has the most remaining budget at ${formatAmount(mostRemaining.remaining)}.`
        ],
        recommendations: [
          `Consider reallocating resources from ${mostRemaining.name} to departments with higher demand.`,
          `Review spending patterns in ${highestUtilization.name} to ensure budget alignment with organizational goals.`,
          `Implement the successful budget management practices from ${topDept.name} across other departments.`
        ],
        trends: `Based on ${timePeriod} data, spending has been ${spendingTrend} with a ${growthRate}% change ${periodText}. Budget allocation has been ${budgetTrend} during this period.`,
        forecast: `If current trends continue, expect the annual budget to be ${
          overallUtilization > 90 
            ? 'exceeded by year-end. Budget adjustments may be necessary.' 
            : overallUtilization > 75 
              ? 'fully utilized by year-end.' 
              : 'underutilized by year-end. Consider initiatives to maximize budget impact.'
        }`
      };
      
      setGeneratedReport(report);
      setIsGeneratingReport(false);
    }, 1500);
  };
  
  // Get current data based on selected time period
  const getCurrentData = () => {
    switch(timePeriod) {
      case 'quarterly':
        return quarterlyData;
      case 'yearly':
        return yearlyData;
      default:
        return monthlyData;
    }
  };
  
  // Format X-axis label based on time period
  const getXAxisKey = () => {
    switch(timePeriod) {
      case 'quarterly':
        return 'quarter';
      case 'yearly':
        return 'year';
      default:
        return 'month';
    }
  };
  
  // If no departments loaded yet, show a loading indicator
  if (!departments || departments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent mb-4"></div>
          <p>Loading department data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Reports & Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your department budgets and spending
        </p>
      </div>
      
      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-6">
          {/* Date Range Filter */}
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input 
                type="date" 
                name="start"
                value={dateRange.start || ''} 
                onChange={handleDateChange}
                className="border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input 
                type="date" 
                name="end"
                value={dateRange.end || ''} 
                onChange={handleDateChange}
                className="border rounded p-2"
              />
            </div>
          </div>
          
          {/* Time Period Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <select 
              value={timePeriod} 
              onChange={(e) => setTimePeriod(e.target.value)}
              className="border rounded p-2"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          
          {/* AI Report Generator Button */}
          <div className="ml-auto self-end">
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              onClick={generateAIReport}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>Generate AI Report</>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* AI Generated Report Section */}
      {generatedReport && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">{generatedReport.title}</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
            <p className="text-gray-700">{generatedReport.summary}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Key Highlights</h3>
            <ul className="list-disc pl-5 space-y-1">
              {generatedReport.highlights.map((highlight, idx) => (
                <li key={idx} className="text-gray-700">{highlight}</li>
              ))}
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Trend Analysis</h3>
            <p className="text-gray-700">{generatedReport.trends}</p>
            <p className="text-gray-700 mt-2">{generatedReport.forecast}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
            <ul className="list-disc pl-5 space-y-1">
              {generatedReport.recommendations.map((rec, idx) => (
                <li key={idx} className="text-gray-700">{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Budget</div>
          <div className="text-2xl font-bold">{formatAmount(totalBudget)}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Spent</div>
          <div className="text-2xl font-bold text-red-500">
            {formatAmount(totalSpent)}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Remaining Budget</div>
          <div className="text-2xl font-bold text-green-500">
            {formatAmount(totalRemaining)}
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex flex-wrap">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'departments' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('departments')}
            >
              Departments
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'trends' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('trends')}
            >
              Trends
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'monthly' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'ranking' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('ranking')}
            >
              Department Ranking
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Budget Overview</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departments}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="budget"
                    >
                      {departments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatAmount(value)} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {activeTab === 'departments' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Department Analysis</h2>
              <div className="h-[300px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departments}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatAmount(value)} />
                    <Tooltip formatter={(value) => formatAmount(value)} />
                    <Legend />
                    <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                    <Bar dataKey="spent" fill="#82ca9d" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Department</th>
                    <th className="text-left p-2">Budget</th>
                    <th className="text-left p-2">Spent</th>
                    <th className="text-left p-2">Remaining</th>
                    <th className="text-left p-2">Usage %</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => {
                    const usagePercentage = (dept.spent / dept.budget) * 100;
                    return (
                      <tr key={dept.name} className="border-b">
                        <td className="p-2 font-medium">{dept.name}</td>
                        <td className="p-2">{formatAmount(dept.budget)}</td>
                        <td className="p-2 text-red-500">
                          {formatAmount(dept.spent)}
                        </td>
                        <td className="p-2 text-green-500">
                          {formatAmount(dept.budget - dept.spent)}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full">
                              <div
                                className={`h-full rounded-full ${
                                  usagePercentage > 90
                                    ? "bg-red-500"
                                    : usagePercentage > 70
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                                style={{ width: `${Math.min(100, usagePercentage)}%` }}
                              />
                            </div>
                            <span className="text-sm">
                              {usagePercentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'trends' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Trends Analysis</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getCurrentData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={getXAxisKey()} />
                    <YAxis tickFormatter={(value) => formatAmount(value)} />
                    <Tooltip formatter={(value) => formatAmount(value)} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="budget" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      name="Budget"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="spent" 
                      stroke="#82ca9d" 
                      name="Spent"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {activeTab === 'monthly' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Monthly Trends</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={getCurrentData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={getXAxisKey()} />
                    <YAxis tickFormatter={(value) => formatAmount(value)} />
                    <Tooltip formatter={(value) => formatAmount(value)} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="budget" 
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      name="Budget"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="spent" 
                      stackId="1"
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      name="Spent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {activeTab === 'ranking' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Department Performance Ranking</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Performance Score Chart */}
                <div className="h-[300px]">
                  <h3 className="text-lg font-semibold mb-2">Performance Score</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentRankingData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip formatter={(value) => `${value}/100`} />
                      <Bar 
                        dataKey="performanceScore" 
                        name="Performance Score" 
                        fill="#8884d8"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Budget Efficiency Chart */}
                <div className="h-[300px]">
                  <h3 className="text-lg font-semibold mb-2">Department Comparison</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} width={730} height={250} data={departments}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                      <Radar name="Budget" dataKey="budget" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar name="Spent" dataKey="spent" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Legend />
                      <Tooltip formatter={(value) => formatAmount(value)} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Ranking Table */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Department Ranking</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-2">Rank</th>
                      <th className="text-left p-2">Department</th>
                      <th className="text-left p-2">Performance</th>
                      <th className="text-left p-2">Budget</th>
                      <th className="text-left p-2">Spent</th>
                      <th className="text-left p-2">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentRankingData.map((dept, index) => (
                      <tr key={dept.name} className={`border-b ${index === 0 ? 'bg-green-50' : ''}`}>
                        <td className="p-2 font-bold">{index + 1}</td>
                        <td className="p-2 font-medium">
                          {dept.name}
                          {index === 0 && <span className="ml-2 text-green-500">🏆</span>}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full">
                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{ width: `${dept.performanceScore}%` }}
                              />
                            </div>
                            <span className="text-sm">{dept.performanceScore}/100</span>
                          </div>
                        </td>
                        <td className="p-2">{formatAmount(dept.budget)}</td>
                        <td className="p-2">{formatAmount(dept.spent)}</td>
                        <td className="p-2">{dept.efficiency}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Export Button */}
      <div className="flex justify-end">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          onClick={() => {
            const reportData = {
              date: new Date().toLocaleDateString(),
              timePeriod,
              dateRange,
              summary: {
                totalBudget,
                totalSpent,
                totalRemaining
              },
              departments,
              ranking: departmentRankingData,
              trendsData: {
                monthly: monthlyData,
                quarterly: quarterlyData,
                yearly: yearlyData
              },
              aiReport: generatedReport
            };
            
            console.log("Exporting report data:", reportData);
            alert("Report data exported to console. In a real app, this would download a PDF or CSV.");
          }}
        >
          Export Report
        </button>
      </div>
    </div>
  );
};

export default SimpleReports; 