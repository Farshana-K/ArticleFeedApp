import { Request, Response } from 'express';
import { UnauthorizedError, BadRequestError } from '../errors/app.error';
import { CategoryService } from '../services/category.service';
import { CreateCategoryRequestDTO, UpdateCategoryRequestDTO, UpdateCategoryStatusRequestDTO } from '../validators/category.validator';
import { asyncHandler } from '../utils/async-handler.util';
import { successResponse } from '../utils/api-response.util';
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  private getId(req: Request): string { const id = req.params.id; if (!id) throw new BadRequestError('Category ID is required'); return id; }
  getCategories = asyncHandler(async (_req: Request, res: Response) => { const categories = await this.categoryService.getActiveCategories(); res.status(200).json(successResponse('Categories retrieved successfully', { categories })); });
  getCategory = asyncHandler(async (req: Request, res: Response) => { const category = await this.categoryService.getActiveCategoryById(this.getId(req)); res.status(200).json(successResponse('Category retrieved successfully', { category })); });
  createCategory = asyncHandler(async (req: Request, res: Response) => { if (!req.user) throw new UnauthorizedError('Authentication required'); const category = await this.categoryService.create(req.body as CreateCategoryRequestDTO); res.status(201).json(successResponse('Category created successfully', { category })); });
  updateCategory = asyncHandler(async (req: Request, res: Response) => { if (!req.user) throw new UnauthorizedError('Authentication required'); const category = await this.categoryService.update(this.getId(req), req.body as UpdateCategoryRequestDTO); res.status(200).json(successResponse('Category updated successfully', { category })); });
  updateCategoryStatus = asyncHandler(async (req: Request, res: Response) => { if (!req.user) throw new UnauthorizedError('Authentication required'); const input = req.body as UpdateCategoryStatusRequestDTO; const category = await this.categoryService.updateStatus(this.getId(req), input.isActive); res.status(200).json(successResponse('Category status updated successfully', { category })); });
  deleteCategory = asyncHandler(async (req: Request, res: Response) => { if (!req.user) throw new UnauthorizedError('Authentication required'); await this.categoryService.softDelete(this.getId(req)); res.status(200).json(successResponse('Category deleted successfully')); });
}
