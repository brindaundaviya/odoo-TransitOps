import { PageHeader } from '@/components/layout/PageHeader';

export default function AnalyticsPage() {
  return (
    <div className="page-container">
      <PageHeader
        title="Analytics"
        description="Fleet insights and trend visualizations powered by Recharts."
      />
      <div className="rounded-xl border border-dashed border-surface-border bg-surface p-8 text-center shadow-card">
        <p className="text-sm font-medium text-slate-700">Analytics module</p>
        <p className="mt-1 text-sm text-slate-500">
          Chart components will be implemented in a future phase.
        </p>
      </div>
    </div>
  );
}
