import { CategoryDocument } from '../models/category.model';
export interface CategoryDTO { id: string; name: string; slug: string; isActive: boolean; createdAt: Date; updatedAt: Date; }
export function toCategoryDTO(category: CategoryDocument): CategoryDTO { return { id: String(category._id), name: category.name, slug: category.slug, isActive: category.isActive, createdAt: category.createdAt, updatedAt: category.updatedAt }; }
