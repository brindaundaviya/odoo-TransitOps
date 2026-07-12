import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { fuelService } from '@/services/api/fuelService';
import { vehicleService } from '@/services/api/vehicleService';
import { driverService } from '@/services/api/driverService';
import { tripService } from '@/services/api/tripService';
import { createFuelSchema } from '@/schemas';
import type { FuelLog } from '@/types/models';
import type { UpdateFuelSchema } from '@/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function FuelLogListPage() {
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [vehicles, setVehicles] = useState<Array<{ id: string; registrationNumber: string; make: string; model: string }>>([]);
  const [drivers, setDrivers] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);
  const [trips, setTrips] = useState<Array<{ id: string; tripCode: string; origin: string; destination: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<FuelLog | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<FuelLog | null>(null);
  const [viewingLog, setViewingLog] = useState<FuelLog | null>(null);

  const form = useForm({
    resolver: zodResolver(createFuelSchema),
    defaultValues: {
      vehicleId: '',
      driverId: '',
      tripId: '',
      loggedAt: '',
      odometer: undefined,
      quantity: undefined,
      cost: undefined,
      fuelType: '',
      station: '',
    },
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fuelService.getAll({
        search: search || undefined,
        vehicleId: vehicleFilter || undefined,
        page,
        limit: 10,
      });
      setLogs(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Failed to fetch fuel logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [vehiclesRes, driversRes, tripsRes] = await Promise.all([
        vehicleService.getAll({ limit: 100 }),
        driverService.getAll({ limit: 100 }),
        tripService.getAll({ limit: 100 }),
      ]);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
      setTrips(tripsRes.data);
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchLogs();
    fetchDropdownData();
  }, [search, vehicleFilter, page]);

  const handleCreate = () => {
    setEditingLog(null);
    form.reset({
      vehicleId: '',
      driverId: '',
      tripId: '',
      loggedAt: '',
      odometer: undefined,
      quantity: undefined,
      cost: undefined,
      fuelType: '',
      station: '',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (log: FuelLog) => {
    setEditingLog(log);
    form.reset({
      vehicleId: log.vehicleId,
      driverId: log.driverId || '',
      tripId: log.tripId || '',
      loggedAt: log.loggedAt,
      odometer: log.odometer,
      quantity: log.quantity,
      cost: log.cost,
      fuelType: log.fuelType,
      station: log.station || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await fuelService.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchLogs();
    } catch (error) {
      console.error('Failed to delete fuel log:', error);
    }
  };

  const onSubmit = async (data: unknown) => {
    try {
      if (editingLog) {
        await fuelService.update(editingLog.id, data as UpdateFuelSchema);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await fuelService.create(data as any);
      }
      setIsDialogOpen(false);
      fetchLogs();
    } catch (error: unknown) {
      console.error('Failed to save fuel log:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { errors?: Array<{ field: string; message: string }>; message?: string } } };
        if (err.response?.data?.errors) {
          err.response.data.errors.forEach((e) => {
            form.setError(e.field as 'vehicleId' | 'driverId' | 'tripId' | 'loggedAt' | 'odometer' | 'fuelType' | 'quantity' | 'cost' | 'station', { message: e.message });
          });
        } else {
          alert(err.response?.data?.message || 'Failed to save fuel log');
        }
      } else {
        alert('Failed to save fuel log');
      }
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Fuel Logs"
        description="Fuel purchases and consumption tracking."
        actions={
          <button
            onClick={handleCreate}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Add Fuel Log
          </button>
        }
      />

      <div className="rounded-xl border border-surface-border bg-surface shadow-card">
        <div className="border-b border-surface-border p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                placeholder="Search fuel logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Vehicles</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.registrationNumber}
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
            <p className="mt-2 text-sm text-slate-500">Loading fuel logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">No fuel logs found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Vehicle</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Driver</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Odometer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Fuel Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Station</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-muted">
                      <td className="px-4 py-3 text-sm text-slate-600">{new Date(log.loggedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{log.vehicle?.registrationNumber}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{log.driver ? `${log.driver.firstName} ${log.driver.lastName}` : '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{log.odometer ? `${log.odometer.toLocaleString()} km` : '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{log.quantity || '-'} L</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{log.cost ? `$${log.cost}` : '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{log.fuelType || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{log.station || '-'}</td>
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
              {editingLog ? 'Edit Fuel Log' : 'Add Fuel Log'}
            </h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-slate-700">Date *</label>
                  <input
                    type="date"
                    {...form.register('loggedAt')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.loggedAt && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.loggedAt.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Driver</label>
                  <select
                    {...form.register('driverId')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Select Driver</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.firstName} {driver.lastName}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.driverId && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.driverId.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Trip</label>
                  <select
                    {...form.register('tripId')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Select Trip</option>
                    {trips.map((trip) => (
                      <option key={trip.id} value={trip.id}>
                        {trip.tripCode} ({trip.origin} → {trip.destination})
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.tripId && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.tripId.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Odometer (km) *</label>
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
                  <label className="block text-sm font-medium text-slate-700">Quantity (L) *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...form.register('quantity', { valueAsNumber: true })}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.quantity && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.quantity.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Total Cost *</label>
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
                  <label className="block text-sm font-medium text-slate-700">Fuel Type *</label>
                  <input
                    {...form.register('fuelType')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.fuelType && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.fuelType.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Station</label>
                <input
                  {...form.register('station')}
                  className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {form.formState.errors.station && (
                  <p className="mt-1 text-xs text-red-600">{form.formState.errors.station.message}</p>
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
            <h2 className="text-lg font-semibold text-slate-900">Delete Fuel Log</h2>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete this fuel log? This action cannot be undone.
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
            <h2 className="text-lg font-semibold text-slate-900">Fuel Log Details</h2>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Date</p>
                  <p className="text-sm text-slate-900">{new Date(viewingLog.loggedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Vehicle</p>
                  <p className="text-sm font-medium text-slate-900">{viewingLog.vehicle?.registrationNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Driver</p>
                  <p className="text-sm text-slate-900">{viewingLog.driver ? `${viewingLog.driver.firstName} ${viewingLog.driver.lastName}` : '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Trip</p>
                  <p className="text-sm text-slate-900">{viewingLog.trip?.tripCode || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Odometer</p>
                  <p className="text-sm text-slate-900">{viewingLog.odometer ? `${viewingLog.odometer.toLocaleString()} km` : '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Quantity</p>
                  <p className="text-sm text-slate-900">{viewingLog.quantity || '-'} L</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Cost</p>
                  <p className="text-sm text-slate-900">{viewingLog.cost ? `$${viewingLog.cost}` : '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Fuel Type</p>
                  <p className="text-sm text-slate-900">{viewingLog.fuelType || '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Station</p>
                <p className="text-sm text-slate-900">{viewingLog.station || '-'}</p>
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
