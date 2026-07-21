import {
  PrismaClient,
  RoleEnum,
  TaxType,
  ContributionType,
  LeaveType,
  Period,
} from '@prisma/client';
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

  // ── Compliance: Countries ──────────────────────────────────────────
  if ((await prisma.country.count()) === 0) {
    const now = new Date();
    const forever = null;

    // France
    await prisma.country.create({
      data: {
        code: 'FR',
        name: 'France',
        currency: 'EUR',
        region: 'EUROPE',
        taxBrackets: {
          create: [
            {
              type: 'IRPP' as TaxType,
              minIncome: 0,
              maxIncome: 10777,
              rate: 0,
              deduction: 0,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 10778,
              maxIncome: 27478,
              rate: 0.11,
              deduction: 0,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 27479,
              maxIncome: 78570,
              rate: 0.3,
              deduction: 0,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 78571,
              maxIncome: 168994,
              rate: 0.41,
              deduction: 0,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 168995,
              maxIncome: null,
              rate: 0.45,
              deduction: 0,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
          ],
        },
        socialContributions: {
          create: [
            {
              code: 'CSG_DED',
              label: 'CSG déductible',
              type: 'SOCIAL_SECURITY' as ContributionType,
              employerRate: 0,
              employeeRate: 0.068,
              cap: null,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              code: 'CSG_ND',
              label: 'CSG non déductible',
              type: 'SOCIAL_SECURITY' as ContributionType,
              employerRate: 0,
              employeeRate: 0.024,
              cap: null,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              code: 'CRDS',
              label: 'CRDS',
              type: 'SOCIAL_SECURITY' as ContributionType,
              employerRate: 0,
              employeeRate: 0.005,
              cap: null,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              code: 'URSSAF',
              label: 'URSSAF',
              type: 'SOCIAL_SECURITY' as ContributionType,
              employerRate: 0.03,
              employeeRate: 0.22,
              cap: null,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              code: 'RETRAITE',
              label: 'Retraite complémentaire',
              type: 'PENSION' as ContributionType,
              employerRate: 0.05,
              employeeRate: 0.0315,
              cap: null,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              code: 'MUTUELLE',
              label: 'Mutuelle',
              type: 'HEALTH_INSURANCE' as ContributionType,
              employerRate: 0.03,
              employeeRate: 0.02,
              cap: null,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              code: 'PREVOYANCE',
              label: 'Prévoyance',
              type: 'OTHER' as ContributionType,
              employerRate: 0.01,
              employeeRate: 0.005,
              cap: null,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
          ],
        },
        leaveRules: {
          create: [
            {
              type: 'ANNUAL' as LeaveType,
              label: 'Congés payés',
              daysEntitled: 30,
              accrualRate: 2.5,
              seniorityExtraDays: 2,
              maxConsecutiveDays: null,
              paidByEmployerPct: 1,
              requiresMedicalCert: false,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
            },
            {
              type: 'SICK' as LeaveType,
              label: 'Arrêt maladie',
              daysEntitled: 90,
              accrualRate: null,
              seniorityExtraDays: 0,
              maxConsecutiveDays: null,
              paidByEmployerPct: 0.9,
              requiresMedicalCert: true,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
            },
            {
              type: 'MATERNITY' as LeaveType,
              label: 'Congé maternité',
              daysEntitled: 112,
              accrualRate: null,
              seniorityExtraDays: 0,
              maxConsecutiveDays: null,
              paidByEmployerPct: 1,
              requiresMedicalCert: true,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
            },
            {
              type: 'PATERNITY' as LeaveType,
              label: 'Congé paternité',
              daysEntitled: 25,
              accrualRate: null,
              seniorityExtraDays: 0,
              maxConsecutiveDays: null,
              paidByEmployerPct: 1,
              requiresMedicalCert: true,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
            },
          ],
        },
        minimumWages: {
          create: [
            {
              amount: 1801.8,
              period: 'MONTHLY' as Period,
              category: null,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
            },
          ],
        },
      },
    });

    // Benin
    await prisma.country.create({
      data: {
        code: 'BJ',
        name: 'Bénin',
        currency: 'XOF',
        region: 'UEMOA',
        taxBrackets: {
          create: [
            {
              type: 'IRPP' as TaxType,
              minIncome: 0,
              maxIncome: 300000,
              rate: 0,
              deduction: 0,
              effectiveFrom: new Date('2024-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 300001,
              maxIncome: 600000,
              rate: 0.1,
              deduction: 0,
              effectiveFrom: new Date('2024-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 600001,
              maxIncome: 1000000,
              rate: 0.2,
              deduction: 0,
              effectiveFrom: new Date('2024-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 1000001,
              maxIncome: 1500000,
              rate: 0.25,
              deduction: 0,
              effectiveFrom: new Date('2024-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 1500001,
              maxIncome: 3000000,
              rate: 0.3,
              deduction: 0,
              effectiveFrom: new Date('2024-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 3000001,
              maxIncome: 5000000,
              rate: 0.35,
              deduction: 0,
              effectiveFrom: new Date('2024-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 5000001,
              maxIncome: null,
              rate: 0.4,
              deduction: 0,
              effectiveFrom: new Date('2024-01-01'),
              effectiveTo: forever,
              version: 1,
            },
          ],
        },
        socialContributions: {
          create: [
            {
              code: 'CNSS_CONT',
              label: 'CNSS - Maladie/Maternité',
              type: 'SOCIAL_SECURITY' as ContributionType,
              employerRate: 0.028,
              employeeRate: 0.018,
              cap: 840000,
              effectiveFrom: new Date('2024-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              code: 'CNSS_RET',
              label: 'CNSS - Retraite',
              type: 'PENSION' as ContributionType,
              employerRate: 0.112,
              employeeRate: 0.052,
              cap: 840000,
              effectiveFrom: new Date('2024-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              code: 'CNSS_FAM',
              label: 'CNSS - Prestations familiales',
              type: 'SOCIAL_SECURITY' as ContributionType,
              employerRate: 0.024,
              employeeRate: 0,
              cap: null,
              effectiveFrom: new Date('2024-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              code: 'CNSS_AT',
              label: 'CNSS - Accidents du travail',
              type: 'SOCIAL_SECURITY' as ContributionType,
              employerRate: 0.02,
              employeeRate: 0,
              cap: null,
              effectiveFrom: new Date('2024-01-01'),
              effectiveTo: forever,
              version: 1,
            },
          ],
        },
        leaveRules: {
          create: [
            {
              type: 'ANNUAL' as LeaveType,
              label: 'Congés annuels',
              daysEntitled: 24,
              accrualRate: 2,
              seniorityExtraDays: 1,
              maxConsecutiveDays: null,
              paidByEmployerPct: 1,
              requiresMedicalCert: false,
              effectiveFrom: new Date('2024-01-01'),
              effectiveTo: forever,
            },
            {
              type: 'SICK' as LeaveType,
              label: 'Congé maladie',
              daysEntitled: 180,
              accrualRate: null,
              seniorityExtraDays: 0,
              maxConsecutiveDays: null,
              paidByEmployerPct: 1,
              requiresMedicalCert: true,
              effectiveFrom: new Date('2024-01-01'),
              effectiveTo: forever,
            },
            {
              type: 'MATERNITY' as LeaveType,
              label: 'Congé maternité',
              daysEntitled: 98,
              accrualRate: null,
              seniorityExtraDays: 0,
              maxConsecutiveDays: null,
              paidByEmployerPct: 1,
              requiresMedicalCert: true,
              effectiveFrom: new Date('2024-01-01'),
              effectiveTo: forever,
            },
            {
              type: 'PATERNITY' as LeaveType,
              label: 'Congé paternité',
              daysEntitled: 3,
              accrualRate: null,
              seniorityExtraDays: 0,
              maxConsecutiveDays: null,
              paidByEmployerPct: 1,
              requiresMedicalCert: false,
              effectiveFrom: new Date('2024-01-01'),
              effectiveTo: forever,
            },
          ],
        },
        minimumWages: {
          create: [
            {
              amount: 52000,
              period: 'MONTHLY' as Period,
              category: 'general',
              effectiveFrom: new Date('2024-01-01'),
              effectiveTo: forever,
            },
            {
              amount: 60000,
              period: 'MONTHLY' as Period,
              category: 'agricole',
              effectiveFrom: new Date('2024-01-01'),
              effectiveTo: forever,
            },
          ],
        },
      },
    });

    // Côte d'Ivoire
    await prisma.country.create({
      data: {
        code: 'CI',
        name: "Côte d'Ivoire",
        currency: 'XOF',
        region: 'UEMOA',
        taxBrackets: {
          create: [
            {
              type: 'IRPP' as TaxType,
              minIncome: 0,
              maxIncome: 75000,
              rate: 0,
              deduction: 0,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 75001,
              maxIncome: 240000,
              rate: 0.16,
              deduction: 0,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 240001,
              maxIncome: 800000,
              rate: 0.21,
              deduction: 0,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 800001,
              maxIncome: 2400000,
              rate: 0.24,
              deduction: 0,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 2400001,
              maxIncome: 8000000,
              rate: 0.28,
              deduction: 0,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 8000001,
              maxIncome: null,
              rate: 0.32,
              deduction: 0,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
          ],
        },
        socialContributions: {
          create: [
            {
              code: 'CNPS_RET',
              label: 'CNPS - Assurance Vieillesse',
              type: 'PENSION' as ContributionType,
              employerRate: 0.077,
              employeeRate: 0.063,
              cap: 3375000,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              code: 'CNPS_FAM',
              label: 'CNPS - Prestations familiales',
              type: 'SOCIAL_SECURITY' as ContributionType,
              employerRate: 0.05,
              employeeRate: 0,
              cap: 70000,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              code: 'CNPS_MAT',
              label: 'CNPS - Assurance Maternité',
              type: 'SOCIAL_SECURITY' as ContributionType,
              employerRate: 0.0075,
              employeeRate: 0,
              cap: 70000,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              code: 'CNPS_AT',
              label: 'CNPS - Accidents du Travail',
              type: 'SOCIAL_SECURITY' as ContributionType,
              employerRate: 0.02,
              employeeRate: 0,
              cap: 70000,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
          ],
        },
        leaveRules: {
          create: [
            {
              type: 'ANNUAL' as LeaveType,
              label: 'Congés annuels',
              daysEntitled: 24,
              accrualRate: 2,
              seniorityExtraDays: 1,
              maxConsecutiveDays: null,
              paidByEmployerPct: 1,
              requiresMedicalCert: false,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
            },
            {
              type: 'SICK' as LeaveType,
              label: 'Congé maladie',
              daysEntitled: 180,
              accrualRate: null,
              seniorityExtraDays: 0,
              maxConsecutiveDays: null,
              paidByEmployerPct: 1,
              requiresMedicalCert: true,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
            },
            {
              type: 'MATERNITY' as LeaveType,
              label: 'Congé maternité',
              daysEntitled: 98,
              accrualRate: null,
              seniorityExtraDays: 0,
              maxConsecutiveDays: null,
              paidByEmployerPct: 1,
              requiresMedicalCert: true,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
            },
            {
              type: 'PATERNITY' as LeaveType,
              label: 'Congé paternité',
              daysEntitled: 10,
              accrualRate: null,
              seniorityExtraDays: 0,
              maxConsecutiveDays: null,
              paidByEmployerPct: 1,
              requiresMedicalCert: false,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
            },
          ],
        },
        minimumWages: {
          create: [
            {
              amount: 60000,
              period: 'MONTHLY' as Period,
              category: 'general',
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
            },
          ],
        },
      },
    });

    // Sénégal
    await prisma.country.create({
      data: {
        code: 'SN',
        name: 'Sénégal',
        currency: 'XOF',
        region: 'UEMOA',
        taxBrackets: {
          create: [
            {
              type: 'IRPP' as TaxType,
              minIncome: 0,
              maxIncome: 630000,
              rate: 0,
              deduction: 0,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 630001,
              maxIncome: 1500000,
              rate: 0.2,
              deduction: 0,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 1500001,
              maxIncome: 4000000,
              rate: 0.3,
              deduction: 0,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 4000001,
              maxIncome: 8000000,
              rate: 0.35,
              deduction: 0,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 8000001,
              maxIncome: 13500000,
              rate: 0.37,
              deduction: 0,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 13500001,
              maxIncome: 50000000,
              rate: 0.4,
              deduction: 0,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              type: 'IRPP' as TaxType,
              minIncome: 50000001,
              maxIncome: null,
              rate: 0.43,
              deduction: 0,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
          ],
        },
        socialContributions: {
          create: [
            {
              code: 'IPRES_RG',
              label: 'IPRES - Régime Général Retraite',
              type: 'PENSION' as ContributionType,
              employerRate: 0.084,
              employeeRate: 0.056,
              cap: 432000,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              code: 'CSS_FAM',
              label: 'CSS - Prestations familiales',
              type: 'SOCIAL_SECURITY' as ContributionType,
              employerRate: 0.07,
              employeeRate: 0,
              cap: 63000,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
            {
              code: 'CSS_AT',
              label: 'CSS - Accidents du Travail/MP',
              type: 'SOCIAL_SECURITY' as ContributionType,
              employerRate: 0.02,
              employeeRate: 0,
              cap: 63000,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
              version: 1,
            },
          ],
        },
        leaveRules: {
          create: [
            {
              type: 'ANNUAL' as LeaveType,
              label: 'Congés annuels',
              daysEntitled: 24,
              accrualRate: 2,
              seniorityExtraDays: 1,
              maxConsecutiveDays: null,
              paidByEmployerPct: 1,
              requiresMedicalCert: false,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
            },
            {
              type: 'SICK' as LeaveType,
              label: 'Congé maladie',
              daysEntitled: 180,
              accrualRate: null,
              seniorityExtraDays: 0,
              maxConsecutiveDays: null,
              paidByEmployerPct: 1,
              requiresMedicalCert: true,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
            },
            {
              type: 'MATERNITY' as LeaveType,
              label: 'Congé maternité',
              daysEntitled: 98,
              accrualRate: null,
              seniorityExtraDays: 0,
              maxConsecutiveDays: null,
              paidByEmployerPct: 1,
              requiresMedicalCert: true,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
            },
            {
              type: 'PATERNITY' as LeaveType,
              label: 'Congé paternité',
              daysEntitled: 10,
              accrualRate: null,
              seniorityExtraDays: 0,
              maxConsecutiveDays: null,
              paidByEmployerPct: 1,
              requiresMedicalCert: false,
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
            },
          ],
        },
        minimumWages: {
          create: [
            {
              amount: 64306,
              period: 'MONTHLY' as Period,
              category: 'general',
              effectiveFrom: new Date('2025-01-01'),
              effectiveTo: forever,
            },
          ],
        },
      },
    });

    // Public holidays (fixed dates, recurring)
    const frHolidays = [
      { date: new Date('2025-01-01'), name: "Jour de l'an" },
      { date: new Date('2025-05-01'), name: 'Fête du Travail' },
      { date: new Date('2025-05-08'), name: 'Victoire 1945' },
      { date: new Date('2025-07-14'), name: 'Fête nationale' },
      { date: new Date('2025-08-15'), name: 'Assomption' },
      { date: new Date('2025-11-01'), name: 'Toussaint' },
      { date: new Date('2025-11-11'), name: 'Armistice 1918' },
      { date: new Date('2025-12-25'), name: 'Noël' },
    ];
    for (const h of frHolidays) {
      await prisma.publicHoliday.create({
        data: { countryCode: 'FR', date: h.date, name: h.name, isRecurring: true },
      });
    }

    const bjHolidays = [
      { date: new Date('2025-01-01'), name: "Jour de l'an" },
      { date: new Date('2025-01-10'), name: 'Fête du Vodoun' },
      { date: new Date('2025-04-21'), name: 'Lundi de Pâques' },
      { date: new Date('2025-05-01'), name: 'Fête du Travail' },
      { date: new Date('2025-05-29'), name: 'Ascension' },
      { date: new Date('2025-06-09'), name: 'Lundi de Pentecôte' },
      { date: new Date('2025-08-01'), name: 'Indépendance' },
      { date: new Date('2025-08-15'), name: 'Assomption' },
      { date: new Date('2025-11-01'), name: 'Toussaint' },
      { date: new Date('2025-12-25'), name: 'Noël' },
    ];
    for (const h of bjHolidays) {
      await prisma.publicHoliday.create({
        data: { countryCode: 'BJ', date: h.date, name: h.name, isRecurring: true },
      });
    }

    const ciHolidays = [
      { date: new Date('2025-01-01'), name: "Jour de l'an" },
      { date: new Date('2025-04-21'), name: 'Lundi de Pâques' },
      { date: new Date('2025-05-01'), name: 'Fête du Travail' },
      { date: new Date('2025-05-29'), name: 'Ascension' },
      { date: new Date('2025-06-09'), name: 'Lundi de Pentecôte' },
      { date: new Date('2025-08-07'), name: 'Indépendance' },
      { date: new Date('2025-08-15'), name: 'Assomption' },
      { date: new Date('2025-11-01'), name: 'Toussaint' },
      { date: new Date('2025-11-15'), name: 'Journée nationale de la Paix' },
      { date: new Date('2025-12-25'), name: 'Noël' },
    ];
    for (const h of ciHolidays) {
      await prisma.publicHoliday.create({
        data: { countryCode: 'CI', date: h.date, name: h.name, isRecurring: true },
      });
    }

    const snHolidays = [
      { date: new Date('2025-01-01'), name: "Jour de l'an" },
      { date: new Date('2025-04-04'), name: 'Indépendance' },
      { date: new Date('2025-04-21'), name: 'Lundi de Pâques' },
      { date: new Date('2025-05-01'), name: 'Fête du Travail' },
      { date: new Date('2025-05-29'), name: 'Ascension' },
      { date: new Date('2025-06-09'), name: 'Lundi de Pentecôte' },
      { date: new Date('2025-08-15'), name: 'Assomption' },
      { date: new Date('2025-11-01'), name: 'Toussaint' },
      { date: new Date('2025-12-25'), name: 'Noël' },
    ];
    for (const h of snHolidays) {
      await prisma.publicHoliday.create({
        data: { countryCode: 'SN', date: h.date, name: h.name, isRecurring: true },
      });
    }
  }

  console.log('Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
