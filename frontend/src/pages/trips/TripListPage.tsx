import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { tripService } from '@/services/api/tripService';
import { vehicleService } from '@/services/api/vehicleService';
import { driverService } from '@/services/api/driverService';
import { createTripSchema } from '@/schemas';
import type { Trip, TripStatus } from '@/types/models';
import type { UpdateTripSchema } from '@/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/utils/cn';

const statusConfig: Record<TripStatus, { label: string; color: string }> = {
  SCHEDULED: { label: 'Draft', color: 'bg-slate-100 text-slate-800' },
  IN_PROGRESS: { label: 'Dispatched', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export default function TripListPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Array<{ id: string; registrationNumber: string; make: string; model: string; status: string }>>([]);
  const [drivers, setDrivers] = useState<Array<{ id: string; firstName: string; lastName: string; licenseNumber: string; status: string; licenseExpiry: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Trip | null>(null);
  const [viewingTrip, setViewingTrip] = useState<Trip | null>(null);

  const form = useForm({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      tripCode: '',
      origin: '',
      destination: '',
      scheduledStart: '',
      scheduledEnd: '',
      driverId: '',
      vehicleId: '',
      status: 'SCHEDULED',
      distanceKm: null,
      cargoWeight: null,
    },
  });

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripService.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      setTrips(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehiclesAndDrivers = async () => {
    try {
      const [vehiclesRes, driversRes] = await Promise.all([
        vehicleService.getAll({ limit: 100 }),
        driverService.getAll({ limit: 100 }),
      ]);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
    } catch (error) {
      console.error('Failed to fetch vehicles/drivers:', error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTrips();
    fetchVehiclesAndDrivers();
  }, [search, statusFilter, page]);

  const handleCreate = () => {
    setEditingTrip(null);
    form.reset({
      tripCode: '',
      origin: '',
      destination: '',
      scheduledStart: '',
      scheduledEnd: '',
      driverId: '',
      vehicleId: '',
      status: 'SCHEDULED',
      distanceKm: null,
      cargoWeight: null,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip);
    form.reset({
      tripCode: trip.tripCode,
      origin: trip.origin,
      destination: trip.destination,
      scheduledStart: trip.scheduledStart,
      scheduledEnd: trip.scheduledEnd,
      driverId: trip.driverId,
      vehicleId: trip.vehicleId,
      status: trip.status,
      distanceKm: trip.distanceKm || null,
      cargoWeight: trip.cargoWeight || null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await tripService.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchTrips();
    } catch (error) {
      console.error('Failed to delete trip:', error);
    }
  };

  const handleDispatch = async (trip: Trip) => {
    try {
      await tripService.update(trip.id, { status: 'IN_PROGRESS' });
      fetchTrips();
    } catch (error: unknown) {
      console.error('Failed to dispatch trip:', error);
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Failed to dispatch trip');
    }
  };

  const handleComplete = async (trip: Trip) => {
    try {
      await tripService.update(trip.id, { status: 'COMPLETED' });
      fetchTrips();
    } catch (error: unknown) {
      console.error('Failed to complete trip:', error);
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Failed to complete trip');
    }
  };

  const handleCancel = async (trip: Trip) => {
    try {
      await tripService.update(trip.id, { status: 'CANCELLED' });
      fetchTrips();
    } catch (error: unknown) {
      console.error('Failed to cancel trip:', error);
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Failed to cancel trip');
    }
  };

  const onSubmit = async (data: unknown) => {
    try {
      if (editingTrip) {
        await tripService.update(editingTrip.id, data as UpdateTripSchema);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await tripService.create(data as any);
      }
      setIsDialogOpen(false);
      fetchTrips();
    } catch (error: unknown) {
      console.error('Failed to save trip:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { errors?: Array<{ field: string; message: string }>; message?: string } } };
        if (err.response?.data?.errors) {
          err.response.data.errors.forEach((e) => {
            form.setError(e.field as 'tripCode' | 'origin' | 'destination' | 'scheduledStart' | 'scheduledEnd' | 'driverId' | 'vehicleId' | 'status' | 'distanceKm' | 'cargoWeight', { message: e.message });
          });
        } else {
          alert(err.response?.data?.message || 'Failed to save trip');
        }
      } else {
        alert('Failed to save trip');
      }
    }
  };

  const getAvailableVehicles = () => {
    return vehicles.filter(v => v.status === 'ACTIVE');
  };

  const getAvailableDrivers = () => {
    return drivers.filter(d => d.status === 'ACTIVE' && new Date(d.licenseExpiry) > new Date());
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Trips"
        description="Trip planning, assignment, and lifecycle tracking."
        actions={
          <button
            onClick={handleCreate}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Add Trip
          </button>
        }
      />

      <div className="rounded-xl border border-surface-border bg-surface shadow-card">
        <div className="border-b border-surface-border p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                placeholder="Search trips..."
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
              {total} trip{total !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
            <p className="mt-2 text-sm text-slate-500">Loading trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">No trips found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Trip Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Route</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Driver</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Vehicle</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Scheduled</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Cargo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {trips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-surface-muted">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{trip.tripCode}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {trip.origin} → {trip.destination}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{trip.driver?.firstName} {trip.driver?.lastName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{trip.vehicle?.registrationNumber}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(trip.scheduledStart).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{trip.cargoWeight || '-'} kg</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                            statusConfig[trip.status].color
                          )}
                        >
                          {statusConfig[trip.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setViewingTrip(trip)}
                            className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-surface-border"
                          >
                            View
                          </button>
                          {trip.status === 'SCHEDULED' && (
                            <>
                              <button
                                onClick={() => handleEdit(trip)}
                                className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-surface-border"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDispatch(trip)}
                                className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                              >
                                Dispatch
                              </button>
                            </>
                          )}
                          {trip.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleComplete(trip)}
                              className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
                            >
                              Complete
                            </button>
                          )}
                          {(trip.status === 'SCHEDULED' || trip.status === 'IN_PROGRESS') && (
                            <button
                              onClick={() => handleCancel(trip)}
                              className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(trip)}
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
              {editingTrip ? 'Edit Trip' : 'Add Trip'}
            </h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Trip Code *</label>
                <input
                  {...form.register('tripCode')}
                  className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {form.formState.errors.tripCode && (
                  <p className="mt-1 text-xs text-red-600">{form.formState.errors.tripCode.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Origin *</label>
                  <input
                    {...form.register('origin')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.origin && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.origin.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Destination *</label>
                  <input
                    {...form.register('destination')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.destination && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.destination.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Scheduled Start *</label>
                  <input
                    type="datetime-local"
                    {...form.register('scheduledStart')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.scheduledStart && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.scheduledStart.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Scheduled End *</label>
                  <input
                    type="datetime-local"
                    {...form.register('scheduledEnd')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.scheduledEnd && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.scheduledEnd.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Driver *</label>
                  <select
                    {...form.register('driverId')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Select Driver</option>
                    {getAvailableDrivers().map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.firstName} {driver.lastName} ({driver.licenseNumber})
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.driverId && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.driverId.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Vehicle *</label>
                  <select
                    {...form.register('vehicleId')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Select Vehicle</option>
                    {getAvailableVehicles().map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.registrationNumber} ({vehicle.make} {vehicle.model})
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.vehicleId && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.vehicleId.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Distance (km)</label>
                  <input
                    type="number"
                    {...form.register('distanceKm', { valueAsNumber: true })}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.distanceKm && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.distanceKm.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Cargo Weight (kg)</label>
                  <input
                    type="number"
                    {...form.register('cargoWeight', { valueAsNumber: true })}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.cargoWeight && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.cargoWeight.message}</p>
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
                  {editingTrip ? 'Update' : 'Create'}
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
            <h2 className="text-lg font-semibold text-slate-900">Delete Trip</h2>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete trip {deleteConfirm.tripCode}? This action cannot be undone.
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
      {viewingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-900">Trip Details</h2>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Trip Code</p>
                  <p className="text-sm font-medium text-slate-900">{viewingTrip.tripCode}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Status</p>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                      statusConfig[viewingTrip.status].color
                    )}
                  >
                    {statusConfig[viewingTrip.status].label}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Origin</p>
                  <p className="text-sm text-slate-900">{viewingTrip.origin}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Destination</p>
                  <p className="text-sm text-slate-900">{viewingTrip.destination}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Driver</p>
                  <p className="text-sm text-slate-900">{viewingTrip.driver?.firstName} {viewingTrip.driver?.lastName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Vehicle</p>
                  <p className="text-sm text-slate-900">{viewingTrip.vehicle?.registrationNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Scheduled Start</p>
                  <p className="text-sm text-slate-900">{new Date(viewingTrip.scheduledStart).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Scheduled End</p>
                  <p className="text-sm text-slate-900">{new Date(viewingTrip.scheduledEnd).toLocaleString()}</p>
                </div>
              </div>
              {viewingTrip.actualStart && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Actual Start</p>
                    <p className="text-sm text-slate-900">{new Date(viewingTrip.actualStart).toLocaleString()}</p>
                  </div>
                  {viewingTrip.actualEnd && (
                    <div>
                      <p className="text-xs font-medium text-slate-500">Actual End</p>
                      <p className="text-sm text-slate-900">{new Date(viewingTrip.actualEnd).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Distance</p>
                  <p className="text-sm text-slate-900">{viewingTrip.distanceKm || '-'} km</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Cargo Weight</p>
                  <p className="text-sm text-slate-900">{viewingTrip.cargoWeight || '-'} kg</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingTrip(null)}
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
