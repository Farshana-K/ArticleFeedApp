import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID');


const profileUpdateSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').optional(),
    lastName: z.string().trim().min(1, 'Last name is required').optional(),
    email: z.string().trim().toLowerCase().email('Invalid email address').optional(),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number')
      .optional(),
    dateOfBirth: z.coerce.date().optional(),
  })
  .strict();



const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'New passwords do not match',
  path: ['confirmNewPassword'],
});

const preferencesUpdateSchema = z.object({
  preferences: z.array(objectIdSchema).min(1, 'At least one preference is required'),
}).strict();

export const updateProfileSchema = z.object({
  body: profileUpdateSchema,
});

export const updatePasswordSchema = z.object({
  body: passwordUpdateSchema,
});

export const updatePreferencesSchema = z.object({
  body: preferencesUpdateSchema,
});

export type UpdateProfileRequestDTO = z.infer<typeof profileUpdateSchema>;
export type UpdatePasswordRequestDTO = z.infer<typeof passwordUpdateSchema>;
export type UpdatePreferencesRequestDTO = z.infer<typeof preferencesUpdateSchema>;