import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
  updateCategoryStatus,
} from '../controllers/category.controller';
import { requireAdmin } from '../middlewares/admin.middleware';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import {
  categoryIdSchema,
  createCategoryRequestSchema,
  updateCategoryRequestSchema,
  updateCategoryStatusRequestSchema,
} from '../validators/category.validator';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategory);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  validateBody(createCategoryRequestSchema.shape.body),
  createCategory,
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validateParams(updateCategoryRequestSchema.shape.params),
  validateBody(updateCategoryRequestSchema.shape.body),
  updateCategory,
);

router.patch(
  '/:id/status',
  requireAuth,
  requireAdmin,
  validateParams(updateCategoryStatusRequestSchema.shape.params),
  validateBody(updateCategoryStatusRequestSchema.shape.body),
  updateCategoryStatus,
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  validateParams(categoryIdSchema.shape.params),
  deleteCategory,
);

export default router;