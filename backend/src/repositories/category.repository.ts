import { CategoryDocument, CategoryModel } from '../models/category.model';
import { ICategoryRepository } from '../contracts/category.repository.interface';

export class CategoryRepository implements ICategoryRepository {
  findActive(): Promise<CategoryDocument[]> { return CategoryModel.find({ isActive: true }).sort({ name: 1 }); }
  findActiveById(id: string): Promise<CategoryDocument | null> { return CategoryModel.findOne({ _id: id, isActive: true }); }
  findActiveByIds(ids: string[]): Promise<CategoryDocument[]> { return ids.length ? CategoryModel.find({ _id: { $in: ids }, isActive: true }).select('_id') : Promise.resolve([]); }
  findById(id: string): Promise<CategoryDocument | null> { return CategoryModel.findById(id); }
  findByName(name: string): Promise<CategoryDocument | null> {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return CategoryModel.findOne({ name: { $regex: `^${escaped}$`, $options: 'i' } });
  }
  findBySlug(slug: string): Promise<CategoryDocument | null> { return CategoryModel.findOne({ slug }); }
  create(input: { name: string; slug: string }): Promise<CategoryDocument> { return CategoryModel.create(input); }
  update(id: string, updates: { name?: string; slug?: string; isActive?: boolean }): Promise<CategoryDocument | null> { return CategoryModel.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }); }
  updateStatus(id: string, isActive: boolean): Promise<CategoryDocument | null> { return CategoryModel.findByIdAndUpdate(id, { $set: { isActive } }, { new: true, runValidators: true }); }
}
