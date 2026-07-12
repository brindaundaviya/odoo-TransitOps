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
};
