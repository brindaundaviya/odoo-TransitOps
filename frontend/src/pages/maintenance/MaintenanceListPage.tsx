import { PageHeader } from '@/components/layout/PageHeader';

export default function MaintenanceListPage() {
  return (
    <div className="page-container">
      <PageHeader title="Maintenance" description="Scheduled and unscheduled vehicle maintenance." />
      <div className="rounded-xl border border-dashed border-surface-border bg-surface p-8 text-center shadow-card">
        <p className="text-sm font-medium text-slate-700">Maintenance module</p>
        <p className="mt-1 text-sm text-slate-500">Content will be implemented in a future phase.</p>
      </div>
    </div>
  );
}
