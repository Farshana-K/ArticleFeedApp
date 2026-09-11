import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Ban,
  LogOut,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import { logoutUser } from '../../store/slices/authSlice';
import {
  getArticleById,
  interactWithArticle,
} from '../../services/article.service';
import type { Article } from '../../types/article.types';
import logo from '../../assets/logo.png';

function ArticleDetail() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { user } = useAppSelector((state) => state.auth);
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadArticle = async () => {
      try {
        const response = await getArticleById(id);
        setArticle(response.data.data.article as Article);
      } catch {
        toast.error('Failed to load article');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadArticle();
  }, [id, navigate]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleInteraction = async (
    interactionType: 'like' | 'dislike' | 'block',
  ) => {
    if (!id || !article) return;

    try {
      const response = await interactWithArticle(id, interactionType);
      const counts = response.data.data.counts;

      setArticle({
        ...article,
        ...counts,
        userInteraction: interactionType,
      });

      if (interactionType === 'block') {
        toast.success('Article blocked');
        navigate('/dashboard');
        return;
      }

      toast.success(
        interactionType === 'like' ? 'Article liked' : 'Article disliked',
      );
    } catch {
      toast.error('Failed to update article');
    }
  };

  const userInitial = user?.firstName?.charAt(0).toUpperCase() ?? 'U';

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-500">Loading article...</p>
        </div>
      </main>
    );
  }

  if (!article) return null;

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
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-teal-600"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <article className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {article.images.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2">
                {article.images.map((image) => (
                  <img
                    key={image}
                    src={image}
                    alt={article.title}
                    className="h-64 w-full object-cover"
                  />
                ))}
              </div>
            )}

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  {article.category.name}
                </span>

                <span className="text-sm text-slate-400">
                  By {article.author.firstName} {article.author.lastName}
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {article.title}
              </h1>

              <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-600">
                {article.description}
              </p>

              {article.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={() => handleInteraction('like')}
                  aria-label="Like article"
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    article.userInteraction === 'like'
                      ? 'bg-teal-50 text-teal-600'
                      : 'text-slate-500 hover:bg-teal-50 hover:text-teal-600'
                  }`}
                >
                  <ThumbsUp
                    size={16}
                    className={
                      article.userInteraction === 'like'
                        ? 'fill-current'
                        : ''
                    }
                  />
                  {article.likeCount}
                </button>

                <button
                  type="button"
                  onClick={() => handleInteraction('dislike')}
                  aria-label="Dislike article"
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    article.userInteraction === 'dislike'
                      ? 'bg-red-50 text-red-500'
                      : 'text-slate-500 hover:bg-red-50 hover:text-red-500'
                  }`}
                >
                  <ThumbsDown
                    size={16}
                    className={
                      article.userInteraction === 'dislike'
                        ? 'fill-current'
                        : ''
                    }
                  />
                  {article.dislikeCount}
                </button>

                <button
                  type="button"
                  onClick={() => handleInteraction('block')}
                  aria-label="Block article"
                  className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                >
                  <Ban size={16} />
                  Block
                </button>

                <span className="ml-2 text-xs text-slate-400">
                  {article.blockCount} blocks
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

export default ArticleDetail;