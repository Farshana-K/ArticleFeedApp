import { z } from 'zod';

const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name is required')
    .max(50, 'First name must not exceed 50 characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name must not exceed 50 characters'),
  phone: z.string().trim().regex(PHONE_REGEX, 'Invalid phone number'),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

