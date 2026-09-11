import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  deleteArticle,
  getBlockedArticles,
  getMyArticles,
  getPersonalizedArticles,
  interactWithArticle,
  removeArticleInteraction,
  createArticle,
  updateArticle
} from '../../services/article.service';
import type { Article } from '../../types/article.types';

interface ArticleState {
  articles: Article[];
  myArticles: Article[];
  blockedArticles: Article[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ArticleState = {
  articles: [],
  myArticles: [],
  blockedArticles: [],
  isLoading: false,
  error: null,
};

export const fetchPersonalizedArticles = createAsyncThunk(
  'articles/fetchPersonalized',
  async () => {
    const response = await getPersonalizedArticles();
    return response.data.data.articles as Article[];
  },
);

export const fetchMyArticles = createAsyncThunk(
  'articles/fetchMy',
  async () => {
    const response = await getMyArticles();
    return response.data.data.articles as Article[];
  },
);

export const createNewArticle = createAsyncThunk(
  'articles/create',
  async (input: {
    title: string;
    description: string;
    images: string[];
    tags: string[];
    category: string;
  }) => {
    const response = await createArticle(input);
    return response.data.data.article as Article;
  },
);

export const updateExistingArticle = createAsyncThunk(
  'articles/update',
  async ({
    articleId,
    input,
  }: {
    articleId: string;
    input: {
      title: string;
      description: string;
      images: string[];
      tags: string[];
      category: string;
    };
  }) => {
    const response = await updateArticle(articleId, input);
    return response.data.data.article as Article;
  },
);


export const removeMyArticle = createAsyncThunk(
  'articles/deleteMy',
  async (articleId: string) => {
    await deleteArticle(articleId);
    return articleId;
  },
);

export const fetchBlockedArticles = createAsyncThunk(
  'articles/fetchBlocked',
  async () => {
    const response = await getBlockedArticles();

    return response.data.data.articles.map(
      (interaction: { articleId: Article & { _id: string } }) => ({
        ...interaction.articleId,
        id: interaction.articleId._id,
      }),
    );
  },
);


export const interactArticle = createAsyncThunk(
  'articles/interact',
  async ({
    articleId,
    interactionType,
  }: {
    articleId: string;
    interactionType: 'like' | 'dislike' | 'block';
  }) => {
    const response = await interactWithArticle(articleId, interactionType);

    return {
      articleId,
      interactionType,
      counts: response.data.data.counts,
    };
  },
);



export const unblockArticle = createAsyncThunk(
  'articles/unblock',
  async (articleId: string) => {
    await removeArticleInteraction(articleId);
    return articleId;
  },
);

const articleSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPersonalizedArticles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPersonalizedArticles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.articles = action.payload;
      })
      .addCase(fetchPersonalizedArticles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to load articles';
      })
      .addCase(fetchMyArticles.fulfilled, (state, action) => {
        state.myArticles = action.payload;
      })
      .addCase(createNewArticle.fulfilled, (state, action) => {
        state.myArticles.unshift(action.payload);
      })
      .addCase(updateExistingArticle.fulfilled, (state, action) => {
        const index = state.myArticles.findIndex(
          (article) => article.id === action.payload.id,
        );

        if (index !== -1) state.myArticles[index] = action.payload;
      })
      .addCase(removeMyArticle.fulfilled, (state, action) => {
        state.myArticles = state.myArticles.filter(
          (article) => article.id !== action.payload,
        );
      })
      .addCase(fetchBlockedArticles.fulfilled, (state, action) => {
        state.blockedArticles = action.payload;
      })
      .addCase(fetchBlockedArticles.rejected, (state, action) => {
        state.error =
          action.error.message ?? 'Failed to load blocked articles';
      })
      
        .addCase(interactArticle.fulfilled, (state, action) => {
        const article = state.articles.find(
            (item) => item.id === action.payload.articleId,
        );

        if (article) {
            article.likeCount = action.payload.counts.likeCount;
            article.dislikeCount = action.payload.counts.dislikeCount;
            article.blockCount = action.payload.counts.blockCount;
            article.userInteraction = action.payload.interactionType;
        }
        })


      .addCase(interactArticle.rejected, (state, action) => {
        state.error = action.error.message ?? 'Interaction failed';
      })
      .addCase(unblockArticle.fulfilled, (state, action) => {
        state.blockedArticles = state.blockedArticles.filter(
          (article) => article.id !== action.payload,
        );
      })
      .addCase(unblockArticle.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to unblock article';
      });
  },
});

export default articleSlice.reducer;

