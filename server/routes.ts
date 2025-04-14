import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-provider";
import { InsertTransaction, insertTransactionSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api

  // Get all transactions
  app.get("/api/transactions", async (req: Request, res: Response) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Get transaction by ID
  app.get("/api/transactions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      const transaction = await storage.getTransactionById(id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  // Create transaction
  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const result = insertTransactionSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const transaction = await storage.createTransaction(result.data);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Update transaction
  app.patch("/api/transactions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      // Validate only the fields provided
      const providedData: Partial<InsertTransaction> = {};
      const keys = Object.keys(req.body) as (keyof InsertTransaction)[];
      
      for (const key of keys) {
        const singleFieldSchema = insertTransactionSchema.pick({ [key]: true });
        const result = singleFieldSchema.safeParse({ [key]: req.body[key] });
        
        if (!result.success) {
          const errorMessage = fromZodError(result.error).message;
          return res.status(400).json({ message: errorMessage });
        }
        
        providedData[key] = req.body[key];
      }

      const transaction = await storage.updateTransaction(id, providedData);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  // Delete transaction
  app.delete("/api/transactions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      const success = await storage.deleteTransaction(id);
      
      if (!success) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Get dashboard statistics
  app.get("/api/dashboard/statistics", async (req: Request, res: Response) => {
    try {
      const [monthlyIncome, monthlyExpenses, categoryBreakdown] = await Promise.all([
        storage.getMonthlyIncome(),
        storage.getMonthlyExpenses(),
        storage.getCategoryBreakdown()
      ]);
      
      const balance = monthlyIncome - monthlyExpenses;
      const savingsRate = monthlyIncome > 0 ? Math.round((balance / monthlyIncome) * 100) : 0;
      
      res.json({
        balance,
        monthlyIncome,
        monthlyExpenses,
        savingsRate,
        categoryBreakdown
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
