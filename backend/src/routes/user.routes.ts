import { Router } from 'express';
import {
  getProfile,
  updatePassword,
  updatePreferences,
  updateProfile,
} from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
  updatePasswordSchema,
  updatePreferencesSchema,
  updateProfileSchema,
} from '../validators/user.validator';

const router = Router();

router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, validateBody(updateProfileSchema.shape.body), updateProfile);
router.put('/password', requireAuth, validateBody(updatePasswordSchema.shape.body), updatePassword);
router.put('/preferences', requireAuth, validateBody(updatePreferencesSchema.shape.body), updatePreferences);

export default router;