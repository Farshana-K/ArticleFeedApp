import { ArticleDocument, ArticleModel } from '../models/article.model';

export async function createArticle(input: {
  title: string; description: string; images: string[]; tags: string[];
  category: string; author: string;
}): Promise<ArticleDocument> {
  return ArticleModel.create(input);
}

export async function findArticles(): Promise<ArticleDocument[]> {
  return ArticleModel.find().populate('category', 'name slug').populate('author', 'firstName lastName').sort({ createdAt: -1 });
}

export async function findArticleById(id: string): Promise<ArticleDocument | null> {
  return ArticleModel.findById(id).populate('category', 'name slug').populate('author', 'firstName lastName');
}

export async function findArticleByIdAndAuthor(id: string, authorId: string): Promise<ArticleDocument | null> {
  return ArticleModel.findOne({ _id: id, author: authorId }).populate('category', 'name slug').populate('author', 'firstName lastName');
}

export async function updateArticle(
  id: string,
  authorId: string,
  updates: { title?: string; description?: string; images?: string[]; tags?: string[]; category?: string },
): Promise<ArticleDocument | null> {
  return ArticleModel.findOneAndUpdate({ _id: id, author: authorId }, { $set: updates }, { new: true, runValidators: true })
    .populate('category', 'name slug').populate('author', 'firstName lastName');
}

export async function deleteArticle(id: string, authorId: string): Promise<ArticleDocument | null> {
  return ArticleModel.findOneAndDelete({ _id: id, author: authorId });
}

export async function findArticlesByCategories(categoryIds: string[]): Promise<ArticleDocument[]> {
  return ArticleModel.find({ category: { $in: categoryIds } })
    .populate('category', 'name slug')
    .populate('author', 'firstName lastName')
    .sort({ createdAt: -1 });
}

export async function findArticlesByAuthor(authorId: string): Promise<ArticleDocument[]> {
  return ArticleModel.find({ author: authorId })
    .populate('category', 'name slug')
    .populate('author', 'firstName lastName')
    .sort({ createdAt: -1 });
}