import { Types } from 'mongoose';
import { BadRequestError, NotFoundError } from '../errors/app.error';
import { IArticleRepository } from '../contracts/article.repository.interface';
import { ICategoryRepository } from '../contracts/category.repository.interface';
import { IArticleInteractionRepository } from '../contracts/article-interaction.repository.interface';
import { CreateArticleRequestDTO, UpdateArticleRequestDTO } from '../validators/article.validator';
import { ArticleDTO, toArticleDTO } from '../mappers/article.mapper';

export class ArticleService {
  constructor(private readonly articles: IArticleRepository, private readonly categories: ICategoryRepository, private readonly interactions: IArticleInteractionRepository) {}
  private validateId(id: string): void { if (!Types.ObjectId.isValid(id)) throw new NotFoundError('Article not found'); }
  private async validateCategory(categoryId: string): Promise<void> { if (!Types.ObjectId.isValid(categoryId)) throw new BadRequestError('Invalid category ID'); const category = await this.categories.findActiveById(categoryId); if (!category) throw new BadRequestError('Category not found or inactive'); }
  async create(userId: string, input: CreateArticleRequestDTO): Promise<ArticleDTO> { await this.validateCategory(input.category); const article = await this.articles.create({ ...input, author: userId }); const saved = await this.articles.findById(String(article._id)); if (!saved) throw new NotFoundError('Article not found'); return toArticleDTO(saved); }
  async getAll(): Promise<ArticleDTO[]> { return (await this.articles.findAll()).map((item) => toArticleDTO(item)); }
  async getById(id: string): Promise<ArticleDTO> { this.validateId(id); const article = await this.articles.findById(id); if (!article) throw new NotFoundError('Article not found'); return toArticleDTO(article); }
  async updateOwn(id: string, userId: string, input: UpdateArticleRequestDTO): Promise<ArticleDTO> { this.validateId(id); if (input.category) await this.validateCategory(input.category); if (!(await this.articles.findByIdAndAuthor(id, userId))) throw new NotFoundError('Article not found'); const updated = await this.articles.updateByAuthor(id, userId, input); if (!updated) throw new NotFoundError('Article not found'); return toArticleDTO(updated); }
  async deleteOwn(id: string, userId: string): Promise<void> { this.validateId(id); if (!(await this.articles.deleteByAuthor(id, userId))) throw new NotFoundError('Article not found'); }
  async getPersonalized(categoryIds: string[], userId: string): Promise<ArticleDTO[]> {
    if (!categoryIds.length) return [];
    const [articles, blockedIds] = await Promise.all([this.articles.findByCategories(categoryIds), this.interactions.findBlockedArticleIds(userId)]);
    const blocked = new Set(blockedIds);
    return Promise.all(articles.filter((article) => !blocked.has(String(article._id))).map(async (article) => {
      const interaction = await this.interactions.find(String(article._id), userId);
      return toArticleDTO(article, interaction?.interactionType ?? null);
    }));
  }
  async getMy(userId: string): Promise<ArticleDTO[]> { return (await this.articles.findByAuthor(userId)).map((item) => toArticleDTO(item)); }
}
