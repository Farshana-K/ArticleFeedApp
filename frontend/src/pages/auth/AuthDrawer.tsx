import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import { loginUser, registerUser } from '../../store/slices/authSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import {
  loginSchema,
  registerSchema,
} from '../../validators/auth.validator';
import type {
  LoginFormData,
  RegisterFormData,
} from '../../validators/auth.validator';
import logo from '../../assets/logo.png'

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function AuthDrawer({ isOpen, onClose }: AuthDrawerProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories.categories);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { preferences: [] },
  });

  const preferences = registerForm.watch('preferences');

  useEffect(() => {
    if (isOpen) dispatch(fetchCategories());
  }, [dispatch, isOpen]);

  function togglePreference(categoryId: string) {
    const updatedPreferences = preferences.includes(categoryId)
      ? preferences.filter((id) => id !== categoryId)
      : [...preferences, categoryId];

    registerForm.setValue('preferences', updatedPreferences, {
      shouldValidate: true,
    });
  }

  function switchMode(registering: boolean) {
    setIsRegistering(registering);
    loginForm.reset();
    registerForm.reset({ preferences: [] });
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  async function handleLogin(data: LoginFormData) {
    try {
      await dispatch(loginUser(data)).unwrap();
      toast.success('Login successful');
      loginForm.reset();
      onClose();
      navigate('/dashboard');
    } catch (error) {
      toast.error(String(error));
    }
  }

  async function handleRegister(data: RegisterFormData) {
    try {
      await dispatch(registerUser(data)).unwrap();
      toast.success('Account created successfully');
      registerForm.reset({ preferences: [] });
      setIsRegistering(false);
    } catch (error) {
      toast.error(String(error));
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm transition-opacity ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
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
            {isRegistering ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
            {isRegistering
                ? 'Join Article Feed and personalize your reading.'
                : 'Sign in to continue to Article Feed.'}
            </p>
        </div>
        </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close authentication"
          >
            <X size={20} />
          </button>
        </div>

        {!isRegistering ? (
          <form
            onSubmit={loginForm.handleSubmit(handleLogin)}
            className="space-y-5 p-6"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email or phone
              </label>
              <input
                {...loginForm.register('identifier')}
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
                  {...loginForm.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-16 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-teal-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
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
              {isLoading ? 'Signing in...' : 'Log in'}
            </button>

            <p className="text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode(true)}
                className="font-semibold text-teal-600 hover:text-teal-700"
              >
                Sign up
              </button>
            </p>
          </form>
        ) : (
          <form
            onSubmit={registerForm.handleSubmit(handleRegister)}
            className="space-y-4 p-6"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  {...registerForm.register('firstName')}
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
                  {...registerForm.register('lastName')}
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
                {...registerForm.register('phone')}
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
                {...registerForm.register('email')}
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
                {...registerForm.register('dateOfBirth')}
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
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                {...registerForm.register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-16 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-teal-600"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>

              {registerForm.formState.errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                {...registerForm.register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-16 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-teal-600"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
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
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
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

