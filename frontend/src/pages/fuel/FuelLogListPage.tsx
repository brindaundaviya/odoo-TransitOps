import { PageHeader } from '@/components/layout/PageHeader';

export default function FuelLogListPage() {
  return (
    <div className="page-container">
      <PageHeader title="Fuel Logs" description="Fuel purchases and consumption tracking." />
      <div className="rounded-xl border border-dashed border-surface-border bg-surface p-8 text-center shadow-card">
        <p className="text-sm font-medium text-slate-700">Fuel Logs module</p>
        <p className="mt-1 text-sm text-slate-500">Content will be implemented in a future phase.</p>
      </div>
    </div>
  );
}
