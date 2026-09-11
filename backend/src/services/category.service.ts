import { Types } from 'mongoose';
import { BadRequestError, ConflictError, NotFoundError } from '../errors/app.error';
import {
  createCategory,
  findActiveCategories,
  findActiveCategoryById,
  findCategoryById,
  findCategoryByName,
  findCategoryBySlug,
  updateCategory,
  updateCategoryStatus,
} from '../repositories/category.repository';
import { CreateCategoryRequestDTO, UpdateCategoryRequestDTO } from '../validators/category.validator';
import { generateSlug } from '../utils/slug.util';
import { CategoryDocument } from '../models/category.model';

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toCategoryDTO(category: CategoryDocument): CategoryDTO {
  return {
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

function validateCategoryId(id: string): void {
  if (!Types.ObjectId.isValid(id)) {
    throw new NotFoundError('Category not found');
  }
}

export async function getActiveCategories(): Promise<CategoryDTO[]> {
  const categories = await findActiveCategories();
  return categories.map(toCategoryDTO);
}

export async function getActiveCategoryById(id: string): Promise<CategoryDTO> {
  validateCategoryId(id);

  const category = await findActiveCategoryById(id);

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  return toCategoryDTO(category);
}

export async function createNewCategory(input: CreateCategoryRequestDTO): Promise<CategoryDTO> {
  const name = input.name.trim();
  const slug = generateSlug(name);

  if (!slug) {
    throw new BadRequestError('Category name cannot generate a valid slug');
  }

  const existingName = await findCategoryByName(name);

  if (existingName) {
    throw new ConflictError('A category with this name already exists');
  }

  const existingSlug = await findCategoryBySlug(slug);

  if (existingSlug) {
    throw new ConflictError('A category with this slug already exists');
  }

  const category = await createCategory({ name, slug });

  return toCategoryDTO(category);
}

export async function updateCategoryData(
  id: string,
  input: UpdateCategoryRequestDTO,
): Promise<CategoryDTO> {
  validateCategoryId(id);

  const existingCategory = await findCategoryById(id);

  if (!existingCategory) {
    throw new NotFoundError('Category not found');
  }

  const updates: { name?: string; slug?: string; isActive?: boolean } = {};

  if (input.name !== undefined) {
    const name = input.name.trim();

    if (name.toLowerCase() !== existingCategory.name.toLowerCase()) {
      const existingName = await findCategoryByName(name);

      if (existingName && String(existingName._id) !== id) {
        throw new ConflictError('A category with this name already exists');
      }

      const slug = generateSlug(name);

      if (!slug) {
        throw new BadRequestError('Category name cannot generate a valid slug');
      }

      const existingSlug = await findCategoryBySlug(slug);

      if (existingSlug && String(existingSlug._id) !== id) {
        throw new ConflictError('A category with this slug already exists');
      }

      updates.name = name;
      updates.slug = slug;
    }
  }

  if (input.isActive !== undefined) {
    updates.isActive = input.isActive;
  }

  if (Object.keys(updates).length === 0) {
    return toCategoryDTO(existingCategory);
  }

  const updatedCategory = await updateCategory(id, updates);

  if (!updatedCategory) {
    throw new NotFoundError('Category not found');
  }

  return toCategoryDTO(updatedCategory);
}

export async function updateCategoryActiveStatus(
  id: string,
  isActive: boolean,
): Promise<CategoryDTO> {
  validateCategoryId(id);

  const category = await findCategoryById(id);

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  const updatedCategory = await updateCategoryStatus(id, isActive);

  if (!updatedCategory) {
    throw new NotFoundError('Category not found');
  }

  return toCategoryDTO(updatedCategory);
}

export async function softDeleteCategory(id: string): Promise<void> {
  validateCategoryId(id);

  const category = await findCategoryById(id);

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  await updateCategoryStatus(id, false);
}