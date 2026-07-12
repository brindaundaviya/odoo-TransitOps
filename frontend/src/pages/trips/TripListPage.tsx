import { PageHeader } from '@/components/layout/PageHeader';

export default function TripListPage() {
  return (
    <div className="page-container">
      <PageHeader title="Trips" description="Trip planning, assignment, and lifecycle tracking." />
      <div className="rounded-xl border border-dashed border-surface-border bg-surface p-8 text-center shadow-card">
        <p className="text-sm font-medium text-slate-700">Trips module</p>
        <p className="mt-1 text-sm text-slate-500">Content will be implemented in a future phase.</p>
      </div>
    </div>
  );
}
