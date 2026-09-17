import { ArticleDocument, ArticleModel } from '../models/article.model';
import { CreateArticleInput, IArticleRepository, UpdateArticleInput, InteractionCounterField } from '../contracts/article.repository.interface';

export class ArticleRepository implements IArticleRepository {
  create(input: CreateArticleInput): Promise<ArticleDocument> { return ArticleModel.create(input); }
  findAll(): Promise<ArticleDocument[]> { return ArticleModel.find().populate('category', 'name slug').populate('author', 'firstName lastName').sort({ createdAt: -1 }); }
  findById(id: string): Promise<ArticleDocument | null> { return ArticleModel.findById(id).populate('category', 'name slug').populate('author', 'firstName lastName'); }
  findByIdAndAuthor(id: string, authorId: string): Promise<ArticleDocument | null> { return ArticleModel.findOne({ _id: id, author: authorId }).populate('category', 'name slug').populate('author', 'firstName lastName'); }
  updateByAuthor(id: string, authorId: string, updates: UpdateArticleInput): Promise<ArticleDocument | null> {
    return ArticleModel.findOneAndUpdate({ _id: id, author: authorId }, { $set: updates }, { new: true, runValidators: true }).populate('category', 'name slug').populate('author', 'firstName lastName');
  }
  deleteByAuthor(id: string, authorId: string): Promise<ArticleDocument | null> { return ArticleModel.findOneAndDelete({ _id: id, author: authorId }); }
  findByCategories(categoryIds: string[]): Promise<ArticleDocument[]> { return ArticleModel.find({ category: { $in: categoryIds } }).populate('category', 'name slug').populate('author', 'firstName lastName').sort({ createdAt: -1 }); }
  findByAuthor(authorId: string): Promise<ArticleDocument[]> { return ArticleModel.find({ author: authorId }).populate('category', 'name slug').populate('author', 'firstName lastName').sort({ createdAt: -1 }); }
  async incrementInteractionCounters(articleId: string, changes: Partial<Record<InteractionCounterField, number>>): Promise<void> { await ArticleModel.updateOne({ _id: articleId }, { $inc: changes }); }
}
