import { IStorage } from './storage';
import { MongoStorage } from './mongo-storage';

// Create an instance of MongoStorage
const mongoStorage = new MongoStorage();

// Seed the database with initial data if it's empty
mongoStorage.seedDatabaseIfEmpty().catch(console.error);

// Export the storage to be used across the application
export const storage: IStorage = mongoStorage;