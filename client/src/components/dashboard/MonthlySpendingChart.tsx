import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Transaction } from "@shared/schema";
import { formatCurrency } from "@/lib/utils/format";

interface MonthlySpendingChartProps {
  transactions: Transaction[];
}

type TimeRange = "30d" | "3m" | "6m" | "1y";

type ChartData = {
  name: string;
  income: number;
  expenses: number;
};

export function MonthlySpendingChart({ transactions }: MonthlySpendingChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const data = generateChartData(transactions, timeRange);
    setChartData(data);
  }, [transactions, timeRange]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">Monthly Spending</CardTitle>
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                formatter={(value) => [`₹${Number(value).toFixed(2)}`, ""]}
              />
              <Legend />
              <Bar 
                dataKey="income" 
                name="Income" 
                fill="rgba(37, 99, 235, 0.8)" 
                activeBar={{ fill: "rgba(37, 99, 235, 1)" }} 
              />
              <Bar 
                dataKey="expenses" 
                name="Expenses" 
                fill="rgba(239, 68, 68, 0.8)" 
                activeBar={{ fill: "rgba(239, 68, 68, 1)" }} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function generateChartData(transactions: Transaction[], timeRange: TimeRange): ChartData[] {
  const now = new Date();
  let startDate: Date;
  let format: "monthly" | "daily";
  
  switch (timeRange) {
    case "30d":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      format = "daily";
      break;
    case "3m":
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      format = "monthly";
      break;
    case "6m":
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      format = "monthly";
      break;
    case "1y":
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      format = "monthly";
      break;
  }
  
  const filteredTransactions = transactions.filter(t => new Date(t.date) >= startDate);
  
  if (format === "monthly") {
    const monthData: Record<string, { income: number; expenses: number }> = {};
    
    // Initialize months
    const monthCount = timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12;
    for (let i = 0; i < monthCount; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      monthData[`${monthName} ${date.getFullYear()}`] = { income: 0, expenses: 0 };
    }
    
    // Fill with transaction data
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const key = `${monthName} ${date.getFullYear()}`;
      
      if (monthData[key]) {
        if (t.type === 'income') {
          monthData[key].income += t.amount;
        } else {
          monthData[key].expenses += t.amount;
        }
      }
    });
    
    // Convert to array and sort by date
    return Object.entries(monthData)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.name.split(' ');
        const [bMonth, bYear] = b.name.split(' ');
        
        const aDate = new Date(`${aMonth} 1, ${aYear}`);
        const bDate = new Date(`${bMonth} 1, ${bYear}`);
        
        return aDate.getTime() - bDate.getTime();
      });
  } else {
    // Daily format for 30 days
    const dayData: Record<string, { income: number; expenses: number }> = {};
    
    // Initialize days
    for (let i = 0; i < 30; i += 5) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayName = date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      dayData[dayName] = { income: 0, expenses: 0 };
    }
    
    // Fill with transaction data
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const dayName = date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      
      if (dayData[dayName]) {
        if (t.type === 'income') {
          dayData[dayName].income += t.amount;
        } else {
          dayData[dayName].expenses += t.amount;
        }
      }
    });
    
    // Convert to array and sort by date
    return Object.entries(dayData)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => {
        const aDate = new Date(a.name);
        const bDate = new Date(b.name);
        return aDate.getTime() - bDate.getTime();
      });
  }
}
