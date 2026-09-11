import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getCategories } from '../../services/category.service';
import type { Category } from '../../types/category.types';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'categories/fetch',
  async () => {
    const response = await getCategories();
    return response.data.data.categories as Category[];
  },
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to load categories';
      });
  },
});

export default categorySlice.reducer;