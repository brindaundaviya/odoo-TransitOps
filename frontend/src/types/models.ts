// Domain model types — matches Prisma schema on the backend

export type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';
export type DriverStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED';
export type TripStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type MaintenanceType = 'SCHEDULED' | 'REPAIR' | 'INSPECTION';
export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
export type ExpenseCategory = 'FUEL' | 'MAINTENANCE' | 'TOLL' | 'INSURANCE' | 'FINE' | 'MISC';
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  fuelType: string;
  capacity: number | null;
  odometer: number;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    trips: number;
    maintenanceLogs: number;
  };
}

export interface Driver {
  id: string;
  userId: string | null;
  employeeId: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiry: string;
  phone: string;
  status: DriverStatus;
  safetyScore: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    role: string;
  } | null;
  _count?: {
    trips: number;
  };
}

export interface Trip {
  id: string;
  tripCode: string;
  origin: string;
  destination: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  driverId: string;
  vehicleId: string;
  status: TripStatus;
  distanceKm: number | null;
  cargoWeight: number | null;
  createdAt: string;
  updatedAt: string;
  driver?: Driver;
  vehicle?: Vehicle;
  fuelLogs?: FuelLog[];
  expenses?: Expense[];
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  description: string;
  scheduledDate: string;
  completedDate: string | null;
  cost: number | null;
  serviceProvider: string | null;
  status: MaintenanceStatus;
  odometerAtService: number | null;
  createdAt: string;
  updatedAt: string;
  vehicle?: Vehicle;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  tripId: string | null;
  driverId: string | null;
  loggedAt: string;
  fuelType: string;
  quantity: number;
  cost: number;
  odometer: number;
  station: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle?: Vehicle;
  trip?: Trip;
  driver?: Driver;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  expenseDate: string;
  vehicleId: string | null;
  tripId: string | null;
  description: string;
  receiptRef: string | null;
  status: ExpenseStatus;
  submittedBy: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle?: Vehicle | null;
  trip?: Trip | null;
  submitter?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}
