import { PrismaClient, Role, VehicleStatus, DriverStatus } from '@prisma/client';
import { hashPassword } from '../src/utils/password.util';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@transitops.demo';
const ADMIN_PASSWORD = 'Admin@12345';

async function main(): Promise<void> {
  console.log('Seeding TransitOps database...');

  const passwordHash = await hashPassword(ADMIN_PASSWORD);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      firstName: 'System',
      lastName: 'Admin',
      role: Role.ADMIN,
    },
  });

  const vehicles = await Promise.all([
    prisma.vehicle.upsert({
      where: { registrationNumber: 'MH-12-AB-1234' },
      update: {},
      create: {
        registrationNumber: 'MH-12-AB-1234',
        make: 'Tata',
        model: 'Starbus',
        year: 2022,
        vin: 'VIN00000000000001',
        fuelType: 'Diesel',
        capacity: 45,
        odometer: 48250,
        status: VehicleStatus.ACTIVE,
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: 'MH-14-CD-5678' },
      update: {},
      create: {
        registrationNumber: 'MH-14-CD-5678',
        make: 'Ashok Leyland',
        model: 'Viking',
        year: 2021,
        vin: 'VIN00000000000002',
        fuelType: 'Diesel',
        capacity: 52,
        odometer: 61300,
        status: VehicleStatus.ACTIVE,
      },
    }),
  ]);

  const drivers = await Promise.all([
    prisma.driver.upsert({
      where: { employeeId: 'DRV-001' },
      update: {},
      create: {
        employeeId: 'DRV-001',
        firstName: 'Rahul',
        lastName: 'Sharma',
        licenseNumber: 'MH-2020-0001234',
        licenseClass: 'HMV',
        licenseExpiry: new Date('2027-06-30'),
        phone: '+91-9876543210',
        status: DriverStatus.ACTIVE,
      },
    }),
    prisma.driver.upsert({
      where: { employeeId: 'DRV-002' },
      update: {},
      create: {
        employeeId: 'DRV-002',
        firstName: 'Priya',
        lastName: 'Patel',
        licenseNumber: 'MH-2019-0005678',
        licenseClass: 'HMV',
        licenseExpiry: new Date('2026-12-15'),
        phone: '+91-9876543211',
        status: DriverStatus.ACTIVE,
      },
    }),
  ]);

  console.log('Seed completed successfully.');
  console.log(`Admin user: ${admin.email}`);
  console.log(`Vehicles: ${vehicles.map((v) => v.registrationNumber).join(', ')}`);
  console.log(`Drivers: ${drivers.map((d) => d.employeeId).join(', ')}`);
  console.log(`Default admin password: ${ADMIN_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
