// This file serves as an API endpoint for Vercel serverless functions
import { createServer } from 'http';
import express from 'express';
import { connectMongoDB } from '../server/mongo';
import { registerRoutes } from '../server/routes';

// Create Express app
const app = express();

// Initialize middleware
app.use(express.json());

// Connect to MongoDB
connectMongoDB().catch(err => console.error('MongoDB connection error in API handler:', err));

// Register routes
registerRoutes(app);

// Create HTTP server
const server = createServer(app);

// Export the Express app as a serverless function handler
export default async function handler(req, res) {
  // Forward the request to Express
  return new Promise((resolve, reject) => {
    server.emit('request', req, res);
    res.on('finish', resolve);
    res.on('error', reject);
  });
}