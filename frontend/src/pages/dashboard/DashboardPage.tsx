import { PageHeader } from '@/components/layout/PageHeader';

const PlaceholderSection = ({ module }: { module: string }) => (
  <div className="rounded-xl border border-dashed border-surface-border bg-surface p-8 text-center shadow-card">
    <p className="text-sm font-medium text-slate-700">{module} module</p>
    <p className="mt-1 text-sm text-slate-500">Content will be implemented in a future phase.</p>
  </div>
);

export default function DashboardPage() {
  return (
    <div className="page-container">
      <PageHeader
        title="Dashboard"
        description="Operational overview and fleet KPIs will appear here."
      />
      <PlaceholderSection module="Dashboard" />
    </div>
  );
}
