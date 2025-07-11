import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDepartmentColor } from "@/utils/colors";

// Color mapping for Tailwind colors to hex
const COLOR_MAP: Record<string, string> = {
  'blue-100': '#3B82F6',    // More vibrant blue
  'purple-100': '#8B5CF6',  // More vibrant purple
  'pink-100': '#EC4899',    // More vibrant pink
  'orange-100': '#F97316',  // More vibrant orange
  'green-100': '#22C55E',   // More vibrant green
  'yellow-100': '#EAB308',  // More vibrant yellow
  'red-100': '#EF4444',     // More vibrant red
  'indigo-100': '#6366F1',  // More vibrant indigo
  'teal-100': '#14B8A6',    // More vibrant teal
  'cyan-100': '#06B6D4'     // More vibrant cyan
};

const COLORS = {
  income: ["#22C55E", "#16A34A", "#15803D", "#166534"],
  expense: ["#EF4444", "#DC2626", "#B91C1C", "#991B1B"],
};

const CHART_TYPES = {
  distribution: "Distribution",
  trend: "Trend Analysis",
};

export const TransactionChart = () => {
  const { formatAmount } = useCurrency();
  const [chartType, setChartType] = useState("distribution");
  const { transactions } = useTransactions();

  // Process data for pie charts
  const incomeByDepartment = transactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => {
      acc[t.department] = (acc[t.department] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const expensesByDepartment = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => {
      acc[t.department] = (acc[t.department] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const incomeData = Object.entries(incomeByDepartment).map(([name, value]) => ({
    name,
    value,
  }));

  const expenseData = Object.entries(expensesByDepartment).map(([name, value]) => ({
    name,
    value,
  }));

  // Process data for trend chart
  const trendData = transactions.reduce((acc, t) => {
    const date = t.date.split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, income: 0, expenses: 0 };
    }
    if (t.amount > 0) {
      acc[date].income += t.amount;
    } else {
      acc[date].expenses += Math.abs(t.amount);
    }
    return acc;
  }, {} as Record<string, { date: string; income: number; expenses: number }>);

  const sortedTrendData = Object.values(trendData)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

  // Replace your current useEffect with this updated version
  useEffect(() => {
    // Function to remove unwanted elements
    const removeUnwantedElements = () => {
      // Target specific blue highlighted text
      const blueHighlightedTexts = document.querySelectorAll('.recharts-text.recharts-label');
      blueHighlightedTexts.forEach(el => {
        // Check if it's one of the header texts (near the top of the chart)
        const y = el.getAttribute('y');
        if (y && parseInt(y) < 50) {
          el.remove();
        }
      });
      
      // Target dropdown elements that might be showing
      const distributionDropdown = document.querySelector('.recharts-default-tooltip');
      if (distributionDropdown) {
        distributionDropdown.remove();
      }
    };

    // Run immediately
    removeUnwantedElements();
    
    // Also run after a short delay to catch elements that render later
    const timer = setTimeout(() => {
      removeUnwantedElements();
    }, 100);
    
    // Observer to keep removing elements as they appear
    const observer = new MutationObserver((mutations) => {
      removeUnwantedElements();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Cleanup
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [chartType]); // Re-run when chart type changes

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={chartType} onValueChange={setChartType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CHART_TYPES).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {chartType === "distribution" ? (
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 text-center">Income Distribution</h3>
            <div className="w-full aspect-square">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    name=""
                    data={incomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#ffffff"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.9))'
                          }}
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    outerRadius="70%"
                    dataKey="value"
                  >
                    {incomeData.map((entry) => {
                      const colors = getDepartmentColor(entry.name);
                      const colorClass = colors.bg.replace('bg-', '');
                      const hexColor = COLOR_MAP[colorClass] || '#3B82F6';
                      return (
                        <Cell 
                          key={`cell-${entry.name}`} 
                          fill={hexColor}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatAmount(value)} 
                    contentStyle={{ borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3 text-center">Expense Distribution</h3>
            <div className="w-full aspect-square">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    name=""
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#ffffff"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.9))'
                          }}
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    outerRadius="70%"
                    dataKey="value"
                  >
                    {expenseData.map((entry) => {
                      const colors = getDepartmentColor(entry.name);
                      const colorClass = colors.bg.replace('bg-', '');
                      const hexColor = COLOR_MAP[colorClass] || '#3B82F6';
                      return (
                        <Cell 
                          key={`cell-${entry.name}`} 
                          fill={hexColor}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatAmount(value)} 
                    contentStyle={{ borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full aspect-[2/1]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sortedTrendData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#ffffff' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#ffffff' }}
                tickFormatter={(value) => formatAmount(value)}
                tickLine={false}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip
                formatter={(value: number) => formatAmount(value)}
                contentStyle={{ borderRadius: '8px' }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#22C55E"
                fillOpacity={1}
                fill="url(#colorIncome)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#EF4444"
                fillOpacity={1}
                fill="url(#colorExpenses)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

<style>{`
  /* Target the "Transaction Analysis" text */
  text.recharts-text.recharts-label[y="14"],
  
  /* Target Income/Expense Distribution text at top */
  text.recharts-text.recharts-label[y="30"],
  
  /* Any text element in the top part of the chart */
  .recharts-wrapper text[y*="1"][y<"40"],
  .recharts-wrapper text[y*="2"][y<"40"],
  .recharts-wrapper text[y*="3"][y<"40"],
  
  /* Hide specific texts */
  .recharts-wrapper text:first-child,
  .recharts-surface > .recharts-layer:first-child text {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
  }
  
  /* Keep other styles */
  .recharts-text.recharts-pie-label-text {
    font-size: 18px;
    font-weight: 700;
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  .recharts-tooltip-item-name,
  .recharts-tooltip-item-value {
    font-size: 14px;
  }
`}</style>