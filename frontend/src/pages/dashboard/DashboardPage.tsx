import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { dashboardService } from '@/services/api/dashboardService';
import type {
  DashboardKPIs,
  FleetUtilizationData,
  FuelConsumptionData,
  MonthlyExpenseData,
  TripDistributionData,
} from '@/services/api/dashboardService';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/* ──────────────────────────── KPI Card ──────────────────────────── */

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  trend?: string;
}

const KPICard = ({ title, value, icon, gradient, trend }: KPICardProps) => (
  <div className="group relative overflow-hidden rounded-2xl border border-surface-border bg-surface p-5 shadow-card transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
    {/* Decorative gradient accent */}
    <div className={`absolute inset-x-0 top-0 h-1 ${gradient}`} />
    <div className="flex items-start justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
        {trend && (
          <p className="mt-1.5 text-xs font-medium text-slate-500">{trend}</p>
        )}
      </div>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </div>
    </div>
  </div>
);

/* ──────────────────────── Chart Wrapper ─────────────────────────── */

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isEmpty?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

const ChartCard = ({ title, subtitle, children, isEmpty, isLoading, error }: ChartCardProps) => (
  <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card">
    <div className="mb-5">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
    </div>
    {isLoading ? (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    ) : error ? (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
        <svg className="h-10 w-10 text-red-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <p className="text-sm font-medium text-red-500">Failed to load data</p>
        <p className="text-xs text-slate-400">{error}</p>
      </div>
    ) : isEmpty ? (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
        <svg className="h-10 w-10 text-slate-200" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
        </svg>
        <p className="text-sm font-medium text-slate-400">No data available</p>
        <p className="text-xs text-slate-300">Data will appear once records are added.</p>
      </div>
    ) : (
      children
    )}
  </div>
);

/* ────────────────────── Skeleton Loaders ─────────────────────────── */

const KPICardSkeleton = () => (
  <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface p-5 shadow-card">
    <div className="absolute inset-x-0 top-0 h-1 animate-pulse bg-slate-200" />
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-200" />
    </div>
  </div>
);

/* ──────────────────────── SVG Icons ──────────────────────────────── */

const TruckIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-1.125V9m0 0h6.375a1.125 1.125 0 0 1 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H12.75M9.75 9v3.375M9.75 9H3.375A1.125 1.125 0 0 0 2.25 10.125v4.5" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const WrenchIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const UserGroupIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);

const ChartBarIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

/* ───────────────── Custom Tooltip for Charts ─────────────────────── */

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      <p className="mb-1 text-xs font-semibold text-slate-600">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ──────────────────────── Dashboard Page ──────────────────────────── */

export default function DashboardPage() {
  const [kpis, setKPIs] = useState<DashboardKPIs | null>(null);
  const [fleetData, setFleetData] = useState<FleetUtilizationData[] | null>(null);
  const [fuelData, setFuelData] = useState<FuelConsumptionData[] | null>(null);
  const [expenseData, setExpenseData] = useState<MonthlyExpenseData[] | null>(null);
  const [tripData, setTripData] = useState<TripDistributionData[] | null>(null);

  const [kpiLoading, setKpiLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);

  const [kpiError, setKpiError] = useState<string | null>(null);
  const [fleetError, setFleetError] = useState<string | null>(null);
  const [fuelError, setFuelError] = useState<string | null>(null);
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [tripError, setTripError] = useState<string | null>(null);

  const fetchKPIs = useCallback(async () => {
    try {
      setKpiLoading(true);
      setKpiError(null);
      const data = await dashboardService.getKPIs();
      setKPIs(data);
    } catch (err) {
      setKpiError(err instanceof Error ? err.message : 'Unable to load KPIs');
    } finally {
      setKpiLoading(false);
    }
  }, []);

  const fetchCharts = useCallback(async () => {
    setChartsLoading(true);

    // Fetch all chart data in parallel — each independently handles errors
    const results = await Promise.allSettled([
      dashboardService.getFleetUtilization(),
      dashboardService.getFuelConsumption(),
      dashboardService.getMonthlyExpenses(),
      dashboardService.getTripDistribution(),
    ]);

    if (results[0].status === 'fulfilled') setFleetData(results[0].value);
    else setFleetError(results[0].reason?.message ?? 'Failed');

    if (results[1].status === 'fulfilled') setFuelData(results[1].value);
    else setFuelError(results[1].reason?.message ?? 'Failed');

    if (results[2].status === 'fulfilled') setExpenseData(results[2].value);
    else setExpenseError(results[2].reason?.message ?? 'Failed');

    if (results[3].status === 'fulfilled') setTripData(results[3].value);
    else setTripError(results[3].reason?.message ?? 'Failed');

    setChartsLoading(false);
  }, []);

  useEffect(() => {
    fetchKPIs();
    fetchCharts();
  }, [fetchKPIs, fetchCharts]);

  const isFleetEmpty = fleetData?.every((d) => d.utilization === 0) ?? true;
  const isFuelEmpty = fuelData?.every((d) => d.totalLiters === 0 && d.totalCost === 0) ?? true;
  const isExpenseEmpty = expenseData?.every((d) => d.total === 0) ?? true;
  const isTripEmpty = tripData?.every((d) => d.count === 0) ?? true;

  return (
    <div className="page-container">
      <PageHeader
        title="Dashboard"
        description="Real-time operational overview and fleet performance metrics."
      />

      {/* ── KPI Error Banner ── */}
      {kpiError && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <svg className="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Unable to load KPIs</p>
            <p className="text-xs text-red-600">{kpiError}</p>
          </div>
          <button
            onClick={fetchKPIs}
            className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {kpiLoading ? (
          Array.from({ length: 7 }).map((_, i) => <KPICardSkeleton key={i} />)
        ) : kpis ? (
          <>
            <KPICard
              title="Active Vehicles"
              value={kpis.activeVehicles}
              icon={<TruckIcon />}
              gradient="bg-gradient-to-r from-blue-500 to-blue-600"
              trend="Currently on trips"
            />
            <KPICard
              title="Available Vehicles"
              value={kpis.availableVehicles}
              icon={<CheckCircleIcon />}
              gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
              trend="Ready for dispatch"
            />
            <KPICard
              title="In Maintenance"
              value={kpis.vehiclesInMaintenance}
              icon={<WrenchIcon />}
              gradient="bg-gradient-to-r from-amber-500 to-orange-500"
              trend="Under service"
            />
            <KPICard
              title="Active Trips"
              value={kpis.activeTrips}
              icon={<MapPinIcon />}
              gradient="bg-gradient-to-r from-violet-500 to-purple-600"
              trend="In progress now"
            />
            <KPICard
              title="Pending Trips"
              value={kpis.pendingTrips}
              icon={<ClockIcon />}
              gradient="bg-gradient-to-r from-yellow-500 to-amber-500"
              trend="Scheduled"
            />
            <KPICard
              title="Drivers On Duty"
              value={kpis.driversOnDuty}
              icon={<UserGroupIcon />}
              gradient="bg-gradient-to-r from-indigo-500 to-indigo-600"
              trend="Active drivers"
            />
            <KPICard
              title="Fleet Utilization"
              value={`${kpis.fleetUtilization}%`}
              icon={<ChartBarIcon />}
              gradient="bg-gradient-to-r from-teal-500 to-cyan-500"
              trend="Vehicle usage rate"
            />
          </>
        ) : null}
      </div>

      {/* ── Charts ── */}
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Fleet Utilization Area Chart */}
        <ChartCard
          title="Fleet Utilization"
          subtitle="Vehicle usage rate over the last 6 months"
          isLoading={chartsLoading}
          error={fleetError}
          isEmpty={isFleetEmpty}
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={fleetData ?? []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="fleetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="utilization"
                name="Utilization"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#fleetGrad)"
                dot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Fuel Consumption Bar + Line Chart */}
        <ChartCard
          title="Fuel Consumption"
          subtitle="Monthly fuel usage and cost over 6 months"
          isLoading={chartsLoading}
          error={fuelError}
          isEmpty={isFuelEmpty}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={fuelData ?? []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar yAxisId="left" dataKey="totalLiters" name="Liters" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={28} />
              <Line yAxisId="right" type="monotone" dataKey="totalCost" name="Cost ($)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Monthly Expenses Stacked Bar Chart */}
        <ChartCard
          title="Monthly Expenses"
          subtitle="Expense breakdown by category over 6 months"
          isLoading={chartsLoading}
          error={expenseError}
          isEmpty={isExpenseEmpty}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={expenseData ?? []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="fuel" name="Fuel" stackId="expenses" fill="#3b82f6" />
              <Bar dataKey="maintenance" name="Maintenance" stackId="expenses" fill="#f59e0b" />
              <Bar dataKey="toll" name="Toll" stackId="expenses" fill="#10b981" />
              <Bar dataKey="insurance" name="Insurance" stackId="expenses" fill="#8b5cf6" />
              <Bar dataKey="fine" name="Fine" stackId="expenses" fill="#ef4444" />
              <Bar dataKey="misc" name="Misc" stackId="expenses" fill="#6b7280" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Trip Distribution Pie Chart */}
        <ChartCard
          title="Trip Distribution"
          subtitle="Current trip status breakdown"
          isLoading={chartsLoading}
          error={tripError}
          isEmpty={isTripEmpty}
        >
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={(tripData ?? []).filter((d) => d.count > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="status"
                  stroke="none"
                  label={({ status, percent }: { status: string; percent: number }) =>
                    `${status} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {(tripData ?? []).filter((d) => d.count > 0).map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [value, name]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── Footer Timestamp ── */}
      <div className="mt-6 flex items-center justify-end">
        <p className="text-xs text-slate-400">
          Last refreshed: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}
