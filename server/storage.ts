import { users, type User, type InsertUser, transactions, type Transaction, type InsertTransaction } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction methods
  getTransactions(): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
  
  // Dashboard statistics
  getMonthlyIncome(): Promise<number>;
  getMonthlyExpenses(): Promise<number>;
  getCategoryBreakdown(): Promise<{category: string, percentage: number}[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactionsStore: Map<number, Transaction>;
  currentUserId: number;
  currentTransactionId: number;

  constructor() {
    this.users = new Map();
    this.transactionsStore = new Map();
    this.currentUserId = 1;
    this.currentTransactionId = 1;
    
    // Add some initial transactions for development
    this.seedTransactions();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactionsStore.values()).sort((a, b) => {
      // Sort by date descending (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }
  
  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactionsStore.get(id);
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      userId: 1, // Default user ID since we're not implementing auth
    };
    this.transactionsStore.set(id, transaction);
    return transaction;
  }
  
  async updateTransaction(id: number, partialTransaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = this.transactionsStore.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction: Transaction = {
      ...transaction,
      ...partialTransaction,
    };
    this.transactionsStore.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactionsStore.delete(id);
  }
  
  async getMonthlyIncome(): Promise<number> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return Array.from(this.transactionsStore.values())
      .filter(t => 
        t.type === 'income' && 
        new Date(t.date) >= firstDayOfMonth
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }
  
  async getMonthlyExpenses(): Promise<number> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return Array.from(this.transactionsStore.values())
      .filter(t => 
        t.type === 'expense' && 
        new Date(t.date) >= firstDayOfMonth
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }
  
  async getCategoryBreakdown(): Promise<{category: string, percentage: number}[]> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get all expenses for current month
    const expenses = Array.from(this.transactionsStore.values())
      .filter(t => 
        t.type === 'expense' && 
        new Date(t.date) >= firstDayOfMonth
      );
    
    // Calculate total expenses
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
  }
  
  private seedTransactions() {
    // This is only for development purposes to have initial data
    const currentDate = new Date();
    
    const transactions: Omit<Transaction, 'id'>[] = [
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
    
    transactions.forEach(t => {
      const id = this.currentTransactionId++;
      this.transactionsStore.set(id, { ...t, id });
    });
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getTransactions(): Promise<Transaction[]> {
    return db.select().from(transactions).orderBy(desc(transactions.date));
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions)
      .values({ 
        ...insertTransaction, 
        userId: 1 // Default user ID since we're not implementing auth
      })
      .returning();
    return transaction;
  }

  async updateTransaction(id: number, partialTransaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [transaction] = await db.update(transactions)
      .set(partialTransaction)
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const [deleted] = await db.delete(transactions)
      .where(eq(transactions.id, id))
      .returning({ id: transactions.id });
    return !!deleted;
  }

  async getMonthlyIncome(): Promise<number> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const result = await db.select()
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 'income'),
          gte(transactions.date, firstDayOfMonth)
        )
      );

    return result.reduce((sum, t) => sum + t.amount, 0);
  }

  async getMonthlyExpenses(): Promise<number> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const result = await db.select()
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 'expense'),
          gte(transactions.date, firstDayOfMonth)
        )
      );

    return result.reduce((sum, t) => sum + t.amount, 0);
  }

  async getCategoryBreakdown(): Promise<{category: string, percentage: number}[]> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const expenses = await db.select()
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 'expense'),
          gte(transactions.date, firstDayOfMonth)
        )
      );
    
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
  }

  // Initialize the database with seed data if it's empty
  async seedDatabaseIfEmpty(): Promise<void> {
    const existingTransactions = await db.select().from(transactions);
    
    if (existingTransactions.length === 0) {
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
      
      await db.insert(transactions).values(seedTransactions);
    }
  }
}

// Create an instance of DatabaseStorage
export const storage = new DatabaseStorage();

// Seed the database with initial data if it's empty
storage.seedDatabaseIfEmpty().catch(console.error);
