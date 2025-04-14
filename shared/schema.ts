import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Transaction categories
export const categories = [
  "Housing",
  "Food",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Shopping",
  "Personal Care",
  "Education",
  "Other",
  "Income",
];

// Transaction table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  amount: doublePrecision("amount").notNull(),
  type: varchar("type", { length: 10 }).notNull(), // 'income' or 'expense'
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const insertTransactionSchema = createInsertSchema(transactions)
  .pick({
    amount: true,
    type: true,
    category: true,
    description: true,
    date: true,
  })
  .extend({
    amount: z.coerce.number().positive(),
    type: z.enum(["income", "expense"]),
    category: z.string().min(1, "Category is required"),
    description: z.string().min(1, "Description is required"),
    date: z.coerce.date()
  });

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
