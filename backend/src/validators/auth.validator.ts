import { z } from 'zod';

const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const MIN_PASSWORD_LENGTH = 8;

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(50),
    lastName: z.string().trim().min(1, 'Last name must be at least 1 character').max(50),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    phone: z
      .string()
      .trim()
      .regex(PHONE_REGEX, 'Invalid phone number'),
    dateOfBirth: z.coerce
      .date()
      .refine((date) => !Number.isNaN(date.getTime()), 'Invalid date of birth'),
    password: z.string().min(MIN_PASSWORD_LENGTH, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(MIN_PASSWORD_LENGTH, 'Confirm password is required'),
    preferences: z
      .array(z.string().regex(OBJECT_ID_REGEX, 'Invalid category id'))
      .optional()
      .default([]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterRequestDTO = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequestDTO = z.infer<typeof loginSchema>;
