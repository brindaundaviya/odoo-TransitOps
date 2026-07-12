import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-950 via-slate-900 to-brand-900 px-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            TO
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">TransitOps</h1>
          <p className="mt-1 text-sm text-slate-500">Smart Transport Operations Platform</p>
        </div>

        <div className="rounded-lg border border-dashed border-surface-border bg-surface-muted p-6 text-center">
          <p className="text-sm font-medium text-slate-700">Login</p>
          <p className="mt-1 text-sm text-slate-500">Authentication will be implemented in a future phase.</p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Continue to{' '}
          <Link to={ROUTES.DASHBOARD} className="font-medium text-brand-600 hover:text-brand-700">
            Dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
