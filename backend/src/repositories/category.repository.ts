import { CategoryDocument, CategoryModel } from '../models/category.model';

export async function findActiveCategories(): Promise<CategoryDocument[]> {
  return CategoryModel.find({ isActive: true }).sort({ name: 1 });
}

export async function findActiveCategoryById(id: string): Promise<CategoryDocument | null> {
  return CategoryModel.findOne({ _id: id, isActive: true });
}

export async function findCategoryById(id: string): Promise<CategoryDocument | null> {
  return CategoryModel.findById(id);
}

export async function findCategoryByName(name: string): Promise<CategoryDocument | null> {
  return CategoryModel.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
}

export async function findCategoryBySlug(slug: string): Promise<CategoryDocument | null> {
  return CategoryModel.findOne({ slug });
}

export async function createCategory(input: {
  name: string;
  slug: string;
}): Promise<CategoryDocument> {
  return CategoryModel.create(input);
}

export async function updateCategory(
  id: string,
  updates: { name?: string; slug?: string; isActive?: boolean },
): Promise<CategoryDocument | null> {
  return CategoryModel.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
}

export async function updateCategoryStatus(
  id: string,
  isActive: boolean,
): Promise<CategoryDocument | null> {
  return CategoryModel.findByIdAndUpdate(id, { $set: { isActive } }, { new: true, runValidators: true });
}