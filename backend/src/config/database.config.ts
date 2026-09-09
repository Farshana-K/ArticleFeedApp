import mongoose from 'mongoose';
import { env } from './env.config';

mongoose.set('strictQuery', true);

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

mongoose.connection.on('error', (error: Error) => {
  // eslint-disable-next-line no-console
  console.error('MongoDB connection error:', error.message);
});

mongoose.connection.on('disconnected', () => {
  // eslint-disable-next-line no-console
  console.warn('MongoDB disconnected');
});
