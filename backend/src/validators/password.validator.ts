
import { z } from 'zod';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .regex(
        PASSWORD_REGEX,
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character',
      ),
    confirmNewPassword: z
      .string()
      .min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export type PasswordFormData = z.infer<typeof passwordSchema>;

