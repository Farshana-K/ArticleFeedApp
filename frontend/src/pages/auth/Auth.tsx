import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../hooks/redux.hooks';
import { loginUser, registerUser } from '../../store/slices/authSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { loginSchema, registerSchema } from '../../validators/auth.validator';
import type {
  LoginFormData,
  RegisterFormData,
} from '../../validators/auth.validator';
import { getApiErrorMessage } from '../../utils/api-error.util';

function Auth() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const categories = useAppSelector((state) => state.categories.categories);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as never,
    defaultValues: {
      preferences: [],
    },
  });

  const preferences = registerForm.watch('preferences');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  function togglePreference(categoryId: string) {
    const updatedPreferences = preferences.includes(categoryId)
      ? preferences.filter((id) => id !== categoryId)
      : [...preferences, categoryId];

    registerForm.setValue('preferences', updatedPreferences);
  }

  async function handleLogin(data: LoginFormData) {
    try {
      await dispatch(loginUser(data)).unwrap();
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  async function handleRegister(data: RegisterFormData) {
    try {
      await dispatch(registerUser(data)).unwrap();
      toast.success('Account created successfully');
      setIsRegistering(false);
      registerForm.reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 px-4 py-12 sm:px-6 lg:px-8">
      <section className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-xl shadow-teal-900/5 ring-1 ring-slate-100">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Article Feed
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            {isRegistering
              ? 'Create an account to join the community'
              : 'Welcome back! Please enter your details'}
          </p>
        </div>

        {!isRegistering ? (
          <form
            onSubmit={loginForm.handleSubmit(handleLogin)}
            className="space-y-5"
          >
            <input
              {...loginForm.register('identifier')}
              placeholder="Email or phone"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10"
            />

            {loginForm.formState.errors.identifier && (
              <p className="text-sm text-red-500">
                {loginForm.formState.errors.identifier.message}
              </p>
            )}

            <div className="relative">
              <input
                {...loginForm.register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-14 text-sm focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10"
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
              <p className="text-sm text-red-500">
                {loginForm.formState.errors.password.message}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Log In
            </button>

            <p className="pt-4 text-center text-sm font-medium text-slate-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className="font-semibold text-teal-600 hover:text-teal-800 hover:underline"
              >
                Sign up
              </button>
            </p>
          </form>
        ) : (
          <form
            onSubmit={registerForm.handleSubmit(handleRegister)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <input
                {...registerForm.register('firstName')}
                placeholder="First name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
              />

              <input
                {...registerForm.register('lastName')}
                placeholder="Last name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
              />
            </div>

            <input
              {...registerForm.register('phone')}
              type="tel"
              placeholder="Phone number"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
            />

            <input
              {...registerForm.register('email')}
              type="email"
              placeholder="Email address"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
            />

            <div>
              <label
                htmlFor="dateOfBirth"
                className="mb-1 block text-sm font-medium text-slate-600"
              >
                Date of birth
              </label>

              <input
                id="dateOfBirth"
                {...registerForm.register('dateOfBirth')}
                type="date"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10"
              />
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
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-14 text-sm focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-teal-600"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {registerForm.formState.errors.password && (
              <p className="text-sm text-red-500">
                {registerForm.formState.errors.password.message}
              </p>
            )}

            <div className="relative">
              <input
                {...registerForm.register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-14 text-sm focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 hover:text-teal-600"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {registerForm.formState.errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {registerForm.formState.errors.confirmPassword.message}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Create Account
            </button>

            <p className="pt-4 text-center text-sm font-medium text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="font-semibold text-teal-600 hover:text-teal-800 hover:underline"
              >
                Log in
              </button>
            </p>
          </form>
        )}
      </section>
    </main>
  );
}

export default Auth;