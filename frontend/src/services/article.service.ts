import { api } from './api';

export async function getPersonalizedArticles() {
  return api.get('/articles/feed');
}

export async function interactWithArticle(
  articleId: string,
  interactionType: 'like' | 'dislike' | 'block',
) {
  return api.post(`/articles/${articleId}/interaction`, {
    interactionType,
  });
}

export async function removeArticleInteraction(articleId: string) {
  return api.delete(`/articles/${articleId}/interaction`);
}

export async function getBlockedArticles() {
  return api.get('/articles/blocked');
}

export async function getMyArticles() {
  return api.get('/articles/my');
}

export async function deleteArticle(articleId: string) {
  return api.delete(`/articles/${articleId}`);
}

export async function createArticle(input: {
  title: string;
  description: string;
  images: string[];
  tags: string[];
  category: string;
}) {
  return api.post('/articles', input);
}

export async function uploadArticleImages(images: File[]) {
  const formData = new FormData();

  images.forEach((image) => formData.append('images', image));

  return api.post('/articles/upload-image', formData);
}

export async function getArticleById(articleId: string) {
  return api.get(`/articles/${articleId}`);
}

export async function updateArticle(
  articleId: string,
  input: {
    title?: string;
    description?: string;
    images?: string[];
    tags?: string[];
    category?: string;
  },
) {
  return api.put(`/articles/${articleId}`, input);
}