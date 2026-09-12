import mongoose from 'mongoose';
import { env } from './env.config';

mongoose.set('strictQuery', true);

let cachedConnection: typeof mongoose.connection | null = null;

export async function connectDatabase(): Promise<void> {
  if (cachedConnection && mongoose.connection.readyState === 1) return;

  try {
    await mongoose.connect(env.MONGODB_URI);
    cachedConnection = mongoose.connection;
  } catch (error) {
    throw new Error(
      `MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function disconnectDatabase(): Promise<void> {
  cachedConnection = null;
  await mongoose.disconnect();
}