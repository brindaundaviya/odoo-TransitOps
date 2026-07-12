import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { expenseService } from '@/services/api/expenseService';
import { vehicleService } from '@/services/api/vehicleService';
import { tripService } from '@/services/api/tripService';
import { createExpenseSchema } from '@/schemas';
import type { Expense, ExpenseCategory, ExpenseStatus } from '@/types/models';
import type { UpdateExpenseSchema } from '@/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/utils/cn';

const categoryConfig: Record<ExpenseCategory, { label: string }> = {
  FUEL: { label: 'Fuel' },
  MAINTENANCE: { label: 'Maintenance' },
  TOLL: { label: 'Toll' },
  INSURANCE: { label: 'Insurance' },
  FINE: { label: 'Fine' },
  MISC: { label: 'Miscellaneous' },
};

const statusConfig: Record<ExpenseStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
};

export default function ExpenseListPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Array<{ id: string; registrationNumber: string; make: string; model: string }>>([]);
  const [trips, setTrips] = useState<Array<{ id: string; tripCode: string; origin: string; destination: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);

  const form = useForm({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      category: 'MISC',
      amount: undefined,
      currency: 'USD',
      expenseDate: '',
      vehicleId: '',
      tripId: '',
      description: '',
      receiptRef: '',
      status: 'PENDING',
    },
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expenseService.getAll({
        search: search || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      setExpenses(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [vehiclesRes, tripsRes] = await Promise.all([
        vehicleService.getAll({ limit: 100 }),
        tripService.getAll({ limit: 100 }),
      ]);
      setVehicles(vehiclesRes.data);
      setTrips(tripsRes.data);
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchExpenses();
    fetchDropdownData();
  }, [search, categoryFilter, statusFilter, page]);

  const handleCreate = () => {
    setEditingExpense(null);
    form.reset({
      category: 'MISC',
      amount: undefined,
      currency: 'USD',
      expenseDate: '',
      vehicleId: '',
      tripId: '',
      description: '',
      receiptRef: '',
      status: 'PENDING',
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    form.reset({
      category: expense.category,
      amount: expense.amount,
      currency: expense.currency,
      expenseDate: expense.expenseDate,
      vehicleId: expense.vehicleId || '',
      tripId: expense.tripId || '',
      description: expense.description,
      receiptRef: expense.receiptRef || '',
      status: expense.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await expenseService.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchExpenses();
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const handleApprove = async (expense: Expense) => {
    try {
      await expenseService.update(expense.id, { status: 'APPROVED' });
      fetchExpenses();
    } catch (error: unknown) {
      console.error('Failed to approve expense:', error);
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Failed to approve expense');
    }
  };

  const handleReject = async (expense: Expense) => {
    try {
      await expenseService.update(expense.id, { status: 'REJECTED' });
      fetchExpenses();
    } catch (error: unknown) {
      console.error('Failed to reject expense:', error);
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Failed to reject expense');
    }
  };

  const onSubmit = async (data: unknown) => {
    try {
      if (editingExpense) {
        await expenseService.update(editingExpense.id, data as UpdateExpenseSchema);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await expenseService.create(data as any);
      }
      setIsDialogOpen(false);
      fetchExpenses();
    } catch (error: unknown) {
      console.error('Failed to save expense:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { errors?: Array<{ field: string; message: string }>; message?: string } } };
        if (err.response?.data?.errors) {
          err.response.data.errors.forEach((e) => {
            form.setError(e.field as 'category' | 'amount' | 'currency' | 'expenseDate' | 'vehicleId' | 'tripId' | 'description' | 'receiptRef' | 'status', { message: e.message });
          });
        } else {
          alert(err.response?.data?.message || 'Failed to save expense');
        }
      } else {
        alert('Failed to save expense');
      }
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Expenses"
        description="Fleet expenditure tracking and approvals."
        actions={
          <button
            onClick={handleCreate}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Add Expense
          </button>
        }
      />

      <div className="rounded-xl border border-surface-border bg-surface shadow-card">
        <div className="border-b border-surface-border p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                placeholder="Search expenses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Categories</option>
                {Object.entries(categoryConfig).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
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
              {total} expense{total !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
            <p className="mt-2 text-sm text-slate-500">Loading expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">No expenses found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Vehicle</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Trip</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-surface-muted">
                      <td className="px-4 py-3 text-sm text-slate-600">{new Date(expense.expenseDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{categoryConfig[expense.category].label}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{expense.description}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{expense.vehicle?.registrationNumber || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{expense.trip?.tripCode || '-'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {expense.currency} {expense.amount}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                            statusConfig[expense.status].color
                          )}
                        >
                          {statusConfig[expense.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setViewingExpense(expense)}
                            className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-surface-border"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(expense)}
                            className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-surface-border"
                          >
                            Edit
                          </button>
                          {expense.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(expense)}
                                className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(expense)}
                                className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(expense)}
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
              {editingExpense ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Category *</label>
                  <select
                    {...form.register('category')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {Object.entries(categoryConfig).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.category && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.category.message}</p>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...form.register('amount', { valueAsNumber: true })}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.amount && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.amount.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Currency</label>
                  <input
                    {...form.register('currency')}
                    className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {form.formState.errors.currency && (
                    <p className="mt-1 text-xs text-red-600">{form.formState.errors.currency.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Expense Date *</label>
                <input
                  type="date"
                  {...form.register('expenseDate')}
                  className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {form.formState.errors.expenseDate && (
                  <p className="mt-1 text-xs text-red-600">{form.formState.errors.expenseDate.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Vehicle</label>
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
              <div>
                <label className="block text-sm font-medium text-slate-700">Receipt Reference</label>
                <input
                  {...form.register('receiptRef')}
                  className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {form.formState.errors.receiptRef && (
                  <p className="mt-1 text-xs text-red-600">{form.formState.errors.receiptRef.message}</p>
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
                  {editingExpense ? 'Update' : 'Create'}
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
            <h2 className="text-lg font-semibold text-slate-900">Delete Expense</h2>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete this expense? This action cannot be undone.
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
      {viewingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-slate-900">Expense Details</h2>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Date</p>
                  <p className="text-sm text-slate-900">{new Date(viewingExpense.expenseDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Category</p>
                  <p className="text-sm text-slate-900">{categoryConfig[viewingExpense.category].label}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Amount</p>
                  <p className="text-sm font-medium text-slate-900">
                    {viewingExpense.currency} {viewingExpense.amount}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Status</p>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                      statusConfig[viewingExpense.status].color
                    )}
                  >
                    {statusConfig[viewingExpense.status].label}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Description</p>
                <p className="text-sm text-slate-900">{viewingExpense.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Vehicle</p>
                  <p className="text-sm text-slate-900">{viewingExpense.vehicle?.registrationNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Trip</p>
                  <p className="text-sm text-slate-900">{viewingExpense.trip?.tripCode || '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Receipt Reference</p>
                <p className="text-sm text-slate-900">{viewingExpense.receiptRef || '-'}</p>
              </div>
              {viewingExpense.submitter && (
                <div>
                  <p className="text-xs font-medium text-slate-500">Submitted By</p>
                  <p className="text-sm text-slate-900">{viewingExpense.submitter.firstName} {viewingExpense.submitter.lastName}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingExpense(null)}
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
