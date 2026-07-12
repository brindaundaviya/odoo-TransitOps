import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { vehicleService } from '@/services/api/vehicleService';
import { createVehicleSchema } from '@/schemas';
import type { Vehicle, VehicleStatus } from '@/types/models';
import type { UpdateVehicleSchema } from '@/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/utils/cn';

const statusConfig: Record<VehicleStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Available', color: 'bg-green-100 text-green-800' },
  MAINTENANCE: { label: 'In Shop', color: 'bg-yellow-100 text-yellow-800' },
  RETIRED: { label: 'Retired', color: 'bg-red-100 text-red-800' },
};

export default function VehicleListPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Vehicle | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);

  const form = useForm({
    resolver: zodResolver(createVehicleSchema),
    defaultValues: {
      registrationNumber: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      vin: '',
      fuelType: '',
      capacity: null,
      odometer: 0,
      status: 'ACTIVE',
    },
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      setVehicles(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search, statusFilter, page]);

  const handleCreate = () => {
    setEditingVehicle(null);
    form.reset({
      registrationNumber: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      vin: '',
      fuelType: '',
      capacity: null,
      odometer: 0,
      status: 'ACTIVE',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.reset({
      registrationNumber: vehicle.registrationNumber,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin || '',
      fuelType: vehicle.fuelType,
      capacity: vehicle.capacity,
      odometer: vehicle.odometer,
      status: vehicle.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await vehicleService.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchVehicles();
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
    }
  };

  const onSubmit = async (data: unknown) => {
    try {
      if (editingVehicle) {
        await vehicleService.update(editingVehicle.id, data as UpdateVehicleSchema);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await vehicleService.create(data as any);
      }
      setIsDialogOpen(false);
      fetchVehicles();
    } catch (error: unknown) {
      console.error('Failed to save vehicle:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { errors?: Array<{ field: string; message: string }>; message?: string } } };
        if (err.response?.data?.errors) {
          err.response.data.errors.forEach((e) => {
            form.setError(e.field as 'registrationNumber' | 'make' | 'model' | 'year' | 'vin' | 'fuelType' | 'capacity' | 'odometer' | 'status', { message: e.message });
          });
        }
      }
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Vehicles"
        description="Fleet vehicle registry and status tracking."
        actions={
          <button
            onClick={handleCreate}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Add Vehicle
          </button>
        }
      />

      <div className="rounded-xl border border-surface-border bg-surface shadow-card">
        <div className="border-b border-surface-border p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                placeholder="Search vehicles..."
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
              {total} vehicle{total !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
            <p className="mt-2 text-sm text-slate-500">Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">No vehicles found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Registration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Make/Model</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Year</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Fuel Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Capacity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Odometer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-surface-muted">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{vehicle.registrationNumber}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {vehicle.make} {vehicle.model}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{vehicle.year}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{vehicle.fuelType}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{vehicle.capacity || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{vehicle.odometer.toLocaleString()} km</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                            statusConfig[vehicle.status].color
                          )}
                        >
                          {statusConfig[vehicle.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setViewingVehicle(vehicle)}
                            className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-surface-border"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(vehicle)}
                            className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-surface-border"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(vehicle)}
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
              {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
            </h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Registration Number *</label>
                <input
                  {...form.register('registrationNumber')}
                  className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {form.formState.errors.registrationNumber && (
                  <p className="mt-1 text-xs text-red-600">{form.formState.errors.registrationNumber.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Make *</label>
                  <input
                    {...form.register('make')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.make && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.make.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Model *</label>
                  <input
                    {...form.register('model')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.model && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.model.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Year *</label>
                  <input
                    type="number"
                    {...form.register('year', { valueAsNumber: true })}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.year && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.year.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">VIN</label>
                  <input
                    {...form.register('vin')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.vin && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.vin.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Fuel Type *</label>
                  <input
                    {...form.register('fuelType')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.fuelType && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.fuelType.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Capacity (kg)</label>
                  <input
                    type="number"
                    {...form.register('capacity', { valueAsNumber: true })}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.capacity && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.capacity.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Odometer (km)</label>
                  <input
                    type="number"
                    {...form.register('odometer', { valueAsNumber: true })}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.odometer && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.odometer.message}</p>
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
                  {editingVehicle ? 'Update' : 'Create'}
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
            <h2 className="text-lg font-semibold text-slate-900">Delete Vehicle</h2>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete vehicle {deleteConfirm.registrationNumber}? This action cannot be undone.
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
      {viewingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900">Vehicle Details</h2>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Registration</p>
                  <p className="text-sm font-medium text-slate-900">{viewingVehicle.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Status</p>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                      statusConfig[viewingVehicle.status].color
                    )}
                  >
                    {statusConfig[viewingVehicle.status].label}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Make</p>
                  <p className="text-sm text-slate-900">{viewingVehicle.make}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Model</p>
                  <p className="text-sm text-slate-900">{viewingVehicle.model}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Year</p>
                  <p className="text-sm text-slate-900">{viewingVehicle.year}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">VIN</p>
                  <p className="text-sm text-slate-900">{viewingVehicle.vin || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Fuel Type</p>
                  <p className="text-sm text-slate-900">{viewingVehicle.fuelType}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Capacity</p>
                  <p className="text-sm text-slate-900">{viewingVehicle.capacity ? `${viewingVehicle.capacity} kg` : '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Odometer</p>
                  <p className="text-sm text-slate-900">{viewingVehicle.odometer.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Trips</p>
                  <p className="text-sm text-slate-900">{viewingVehicle._count?.trips || 0}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingVehicle(null)}
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
