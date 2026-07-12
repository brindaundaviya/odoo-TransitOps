import { MaintenanceStatus, VehicleStatus } from '@prisma/client';
import { ApiError } from '../../utils/ApiError';
import { prisma } from '../../config/database';
import { maintenanceRepository } from './maintenance.repository';
import { vehicleRepository } from '../vehicles/vehicle.repository';
import { CreateMaintenanceInput, UpdateMaintenanceInput, MaintenanceQueryFilters } from './maintenance.types';

// Helper to determine if vehicle has any other open maintenance logs
async function hasOtherOpenMaintenance(vehicleId: string, excludeLogId?: string): Promise<boolean> {
  const openCount = await prisma.maintenanceLog.count({
    where: {
      vehicleId,
      status: {
        in: [MaintenanceStatus.PENDING, MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.OVERDUE],
      },
      NOT: excludeLogId ? { id: excludeLogId } : undefined,
    },
  });
  return openCount > 0;
}

export const maintenanceService = {
  create: async (input: CreateMaintenanceInput) => {
    const vehicle = await vehicleRepository.findById(input.vehicleId);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }

    // Creating maintenance log in active state updates vehicle status to MAINTENANCE (In Shop)
    const log = await maintenanceRepository.create(input);

    if (log.status !== MaintenanceStatus.COMPLETED) {
      await vehicleRepository.update(log.vehicleId, { status: VehicleStatus.MAINTENANCE });
    } else {
      // Completed on creation, check if we need to ensure vehicle is Active
      if (vehicle.status === VehicleStatus.MAINTENANCE) {
        const otherOpen = await hasOtherOpenMaintenance(log.vehicleId, log.id);
        if (!otherOpen) {
          await vehicleRepository.update(log.vehicleId, { status: VehicleStatus.ACTIVE });
        }
      }
    }

    return maintenanceRepository.findById(log.id);
  },

  update: async (id: string, input: UpdateMaintenanceInput) => {
    const log = await maintenanceRepository.findById(id);
    if (!log) {
      throw new ApiError(404, 'Maintenance log not found');
    }

    const updatedLog = await maintenanceRepository.update(id, input);
    const vehicle = await vehicleRepository.findById(updatedLog.vehicleId);

    if (vehicle) {
      if (updatedLog.status === MaintenanceStatus.COMPLETED) {
        // Closing maintenance log. Restore Available unless retired or has other open logs
        if (vehicle.status !== VehicleStatus.RETIRED) {
          const otherOpen = await hasOtherOpenMaintenance(updatedLog.vehicleId, id);
          if (!otherOpen) {
            await vehicleRepository.update(updatedLog.vehicleId, { status: VehicleStatus.ACTIVE });
          }
        }
      } else {
        // Reopened or updated in open state. Set vehicle status to MAINTENANCE
        if (vehicle.status !== VehicleStatus.RETIRED) {
          await vehicleRepository.update(updatedLog.vehicleId, { status: VehicleStatus.MAINTENANCE });
        }
      }
    }

    return updatedLog;
  },

  delete: async (id: string) => {
    const log = await maintenanceRepository.findById(id);
    if (!log) {
      throw new ApiError(404, 'Maintenance log not found');
    }

    await maintenanceRepository.delete(id);

    // After deletion, if there are no more open logs, restore vehicle status
    const vehicle = await vehicleRepository.findById(log.vehicleId);
    if (vehicle && vehicle.status === VehicleStatus.MAINTENANCE) {
      const otherOpen = await hasOtherOpenMaintenance(log.vehicleId);
      if (!otherOpen && vehicle.status !== VehicleStatus.RETIRED) {
        await vehicleRepository.update(log.vehicleId, { status: VehicleStatus.ACTIVE });
      }
    }
  },

  getById: async (id: string) => {
    const log = await maintenanceRepository.findById(id);
    if (!log) {
      throw new ApiError(404, 'Maintenance log not found');
    }
    return log;
  },

  getAll: async (filters: MaintenanceQueryFilters) => {
    return maintenanceRepository.findAll(filters);
  },
};
