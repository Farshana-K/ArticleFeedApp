import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  changePassword,
  updatePreferences,
  updateProfile,
} from '../../services/profile.service';
import { fetchCurrentUser } from './authSlice';
import { getApiErrorMessage } from '../../utils/api-error.util';

interface ProfileState {
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  isLoading: false,
  error: null,
};


export const updateUserProfile = createAsyncThunk(
  'profile/update',
  async (
    input: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      dateOfBirth: string;
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      await updateProfile(input);
      await dispatch(fetchCurrentUser()).unwrap();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);



export const updateUserPassword = createAsyncThunk(
  'profile/changePassword',
  async (
    input: {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    },
    { rejectWithValue },
  ) => {
    try {
      await changePassword(input);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);



export const updateUserPreferences = createAsyncThunk(
  'profile/preferences',
  async (preferences: string[], { dispatch, rejectWithValue }) => {
    try {
      await updatePreferences(preferences);
      await dispatch(fetchCurrentUser()).unwrap();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;

