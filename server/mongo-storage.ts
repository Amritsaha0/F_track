import { User, Transaction } from './mongo';
import { IStorage } from './storage';
import { type User as UserType, type InsertUser, type Transaction as TransactionType, type InsertTransaction } from '@shared/schema';
import mongoose from 'mongoose';

export class MongoStorage implements IStorage {
  async getUser(id: number): Promise<UserType | undefined> {
    try {
      const user = await User.findById(id);
      if (!user) return undefined;
      
      return {
        id: parseInt(user._id.toString()),
        username: user.username,
        password: user.password
      };
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<UserType | undefined> {
    try {
      const user = await User.findOne({ username });
      if (!user) return undefined;
      
      return {
        id: parseInt(user._id.toString()),
        username: user.username,
        password: user.password
      };
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<UserType> {
    try {
      const newUser = await User.create(insertUser);
      
      return {
        id: parseInt(newUser._id.toString()),
        username: newUser.username,
        password: newUser.password
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getTransactions(): Promise<TransactionType[]> {
    try {
      const transactions = await Transaction.find().sort({ date: -1 });
      
      return transactions.map((t, index) => {
        // Generate a truly unique ID for each transaction
        const uniqueId = parseInt(index + "" + Math.floor(Math.random() * 10000));
        
        return {
          id: uniqueId,
          amount: t.amount,
          type: t.type as 'income' | 'expense',
          category: t.category,
          description: t.description,
          date: t.date,
          userId: t.userId || 1
        };
      });
    } catch (error) {
      console.error("Error getting transactions:", error);
      return [];
    }
  }

  async getTransactionById(id: number): Promise<TransactionType | undefined> {
    try {
      // For MongoDB, we need to convert the numeric ID to ObjectId or use string ID
      let transaction;
      try {
        // Try to convert to ObjectId if possible
        transaction = await Transaction.findById(id);
      } catch (e) {
        // If that fails, try querying by a custom id field
        transaction = await Transaction.findOne({ _id: id });
      }
      
      if (!transaction) return undefined;
      
      // Generate a unique ID based on timestamp and random number
      const uniqueId = parseInt(Date.now() + "" + Math.floor(Math.random() * 10000));
      
      return {
        id: uniqueId,
        amount: transaction.amount,
        type: transaction.type as 'income' | 'expense',
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
        userId: transaction.userId || 1
      };
    } catch (error) {
      console.error("Error getting transaction by id:", error);
      return undefined;
    }
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<TransactionType> {
    try {
      const newTransaction = await Transaction.create({
        ...insertTransaction,
        userId: 1 // Default user ID
      });
      
      // Generate a unique ID based on timestamp and random number
      const uniqueId = parseInt(Date.now() + "" + Math.floor(Math.random() * 10000));
      
      return {
        id: uniqueId,
        amount: newTransaction.amount,
        type: newTransaction.type as 'income' | 'expense',
        category: newTransaction.category,
        description: newTransaction.description,
        date: newTransaction.date,
        userId: newTransaction.userId || 1
      };
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  async updateTransaction(id: number, partialTransaction: Partial<InsertTransaction>): Promise<TransactionType | undefined> {
    try {
      // Try different approaches to find the document
      let updatedTransaction;
      try {
        // Try direct ID first
        updatedTransaction = await Transaction.findByIdAndUpdate(
          id,
          { $set: partialTransaction },
          { new: true }
        );
      } catch (e) {
        // If that fails, try with a query
        updatedTransaction = await Transaction.findOneAndUpdate(
          { _id: id },
          { $set: partialTransaction },
          { new: true }
        );
      }
      
      if (!updatedTransaction) return undefined;
      
      // Generate a unique ID based on timestamp and random number
      const uniqueId = parseInt(Date.now() + "" + Math.floor(Math.random() * 10000));
      
      return {
        id: uniqueId,
        amount: updatedTransaction.amount,
        type: updatedTransaction.type as 'income' | 'expense',
        category: updatedTransaction.category,
        description: updatedTransaction.description,
        date: updatedTransaction.date,
        userId: updatedTransaction.userId || 1
      };
    } catch (error) {
      console.error("Error updating transaction:", error);
      return undefined;
    }
  }

  async deleteTransaction(id: number): Promise<boolean> {
    try {
      let result;
      try {
        // Try direct ID first
        result = await Transaction.findByIdAndDelete(id);
      } catch (e) {
        // If that fails, try with a query
        result = await Transaction.findOneAndDelete({ _id: id });
      }
      return !!result;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      return false;
    }
  }

  async getMonthlyIncome(): Promise<number> {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const result = await Transaction.find({
        type: 'income',
        date: { $gte: firstDayOfMonth }
      });
      
      return result.reduce((sum, t) => sum + t.amount, 0);
    } catch (error) {
      console.error("Error getting monthly income:", error);
      return 0;
    }
  }

  async getMonthlyExpenses(): Promise<number> {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const result = await Transaction.find({
        type: 'expense',
        date: { $gte: firstDayOfMonth }
      });
      
      return result.reduce((sum, t) => sum + t.amount, 0);
    } catch (error) {
      console.error("Error getting monthly expenses:", error);
      return 0;
    }
  }

  async getCategoryBreakdown(): Promise<{category: string, percentage: number}[]> {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const expenses = await Transaction.find({
        type: 'expense',
        date: { $gte: firstDayOfMonth }
      });
      
      const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
      
      if (totalExpense === 0) {
        return [];
      }
      
      // Group by category and calculate percentages
      const categoryMap: Record<string, number> = {};
      
      expenses.forEach(expense => {
        if (!categoryMap[expense.category]) {
          categoryMap[expense.category] = 0;
        }
        categoryMap[expense.category] += expense.amount;
      });
      
      return Object.entries(categoryMap).map(([category, amount]) => ({
        category,
        percentage: Math.round((amount / totalExpense) * 100)
      })).sort((a, b) => b.percentage - a.percentage);
    } catch (error) {
      console.error("Error getting category breakdown:", error);
      return [];
    }
  }

  // Initialize the database with seed data if it's empty
  async seedDatabaseIfEmpty(): Promise<void> {
    try {
      const count = await Transaction.countDocuments();
      
      if (count === 0) {
        const currentDate = new Date();
        
        const seedTransactions = [
          {
            amount: 2500,
            type: 'income',
            category: 'Income',
            description: 'Salary Deposit',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
            userId: 1
          },
          {
            amount: 1200,
            type: 'expense',
            category: 'Housing',
            description: 'Apartment Rent',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12),
            userId: 1
          },
          {
            amount: 89.75,
            type: 'expense',
            category: 'Food',
            description: 'Grocery Shopping',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
            userId: 1
          },
          {
            amount: 4.50,
            type: 'expense',
            category: 'Food',
            description: 'Coffee Shop',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 9),
            userId: 1
          },
          {
            amount: 300,
            type: 'expense',
            category: 'Transportation',
            description: 'Car Insurance',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 25),
            userId: 1
          },
          {
            amount: 2400,
            type: 'income',
            category: 'Income',
            description: 'Salary Deposit',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 15),
            userId: 1
          },
          {
            amount: 65.99,
            type: 'expense',
            category: 'Entertainment',
            description: 'Movie and Dinner',
            date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 18),
            userId: 1
          }
        ];
        
        await Transaction.insertMany(seedTransactions);
        console.log('Seed data inserted successfully');
      }
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }
}