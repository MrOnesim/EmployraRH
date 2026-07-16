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
    {
      firstName: 'Kofi',
      lastName: 'Mensah',
      email: 'admin@techafrique.com',
      position: 'Directeur Général',
      department: 'Direction',
      salary: 1500000,
    },
    {
      firstName: 'Aminata',
      lastName: 'Diallo',
      email: 'aminata@techafrique.com',
      position: 'RH',
      department: 'Ressources Humaines',
      salary: 800000,
    },
    {
      firstName: 'Modou',
      lastName: 'Diop',
      email: 'modou@techafrique.com',
      position: 'Développeur Fullstack',
      department: 'IT',
      salary: 600000,
    },
    {
      firstName: 'Fatou',
      lastName: 'Sarr',
      email: 'fatou@techafrique.com',
      position: 'Comptable',
      department: 'Finance',
      salary: 550000,
    },
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

  const allEmployees = await prisma.employee.findMany({
    where: { companyId: company.id },
    orderBy: { email: 'asc' },
  });
  const byEmail = (email: string) => allEmployees.find((e) => e.email === email);
  const kofi = byEmail('admin@techafrique.com');
  const aminata = byEmail('aminata@techafrique.com');
  const modou = byEmail('modou@techafrique.com');
  const fatou = byEmail('fatou@techafrique.com');

  if (kofi && aminata && modou && fatou) {
    if ((await prisma.team.count({ where: { companyId: company.id } })) === 0) {
      await prisma.team.createMany({
        data: [
          {
            companyId: company.id,
            name: 'Équipe IT',
            description: 'Développement et infrastructure',
            leaderId: modou.id,
            memberIds: [modou.id],
          },
          {
            companyId: company.id,
            name: 'Direction & RH',
            description: 'Pilotage et ressources humaines',
            leaderId: kofi.id,
            memberIds: [kofi.id, aminata.id],
          },
        ],
      });
    }

    if ((await prisma.post.count({ where: { companyId: company.id } })) === 0) {
      const post = await prisma.post.create({
        data: {
          companyId: company.id,
          authorId: kofi.id,
          authorName: 'Kofi Mensah',
          content: 'Bienvenue sur la plateforme EmployePro ! 🎉',
          likes: [aminata.id, modou.id],
          comments: {
            create: [
              {
                authorId: aminata.id,
                authorName: 'Aminata Diallo',
                content: 'Super initiative !',
              },
            ],
          },
        },
      });
      await prisma.post.create({
        data: {
          companyId: company.id,
          authorId: aminata.id,
          authorName: 'Aminata Diallo',
          content: "Rappel : les congés de fin d'année sont à poser avant le 15.",
          likes: [kofi.id],
        },
      });
      void post;
    }

    if ((await prisma.rewardCatalog.count({ where: { companyId: company.id } })) === 0) {
      await prisma.rewardCatalog.createMany({
        data: [
          {
            companyId: company.id,
            name: 'Jour de congé bonus',
            description: 'Une journée de repos supplémentaire',
            pointsCost: 500,
            stock: 10,
            category: 'advantage',
          },
          {
            companyId: company.id,
            name: "Bon d'achat 25 000 FCFA",
            description: 'Bon cadeau utilisable en magasin',
            pointsCost: 250,
            stock: 20,
            category: 'gift',
          },
          {
            companyId: company.id,
            name: 'Formation en ligne',
            description: 'Accès à une formation certifiante',
            pointsCost: 400,
            stock: 5,
            category: 'training',
          },
        ],
      });
    }

    if ((await prisma.rewardTransaction.count()) === 0) {
      await prisma.rewardTransaction.createMany({
        data: [
          {
            employeeId: modou.id,
            points: 300,
            type: 'earned',
            reason: 'Objectif trimestriel atteint',
          },
          { employeeId: modou.id, points: 150, type: 'earned', reason: 'Aide à un collègue' },
          { employeeId: aminata.id, points: 200, type: 'earned', reason: 'Recrutement réussi' },
        ],
      });
    }

    if ((await prisma.contract.count()) === 0) {
      await prisma.contract.createMany({
        data: [
          {
            employeeId: modou.id,
            type: 'CDI',
            position: 'Développeur Fullstack',
            startDate: new Date('2024-01-15'),
            salary: 600000,
            status: 'active',
          },
          {
            employeeId: fatou.id,
            type: 'CDD',
            position: 'Comptable',
            startDate: new Date('2024-03-01'),
            endDate: new Date('2025-03-01'),
            salary: 550000,
            status: 'active',
          },
        ],
      });
    }

    if ((await prisma.timelineEvent.count()) === 0) {
      await prisma.timelineEvent.createMany({
        data: [
          {
            employeeId: modou.id,
            type: 'hire',
            title: 'Recrutement',
            description: "Arrivée dans l'équipe IT",
            date: new Date('2024-01-15'),
          },
          {
            employeeId: modou.id,
            type: 'objective',
            title: 'Objectif atteint',
            description: 'Livraison du module de paie',
            date: new Date('2024-06-30'),
          },
          {
            employeeId: aminata.id,
            type: 'promotion',
            title: 'Promotion',
            description: 'Responsable RH',
            date: new Date('2024-09-01'),
          },
        ],
      });
    }

    if ((await prisma.plan.count()) === 0) {
      await prisma.plan.createMany({
        data: [
          {
            id: 'plan_free',
            name: 'Free',
            description: 'Pour decouvrir EmployePro',
            price: 0,
            currency: 'XOF',
            interval: 'month',
            trialDays: 0,
            features: '5 employes;Modules RH de base',
            taxRate: 0,
            taxExempt: true,
            active: true,
          },
          {
            id: 'plan_business',
            name: 'Business',
            description: 'Pour les PME en croissance',
            price: 50000,
            currency: 'XOF',
            interval: 'month',
            trialDays: 14,
            features: 'Employes illimites;Paie;Recrutement;Support prioritaire',
            taxRate: 0,
            taxExempt: true,
            active: true,
          },
          {
            id: 'plan_enterprise',
            name: 'Enterprise',
            description: 'Pour les grandes organisations',
            price: 150000,
            currency: 'XOF',
            interval: 'month',
            trialDays: 30,
            features: 'Tout Business;SSO;Audit avance;Account manager',
            taxRate: 0,
            taxExempt: true,
            active: true,
          },
        ],
      });
    }

    if ((await prisma.employeeVaultItem.count()) === 0) {
      await prisma.employeeVaultItem.createMany({
        data: [
          {
            employeeId: modou.id,
            type: 'contract',
            name: 'Contrat de travail.pdf',
            fileUrl: 'https://example.com/docs/contrat-modou.pdf',
          },
          {
            employeeId: modou.id,
            type: 'certificate',
            name: 'Certificat de formation.pdf',
            fileUrl: 'https://example.com/docs/certif-modou.pdf',
          },
        ],
      });
    }
  }

  console.log('Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
