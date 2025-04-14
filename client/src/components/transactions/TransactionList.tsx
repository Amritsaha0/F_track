import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@shared/schema";
import { TransactionItem } from "./TransactionItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  title?: string;
  limit?: number;
  showViewAll?: boolean;
}

export function TransactionList({
  transactions,
  isLoading,
  title = "Recent Transactions",
  limit,
  showViewAll = false
}: TransactionListProps) {
  const displayedTransactions = limit ? transactions.slice(0, limit) : transactions;

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 border-b border-gray-200 flex items-center justify-between">
        <CardTitle className="text-lg font-medium text-gray-900">{title}</CardTitle>
        {showViewAll && (
          <Link href="/transactions" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            View all
          </Link>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          {isLoading ? (
            <TransactionListSkeleton count={limit || 5} />
          ) : displayedTransactions.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {displayedTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No transactions found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionListSkeleton({ count }: { count: number }) {
  return (
    <ul className="divide-y divide-gray-200">
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Skeleton className="h-9 w-9 rounded-md mr-3" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <Skeleton className="h-5 w-20 mr-6" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-5 w-32 mt-2 sm:mt-0" />
          </div>
        </li>
      ))}
    </ul>
  );
}
