import axiosClient from './axiosClient';

export interface FuelEfficiencyReport {
  vehicleId: string;
  registrationNumber: string;
  make: string;
  model: string;
  totalQuantity: number;
  totalCost: number;
  avgEfficiencyKmPerL: number;
}

export interface FleetUtilizationReport {
  vehicleId: string;
  registrationNumber: string;
  status: string;
  totalTrips: number;
  activeTrips: number;
  utilizationPercent: number;
}

export interface OperationalCostReport {
  vehicleId: string;
  registrationNumber: string;
  fuelCost: number;
  maintenanceCost: number;
  otherExpenseCost: number;
  totalCost: number;
}

export interface VehicleROIReport {
  vehicleId: string;
  registrationNumber: string;
  totalCost: number;
  revenue: number;
  netProfit: number;
  roiPercent: number;
}

export interface ReportsSummary {
  fuelEfficiency: FuelEfficiencyReport[];
  fleetUtilization: FleetUtilizationReport[];
  operationalCost: OperationalCostReport[];
  vehicleROI: VehicleROIReport[];
}

export const reportService = {
  getSummary: async () => {
    const response = await axiosClient.get<{ data: ReportsSummary }>('/reports/summary');
    return response.data.data;
  },

  exportCSV: async (type: string) => {
    const response = await axiosClient.get(`/reports/export/${type}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
