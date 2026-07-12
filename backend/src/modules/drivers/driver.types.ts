export interface CreateDriverInput {
  userId?: string | null;
  employeeId: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiry: Date;
  phone: string;
  status?: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED';
  safetyScore?: number;
}

export type UpdateDriverInput = Partial<CreateDriverInput>;

export interface DriverQueryFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}
