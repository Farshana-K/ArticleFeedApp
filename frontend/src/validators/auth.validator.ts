import { z } from 'zod';

const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, 'First name is required').max(50),
    lastName: z.string().trim().min(1, 'Last name is required').max(50),
    phone: z.string().trim().regex(PHONE_REGEX, 'Invalid phone number'),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    password: z.string().regex(
      PASSWORD_REGEX,
      'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character',
    ),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    preferences: z
      .array(z.string().regex(OBJECT_ID_REGEX, 'Invalid category id'))
      
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;