import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { driverService } from '@/services/api/driverService';
import { createDriverSchema } from '@/schemas';
import type { Driver, DriverStatus } from '@/types/models';
import type { UpdateDriverSchema } from '@/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/utils/cn';

const statusConfig: Record<DriverStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-800' },
  ON_LEAVE: { label: 'On Leave', color: 'bg-yellow-100 text-yellow-800' },
  SUSPENDED: { label: 'Suspended', color: 'bg-red-100 text-red-800' },
};

export default function DriverListPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Driver | null>(null);
  const [viewingDriver, setViewingDriver] = useState<Driver | null>(null);

  const form = useForm({
    resolver: zodResolver(createDriverSchema),
    defaultValues: {
      employeeId: '',
      firstName: '',
      lastName: '',
      licenseNumber: '',
      licenseClass: '',
      licenseExpiry: '',
      phone: '',
      status: 'ACTIVE',
      safetyScore: 100,
    },
  });

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await driverService.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      setDrivers(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchDrivers();
  }, [search, statusFilter, page]);

  const handleCreate = () => {
    setEditingDriver(null);
    form.reset({
      employeeId: '',
      firstName: '',
      lastName: '',
      licenseNumber: '',
      licenseClass: '',
      licenseExpiry: '',
      phone: '',
      status: 'ACTIVE',
      safetyScore: 100,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    form.reset({
      employeeId: driver.employeeId,
      firstName: driver.firstName,
      lastName: driver.lastName,
      licenseNumber: driver.licenseNumber,
      licenseClass: driver.licenseClass,
      licenseExpiry: driver.licenseExpiry,
      phone: driver.phone,
      status: driver.status,
      safetyScore: driver.safetyScore,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await driverService.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchDrivers();
    } catch (error) {
      console.error('Failed to delete driver:', error);
    }
  };

  const onSubmit = async (data: unknown) => {
    try {
      if (editingDriver) {
        await driverService.update(editingDriver.id, data as UpdateDriverSchema);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await driverService.create(data as any);
      }
      setIsDialogOpen(false);
      fetchDrivers();
    } catch (error: unknown) {
      console.error('Failed to save driver:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { errors?: Array<{ field: string; message: string }>; message?: string } } };
        if (err.response?.data?.errors) {
          err.response.data.errors.forEach((e) => {
            form.setError(e.field as 'employeeId' | 'firstName' | 'lastName' | 'licenseNumber' | 'licenseClass' | 'licenseExpiry' | 'phone' | 'status' | 'safetyScore', { message: e.message });
          });
        }
      }
    }
  };

  const isLicenseExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Drivers"
        description="Driver profiles, licenses, and assignments."
        actions={
          <button
            onClick={handleCreate}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Add Driver
          </button>
        }
      />

      <div className="rounded-xl border border-surface-border bg-surface shadow-card">
        <div className="border-b border-surface-border p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                placeholder="Search drivers..."
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
            </div>
            <div className="text-sm text-slate-500">
              {total} driver{total !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
            <p className="mt-2 text-sm text-slate-500">Loading drivers...</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">No drivers found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Employee ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">License</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">License Expiry</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Safety Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {drivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-surface-muted">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{driver.employeeId}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {driver.firstName} {driver.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{driver.licenseNumber}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <span className={cn(isLicenseExpired(driver.licenseExpiry) ? 'text-red-600 font-medium' : '')}>
                          {new Date(driver.licenseExpiry).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{driver.phone}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{driver.safetyScore}/100</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                            statusConfig[driver.status].color
                          )}
                        >
                          {statusConfig[driver.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setViewingDriver(driver)}
                            className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-surface-border"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(driver)}
                            className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-surface-border"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(driver)}
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
          <div className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingDriver ? 'Edit Driver' : 'Add Driver'}
            </h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Employee ID *</label>
                  <input
                    {...form.register('employeeId')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.employeeId && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.employeeId.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone *</label>
                  <input
                    {...form.register('phone')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.phone && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">First Name *</label>
                  <input
                    {...form.register('firstName')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Last Name *</label>
                  <input
                    {...form.register('lastName')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.lastName && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">License Number *</label>
                  <input
                    {...form.register('licenseNumber')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.licenseNumber && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.licenseNumber.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">License Class *</label>
                  <input
                    {...form.register('licenseClass')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.licenseClass && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.licenseClass.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">License Expiry *</label>
                  <input
                    type="date"
                    {...form.register('licenseExpiry')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.licenseExpiry && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.licenseExpiry.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Safety Score</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    {...form.register('safetyScore', { valueAsNumber: true })}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.safetyScore && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.safetyScore.message}</p>
                  )}
                </div>
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
                  {editingDriver ? 'Update' : 'Create'}
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
            <h2 className="text-lg font-semibold text-slate-900">Delete Driver</h2>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete driver {deleteConfirm.firstName} {deleteConfirm.lastName}? This action cannot be undone.
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
      {viewingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900">Driver Details</h2>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Employee ID</p>
                  <p className="text-sm font-medium text-slate-900">{viewingDriver.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Status</p>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                      statusConfig[viewingDriver.status].color
                    )}
                  >
                    {statusConfig[viewingDriver.status].label}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">First Name</p>
                  <p className="text-sm text-slate-900">{viewingDriver.firstName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Last Name</p>
                  <p className="text-sm text-slate-900">{viewingDriver.lastName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">License Number</p>
                  <p className="text-sm text-slate-900">{viewingDriver.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">License Class</p>
                  <p className="text-sm text-slate-900">{viewingDriver.licenseClass}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">License Expiry</p>
                  <p className={cn('text-sm', isLicenseExpired(viewingDriver.licenseExpiry) ? 'text-red-600 font-medium' : 'text-slate-900')}>
                    {new Date(viewingDriver.licenseExpiry).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Phone</p>
                  <p className="text-sm text-slate-900">{viewingDriver.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Safety Score</p>
                  <p className="text-sm text-slate-900">{viewingDriver.safetyScore}/100</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Trips</p>
                  <p className="text-sm text-slate-900">{viewingDriver._count?.trips || 0}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingDriver(null)}
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
