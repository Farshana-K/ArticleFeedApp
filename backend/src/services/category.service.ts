import { Types } from 'mongoose';
import { BadRequestError, ConflictError, NotFoundError } from '../errors/app.error';
import { ICategoryRepository } from '../contracts/category.repository.interface';
import { CreateCategoryRequestDTO, UpdateCategoryRequestDTO } from '../validators/category.validator';
import { generateSlug } from '../utils/slug.util';
import { CategoryDTO, toCategoryDTO } from '../mappers/category.mapper';

export class CategoryService {
  constructor(private readonly categories: ICategoryRepository) {}
  private validateId(id: string): void { if (!Types.ObjectId.isValid(id)) throw new NotFoundError('Category not found'); }
  getActiveCategories(): Promise<CategoryDTO[]> { return this.categories.findActive().then((items) => items.map(toCategoryDTO)); }
  async getActiveCategoryById(id: string): Promise<CategoryDTO> { this.validateId(id); const item = await this.categories.findActiveById(id); if (!item) throw new NotFoundError('Category not found'); return toCategoryDTO(item); }
  async create(input: CreateCategoryRequestDTO): Promise<CategoryDTO> {
    const name = input.name.trim(); const slug = generateSlug(name); if (!slug) throw new BadRequestError('Category name cannot generate a valid slug');
    if (await this.categories.findByName(name)) throw new ConflictError('A category with this name already exists');
    if (await this.categories.findBySlug(slug)) throw new ConflictError('A category with this slug already exists');
    return toCategoryDTO(await this.categories.create({ name, slug }));
  }
  async update(id: string, input: UpdateCategoryRequestDTO): Promise<CategoryDTO> {
    this.validateId(id); const existing = await this.categories.findById(id); if (!existing) throw new NotFoundError('Category not found');
    const updates: { name?: string; slug?: string; isActive?: boolean } = {};
    if (input.name !== undefined && input.name.trim().toLowerCase() !== existing.name.toLowerCase()) {
      const name = input.name.trim(); const slug = generateSlug(name); if (!slug) throw new BadRequestError('Category name cannot generate a valid slug');
      const sameName = await this.categories.findByName(name); if (sameName && String(sameName._id) !== id) throw new ConflictError('A category with this name already exists');
      const sameSlug = await this.categories.findBySlug(slug); if (sameSlug && String(sameSlug._id) !== id) throw new ConflictError('A category with this slug already exists');
      updates.name = name; updates.slug = slug;
    }
    if (input.isActive !== undefined) updates.isActive = input.isActive;
    if (!Object.keys(updates).length) return toCategoryDTO(existing);
    const updated = await this.categories.update(id, updates); if (!updated) throw new NotFoundError('Category not found'); return toCategoryDTO(updated);
  }
  async updateStatus(id: string, isActive: boolean): Promise<CategoryDTO> { this.validateId(id); if (!(await this.categories.findById(id))) throw new NotFoundError('Category not found'); const updated = await this.categories.updateStatus(id, isActive); if (!updated) throw new NotFoundError('Category not found'); return toCategoryDTO(updated); }
  async softDelete(id: string): Promise<void> { this.validateId(id); if (!(await this.categories.findById(id))) throw new NotFoundError('Category not found'); await this.categories.updateStatus(id, false); }
}
