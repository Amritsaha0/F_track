import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/dashboard/StatCard";
import { MonthlySpendingChart } from "@/components/dashboard/MonthlySpendingChart";
import { ExpenseBreakdownChart } from "@/components/dashboard/ExpenseBreakdownChart";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionList } from "@/components/transactions/TransactionList";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/hooks/useTransactions";

export default function Dashboard() {
  const { transactions, isLoading: isTransactionsLoading } = useTransactions();
  
  const { data: statistics, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/dashboard/statistics'],
  });
  
  return (
    <>
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Track your financial activities and monitor your spending habits.</p>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isStatsLoading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard
              title="Total Balance"
              value={statistics?.balance || 0}
              change={4.75}
              isCurrency
            />
            <StatCard
              title="Monthly Income"
              value={statistics?.monthlyIncome || 0}
              change={2.3}
              isCurrency
            />
            <StatCard
              title="Monthly Expenses"
              value={statistics?.monthlyExpenses || 0}
              change={8.2}
              isCurrency
            />
            <StatCard
              title="Savings Rate"
              value={statistics?.savingsRate || 0}
              change={2.1}
              isPercentage
            />
          </>
        )}
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlySpendingChart transactions={transactions || []} />
        </div>
        
        <div>
          <ExpenseBreakdownChart categoryBreakdown={statistics?.categoryBreakdown || []} />
        </div>
        
        <div className="lg:col-span-2">
          <TransactionForm />
        </div>
        
        <div>
          <TransactionList 
            transactions={transactions || []} 
            isLoading={isTransactionsLoading} 
            limit={5} 
            showViewAll
          />
        </div>
      </div>
    </>
  );
}
