import axiosClient from './axiosClient';

export interface DashboardKPIs {
  activeVehicles: number;
  availableVehicles: number;
  vehiclesInMaintenance: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilization: number;
}

export interface FleetUtilizationData {
  month: string;
  utilization: number;
  activeVehicles: number;
  totalVehicles: number;
}

export interface FuelConsumptionData {
  month: string;
  totalLiters: number;
  totalCost: number;
}

export interface MonthlyExpenseData {
  month: string;
  fuel: number;
  maintenance: number;
  toll: number;
  insurance: number;
  fine: number;
  misc: number;
  total: number;
}

export interface TripDistributionData {
  status: string;
  count: number;
  color: string;
}

export const dashboardService = {
  getKPIs: async (): Promise<DashboardKPIs> => {
    const response = await axiosClient.get<{ data: DashboardKPIs }>('/dashboard/kpis');
    return response.data.data;
  },

  getFleetUtilization: async (): Promise<FleetUtilizationData[]> => {
    const response = await axiosClient.get<{ data: FleetUtilizationData[] }>('/dashboard/fleet-utilization');
    return response.data.data;
  },

  getFuelConsumption: async (): Promise<FuelConsumptionData[]> => {
    const response = await axiosClient.get<{ data: FuelConsumptionData[] }>('/dashboard/fuel-consumption');
    return response.data.data;
  },

  getMonthlyExpenses: async (): Promise<MonthlyExpenseData[]> => {
    const response = await axiosClient.get<{ data: MonthlyExpenseData[] }>('/dashboard/monthly-expenses');
    return response.data.data;
  },

  getTripDistribution: async (): Promise<TripDistributionData[]> => {
    const response = await axiosClient.get<{ data: TripDistributionData[] }>('/dashboard/trip-distribution');
    return response.data.data;
  },
};
