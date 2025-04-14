import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";

export function useTransactions() {
  const { 
    data: transactions, 
    isLoading, 
    isError,
    error,
    refetch
  } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  return {
    transactions,
    isLoading,
    isError,
    error,
    refetch
  };
}
