import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, Routes } from 'react-router-dom';

import Home from './pages/home/Home';
import Dashboard from './pages/dashboard/Dashboard';
import Settings from './pages/settings/Settings';
import MyArticles from './pages/articles/MyArticles';
import CreateArticle from './pages/articles/CreateArticle';
import EditArticle from './pages/articles/EditArticle';
import ArticleDetail from './pages/articles/ArticleDetail';

import {
  useAppDispatch,
  useAppSelector,
} from './hooks/redux.hooks';

import { fetchCurrentUser } from './store/slices/authSlice';

function App() {
  const dispatch = useAppDispatch();

  const { isInitializing } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (isInitializing) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/articles/create" element={<CreateArticle />} />
        <Route path="/articles/my" element={<MyArticles />} />
        <Route path="/articles/edit/:id" element={<EditArticle />} />
        <Route path="/articles/:id" element={<ArticleDetail />} />
      </Routes>
    </>
  );
}

export default App;