import mongoose from 'mongoose';
import { categories } from '@shared/schema';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sahaamrit024:DfbMDSSPvIudCmRp@cluster0.s4oj0.mongodb.net/fin_project';

// Connect to MongoDB - with cached connection for serverless environment
let cachedConnection: typeof mongoose | null = null;

export const connectMongoDB = async () => {
  if (cachedConnection) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    cachedConnection = conn;
    console.log('MongoDB connected successfully');
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't exit process in serverless environment
    throw error;
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
  userId: { type: Number, default: 1 },
});

// Define models
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

// Export MongoDB models
export const mongoModels = {
  User,
  Transaction,
};