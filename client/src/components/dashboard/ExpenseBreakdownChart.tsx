import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Transaction } from "@shared/schema";

interface ExpenseBreakdownChartProps {
  categoryBreakdown: { category: string; percentage: number }[];
}

const COLORS = [
  'rgba(59, 130, 246, 0.8)',   // blue
  'rgba(16, 185, 129, 0.8)',   // green
  'rgba(245, 158, 11, 0.8)',   // yellow
  'rgba(168, 85, 247, 0.8)',   // purple
  'rgba(239, 68, 68, 0.8)',    // red
  'rgba(14, 165, 233, 0.8)',   // sky
  'rgba(236, 72, 153, 0.8)',   // pink
  'rgba(132, 204, 22, 0.8)',   // lime
  'rgba(249, 115, 22, 0.8)',   // orange
  'rgba(8, 145, 178, 0.8)',    // cyan
];

export function ExpenseBreakdownChart({ categoryBreakdown }: ExpenseBreakdownChartProps) {
  // Convert categoryBreakdown to chart data format
  const chartData = categoryBreakdown.map(item => ({
    name: item.category,
    value: item.percentage
  }));

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-60">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={1}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, "Percentage"]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No expense data available
            </div>
          )}
        </div>
        <div className="mt-4 space-y-2">
          {chartData.map((category, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <div className="text-sm text-gray-700 flex-1">{category.name}</div>
              <div className="text-sm font-medium text-gray-900">{category.value}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
