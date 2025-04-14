import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactions } from "@/hooks/useTransactions";
import { categories } from "@shared/schema";

// Colors for pie chart
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

export default function Reports() {
  const { transactions, isLoading } = useTransactions();
  const [timeRange, setTimeRange] = useState<"30d" | "3m" | "6m" | "1y">("6m");
  
  // Process transactions data for category breakdown
  const categoryData = useMemo(() => {
    if (!transactions) return [];
    
    const expensesByCategory: Record<string, number> = {};
    
    // Only process expense transactions
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    // Calculate total expenses
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Group by category
    expenseTransactions.forEach(t => {
      if (!expensesByCategory[t.category]) {
        expensesByCategory[t.category] = 0;
      }
      expensesByCategory[t.category] += t.amount;
    });
    
    // Convert to array format for pie chart with percentages
    return Object.entries(expensesByCategory).map(([category, amount]) => ({
      name: category,
      value: Math.round((amount / totalExpenses) * 100),
      amount
    }));
  }, [transactions]);
  
  // Process transactions data for monthly trends
  const monthlyData = useMemo(() => {
    if (!transactions) return [];
    
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case "30d":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        break;
      case "3m":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case "6m":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case "1y":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
    }
    
    const filteredTransactions = transactions.filter(t => new Date(t.date) >= startDate);
    
    const monthlyData: Record<string, { income: number; expenses: number; savings: number }> = {};
    
    // Initialize months
    const monthCount = timeRange === "30d" ? 1 : timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12;
    for (let i = 0; i < monthCount; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      monthlyData[`${monthName} ${date.getFullYear()}`] = { income: 0, expenses: 0, savings: 0 };
    }
    
    // Fill with transaction data
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const key = `${monthName} ${date.getFullYear()}`;
      
      if (monthlyData[key]) {
        if (t.type === 'income') {
          monthlyData[key].income += t.amount;
        } else {
          monthlyData[key].expenses += t.amount;
        }
      }
    });
    
    // Calculate savings
    Object.keys(monthlyData).forEach(key => {
      monthlyData[key].savings = monthlyData[key].income - monthlyData[key].expenses;
    });
    
    // Convert to array and sort by date
    return Object.entries(monthlyData)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.name.split(' ');
        const [bMonth, bYear] = b.name.split(' ');
        
        const aDate = new Date(`${aMonth} 1, ${aYear}`);
        const bDate = new Date(`${bMonth} 1, ${bYear}`);
        
        return aDate.getTime() - bDate.getTime();
      });
  }, [transactions, timeRange]);
  
  return (
    <>
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Financial Reports</h2>
        <p className="mt-1 text-sm text-gray-500">
          Analyze your spending patterns and financial trends over time.
        </p>
      </div>
      
      {/* Time range selector */}
      <div className="mb-6 flex justify-end">
        <Select 
          value={timeRange} 
          onValueChange={(value) => setTimeRange(value as "30d" | "3m" | "6m" | "1y")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="3m">Last 3 months</SelectItem>
            <SelectItem value="6m">Last 6 months</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Report tabs */}
      <Tabs defaultValue="spending" className="space-y-6">
        <TabsList className="w-full grid grid-cols-3 lg:w-auto">
          <TabsTrigger value="spending">Spending Analysis</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        {/* Spending Analysis Tab */}
        <TabsContent value="spending">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="p-4 border-b border-gray-200">
                <CardTitle className="text-lg font-medium text-gray-900">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-80">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => [`${value}%`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No expense data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4 border-b border-gray-200">
                <CardTitle className="text-lg font-medium text-gray-900">Expense Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">{category.name}</span>
                      </div>
                      <div className="text-sm text-gray-900">₹{category.amount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Monthly Trends Tab */}
        <TabsContent value="trends">
          <Card>
            <CardHeader className="p-4 border-b border-gray-200">
              <CardTitle className="text-lg font-medium text-gray-900">Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => `₹${value}`} 
                    />
                    <Tooltip
                      formatter={(value) => [`₹${Number(value).toFixed(2)}`, ""]}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="rgba(16, 185, 129, 0.8)" />
                    <Bar dataKey="expenses" name="Expenses" fill="rgba(239, 68, 68, 0.8)" />
                    <Bar dataKey="savings" name="Savings" fill="rgba(59, 130, 246, 0.8)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader className="p-4 border-b border-gray-200">
              <CardTitle className="text-lg font-medium text-gray-900">Category Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.filter(c => c !== 'Income').map((category) => {
                  const categoryTransactions = transactions?.filter(t => t.category === category) || [];
                  const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
                  const count = categoryTransactions.length;
                  
                  return (
                    <Card key={category} className="shadow-sm">
                      <CardContent className="p-4">
                        <h3 className="text-lg font-medium text-gray-900">{category}</h3>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Total Spent:</span>
                            <span className="text-sm font-medium text-gray-900">₹{totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Transactions:</span>
                            <span className="text-sm font-medium text-gray-900">{count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Average:</span>
                            <span className="text-sm font-medium text-gray-900">
                              ₹{count > 0 ? (totalAmount / count).toFixed(2) : '0.00'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}