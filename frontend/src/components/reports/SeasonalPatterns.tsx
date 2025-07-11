import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Department } from "@/services/departmentService";

interface SeasonalPatternsProps {
  data: Department[];
}

const generateSeasonalData = (departments: Department[]) => {
  const seasons = [
    { name: 'Winter', months: [0, 1, 2] },
    { name: 'Spring', months: [3, 4, 5] },
    { name: 'Summer', months: [6, 7, 8] },
    { name: 'Fall', months: [9, 10, 11] }
  ];

  const totalBudget = departments.reduce((sum, dept) => sum + (dept.budget || 0), 0);
  const monthlyBudget = totalBudget / 12;

  // Generate seasonal variations
  const seasonalFactors = {
    Winter: 1.2, // Higher spending in winter
    Spring: 0.9, // Lower spending in spring
    Summer: 1.1, // Moderate increase in summer
    Fall: 0.8    // Lowest in fall
  };

  return seasons.map(season => {
    const baseAmount = monthlyBudget * 3; // 3 months per season
    const seasonalFactor = seasonalFactors[season.name as keyof typeof seasonalFactors];
    
    return {
      name: season.name,
      expected: Math.round(baseAmount),
      actual: Math.round(baseAmount * seasonalFactor)
    };
  });
};

export const SeasonalPatterns = ({ data: departments }: SeasonalPatternsProps) => {
  const { formatAmount } = useCurrency();
  const chartData = generateSeasonalData(departments);

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="name" stroke="#fff" />
          <YAxis tickFormatter={(value) => formatAmount(value)} stroke="#fff" />
          <Tooltip
            formatter={(value, name) => [
              formatAmount(value as number),
              name === 'expected' ? 'Expected' : 'Actual'
            ]}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              color: '#fff'
            }}
            labelStyle={{ color: '#fff' }}
          />
          <Legend 
            formatter={(value) => value === 'expected' ? 'Expected' : 'Actual'}
          />
          <Area
            type="monotone"
            dataKey="expected"
            name="expected"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="actual"
            name="actual"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}; 