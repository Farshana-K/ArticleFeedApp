
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  ThumbsDown,
  ThumbsUp,
  Ban,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../hooks/redux.hooks";
import {
  fetchPersonalizedArticles,
  interactArticle,
} from "../../store/slices/articleSlice";
import { logoutUser } from "../../store/slices/authSlice";
import logo from "../../assets/logo.png";

function Dashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.auth);
  const { articles, isLoading, error } = useAppSelector(
    (state) => state.articles,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ARTICLES_PER_PAGE = 6;

  useEffect(() => {
    dispatch(fetchPersonalizedArticles());
  }, [dispatch]);

  const preferences = user?.preferences ?? [];

  /*
   * Filter articles based on:
   * 1. Article title
   * 2. Article category
   */
  const filteredArticles = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return articles;
    }

    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(search) ||
        article.category.name.toLowerCase().includes(search),
    );
  }, [articles, searchTerm]);

  /*
   * Calculate total number of pages.
   */
  const totalPages = Math.ceil(
    filteredArticles.length / ARTICLES_PER_PAGE,
  );

  /*
   * Get only the articles for the current page.
   */
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;

    return filteredArticles.slice(
      startIndex,
      startIndex + ARTICLES_PER_PAGE,
    );
  }, [filteredArticles, currentPage]);

  /*
   * Search handler.
   * Whenever the search changes, return to page 1.
   */
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleInteraction = async (
    articleId: string,
    interactionType: "like" | "dislike" | "block",
  ) => {
    const result = await dispatch(
      interactArticle({ articleId, interactionType }),
    );

    if (interactArticle.fulfilled.match(result)) {
      toast.success(
        interactionType === "like"
          ? "Article liked"
          : interactionType === "dislike"
            ? "Article disliked"
            : "Article blocked",
      );

      if (interactionType === "block") {
        dispatch(fetchPersonalizedArticles());
      }
    } else {
      toast.error("Failed to update article");
    }
  };

  const userInitial = user?.firstName?.charAt(0).toUpperCase() ?? "U";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-5 lg:px-8">
          <Link
            to="/dashboard"
            className="flex shrink-0 items-center"
          >
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

              <p className="text-xs text-slate-400">
                Account
              </p>
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

      {/* Main Content */}
      <section className="relative overflow-hidden">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-teal-100/60 blur-3xl" />

        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-cyan-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          {/* Welcome Section */}
          <div className="mb-10 max-w-3xl">
            <div className="mb-4 inline-flex items-center rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
              Your personalized feed
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Welcome back, {user?.firstName}
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-500">
              Discover stories selected around the topics and interests you
              care about.
            </p>
          </div>

          {/* User Preferences */}
          {preferences.length > 0 && (
            <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Your Interests
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your feed is personalized based on these categories.
                  </p>
                </div>

                <Link
                  to="/settings"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700"
                >
                  Edit Preferences
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {preferences.map((preference) => (
                  <span
                    key={preference.id}
                    className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700"
                  >
                    {preference.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Search Bar */}
          {!isLoading && !error && articles.length > 0 && (
            <div className="mb-8">
              <div className="relative max-w-xl">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    handleSearch(event.target.value)
                  }
                  placeholder="Search by article title or category..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => handleSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-slate-700"
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              {searchTerm && (
                <p className="mt-2 text-sm text-slate-500">
                  {filteredArticles.length} article
                  {filteredArticles.length !== 1 ? "s" : ""} found
                </p>
              )}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-sm text-slate-500">
                Loading your personalized articles...
              </p>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-600">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* No Articles */}
          {!isLoading && !error && !articles.length && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-slate-800">
                No articles yet
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Add more interests from Settings to personalize your feed.
              </p>

              <Link
                to="/settings"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                Update preferences
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* No Search Results */}
          {!isLoading &&
            !error &&
            articles.length > 0 &&
            filteredArticles.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <h2 className="text-xl font-semibold text-slate-800">
                  No articles found
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Try searching with a different title or category.
                </p>

                <button
                  type="button"
                  onClick={() => handleSearch("")}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  Clear search
                </button>
              </div>
            )}

          {/* Article Grid */}
          {!isLoading &&
            !error &&
            paginatedArticles.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedArticles.map((article) => (
                  <article
                    key={article.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Link
                      to={`/articles/${article.id}`}
                      className="block"
                    >
                      {/* Article Image */}
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

                      {/* Article Details */}
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

                        <div className="mt-5 border-t border-slate-100 pt-4">
                          <p className="text-xs text-slate-400">
                            Written by
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {article.author.firstName}{" "}
                            {article.author.lastName}
                          </p>
                        </div>
                      </div>
                    </Link>

                    {/* Article Actions */}
                    <div className="p-6 pt-5">
                      <div className="flex items-center gap-2">
                        {/* Like */}
                        <button
                          type="button"
                          onClick={() =>
                            handleInteraction(article.id, "like")
                          }
                          aria-label="Like article"
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                            article.userInteraction === "like"
                              ? "bg-teal-50 text-teal-600"
                              : "text-slate-500 hover:bg-teal-50 hover:text-teal-600"
                          }`}
                        >
                          <ThumbsUp
                            size={15}
                            className={
                              article.userInteraction === "like"
                                ? "fill-current"
                                : ""
                            }
                          />

                          {article.likeCount}
                        </button>

                        {/* Dislike */}
                        <button
                          type="button"
                          onClick={() =>
                            handleInteraction(article.id, "dislike")
                          }
                          aria-label="Dislike article"
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                            article.userInteraction === "dislike"
                              ? "bg-red-50 text-red-500"
                              : "text-slate-500 hover:bg-red-50 hover:text-red-500"
                          }`}
                        >
                          <ThumbsDown
                            size={15}
                            className={
                              article.userInteraction === "dislike"
                                ? "fill-current"
                                : ""
                            }
                          />

                          {article.dislikeCount}
                        </button>

                        {/* Block */}
                        <button
                          type="button"
                          onClick={() =>
                            handleInteraction(article.id, "block")
                          }
                          aria-label="Block article"
                          className="ml-auto rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Ban size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

          {/* Pagination */}
          {!isLoading &&
            !error &&
            totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                {/* Previous */}
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition ${
                      currentPage === page
                        ? "bg-teal-600 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next */}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}

          {/* Article Count */}
          {!isLoading &&
            !error &&
            filteredArticles.length > 0 && (
              <p className="mt-4 text-center text-xs text-slate-400">
                Showing{" "}
                {(currentPage - 1) * ARTICLES_PER_PAGE + 1}–
                {Math.min(
                  currentPage * ARTICLES_PER_PAGE,
                  filteredArticles.length,
                )}{" "}
                of {filteredArticles.length} articles
              </p>
            )}
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
