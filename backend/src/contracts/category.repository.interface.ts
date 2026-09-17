import { CategoryDocument } from "../models/category.model";
export interface ICategoryRepository {
  findActive(): Promise<CategoryDocument[]>;
  findActiveById(id: string): Promise<CategoryDocument | null>;
  findActiveByIds(ids: string[]): Promise<CategoryDocument[]>;
  findById(id: string): Promise<CategoryDocument | null>;
  findByName(name: string): Promise<CategoryDocument | null>;
  findBySlug(slug: string): Promise<CategoryDocument | null>;
  create(input: { name: string; slug: string }): Promise<CategoryDocument>;
  update(
    id: string,
    updates: { name?: string; slug?: string; isActive?: boolean },
  ): Promise<CategoryDocument | null>;
  updateStatus(id: string, isActive: boolean): Promise<CategoryDocument | null>;
}
