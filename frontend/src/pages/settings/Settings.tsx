import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Ban, Eye, EyeOff, KeyRound, LogOut, Save, Unlock } from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "../../hooks/redux.hooks";
import {
  fetchBlockedArticles,
  unblockArticle,
} from "../../store/slices/articleSlice";
import { logoutUser } from "../../store/slices/authSlice";
import {
  updateUserPassword,
  updateUserProfile,
  updateUserPreferences,
} from "../../store/slices/profileSlice";
import {
  profileSchema,
  type ProfileFormData,
} from "../../validators/profile.validator";
import {
  passwordSchema,
  type PasswordFormData,
} from "../../validators/password.validator";
import logo from "../../assets/logo.png";
import { fetchCategories } from "../../store/slices/categorySlice";

function Settings() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { categories } = useAppSelector((state) => state.categories);
  const { blockedArticles, error } = useAppSelector((state) => state.articles);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = profileForm;

  const {
    register: registerPassword,
    handleSubmit: submitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = passwordForm;

  useEffect(() => {
    dispatch(fetchBlockedArticles());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth.slice(0, 10),
      });
    }
  }, [user, reset]);

  useEffect(() => {
    if (user) {
      setSelectedPreferences(
        user.preferences.map((preference) => preference.id),
      );
    }
  }, [user]);

  const handleProfileSave = async (data: ProfileFormData) => {
    try {
      await dispatch(updateUserProfile(data)).unwrap();
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handlePasswordChange = async (data: PasswordFormData) => {
    try {
      await dispatch(updateUserPassword(data)).unwrap();
      resetPassword();
      toast.success("Password updated successfully");
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleUnblock = async (articleId: string) => {
    const result = await dispatch(unblockArticle(articleId));
    toast[result.meta.requestStatus === "fulfilled" ? "success" : "error"](
      result.meta.requestStatus === "fulfilled"
        ? "Article unblocked"
        : "Failed to unblock article",
    );
  };

  const handlePreferencesSave = async () => {
    setIsSavingPreferences(true);

    try {
      await dispatch(updateUserPreferences(selectedPreferences)).unwrap();
      toast.success("Preferences updated successfully");
    } catch (error) {
      toast.error(error as string);
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success("Logged out successfully");
    window.location.href = "/";
  };

  const userInitial = user?.firstName?.charAt(0).toUpperCase() ?? "U";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-5 lg:px-8">
          <Link to="/dashboard" className="shrink-0">
            <img
              src={logo}
              alt="Article Feed"
              className="h-12 object-contain sm:h-15"
            />
          </Link>

          <nav className="flex min-w-0 flex-1 justify-end gap-3 overflow-x-auto sm:gap-6 md:gap-8">
            <Link
              to="/dashboard"
              className="shrink-0 py-5 text-xs text-slate-500 hover:text-slate-900 sm:text-sm"
            >
              Dashboard
            </Link>
            <Link
              to="/articles/my"
              className="shrink-0 py-5 text-xs text-slate-500 hover:text-slate-900 sm:text-sm"
            >
              My Articles
            </Link>
            <Link
              to="/settings"
              className="relative shrink-0 py-5 text-xs font-semibold text-teal-600 sm:text-sm"
            >
              Settings
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-teal-600" />
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden text-right lg:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-400">Account</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 sm:h-9 sm:w-9 sm:text-sm">
              {userInitial}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
          <p className="mt-3 text-slate-500">
            Manage your account and personalize your Article Feed experience.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(handleProfileSave)}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold">Account Information</h2>
          <p className="mt-1 text-sm text-slate-500">
            Update your personal information.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {(["firstName", "lastName", "phone", "email"] as const).map(
              (field) => (
                <div key={field}>
                  <label
                    htmlFor={field}
                    className="text-sm font-medium text-slate-700"
                  >
                    {field === "firstName"
                      ? "First Name"
                      : field === "lastName"
                        ? "Last Name"
                        : field === "phone"
                          ? "Phone"
                          : "Email"}
                  </label>
                  <input
                    id={field}
                    type={field === "email" ? "email" : "text"}
                    {...register(field)}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                  {errors[field] && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors[field]?.message}
                    </p>
                  )}
                </div>
              ),
            )}

            <div>
              <label
                htmlFor="dateOfBirth"
                className="text-sm font-medium text-slate-700"
              >
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            <Save size={16} />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2 text-teal-600">
              <KeyRound size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Change Password</h2>
              <p className="text-sm text-slate-500">
                Update your password to keep your account secure.
              </p>
            </div>
          </div>

          <form
            onSubmit={submitPassword(handlePasswordChange)}
            className="mt-6 space-y-5"
          >
            {(
              ["currentPassword", "newPassword", "confirmNewPassword"] as const
            ).map((field) => (
              <div key={field}>
                <label
                  htmlFor={field}
                  className="text-sm font-medium text-slate-700"
                >
                  {field === "currentPassword"
                    ? "Current Password"
                    : field === "newPassword"
                      ? "New Password"
                      : "Confirm New Password"}
                </label>
                <div className="relative mt-2">
                  <input
                    id={field}
                    type={
                      field === "newPassword"
                        ? showNewPassword
                          ? "text"
                          : "password"
                        : showConfirmPassword
                          ? "text"
                          : "password"
                    }
                    {...registerPassword(field)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 pr-11 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />

                  {field !== "currentPassword" && (
                    <button
                      type="button"
                      onClick={() =>
                        field === "newPassword"
                          ? setShowNewPassword((value) => !value)
                          : setShowConfirmPassword((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={
                        field === "newPassword"
                          ? "Toggle new password"
                          : "Toggle confirm password"
                      }
                    >
                      {field === "newPassword" ? (
                        showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )
                      ) : showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  )}
                </div>
                {passwordErrors[field] && (
                  <p className="mt-1 text-xs text-red-500">
                    {passwordErrors[field]?.message}
                  </p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={isPasswordSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              <Save size={16} />
              {isPasswordSubmitting ? "Updating..." : "Update Password"}
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Article Preferences</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose the topics you want to see in your personalized feed.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {categories
              .filter((category) => category.isActive)
              .map((category) => {
                const isSelected = selectedPreferences.includes(category.id);

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      setSelectedPreferences((preferences) =>
                        isSelected
                          ? preferences.filter((id) => id !== category.id)
                          : [...preferences, category.id],
                      )
                    }
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      isSelected
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-teal-500 hover:text-teal-600"
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
          </div>

          <button
            type="button"
            onClick={handlePreferencesSave}
            disabled={isSavingPreferences}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            <Save size={16} />
            {isSavingPreferences ? "Saving..." : "Save Preferences"}
          </button>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2 text-red-500">
              <Ban size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Blocked Articles</h2>
              <p className="text-sm text-slate-500">
                Articles you have hidden from your personalized feed.
              </p>
            </div>
          </div>

          {error && (
            <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </p>
          )}

          {!error && !blockedArticles.length && (
            <p className="py-12 text-center text-sm text-slate-500">
              You have no blocked articles.
            </p>
          )}

          {blockedArticles.length > 0 && (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {blockedArticles.map((article) => (
                <article
                  key={article.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <span className="text-xs font-semibold text-teal-600">
                    {article.category.name}
                  </span>
                  <h3 className="mt-2 text-lg font-bold">{article.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {article.description}
                  </p>
                  <p className="mt-4 text-xs text-slate-400">
                    By {article.author.firstName} {article.author.lastName}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleUnblock(article.id)}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                  >
                    <Unlock size={15} />
                    Unblock
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default Settings;
