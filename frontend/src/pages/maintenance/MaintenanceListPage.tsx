import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { maintenanceService } from '@/services/api/maintenanceService';
import { vehicleService } from '@/services/api/vehicleService';
import { createMaintenanceSchema } from '@/schemas';
import type { MaintenanceLog, MaintenanceStatus, MaintenanceType } from '@/types/models';
import type { UpdateMaintenanceSchema } from '@/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/utils/cn';

const statusConfig: Record<MaintenanceStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-slate-100 text-slate-800' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  OVERDUE: { label: 'Overdue', color: 'bg-red-100 text-red-800' },
};

const typeConfig: Record<MaintenanceType, { label: string }> = {
  SCHEDULED: { label: 'Scheduled' },
  REPAIR: { label: 'Repair' },
  INSPECTION: { label: 'Inspection' },
};

export default function MaintenanceListPage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Array<{ id: string; registrationNumber: string; make: string; model: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<MaintenanceLog | null>(null);
  const [viewingLog, setViewingLog] = useState<MaintenanceLog | null>(null);

  const form = useForm({
    resolver: zodResolver(createMaintenanceSchema),
    defaultValues: {
      vehicleId: '',
      type: 'SCHEDULED',
      description: '',
      scheduledDate: '',
      completedDate: '',
      cost: null,
      serviceProvider: '',
      status: 'PENDING',
      odometerAtService: null,
    },
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await maintenanceService.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        page,
        limit: 10,
      });
      setLogs(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Failed to fetch maintenance logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.getAll({ limit: 100 });
      setVehicles(response.data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchVehicles();
  }, [search, statusFilter, typeFilter, page]);

  const handleCreate = () => {
    setEditingLog(null);
    form.reset({
      vehicleId: '',
      type: 'SCHEDULED',
      description: '',
      scheduledDate: '',
      completedDate: '',
      cost: null,
      serviceProvider: '',
      status: 'PENDING',
      odometerAtService: null,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (log: MaintenanceLog) => {
    setEditingLog(log);
    form.reset({
      vehicleId: log.vehicleId,
      type: log.type,
      description: log.description,
      scheduledDate: log.scheduledDate,
      completedDate: log.completedDate || '',
      cost: log.cost || null,
      serviceProvider: log.serviceProvider || '',
      status: log.status,
      odometerAtService: log.odometerAtService || null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await maintenanceService.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchLogs();
    } catch (error) {
      console.error('Failed to delete maintenance log:', error);
    }
  };

  const handleComplete = async (log: MaintenanceLog) => {
    try {
      await maintenanceService.update(log.id, { status: 'COMPLETED', completedDate: new Date().toISOString() });
      fetchLogs();
    } catch (error: unknown) {
      console.error('Failed to complete maintenance:', error);
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Failed to complete maintenance');
    }
  };

  const onSubmit = async (data: unknown) => {
    try {
      if (editingLog) {
        await maintenanceService.update(editingLog.id, data as UpdateMaintenanceSchema);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await maintenanceService.create(data as any);
      }
      setIsDialogOpen(false);
      fetchLogs();
    } catch (error: unknown) {
      console.error('Failed to save maintenance log:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { errors?: Array<{ field: string; message: string }>; message?: string } } };
        if (err.response?.data?.errors) {
          err.response.data.errors.forEach((e) => {
            form.setError(e.field as 'vehicleId' | 'type' | 'description' | 'scheduledDate' | 'completedDate' | 'cost' | 'serviceProvider' | 'status' | 'odometerAtService', { message: e.message });
          });
        } else {
          alert(err.response?.data?.message || 'Failed to save maintenance log');
        }
      } else {
        alert('Failed to save maintenance log');
      }
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Maintenance"
        description="Scheduled and unscheduled vehicle maintenance."
        actions={
          <button
            onClick={handleCreate}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Add Maintenance
          </button>
        }
      />

      <div className="rounded-xl border border-surface-border bg-surface shadow-card">
        <div className="border-b border-surface-border p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                placeholder="Search maintenance..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Statuses</option>
                {Object.entries(statusConfig).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Types</option>
                {Object.entries(typeConfig).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-slate-500">
              {total} record{total !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
            <p className="mt-2 text-sm text-slate-500">Loading maintenance logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">No maintenance logs found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Vehicle</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Scheduled</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Completed</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-muted">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{log.vehicle?.registrationNumber}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{typeConfig[log.type].label}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{log.description}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{new Date(log.scheduledDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{log.completedDate ? new Date(log.completedDate).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{log.cost ? `$${log.cost}` : '-'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                            statusConfig[log.status].color
                          )}
                        >
                          {statusConfig[log.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setViewingLog(log)}
                            className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-surface-border"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(log)}
                            className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-surface-border"
                          >
                            Edit
                          </button>
                          {log.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleComplete(log)}
                              className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(log)}
                            className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="border-t border-surface-border p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-surface-border px-3 py-2 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg border border-surface-border px-3 py-2 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingLog ? 'Edit Maintenance' : 'Add Maintenance'}
            </h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Vehicle *</label>
                <select
                  {...form.register('vehicleId')}
                  className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registrationNumber} ({vehicle.make} {vehicle.model})
                    </option>
                  ))}
                </select>
                {form.formState.errors.vehicleId && (
                  <p className="mt-1 text-xs text-red-600">{form.formState.errors.vehicleId.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Type *</label>
                  <select
                    {...form.register('type')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {Object.entries(typeConfig).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.type && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.type.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Status</label>
                  <select
                    {...form.register('status')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {Object.entries(statusConfig).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.status && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.status.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description *</label>
                <textarea
                  {...form.register('description')}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {form.formState.errors.description && (
                  <p className="mt-1 text-xs text-red-600">{form.formState.errors.description.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Scheduled Date *</label>
                  <input
                    type="date"
                    {...form.register('scheduledDate')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.scheduledDate && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.scheduledDate.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Completed Date</label>
                  <input
                    type="date"
                    {...form.register('completedDate')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.completedDate && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.completedDate.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    {...form.register('cost', { valueAsNumber: true })}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.cost && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.cost.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Odometer at Service</label>
                  <input
                    type="number"
                    {...form.register('odometerAtService', { valueAsNumber: true })}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.odometerAtService && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.odometerAtService.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Service Provider</label>
                <input
                  {...form.register('serviceProvider')}
                  className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {form.formState.errors.serviceProvider && (
                  <p className="mt-1 text-xs text-red-600">{form.formState.errors.serviceProvider.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  {editingLog ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900">Delete Maintenance Log</h2>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete this maintenance log? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Dialog */}
      {viewingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-900">Maintenance Details</h2>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Vehicle</p>
                  <p className="text-sm font-medium text-slate-900">{viewingLog.vehicle?.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Type</p>
                  <p className="text-sm text-slate-900">{typeConfig[viewingLog.type].label}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Status</p>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                      statusConfig[viewingLog.status].color
                    )}
                  >
                    {statusConfig[viewingLog.status].label}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Cost</p>
                  <p className="text-sm text-slate-900">{viewingLog.cost ? `$${viewingLog.cost}` : '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Description</p>
                <p className="text-sm text-slate-900">{viewingLog.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Scheduled Date</p>
                  <p className="text-sm text-slate-900">{new Date(viewingLog.scheduledDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Completed Date</p>
                  <p className="text-sm text-slate-900">{viewingLog.completedDate ? new Date(viewingLog.completedDate).toLocaleDateString() : '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Service Provider</p>
                  <p className="text-sm text-slate-900">{viewingLog.serviceProvider || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Odometer at Service</p>
                  <p className="text-sm text-slate-900">{viewingLog.odometerAtService ? `${viewingLog.odometerAtService.toLocaleString()} km` : '-'}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingLog(null)}
                className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-surface-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
