import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getCurrentUser,
  login,
  logout,
  register,
} from '../../services/auth.service';
import type { LoginInput, RegisterInput } from '../../services/auth.service';
import type { User } from '../../types/auth.types';
import { getApiErrorMessage } from '../../utils/api-error.util';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (input: LoginInput, { rejectWithValue }) => {
    try {
      const response = await login(input);
      return response.data.data.user as User;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/me',
  async () => {
    const response = await getCurrentUser();
    return response.data.data.user as User;
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (input: RegisterInput, { rejectWithValue }) => {
    try {
      const response = await register(input);
      return response.data.data.user as User;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await logout();
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;