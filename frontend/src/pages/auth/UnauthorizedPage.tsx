import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4">
      <div className="max-w-md rounded-xl bg-surface p-8 text-center shadow-card">
        <p className="text-5xl font-bold text-slate-300">403</p>
        <h1 className="mt-4 text-xl font-semibold text-slate-900">Unauthorized</h1>
        <p className="mt-2 text-sm text-slate-500">
          You do not have permission to access this resource.
        </p>
        <Link
          to={ROUTES.DASHBOARD}
          className="mt-6 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
