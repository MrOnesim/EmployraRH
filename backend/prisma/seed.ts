import { PrismaClient, RoleEnum } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const password = await bcrypt.hash('password123', 10);

  const company = await prisma.company.upsert({
    where: { slug: 'techafrique' },
    update: {},
    create: {
      name: 'TechAfrique Solutions',
      slug: 'techafrique',
      currency: 'FCFA',
      country: 'SN',
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@techafrique.com' },
    update: {},
    create: {
      email: 'admin@techafrique.com',
      name: 'Kofi Mensah',
      password,
      emailVerified: true,
    },
  });

  await prisma.member.upsert({
    where: { userId_companyId: { userId: adminUser.id, companyId: company.id } },
    update: {},
    create: {
      userId: adminUser.id,
      companyId: company.id,
      role: RoleEnum.SUPER_ADMIN,
    },
  });

  const employees = [
    { firstName: 'Kofi', lastName: 'Mensah', email: 'admin@techafrique.com', position: 'Directeur Général', department: 'Direction', salary: 1500000 },
    { firstName: 'Aminata', lastName: 'Diallo', email: 'aminata@techafrique.com', position: 'RH', department: 'Ressources Humaines', salary: 800000 },
    { firstName: 'Modou', lastName: 'Diop', email: 'modou@techafrique.com', position: 'Développeur Fullstack', department: 'IT', salary: 600000 },
    { firstName: 'Fatou', lastName: 'Sarr', email: 'fatou@techafrique.com', position: 'Comptable', department: 'Finance', salary: 550000 },
  ];

  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        ...emp,
        companyId: company.id,
        hireDate: new Date('2024-01-15'),
        currency: 'FCFA',
      },
    });
  }

  console.log('Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
