import { Request, Response } from 'express';
import { UnauthorizedError, BadRequestError } from '../errors/app.error';
import {
  createNewCategory,
  getActiveCategories,
  getActiveCategoryById,
  softDeleteCategory,
  updateCategoryActiveStatus,
  updateCategoryData,
} from '../services/category.service';
import {
  CreateCategoryRequestDTO,
  UpdateCategoryRequestDTO,
  UpdateCategoryStatusRequestDTO,
} from '../validators/category.validator';
import { asyncHandler } from '../utils/async-handler.util';
import { successResponse } from '../utils/api-response.util';

function getCategoryId(req: Request): string {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('Category ID is required');
  }

  return id;
}

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await getActiveCategories();
  res.status(200).json(successResponse('Categories retrieved successfully', { categories }));
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await getActiveCategoryById(getCategoryId(req));
  res.status(200).json(successResponse('Category retrieved successfully', { category }));
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const input = req.body as CreateCategoryRequestDTO;
  const category = await createNewCategory(input);

  res.status(201).json(successResponse('Category created successfully', { category }));
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const input = req.body as UpdateCategoryRequestDTO;
  const category = await updateCategoryData(getCategoryId(req), input);

  res.status(200).json(successResponse('Category updated successfully', { category }));
});

export const updateCategoryStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const input = req.body as UpdateCategoryStatusRequestDTO;
  const category = await updateCategoryActiveStatus(getCategoryId(req), input.isActive);

  res.status(200).json(successResponse('Category status updated successfully', { category }));
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  await softDeleteCategory(getCategoryId(req));

  res.status(200).json(successResponse('Category deleted successfully'));
});