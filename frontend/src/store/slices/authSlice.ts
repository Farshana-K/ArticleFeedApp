import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  register,
  resendPasswordResetOtp,
  resendVerificationOtp,
  resetPassword,
  verifyEmail,
  verifyPasswordResetOtp,
} from "../../services/auth.service";

import type {
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyOtpInput,
} from "../../services/auth.service";

import type { User } from "../../types/auth.types";

import { getApiErrorMessage } from "../../utils/api-error.util";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitializing: boolean;
  isAuthenticated: boolean;

  registrationVerification: {
    userId: string | null;
    expiresAt: string | null;
  };

  passwordReset: {
    userId: string | null;
    expiresAt: string | null;
    resetToken: string | null;
  };

  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isInitializing: true,
  isAuthenticated: false,

  registrationVerification: {
    userId: null,
    expiresAt: null,
  },

  passwordReset: {
    userId: null,
    expiresAt: null,
    resetToken: null,
  },

  error: null,
};

/* -------------------------------------------------------------------------- */
/* Login                                                                      */
/* -------------------------------------------------------------------------- */

export const loginUser = createAsyncThunk(
  "auth/login",
  async (input: LoginInput, { rejectWithValue }) => {
    try {
      const response = await login(input);

      return response.data.data.user as User;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

/* -------------------------------------------------------------------------- */
/* Current User                                                               */
/* -------------------------------------------------------------------------- */

export const fetchCurrentUser = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentUser();

      return response.data.data.user as User;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

/* -------------------------------------------------------------------------- */
/* Registration                                                               */
/* -------------------------------------------------------------------------- */

export const registerUser = createAsyncThunk(
  "auth/register",
  async (input: RegisterInput, { rejectWithValue }) => {
    try {
      const response = await register(input);

      return {
        user: response.data.data.user as User,
        expiresAt: response.data.data.expiresAt as string,
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

/* -------------------------------------------------------------------------- */
/* Registration OTP Verification                                             */
/* -------------------------------------------------------------------------- */

export const verifyRegistrationOtp = createAsyncThunk(
  "auth/verifyRegistrationOtp",
  async (input: VerifyOtpInput, { rejectWithValue }) => {
    try {
      const response = await verifyEmail(input);

      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

/* -------------------------------------------------------------------------- */
/* Registration OTP Resend                                                    */
/* -------------------------------------------------------------------------- */

export const resendRegistrationOtp = createAsyncThunk(
  "auth/resendRegistrationOtp",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await resendVerificationOtp(userId);

      return {
        expiresAt: response.data.data.expiresAt as string,
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

/* -------------------------------------------------------------------------- */
/* Forgot Password                                                            */
/* -------------------------------------------------------------------------- */

export const forgotPasswordUser = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await forgotPassword({ email });

      return {
        userId: response.data.data.userId as string,
        expiresAt: response.data.data.expiresAt as string,
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

/* -------------------------------------------------------------------------- */
/* Password Reset OTP Resend                                                  */
/* -------------------------------------------------------------------------- */

export const resendPasswordResetOtpUser = createAsyncThunk(
  "auth/resendPasswordResetOtp",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await resendPasswordResetOtp(userId);

      return {
        expiresAt: response.data.data.expiresAt as string,
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

/* -------------------------------------------------------------------------- */
/* Password Reset OTP Verification                                            */
/* -------------------------------------------------------------------------- */

export const verifyPasswordResetOtpUser = createAsyncThunk(
  "auth/verifyPasswordResetOtp",
  async (input: VerifyOtpInput, { rejectWithValue }) => {
    try {
      const response = await verifyPasswordResetOtp(input);

      return response.data.data.resetToken as string;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

/* -------------------------------------------------------------------------- */
/* Reset Password                                                             */
/* -------------------------------------------------------------------------- */

export const resetPasswordUser = createAsyncThunk(
  "auth/resetPassword",
  async (input: ResetPasswordInput, { rejectWithValue }) => {
    try {
      const response = await resetPassword(input);

      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

/* -------------------------------------------------------------------------- */
/* Logout                                                                     */
/* -------------------------------------------------------------------------- */

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logout();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

/* -------------------------------------------------------------------------- */
/* Auth Slice                                                                 */
/* -------------------------------------------------------------------------- */

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },

    clearRegistrationVerification: (state) => {
      state.registrationVerification = {
        userId: null,
        expiresAt: null,
      };
    },

    clearPasswordReset: (state) => {
      state.passwordReset = {
        userId: null,
        expiresAt: null,
        resetToken: null,
      };
    },
  },

  extraReducers: (builder) => {
    builder

      /* -------------------------------------------------------------------- */
      /* Login                                                                 */
      /* -------------------------------------------------------------------- */

      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.isAuthenticated = true;
        state.user = action.payload;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* -------------------------------------------------------------------- */
      /* Registration                                                           */
      /* -------------------------------------------------------------------- */

      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        state.registrationVerification = {
          userId: action.payload.user.id,
          expiresAt: action.payload.expiresAt,
        };

        state.isAuthenticated = false;
        state.user = null;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* -------------------------------------------------------------------- */
      /* Registration OTP Verification                                         */
      /* -------------------------------------------------------------------- */

      .addCase(verifyRegistrationOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(verifyRegistrationOtp.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;

        state.registrationVerification = {
          userId: null,
          expiresAt: null,
        };
      })

      .addCase(verifyRegistrationOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* -------------------------------------------------------------------- */
      /* Registration OTP Resend                                               */
      /* -------------------------------------------------------------------- */

      .addCase(resendRegistrationOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(resendRegistrationOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        state.registrationVerification.expiresAt = action.payload.expiresAt;
      })

      .addCase(resendRegistrationOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* -------------------------------------------------------------------- */
      /* Forgot Password                                                       */
      /* -------------------------------------------------------------------- */

      .addCase(forgotPasswordUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(forgotPasswordUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        state.passwordReset = {
          userId: action.payload.userId,
          expiresAt: action.payload.expiresAt,
          resetToken: null,
        };
      })

      .addCase(forgotPasswordUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* -------------------------------------------------------------------- */
      /* Password Reset OTP Resend                                             */
      /* -------------------------------------------------------------------- */

      .addCase(resendPasswordResetOtpUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(resendPasswordResetOtpUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        state.passwordReset.expiresAt = action.payload.expiresAt;
      })

      .addCase(resendPasswordResetOtpUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* -------------------------------------------------------------------- */
      /* Password Reset OTP Verification                                       */
      /* -------------------------------------------------------------------- */

      .addCase(verifyPasswordResetOtpUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(verifyPasswordResetOtpUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        state.passwordReset.resetToken = action.payload;
      })

      .addCase(verifyPasswordResetOtpUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* -------------------------------------------------------------------- */
      /* Reset Password                                                        */
      /* -------------------------------------------------------------------- */

      .addCase(resetPasswordUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(resetPasswordUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;

        state.passwordReset = {
          userId: null,
          expiresAt: null,
          resetToken: null,
        };
      })

      .addCase(resetPasswordUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* -------------------------------------------------------------------- */
      /* Current User                                                          */
      /* -------------------------------------------------------------------- */

      .addCase(fetchCurrentUser.pending, (state) => {
        state.isInitializing = true;
      })

      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isInitializing = false;
        state.error = null;
        state.user = action.payload;
        state.isAuthenticated = true;
      })

      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isInitializing = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })

      /* -------------------------------------------------------------------- */
      /* Logout                                                                */
      /* -------------------------------------------------------------------- */

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const {
  clearAuthError,
  clearRegistrationVerification,
  clearPasswordReset,
} = authSlice.actions;

export default authSlice.reducer;
