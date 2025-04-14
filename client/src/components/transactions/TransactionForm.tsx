import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation } from '@tanstack/react-query';
import { categories, insertTransactionSchema } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

type TransactionFormData = {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
};

export function TransactionForm() {
  const { toast } = useToast();
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  
  // Filter categories based on transaction type
  const filteredCategories = transactionType === 'income' 
    ? categories.filter(cat => cat === 'Income')
    : categories.filter(cat => cat !== 'Income');
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayFormatted = `${year}-${month}-${day}`;
  
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(insertTransactionSchema),
    defaultValues: {
      amount: 0,
      type: 'expense',
      category: '',
      description: '',
      date: todayFormatted,
    },
  });
  
  const createTransactionMutation = useMutation({
    mutationFn: (data: TransactionFormData) => 
      apiRequest('POST', '/api/transactions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/statistics'] });
      
      toast({
        title: "Transaction added",
        description: "Your transaction has been added successfully",
      });
      
      // Reset form
      form.reset({
        amount: 0,
        type: transactionType,
        category: '',
        description: '',
        date: todayFormatted,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add transaction: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: TransactionFormData) {
    createTransactionMutation.mutate(data);
  }
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Add New Transaction</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Transaction Type</FormLabel>
                    <div className="flex rounded-md shadow-sm">
                      <Button
                        type="button"
                        variant={transactionType === 'income' ? 'default' : 'outline'}
                        className={`rounded-l-md ${transactionType === 'income' ? 'bg-primary-50 text-primary-700 hover:bg-primary-100' : ''}`}
                        onClick={() => {
                          setTransactionType('income');
                          field.onChange('income');
                          form.setValue('category', 'Income');
                        }}
                      >
                        Income
                      </Button>
                      <Button
                        type="button"
                        variant={transactionType === 'expense' ? 'default' : 'outline'}
                        className={`rounded-r-md ${transactionType === 'expense' ? 'bg-primary-50 text-primary-700 hover:bg-primary-100' : ''}`}
                        onClick={() => {
                          setTransactionType('expense');
                          field.onChange('expense');
                          form.setValue('category', '');
                        }}
                      >
                        Expense
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Amount</FormLabel>
                    <FormControl>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">₹</span>
                        </div>
                        <Input
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          className="pl-7 pr-12"
                          {...field}
                          value={field.value.toString()}
                          onChange={(e) => field.onChange(parseFloat(e.target.value || '0'))}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">INR</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a description for this transaction"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="mr-3"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createTransactionMutation.isPending}
              >
                {createTransactionMutation.isPending ? "Adding..." : "Add Transaction"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
