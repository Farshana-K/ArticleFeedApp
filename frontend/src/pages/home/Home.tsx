import { ArrowRight, BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import AuthDrawer from '../auth/AuthDrawer';
import logo from '../../assets/logo.png'

function Home() {
  const categories = [
    'Technology',
    'Sports',
    'Politics',
    'Science',
    'Business',
    'Entertainment',
  ];

  const [isAuthOpen, setIsAuthOpen] = useState(false);


  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 lg:px-12">
        <div className="flex items-center gap-3">
        <img
            src={logo}
            alt="Article Feed"
            className="h-15 w-auto object-contain"
        />
        <span className="text-xl font-bold tracking-tight text-slate-900">
            Article Feed
        </span>
        </div>

        <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#categories" className="hover:text-teal-600">
            Categories
          </a>
          <a href="#features" className="hover:text-teal-600">
            Features
          </a>
          <a href="#about" className="hover:text-teal-600">
            About
          </a>
        </div>

        <button type="button"
                onClick={() => setIsAuthOpen(true)}
                className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                Log in
        </button>
      </nav>

      <section className="relative overflow-hidden bg-white px-6 py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
              <Sparkles size={16} />
              Personalized reading starts here
            </div>

            <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Discover stories
              <span className="block text-teal-600">that matter to you.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-500">
              Explore articles from different categories, follow your interests,
              and build a personalized feed around the topics you care about.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                Get started
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-600"
              >
                Explore articles
              </button>
            </div>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <BookOpen className="text-teal-600" size={28} />
              <h3 className="mt-4 font-bold">Read what you love</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose your interests and get relevant articles in your feed.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <Sparkles className="text-teal-600" size={28} />
              <h3 className="mt-4 font-bold">Personalized experience</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your preferences shape the content you discover every day.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <TrendingUp className="text-teal-600" size={28} />
              <h3 className="mt-4 font-bold">Share your stories</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create, publish, and manage your own articles with ease.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">
            Explore
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Explore by interest
          </h2>

          <div className="mt-8 flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-slate-900 px-6 py-16 text-white lg:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-400">
            Why Article Feed?
          </p>

          <h2 className="mt-3 max-w-2xl text-3xl font-bold">
            One place for the stories and ideas you care about.
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="font-semibold">Personalized Feed</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Your selected interests determine the articles you discover.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Create & Share</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Publish your own articles and share your ideas with others.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Stay Connected</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Like, dislike, or block articles to shape your experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer id="about" className="border-t border-slate-200 bg-white px-6 py-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 text-sm text-slate-500 sm:flex-row">
          <p>© 2026 Article Feed. All rights reserved.</p>
          <p>Discover. Read. Share.</p>
        </div>
      </footer>

      <AuthDrawer
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
       />
    
    </main>
  );
}

export default Home;

