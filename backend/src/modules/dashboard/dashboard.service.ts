import { TripStatus, VehicleStatus, DriverStatus } from '@prisma/client';
import { prisma } from '../../config/database';

export const dashboardService = {
  getKPIs: async () => {
    // 1. Active Trips count
    const activeTrips = await prisma.trip.count({
      where: { status: TripStatus.IN_PROGRESS },
    });

    // 2. Pending Trips count (SCHEDULED)
    const pendingTrips = await prisma.trip.count({
      where: { status: TripStatus.SCHEDULED },
    });

    // 3. Active Vehicles (vehicles on active trips)
    const activeVehiclesList = await prisma.trip.findMany({
      where: { status: TripStatus.IN_PROGRESS },
      select: { vehicleId: true },
      distinct: ['vehicleId'],
    });
    const activeVehicles = activeVehiclesList.length;
    const activeVehicleIds = activeVehiclesList.map((v) => v.vehicleId);

    // 4. Available Vehicles (status is ACTIVE and not currently on an active trip)
    const availableVehicles = await prisma.vehicle.count({
      where: {
        status: VehicleStatus.ACTIVE,
        id: { notIn: activeVehicleIds },
      },
    });

    // 5. Vehicles in Maintenance (status is MAINTENANCE)
    const vehiclesInMaintenance = await prisma.vehicle.count({
      where: { status: VehicleStatus.MAINTENANCE },
    });

    // 6. Drivers on Duty (ACTIVE status)
    const driversOnDuty = await prisma.driver.count({
      where: { status: DriverStatus.ACTIVE },
    });

    // 7. Total Non-Retired Vehicles
    const totalNonRetired = await prisma.vehicle.count({
      where: {
        status: { in: [VehicleStatus.ACTIVE, VehicleStatus.MAINTENANCE] },
      },
    });

    // 8. Fleet Utilization %
    const fleetUtilization = totalNonRetired > 0 ? (activeVehicles / totalNonRetired) * 100 : 0;

    return {
      activeVehicles,
      availableVehicles,
      vehiclesInMaintenance,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilization: parseFloat(fleetUtilization.toFixed(1)),
    };
  },

  /**
   * Fleet Utilization over the last 6 months.
   * For each month, counts how many distinct vehicles were used in trips
   * versus total non-retired vehicles at that time.
   */
  getFleetUtilization: async () => {
    const now = new Date();
    const months: { month: string; utilization: number; activeVehicles: number; totalVehicles: number }[] = [];

    // Total non-retired vehicles (current snapshot — good enough for dashboard)
    const totalVehicles = await prisma.vehicle.count({
      where: { status: { in: [VehicleStatus.ACTIVE, VehicleStatus.MAINTENANCE] } },
    });

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const monthLabel = monthStart.toLocaleString('en-US', { month: 'short', year: '2-digit' });

      // Count distinct vehicles used in trips during this month
      const vehiclesUsed = await prisma.trip.findMany({
        where: {
          scheduledStart: { gte: monthStart, lte: monthEnd },
          status: { in: [TripStatus.IN_PROGRESS, TripStatus.COMPLETED] },
        },
        select: { vehicleId: true },
        distinct: ['vehicleId'],
      });

      const activeCount = vehiclesUsed.length;
      const utilization = totalVehicles > 0
        ? parseFloat(((activeCount / totalVehicles) * 100).toFixed(1))
        : 0;

      months.push({
        month: monthLabel,
        utilization,
        activeVehicles: activeCount,
        totalVehicles,
      });
    }

    return months;
  },

  /**
   * Fuel consumption aggregated by month for the last 6 months.
   */
  getFuelConsumption: async () => {
    const now = new Date();
    const months: { month: string; totalLiters: number; totalCost: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const monthLabel = monthStart.toLocaleString('en-US', { month: 'short', year: '2-digit' });

      const aggregate = await prisma.fuelLog.aggregate({
        where: {
          loggedAt: { gte: monthStart, lte: monthEnd },
        },
        _sum: {
          quantity: true,
          cost: true,
        },
      });

      months.push({
        month: monthLabel,
        totalLiters: Number(aggregate._sum.quantity ?? 0),
        totalCost: Number(aggregate._sum.cost ?? 0),
      });
    }

    return months;
  },

  /**
   * Monthly expenses aggregated by category for the last 6 months.
   */
  getMonthlyExpenses: async () => {
    const now = new Date();
    const months: { month: string; fuel: number; maintenance: number; toll: number; insurance: number; fine: number; misc: number; total: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const monthLabel = monthStart.toLocaleString('en-US', { month: 'short', year: '2-digit' });

      const expenses = await prisma.expense.groupBy({
        by: ['category'],
        where: {
          expenseDate: { gte: monthStart, lte: monthEnd },
        },
        _sum: {
          amount: true,
        },
      });

      const byCategory: Record<string, number> = {};
      for (const e of expenses) {
        byCategory[e.category] = Number(e._sum.amount ?? 0);
      }

      const fuel = byCategory['FUEL'] ?? 0;
      const maintenance = byCategory['MAINTENANCE'] ?? 0;
      const toll = byCategory['TOLL'] ?? 0;
      const insurance = byCategory['INSURANCE'] ?? 0;
      const fine = byCategory['FINE'] ?? 0;
      const misc = byCategory['MISC'] ?? 0;

      months.push({
        month: monthLabel,
        fuel,
        maintenance,
        toll,
        insurance,
        fine,
        misc,
        total: fuel + maintenance + toll + insurance + fine + misc,
      });
    }

    return months;
  },

  /**
   * Trip distribution by status.
   */
  getTripDistribution: async () => {
    const groups = await prisma.trip.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const statusMap: Record<string, number> = {};
    for (const g of groups) {
      statusMap[g.status] = g._count._all;
    }

    return [
      { status: 'Scheduled', count: statusMap['SCHEDULED'] ?? 0, color: '#f59e0b' },
      { status: 'In Progress', count: statusMap['IN_PROGRESS'] ?? 0, color: '#3b82f6' },
      { status: 'Completed', count: statusMap['COMPLETED'] ?? 0, color: '#10b981' },
      { status: 'Cancelled', count: statusMap['CANCELLED'] ?? 0, color: '#ef4444' },
    ];
  },
};
