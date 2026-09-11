import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import { fetchCategories } from '../../store/slices/categorySlice';
import { logoutUser } from '../../store/slices/authSlice';
import logo from '../../assets/logo.png';
import {
  createArticleSchema,
  type CreateArticleFormData,
} from '../../validators/article.validator';
import { createArticle, uploadArticleImages } from '../../services/article.service';

function CreateArticle() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { categories, isLoading: categoriesLoading } = useAppSelector(
    (state) => state.categories,
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateArticleFormData>({
    resolver: zodResolver(createArticleSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      tags: '',
      images: [],
    },
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/');
  };

const handleCreateArticle = async (data: CreateArticleFormData) => {
  try {
    const imageUrls = data.images.length
      ? ((await uploadArticleImages(data.images)).data.data.urls as string[])
      : [];

    await createArticle({
      title: data.title,
      description: data.description,
      category: data.category,
      tags: data.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      images: imageUrls,
    });

    toast.success('Article created successfully');
    navigate('/articles/my');
  } catch {
    toast.error('Failed to create article');
  }
};

  const userInitial = user?.firstName?.charAt(0).toUpperCase() ?? 'U';

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-5 lg:px-8">
            <Link to="/dashboard" className="flex shrink-0 items-center">
            <img
                src={logo}
                alt="Article Feed"
                className="h-12 object-contain sm:h-15"
            />
            </Link>

            <nav className="flex min-w-0 flex-1 items-center justify-end gap-3 overflow-x-auto sm:gap-6 md:gap-8">
            <Link
                to="/dashboard"
                className="shrink-0 py-5 text-xs font-medium text-slate-500 transition hover:text-slate-900 sm:text-sm"
            >
                Dashboard
            </Link>

            <Link
                to="/articles/my"
                className="shrink-0 py-5 text-xs font-medium text-slate-500 transition hover:text-slate-900 sm:text-sm"
            >
                My Articles
            </Link>

            <Link
                to="/settings"
                className="shrink-0 py-5 text-xs font-medium text-slate-500 transition hover:text-slate-900 sm:text-sm"
            >
                Settings
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
                title="Logout"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
            >
                <LogOut size={18} />
            </button>
            </div>
        </div>
        </header>

      <section className="relative overflow-hidden">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-teal-100/60 blur-3xl" />
        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-cyan-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
          <Link
            to="/articles/my"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-teal-600"
          >
            <ArrowLeft size={16} />
            Back to My Articles
          </Link>

          <div className="mb-8 mt-6">
            <div className="mb-4 inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
              Share your story
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Create Article
            </h1>

            <p className="mt-3 text-lg leading-8 text-slate-500">
              Write and publish an article for the Article Feed community.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(handleCreateArticle)}
            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div>
              <label
                htmlFor="title"
                className="text-sm font-semibold text-slate-700"
              >
                Article Title
              </label>

              <input
                id="title"
                type="text"
                placeholder="Enter your article title"
                {...register('title')}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />

              {errors.title && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-sm font-semibold text-slate-700"
              >
                Description
              </label>

              <textarea
                id="description"
                rows={7}
                placeholder="Write your article description..."
                {...register('description')}
                className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />

              {errors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="category"
                className="text-sm font-semibold text-slate-700"
              >
                Category
              </label>

              <select
                id="category"
                disabled={categoriesLoading}
                {...register('category')}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
                <option value="">
                  {categoriesLoading
                    ? 'Loading categories...'
                    : 'Select a category'}
                </option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {errors.category && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="tags"
                className="text-sm font-semibold text-slate-700"
              >
                Tags
              </label>

              <input
                id="tags"
                type="text"
                placeholder="cricket, india, sports"
                {...register('tags')}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Separate multiple tags with commas.
              </p>
            </div>

            <div>
              <label
                htmlFor="images"
                className="text-sm font-semibold text-slate-700"
              >
                Images
              </label>

              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) =>
                  setValue('images', Array.from(event.target.files ?? []), {
                    shouldValidate: true,
                  })
                }
                className="mt-2 block w-full rounded-lg border border-slate-200 bg-white text-sm text-slate-500 file:mr-4 file:border-0 file:bg-teal-50 file:px-4 file:py-3 file:font-medium file:text-teal-700"
              />

              {errors.images && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.images.message}
                </p>
              )}

              <p className="mt-2 text-xs text-slate-400">
                You can upload up to 5 images.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
              <Link
                to="/articles/my"
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                Publish Article
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default CreateArticle;

