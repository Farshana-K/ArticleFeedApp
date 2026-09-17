import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.config';
import { API_PREFIX } from './constants/app.constants';
import routes from './routes';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';

const app: Application = express();

// Security headers
app.use(helmet());

// CORS — restricted to the configured client origin, credentials enabled
// for httpOnly cookie-based JWT auth.
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing (required for httpOnly JWT cookies)
app.use(cookieParser());

// Request logging
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// API routes
app.use(API_PREFIX, routes);

// 404 handler — must come after all routes
app.use(notFoundMiddleware);

// Centralized error handler — must be registered last
app.use(errorMiddleware);
 
export default app;
