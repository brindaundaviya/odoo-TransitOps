import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { loginSchema, type LoginSchema } from '@/schemas/auth.schema';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;
  const search = location.state?.from?.search || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      await login(data);
      navigate(from + search, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to connect to authentication server. Please try again.';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-lg shadow-brand-500/20 transform transition hover:scale-105 duration-200">
            TO
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white font-sans">
            TransitOps
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Smart Transport Operations Platform
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm border border-slate-100 shadow-2xl rounded-2xl px-8 py-10">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900 font-sans">Sign in</h3>
            <p className="text-sm text-slate-500 mt-1">Please enter your credentials to access your dashboard.</p>
          </div>

          {apiError && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-100">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{apiError}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={`block w-full rounded-xl border px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm ${
                    errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 font-medium" id="email-error">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                  className={`block w-full rounded-xl border px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm ${
                    errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 font-medium" id="password-error">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/10 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 font-sans"
              >
                {isSubmitting ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Signing In...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          <p>© 2026 TransitOps. All rights reserved.</p>
          <p className="mt-1 text-slate-400">Demo Account Credentials: admin@transitops.demo / Admin@12345</p>
        </div>
      </div>
    </div>
  );
}
