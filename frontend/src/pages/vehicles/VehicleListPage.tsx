import { PageHeader } from '@/components/layout/PageHeader';

export default function VehicleListPage() {
  return (
    <div className="page-container">
      <PageHeader title="Vehicles" description="Fleet vehicle registry and status tracking." />
      <div className="rounded-xl border border-dashed border-surface-border bg-surface p-8 text-center shadow-card">
        <p className="text-sm font-medium text-slate-700">Vehicles module</p>
        <p className="mt-1 text-sm text-slate-500">Content will be implemented in a future phase.</p>
      </div>
    </div>
  );
}
