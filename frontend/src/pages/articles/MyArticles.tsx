import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, LogOut, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import {
  fetchMyArticles,
  removeMyArticle,
} from '../../store/slices/articleSlice';
import { logoutUser } from '../../store/slices/authSlice';
import logo from '../../assets/logo.png';

function MyArticles() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { myArticles, isLoading, error } = useAppSelector(
    (state) => state.articles,
  );

  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchMyArticles());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const openDeleteModal = (articleId: string) => {
    setArticleToDelete(articleId);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setArticleToDelete(null);
  };

  const handleDelete = async () => {
    if (!articleToDelete) return;

    setIsDeleting(true);

    try {
      await dispatch(removeMyArticle(articleToDelete)).unwrap();
      toast.success('Article deleted successfully');
      setArticleToDelete(null);
    } catch {
      toast.error('Failed to delete article');
    } finally {
      setIsDeleting(false);
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
              className="relative shrink-0 py-5 text-xs font-semibold text-teal-600 sm:text-sm"
            >
              My Articles
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-teal-600" />
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

        <div className="relative mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-4 inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
                Your content
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                My Articles
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-500">
                Create, manage, and track the articles you have published.
              </p>
            </div>

            <Link
              to="/articles/create"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              <Plus size={17} />
              Create Article
            </Link>
          </div>

          {isLoading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-sm text-slate-500">
                Loading your articles...
              </p>
            </div>
          )}

          {error && !isLoading && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-600">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {!isLoading && !error && !myArticles.length && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-slate-800">
                No articles yet
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Create your first article and share it with the community.
              </p>

              <Link
                to="/articles/create"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                <Plus size={16} />
                Create your first article
              </Link>
            </div>
          )}

          {!isLoading && !error && myArticles.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myArticles.map((article) => (
                <article
                  key={article.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <Link to={`/articles/${article.id}`} className="block">
                    {article.images[0] ? (
                      <img
                        src={article.images[0]}
                        alt={article.title}
                        className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
                        <span className="text-sm font-medium text-teal-600">
                          {article.category.name}
                        </span>
                      </div>
                    )}

                    <div className="p-6 pb-0">
                      <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                        {article.category.name}
                      </span>

                      <h2 className="mt-4 line-clamp-2 text-xl font-bold text-slate-900">
                        {article.title}
                      </h2>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                        {article.description}
                      </p>

                      <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                        <span>👍 {article.likeCount}</span>
                        <span>👎 {article.dislikeCount}</span>
                        <span>🚫 {article.blockCount}</span>
                      </div>
                    </div>
                  </Link>

                  <div className="p-6 pt-5">
                    <div className="flex gap-2">
                      <Link
                        to={`/articles/edit/${article.id}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        <Edit size={15} />
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(article.id)}
                        aria-label="Delete article"
                        disabled={isDeleting}
                        className="rounded-lg border border-red-100 px-3 py-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {articleToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-article-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <Trash2 size={20} />
                </div>

                <h2
                  id="delete-article-title"
                  className="mt-5 text-xl font-bold text-slate-900"
                >
                  Delete Article?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to delete this article? This action
                  cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex min-w-32 items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Delete Article'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default MyArticles;

