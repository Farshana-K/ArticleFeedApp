
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z.coerce.number().default(5000),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_ACCESS_SECRET: z
    .string()
    .min(1, 'JWT_ACCESS_SECRET is required'),

  JWT_REFRESH_SECRET: z
    .string()
    .min(1, 'JWT_REFRESH_SECRET is required'),

  JWT_ACCESS_EXPIRES_IN: z
    .string()
    .min(1, 'JWT_ACCESS_EXPIRES_IN is required'),

  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .min(1, 'JWT_REFRESH_EXPIRES_IN is required'),

  JWT_PASSWORD_RESET_SECRET: z
    .string()
    .min(1, 'JWT_PASSWORD_RESET_SECRET is required'),

  JWT_PASSWORD_RESET_EXPIRES_IN: z
    .string()
    .min(1, 'JWT_PASSWORD_RESET_EXPIRES_IN is required'),

  CLIENT_URL: z.string().min(1, 'CLIENT_URL is required'),

  RESEND_API_KEY: z
    .string()
    .min(1, 'RESEND_API_KEY is required'),

  EMAIL_FROM: z
    .string()
    .min(1, 'EMAIL_FROM is required'),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),

  CLOUDINARY_API_KEY: z.string().optional(),

  CLOUDINARY_API_SECRET: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formattedErrors = parsed.error.issues
      .map(
        (issue) =>
          `  - ${issue.path.join('.')}: ${issue.message}`,
      )
      .join('\n');

    // eslint-disable-next-line no-console
    console.error(
      `Invalid environment configuration:\n${formattedErrors}`,
    );

    process.exit(1);
  }

  return parsed.data;
}

const loadedEnv = loadEnv();

export const env: Env = loadedEnv;

