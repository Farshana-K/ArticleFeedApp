import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAppDispatch, useAppSelector } from "../../hooks/redux.hooks";

import {
  clearAuthError,
  forgotPasswordUser,
  loginUser,
  registerUser,
  resendPasswordResetOtpUser,
  resendRegistrationOtp,
  resetPasswordUser,
  verifyPasswordResetOtpUser,
  verifyRegistrationOtp,
} from "../../store/slices/authSlice";

import { fetchCategories } from "../../store/slices/categorySlice";

import { loginSchema, registerSchema } from "../../validators/auth.validator";

import type {
  LoginFormData,
  RegisterFormData,
} from "../../validators/auth.validator";

import type { ResetPasswordInput } from "../../services/auth.service";

import OtpVerification from "../../components/auth/OtpVerification";

import {
  clearAuthFlow,
  getAuthFlow,
  saveAuthFlow,
  updateAuthFlow,
  type AuthStep,
} from "../../utils/auth-flow-storage";

import logo from "../../assets/logo.png";

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function AuthDrawer({ isOpen, onClose }: AuthDrawerProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const categories = useAppSelector((state) => state.categories.categories);

  const isLoading = useAppSelector((state) => state.auth.isLoading);

  const authError = useAppSelector((state) => state.auth.error);

  /*
   * Restore authentication flow from sessionStorage.
   *
   * This is important because Redux state is lost when
   * the browser is refreshed.
   */
  const [storedAuthFlow] = useState(() => getAuthFlow());

  const [authStep, setAuthStep] = useState<AuthStep>(
    storedAuthFlow?.step ?? "login",
  );

  const [flowUserId, setFlowUserId] = useState(storedAuthFlow?.userId ?? "");

  const [flowExpiresAt, setFlowExpiresAt] = useState(
    storedAuthFlow?.expiresAt ?? "",
  );

  const [flowResetToken, setFlowResetToken] = useState(
    storedAuthFlow?.resetToken ?? "",
  );

  /*
   * If the drawer was restored because an authentication
   * flow was active before refresh, open it again.
   */
  const [isRestoredOpen, setIsRestoredOpen] = useState(() =>
    Boolean(storedAuthFlow),
  );

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  const [isResendingOtp, setIsResendingOtp] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      preferences: [],
    },
  });

  const resetPasswordForm = useForm<ResetPasswordInput>({
    defaultValues: {
      resetToken: storedAuthFlow?.resetToken ?? "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const preferences = registerForm.watch("preferences");

  /*
   * Keep the reset token in the form when the
   * password-reset flow is restored.
   */
  useEffect(() => {
    if (flowResetToken) {
      resetPasswordForm.setValue("resetToken", flowResetToken);
    }
  }, [flowResetToken, resetPasswordForm]);

  /*
   * Fetch categories whenever the registration
   * screen is opened.
   */
  useEffect(() => {
    if (isOpen && authStep === "register") {
      dispatch(fetchCategories());
    }
  }, [dispatch, isOpen, authStep]);

  function togglePreference(categoryId: string) {
    const updatedPreferences = preferences.includes(categoryId)
      ? preferences.filter((id) => id !== categoryId)
      : [...preferences, categoryId];

    registerForm.setValue("preferences", updatedPreferences, {
      shouldValidate: true,
    });
  }

  function clearPersistedFlow() {
    clearAuthFlow();

    setFlowUserId("");
    setFlowExpiresAt("");
    setFlowResetToken("");
    setIsRestoredOpen(false);

    dispatch(clearAuthError());
  }

  function switchMode(registering: boolean) {
    const nextStep: AuthStep = registering ? "register" : "login";

    clearPersistedFlow();

    setAuthStep(nextStep);

    loginForm.reset();

    registerForm.reset({
      preferences: [],
    });

    resetPasswordForm.reset();

    setForgotPasswordEmail("");

    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  function switchToForgotPassword() {
    clearPersistedFlow();

    setAuthStep("forgot-password");

    loginForm.reset();

    setForgotPasswordEmail("");

    setShowPassword(false);
  }

  function switchToLogin() {
    clearPersistedFlow();

    setAuthStep("login");

    loginForm.reset();

    registerForm.reset({
      preferences: [],
    });

    resetPasswordForm.reset();

    setForgotPasswordEmail("");

    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  function handleClose() {
    /*
     * Do NOT clear the authentication flow here.
     *
     * This allows the flow to be restored if the user
     * accidentally refreshes the browser.
     */
    setIsRestoredOpen(false);

    onClose();
  }

  async function handleLogin(data: LoginFormData) {
    try {
      await dispatch(loginUser(data)).unwrap();

      toast.success("Login successful");

      clearPersistedFlow();

      loginForm.reset();

      onClose();

      navigate("/dashboard");
    } catch (error) {
      toast.error(String(error));
    }
  }

  async function handleRegister(data: RegisterFormData) {
    try {
      const result = await dispatch(registerUser(data)).unwrap();

      toast.success("Account created. Verification OTP sent to your email.");

      registerForm.reset({
        preferences: [],
      });

      const userId = result.user.id;

      const expiresAt = result.expiresAt;

      setFlowUserId(userId);
      setFlowExpiresAt(expiresAt);
      setFlowResetToken("");

      saveAuthFlow({
        step: "registration-otp",
        userId,
        expiresAt,
      });

      dispatch(clearAuthError());

      setAuthStep("registration-otp");
    } catch (error) {
      toast.error(String(error));
    }
  }

  async function handleVerifyRegistrationOtp(otp: string) {
    if (!flowUserId) {
      toast.error("Registration verification session not found.");

      return;
    }

    try {
      await dispatch(
        verifyRegistrationOtp({
          userId: flowUserId,
          otp,
        }),
      ).unwrap();

      toast.success("Email verified successfully. You can now log in.");

      clearPersistedFlow();

      setAuthStep("login");
    } catch (error) {
      toast.error(String(error));
    }
  }

  async function handleResendRegistrationOtp() {
    if (!flowUserId) {
      return;
    }

    setIsResendingOtp(true);

    try {
      const result = await dispatch(resendRegistrationOtp(flowUserId)).unwrap();

      setFlowExpiresAt(result.expiresAt);

      updateAuthFlow({
        expiresAt: result.expiresAt,
      });

      toast.success("OTP sent successfully");
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsResendingOtp(false);
    }
  }

  async function handleForgotPassword() {
    if (!forgotPasswordEmail.trim()) {
      toast.error("Please enter your email address");

      return;
    }

    try {
      const result = await dispatch(
        forgotPasswordUser(forgotPasswordEmail.trim()),
      ).unwrap();

      setFlowUserId(result.userId);

      setFlowExpiresAt(result.expiresAt);

      setFlowResetToken("");

      saveAuthFlow({
        step: "password-reset-otp",
        userId: result.userId,
        expiresAt: result.expiresAt,
      });

      dispatch(clearAuthError());

      setAuthStep("password-reset-otp");

      toast.success("Password reset OTP sent to your email");
    } catch (error) {
      toast.error(String(error));
    }
  }

  async function handleVerifyPasswordResetOtp(otp: string) {
    if (!flowUserId) {
      toast.error("Password reset session not found.");

      return;
    }

    try {
      const resetToken = await dispatch(
        verifyPasswordResetOtpUser({
          userId: flowUserId,
          otp,
        }),
      ).unwrap();

      setFlowResetToken(resetToken);

      saveAuthFlow({
        step: "reset-password",
        userId: flowUserId,
        resetToken,
      });

      resetPasswordForm.setValue("resetToken", resetToken);

      setAuthStep("reset-password");

      toast.success("OTP verified successfully");
    } catch (error) {
      toast.error(String(error));
    }
  }

  async function handleResendPasswordResetOtp() {
    if (!flowUserId) {
      return;
    }

    setIsResendingOtp(true);

    try {
      const result = await dispatch(
        resendPasswordResetOtpUser(flowUserId),
      ).unwrap();

      setFlowExpiresAt(result.expiresAt);

      updateAuthFlow({
        expiresAt: result.expiresAt,
      });

      toast.success("OTP sent successfully");
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsResendingOtp(false);
    }
  }

  async function handleResetPassword(data: ResetPasswordInput) {
    try {
      await dispatch(resetPasswordUser(data)).unwrap();

      toast.success("Password reset successfully. Please log in.");

      clearPersistedFlow();

      resetPasswordForm.reset();

      setAuthStep("login");
    } catch (error) {
      toast.error(String(error));
    }
  }

  function getHeaderTitle() {
    switch (authStep) {
      case "register":
        return "Create your account";

      case "forgot-password":
        return "Reset your password";

      case "registration-otp":
        return "Verify your email";

      case "password-reset-otp":
        return "Verify OTP";

      case "reset-password":
        return "Create new password";

      default:
        return "Welcome back";
    }
  }

  function getHeaderDescription() {
    switch (authStep) {
      case "register":
        return "Join Article Feed and personalize your reading.";

      case "forgot-password":
        return "Enter your email to reset your password.";

      case "registration-otp":
        return "Verify your email address to activate your account.";

      case "password-reset-otp":
        return "Enter the OTP sent to your email to continue.";

      case "reset-password":
        return "Choose a new password for your account.";

      default:
        return "Sign in to continue to Article Feed.";
    }
  }

  const drawerIsOpen = isOpen || isRestoredOpen;

  return (
    <>
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm transition-opacity ${
          drawerIsOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${
          drawerIsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Article Feed"
              className="h-15 w-auto object-contain"
            />

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {getHeaderTitle()}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {getHeaderDescription()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close authentication"
          >
            <X size={20} />
          </button>
        </div>

        {authStep === "forgot-password" && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleForgotPassword();
            }}
            className="space-y-5 p-6"
          >
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Forgot Password
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Enter your registered email address. We will send you a password
                reset OTP.
              </p>
            </div>

            <div>
              <label
                htmlFor="forgotPasswordEmail"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <input
                id="forgotPasswordEmail"
                type="email"
                value={forgotPasswordEmail}
                onChange={(event) => setForgotPasswordEmail(event.target.value)}
                placeholder="Enter your email address"
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Sending..." : "Send OTP"}
            </button>

            <button
              type="button"
              onClick={switchToLogin}
              disabled={isLoading}
              className="w-full text-sm font-semibold text-slate-600 transition hover:text-teal-600 disabled:opacity-50"
            >
              Back to Login
            </button>
          </form>
        )}

        {authStep === "registration-otp" && flowUserId && flowExpiresAt && (
          <div className="p-6">
            <OtpVerification
              userId={flowUserId}
              expiresAt={flowExpiresAt}
              title="Verify your email"
              description="Enter the 6-digit OTP sent to your registered email address."
              isLoading={isLoading && !isResendingOtp}
              isResending={isResendingOtp}
              error={authError}
              onVerify={handleVerifyRegistrationOtp}
              onResend={handleResendRegistrationOtp}
              onBack={switchToLogin}
            />
          </div>
        )}

        {authStep === "password-reset-otp" && flowUserId && flowExpiresAt && (
          <div className="p-6">
            <OtpVerification
              userId={flowUserId}
              expiresAt={flowExpiresAt}
              title="Enter verification OTP"
              description="Enter the 6-digit OTP sent to your email address to reset your password."
              isLoading={isLoading && !isResendingOtp}
              isResending={isResendingOtp}
              error={authError}
              onVerify={handleVerifyPasswordResetOtp}
              onResend={handleResendPasswordResetOtp}
              onBack={switchToLogin}
            />
          </div>
        )}

        {authStep === "reset-password" && (
          <form
            onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)}
            className="space-y-5 p-6"
          >
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Create New Password
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Enter your new password below.
              </p>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                New password
              </label>

              <div className="relative">
                <input
                  {...resetPasswordForm.register("newPassword")}
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-16 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-teal-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {resetPasswordForm.formState.errors.newPassword && (
                <p className="mt-1.5 text-sm text-red-500">
                  {resetPasswordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmNewPassword"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Confirm password
              </label>

              <div className="relative">
                <input
                  {...resetPasswordForm.register("confirmPassword")}
                  id="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-16 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-teal-600"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              {resetPasswordForm.formState.errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-500">
                  {resetPasswordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Resetting password..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={switchToLogin}
              disabled={isLoading}
              className="w-full text-sm font-semibold text-slate-600 transition hover:text-teal-600 disabled:opacity-50"
            >
              Back to Login
            </button>
          </form>
        )}

        {authStep === "login" && (
          <form
            onSubmit={loginForm.handleSubmit(handleLogin)}
            className="space-y-5 p-6"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email or phone
              </label>

              <input
                {...loginForm.register("identifier")}
                placeholder="Enter your email or phone"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />

              {loginForm.formState.errors.identifier && (
                <p className="mt-1.5 text-sm text-red-500">
                  {loginForm.formState.errors.identifier.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="relative">
                <input
                  {...loginForm.register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-16 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-teal-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {loginForm.formState.errors.password && (
                <p className="mt-1.5 text-sm text-red-500">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Log in"}
            </button>

            <button
              type="button"
              onClick={switchToForgotPassword}
              className="w-full text-center text-sm font-semibold text-teal-600 hover:text-teal-700"
            >
              Forgot Password?
            </button>

            <p className="text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode(true)}
                className="font-semibold text-teal-600 hover:text-teal-700"
              >
                Sign up
              </button>
            </p>
          </form>
        )}

        {authStep === "register" && (
          <form
            onSubmit={registerForm.handleSubmit(handleRegister)}
            className="space-y-4 p-6"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  {...registerForm.register("firstName")}
                  placeholder="First name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                />

                {registerForm.formState.errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">
                    {registerForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  {...registerForm.register("lastName")}
                  placeholder="Last name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                />

                {registerForm.formState.errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">
                    {registerForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <input
                {...registerForm.register("phone")}
                type="tel"
                placeholder="Phone number"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />

              {registerForm.formState.errors.phone && (
                <p className="mt-1 text-xs text-red-500">
                  {registerForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <input
                {...registerForm.register("email")}
                type="email"
                placeholder="Email address"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />

              {registerForm.formState.errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Date of birth
              </label>

              <input
                {...registerForm.register("dateOfBirth")}
                type="date"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />

              {registerForm.formState.errors.dateOfBirth && (
                <p className="mt-1 text-xs text-red-500">
                  {registerForm.formState.errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                Select your interests
              </p>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const selected = preferences.includes(category.id);

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => togglePreference(category.id)}
                      className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                        selected
                          ? "bg-teal-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <input
                {...registerForm.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-16 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-teal-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>

              {registerForm.formState.errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                {...registerForm.register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-16 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-teal-600"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>

              {registerForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {registerForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode(false)}
                className="font-semibold text-teal-600 hover:text-teal-700"
              >
                Log in
              </button>
            </p>
          </form>
        )}
      </aside>
    </>
  );
}

export default AuthDrawer;
