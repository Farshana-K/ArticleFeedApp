import { Document, Model, Schema, model } from 'mongoose';
import { ICategory } from '../interfaces/category.interface';

export interface CategoryDocument extends ICategory, Document {}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// name and slug already carry unique indexes via `unique: true` above.

export const CategoryModel: Model<CategoryDocument> = model<CategoryDocument>(
  'Category',
  categorySchema,
);
