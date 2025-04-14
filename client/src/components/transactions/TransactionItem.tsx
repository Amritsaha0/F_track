import { ArrowDown, ArrowUp, Calendar } from "lucide-react";
import { Transaction } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';
  const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <li>
      <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`${isIncome ? 'bg-green-100' : 'bg-red-100'} rounded-md p-2 mr-3`}>
              {isIncome ? (
                <ArrowUp className={`h-5 w-5 text-green-600`} />
              ) : (
                <ArrowDown className={`h-5 w-5 text-red-600`} />
              )}
            </div>
            <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
          </div>
          <div className={`text-sm font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <div className="text-sm text-gray-500 mr-6">
              <Badge variant={isIncome ? 'secondary' : 'destructive'} className="rounded-full">
                {isIncome ? 'Income' : 'Expense'}
              </Badge>
            </div>
            {!isIncome && (
              <div className="text-sm text-gray-500">
                <Badge variant="outline" className="rounded-full">
                  {transaction.category}
                </Badge>
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
            <Calendar className="h-4 w-4 mr-1.5" />
            {formattedDate}
          </div>
        </div>
      </div>
    </li>
  );
}
