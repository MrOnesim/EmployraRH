import type { Employee, Attendance, Leave, Company } from '../types';

interface RuleResponse {
  content: string;
  suggestions?: string[];
}

interface RuleContext {
  employees: Employee[];
  attendance: Attendance[];
  leaves: Leave[];
  company: Company | null;
}

type RuleHandler = (q: string, ctx: RuleContext, extraContext?: Record<string, any>) => RuleResponse | null;

interface Rule {
  pattern: RegExp;
  handler: RuleHandler;
}

function getAbsentEmployees(employees: Employee[], attendance: Attendance[]): Employee[] {
  const today = new Date();
  return employees.filter(
    (e) => e.status === 'active' && !attendance.some(
      (a) => a.employeeId === e.id && new Date(a.date).toDateString() === today.toDateString(),
    ),
  );
}

function getPresentCount(attendance: Attendance[]): number {
  const today = new Date();
  return attendance.filter(
    (a) => new Date(a.date).toDateString() === today.toDateString() && (a.status === 'present' || a.status === 'late'),
  ).length;
}

function getLateCount(attendance: Attendance[]): number {
  const today = new Date();
  return attendance.filter(
    (a) => new Date(a.date).toDateString() === today.toDateString() && a.status === 'late',
  ).length;
}

function detectAnomalies(employees: Employee[], attendance: Attendance[], leaves: Leave[]): string[] {
  const anomalies: string[] = [];
  const active = employees.filter((e) => e.status === 'active');
  const pendingLeaves = leaves.filter((l) => l.status === 'pending');
  const lateCount = getLateCount(attendance);
  const absent = getAbsentEmployees(employees, attendance);

  if (lateCount > 0) {
    const names = attendance
      .filter((a) => a.status === 'late' && new Date(a.date).toDateString() === new Date().toDateString())
      .map((a) => { const e = employees.find((emp) => emp.id === a.employeeId); return e ? e.firstName : '?'; })
      .join(', ');
    anomalies.push(`Retards détectés: ${lateCount} employé(s) en retard (${names})`);
  }
  if (absent.length > 0) {
    anomalies.push(`Absences: ${absent.length} employé(s) absent(s): ${absent.map((e) => `${e.firstName} ${e.lastName}`).join(', ')}`);
  }
  if (pendingLeaves.length > 0) {
    anomalies.push(`Congés non traités: ${pendingLeaves.length} demande(s) en attente`);
  }
  const salaries = active.map((e) => e.salary).filter((s) => s > 0);
  if (salaries.length > 2) {
    const max = Math.max(...salaries);
    const min = Math.min(...salaries);
    if (max / min > 3) {
      anomalies.push(`Écart salarial important: Ratio ${Math.round(max / min)}x (recommandé < 3x)`);
    }
  }
  return anomalies;
}

const rules: Rule[] = [
  {
    pattern: /^(bonjour|salut|hello|hey|hi|bonsoir)/,
    handler: () => ({
      content: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ? Je peux analyser vos données RH, détecter des anomalies, faire des recommandations, ou répondre à des questions spécifiques.',
      suggestions: ['Résumé complet', 'Qui est absent ?', 'Analyse des salaires', 'Recommandations'],
    }),
  },

  {
    pattern: /résumé|synthèse|overview|complet/,
    handler: (_q, { employees, attendance, leaves, company }) => {
      const active = employees.filter((e) => e.status === 'active');
      const absent = getAbsentEmployees(employees, attendance);
      const presentCount = getPresentCount(attendance);
      const lateCount = getLateCount(attendance);
      const totalSalary = active.reduce((s, e) => s + e.salary, 0);
      const pendingLeaves = leaves.filter((l) => l.status === 'pending');
      const departments = new Set(employees.map((e) => e.department)).size;
      const turnover = employees.length > 0 ? Math.round((employees.filter((e) => e.status === 'inactive').length / employees.length) * 100) : 0;
      const anomalies = detectAnomalies(employees, attendance, leaves);
      return {
        content: [
          '=== RAPPORT COMPLET - EMPLOYEPRO ===',
          '',
          `Entreprise : ${company?.name || 'Non définie'}`,
          `Adresse : ${company?.address || 'Non définie'}`,
          '',
          'EFFECTIFS',
          `- Total employés : ${employees.length}`,
          `- Actifs : ${active.length}`,
          `- Inactifs : ${employees.length - active.length}`,
          `- Départements : ${departments}`,
          `- Turnover : ${turnover}%`,
          '',
          'PRÉSENCES AUJOURD\'HUI',
          `- Présents : ${presentCount - lateCount}`,
          `- En retard : ${lateCount}`,
          `- Absents : ${absent.length}`,
          `- Taux : ${active.length > 0 ? Math.round((presentCount / active.length) * 100) : 0}%`,
          '',
          'SALAIRES',
          `- Masse salariale mensuelle : ${(totalSalary / 1000000).toFixed(2)}M / mois`,
          `- Salaire moyen : ${(totalSalary / active.length / 1000).toFixed(0)}K / mois`,
          `- Salaire max : ${(Math.max(...employees.map((e) => e.salary)) / 1000).toFixed(0)}K`,
          `- Salaire min : ${(Math.min(...employees.filter((e) => e.salary > 0).map((e) => e.salary)) / 1000).toFixed(0)}K`,
          '',
          'CONGÉS',
          `- En attente : ${pendingLeaves.length}`,
          `- Approuvés : ${leaves.filter((l) => l.status === 'approved').length}`,
          `- Refusés : ${leaves.filter((l) => l.status === 'rejected').length}`,
          '',
          'ALERTES',
          ...(anomalies.length > 0 ? anomalies : ['Aucune anomalie détectée']),
        ].join('\n'),
        suggestions: ['Analyse des salaires en détail', 'Détection d\'anomalies', 'Recommandations'],
      };
    },
  },

  {
    pattern: /absent|absence|manquant/,
    handler: (_q, { employees, attendance }) => {
      const absent = getAbsentEmployees(employees, attendance);
      if (absent.length === 0) {
        return { content: 'Aucun employé absent aujourd\'hui. Tous les employés actifs sont présents. Excellent taux de présence !' };
      }
      const names = absent.map((e) => `- ${e.firstName} ${e.lastName} - ${e.position} (${e.department})`).join('\n');
      return { content: `${absent.length} employé(s) absent(s) aujourd'hui :\n\n${names}\n\nJe vous recommande de contacter ces employés pour vérifier les raisons de leur absence.` };
    },
  },

  {
    pattern: /salaire|masse salariale|budget|paye/,
    handler: (_q, { employees }) => {
      const active = employees.filter((e) => e.status === 'active');
      const totalSalary = active.reduce((s, e) => s + e.salary, 0);
      const avg = totalSalary / active.length;
      const max = Math.max(...active.map((e) => e.salary));
      const min = Math.min(...active.map((e) => e.salary));
      const sorted = [...active].sort((a, b) => b.salary - a.salary);
      const top5 = sorted.slice(0, 5).map((e) => `- ${e.firstName} ${e.lastName}: ${e.salary.toLocaleString()} (${e.department})`).join('\n');
      return {
        content: [
          '=== ANALYSE DES SALAIRES ===',
          '',
          `Masse salariale mensuelle: ${(totalSalary / 1000000).toFixed(2)}M`,
          `Masse salariale annuelle: ${(totalSalary * 12 / 1000000).toFixed(2)}M`,
          `Salaire moyen: ${(avg / 1000).toFixed(0)}K`,
          `Écart min/max: ${(max / min).toFixed(1)}x`,
          '',
          'TOP 5 LES MIEUX RÉMUNÉRÉS:',
          top5,
          '',
          (max / min > 3 ? 'ATTENTION: L\'écart salarial est important. Harmoniser les grilles.' : 'La répartition des salaires est équilibrée.'),
        ].join('\n'),
        suggestions: ['Top 5 salaires', 'Coût annuel total', 'Écart salarial'],
      };
    },
  },

  {
    pattern: /heure sup|supplémentaire|overtime|surheures/,
    handler: (_q, { employees, attendance }) => {
      const empStats: Record<string, { name: string; totalHours: number; overtime: number }> = {};
      attendance.forEach((a) => {
        const emp = employees.find((e) => e.id === a.employeeId);
        if (!emp) return;
        if (!empStats[a.employeeId]) empStats[a.employeeId] = { name: `${emp.firstName} ${emp.lastName}`, totalHours: 0, overtime: 0 };
        empStats[a.employeeId].totalHours += a.totalHours;
        empStats[a.employeeId].overtime += a.overtime;
      });
      const sorted = Object.values(empStats).sort((a, b) => b.overtime - a.overtime);
      if (sorted.length === 0 || sorted.every((e) => e.overtime === 0)) {
        return { content: 'Aucune heure supplémentaire enregistrée.' };
      }
      const list = sorted.map((e, i) => `${i + 1}. ${e.name}: ${e.totalHours}h total, +${e.overtime}h sup`).join('\n');
      return { content: `=== HEURES SUPPLÉMENTAIRES ===\n\nLeader: ${sorted[0].name} (${sorted[0].overtime}h sup)\n\nCLASSEMENT:\n${list}` };
    },
  },

  {
    pattern: /meilleur|top|performance|best|classement/,
    handler: (_q, { employees, attendance }) => {
      const empStats: Record<string, { name: string; score: number }> = {};
      attendance.forEach((a) => {
        const emp = employees.find((e) => e.id === a.employeeId);
        if (!emp) return;
        if (!empStats[a.employeeId]) empStats[a.employeeId] = { name: `${emp.firstName} ${emp.lastName}`, score: 0 };
        empStats[a.employeeId].score += a.totalHours + (a.status === 'present' ? 5 : 0) + a.overtime * 3;
      });
      const sorted = Object.values(empStats).sort((a, b) => b.score - a.score).slice(0, 3);
      if (sorted.length === 0) return { content: 'Pas assez de données pour établir un classement.' };
      const podium = sorted.map((e, i) => `${i === 0 ? '1er' : i === 1 ? '2ème' : '3ème'}: ${e.name} (score: ${e.score.toFixed(0)})`).join('\n');
      return { content: `=== TOP 3 DES MEILLEURS EMPLOYÉS ===\n\n${podium}\n\nCritère combiné: heures travaillées + ponctualité + heures supplémentaires` };
    },
  },

  {
    pattern: /taux de présence|présence moyenne|présent/,
    handler: (_q, { employees, attendance }) => {
      const active = employees.filter((e) => e.status === 'active');
      const presentCount = getPresentCount(attendance);
      const lateCount = getLateCount(attendance);
      const absent = getAbsentEmployees(employees, attendance);
      const rate = active.length > 0 ? ((presentCount / active.length) * 100).toFixed(1) : '0';
      return {
        content: [
          '=== TAUX DE PRÉSENCE ===',
          '',
          `Aujourd'hui: ${rate}% (${presentCount}/${active.length})`,
          parseFloat(rate) >= 95 ? 'Excellent !' : parseFloat(rate) >= 85 ? 'Bon, mais perfectible.' : 'Préoccupant - action requise.',
          '',
          `Retards: ${lateCount}`,
          `Absents: ${absent.length}`,
        ].join('\n'),
      };
    },
  },

  {
    pattern: /congé|congés|leave/,
    handler: (_q, { employees, leaves }) => {
      const pendingLeaves = leaves.filter((l) => l.status === 'pending');
      if (pendingLeaves.length === 0) return { content: 'Aucune demande de congé en attente. Tout est à jour !' };
      const details = pendingLeaves.map((l) => {
        const emp = employees.find((e) => e.id === l.employeeId);
        const days = Math.ceil((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / 86400000) + 1;
        return `- ${emp ? `${emp.firstName} ${emp.lastName}` : '?'}: ${l.type === 'annual' ? 'Annuel' : l.type === 'sick' ? 'Maladie' : 'Spécial'} - ${days}j - "${l.reason}"`;
      }).join('\n');
      return { content: `${pendingLeaves.length} demande(s) de congé en attente:\n\n${details}\n\nJe vous recommande de les traiter rapidement.` };
    },
  },

  {
    pattern: /département|service/,
    handler: (_q, { employees }) => {
      const active = employees.filter((e) => e.status === 'active');
      const stats: Record<string, { count: number; totalSalary: number }> = {};
      active.forEach((emp) => {
        if (!stats[emp.department]) stats[emp.department] = { count: 0, totalSalary: 0 };
        stats[emp.department].count++;
        stats[emp.department].totalSalary += emp.salary;
      });
      const details = Object.entries(stats).map(([d, s]) => `- ${d}: ${s.count} employé(s), ${(s.totalSalary / s.count / 1000).toFixed(0)}K moy.`).join('\n');
      return { content: `=== STATISTIQUES PAR DÉPARTEMENT ===\n\n${details}\n\nTotal: ${active.length} employés actifs` };
    },
  },

  {
    pattern: /recommandation|améliorer|productivité|conseil/,
    handler: (_q, { employees, leaves, attendance }) => {
      const recs: string[] = [];
      const pendingLeaves = leaves.filter((l) => l.status === 'pending');
      const absent = getAbsentEmployees(employees, attendance);
      const turnover = employees.length > 0 ? Math.round((employees.filter((e) => e.status === 'inactive').length / employees.length) * 100) : 0;
      if (pendingLeaves.length > 0) recs.push(`Congés en attente: Traiter les ${pendingLeaves.length} demande(s) rapidement.`);
      if (turnover > 10) recs.push(`Turnover de ${turnover}% est élevé. Mettre en place un programme de rétention.`);
      if (absent.length > 0) recs.push(`Absents aujourd'hui: ${absent.length} employé(s). Vérifier les raisons.`);
      recs.push('Organiser un séminaire d\'équipe pour améliorer la cohésion.');
      recs.push('Investir dans la formation des compétences. ROI estimé à 24% par an.');
      recs.push('Mettre en place un programme de QVT pour réduire le stress et l\'absentéisme.');
      return { content: `=== RECOMMANDATIONS ===\n\n${recs.map((r, i) => `${i + 1}. ${r}`).join('\n')}` };
    },
  },

  {
    pattern: /anomalie|détect|problème|alert/,
    handler: (_q, { employees, attendance, leaves }) => {
      const anomalies = detectAnomalies(employees, attendance, leaves);
      if (anomalies.length === 0) return { content: 'Aucune anomalie détectée ! Toutes les données sont normales.' };
      return { content: `=== ANOMALIES DÉTECTÉES (${anomalies.length}) ===\n\n${anomalies.map((a, i) => `${i + 1}. ${a}`).join('\n')}` };
    },
  },

  {
    pattern: /turnover|rotation|quitter/,
    handler: (_q, { employees }) => {
      const inactive = employees.filter((e) => e.status === 'inactive');
      const turnover = employees.length > 0 ? Math.round((inactive.length / employees.length) * 100) : 0;
      return {
        content: [
          '=== TAUX DE TURNOVER ===',
          '',
          `Actuel: ${turnover}%`,
          `Inactifs: ${inactive.length}`,
          `Total: ${employees.length}`,
          '',
          turnover <= 5 ? 'Excellent - Taux de rétention très élevé.' : turnover <= 10 ? 'Acceptable mais à surveiller.' : 'Élevé - Actions correctives nécessaires.',
          ...(inactive.length > 0 ? ['', 'Inactifs:', ...inactive.map((e) => `- ${e.firstName} ${e.lastName} - ${e.position}`)] : []),
        ].join('\n'),
      };
    },
  },

  {
    pattern: /aide|help|capable|fonction/,
    handler: () => ({
      content: [
        '=== POSSIBILITÉS DE L\'ASSISTANT IA ===',
        '',
        'Analyse: résumé, effectifs, départements, turnover',
        'Salaire: masse salariale, écarts, par département',
        'Employés: présences, absences, meilleurs, classement',
        'Temps: heures sup., retards, taux de présence',
        'Congés: demandes en attente, statistiques',
        'Alertes: détection d\'anomalies automatique',
        'Conseils: recommandations, productivité, formation',
        '',
        'Exemples: "Résumé complet", "Qui est absent ?", "Analyse les salaires"',
      ].join('\n'),
      suggestions: ['Résumé complet', 'Détection d\'anomalies', 'Recommandations'],
    }),
  },

  {
    pattern: /formation|training/,
    handler: (_q, { employees }) => {
      const active = employees.filter((e) => e.status === 'active');
      return {
        content: [
          '=== PLAN DE FORMATION RECOMMANDÉ ===',
          '',
          '- Informatique: IA, Cloud, Cybersécurité',
          '- RH: Gestion du changement, négociation',
          '- Finance: Nouvelles régulations, outils digitaux',
          '- Marketing: Growth hacking, SEO',
          '- Tous: Soft skills, management, bien-être',
          '',
          `Budget estimé: ${(active.length * 100000 / 1000).toFixed(0)}K par employé/an`,
          'ROI estimé: 24% par an',
        ].join('\n'),
      };
    },
  },

  {
    pattern: /combien|effectif|nombre/,
    handler: (_q, { employees }) => {
      const active = employees.filter((e) => e.status === 'active');
      return {
        content: [
          '=== RÉPARTITION DES EFFECTIFS ===',
          '',
          `Total: ${employees.length}`,
          `Actifs: ${active.length}`,
          `Inactifs: ${employees.length - active.length}`,
          `Départements: ${new Set(employees.map((e) => e.department)).size}`,
        ].join('\n'),
      };
    },
  },
  {
    pattern: /coffre|vault|document personnel|mes docs/,
    handler: (_q, _ctx, extra = {}) => {
      const items = extra.vaultItems || [];
      return { content: `Vous avez ${items.length} document(s) dans votre coffre-fort numérique.` };
    },
  },

  {
    pattern: /récompense|point|reward|solde points/,
    handler: (_q, _ctx, extra = {}) => {
      const points = extra.points ?? 0;
      const txs = extra.rewardTransactions || [];
      const recent = txs.slice(-5).map((t: any) => `- ${t.type}: ${t.points || 0} pts (${t.date || ''})`).join('\n');
      return {
        content: [
          '=== MES RÉCOMPENSES ===',
          '',
          `Solde de points: ${points}`,
          ...(txs.length > 0 ? ['', '5 dernières transactions:', recent] : ['', 'Aucune transaction récente.']),
        ].join('\n'),
      };
    },
  },

  {
    pattern: /équipement|matériel|equip/,
    handler: (_q, _ctx, extra = {}) => {
      const equipment = extra.equipment || [];
      if (equipment.length === 0) return { content: 'Vous n\'avez aucun équipement attribué actuellement.' };
      const list = equipment.map((e: any) => `- ${e.name || e.type} (${e.status || 'assigné'})`).join('\n');
      return { content: `=== ÉQUIPEMENT ATTRIBUÉ ===\n\nVous avez ${equipment.length} équipement(s):\n\n${list}` };
    },
  },

  {
    pattern: /bien-être|sondage|wellness|satisfaction/,
    handler: (_q, _ctx, extra = {}) => {
      const surveys = extra.surveys || [];
      const wellnessScore = extra.wellnessScore ?? null;
      const activeSurveys = surveys.filter((s: any) => s.status === 'active' || !s.status);
      const surveyInfo = activeSurveys.length > 0
        ? `Sondages actifs: ${activeSurveys.length}`
        : 'Aucun sondage actif pour le moment.';
      const scoreInfo = wellnessScore !== null
        ? `Score de bien-être global: ${wellnessScore}/100`
        : 'Pas encore de score de bien-être disponible.';
      return { content: `=== BIEN-ÊTRE ===\n\n${surveyInfo}\n${scoreInfo}` };
    },
  },

  {
    pattern: /avance|salaire avance|fintech|transfert/,
    handler: (_q, _ctx, extra = {}) => {
      const advances = extra.advances || [];
      const transfers = extra.transfers || [];
      const pendingAdvances = advances.filter((a: any) => a.status === 'pending').length;
      const recentTransfers = transfers.slice(-3).map((t: any) => `- ${t.amount || 0}€ (${t.date || ''})`).join('\n');
      return {
        content: [
          '=== FINTECH / AVANCES ===',
          '',
          `Avances en cours: ${pendingAdvances} demande(s)`,
          `Avances totales: ${advances.length}`,
          ...(transfers.length > 0 ? ['', '3 derniers transferts:', recentTransfers] : ['', 'Aucun transfert récent.']),
        ].join('\n'),
      };
    },
  },

  {
    pattern: /quiz|certificat|certification/,
    handler: (_q, _ctx, extra = {}) => {
      const quizzes = extra.quizzes || [];
      const certificates = extra.certificates || [];
      const availableQuizzes = quizzes.filter((q: any) => q.status === 'available' || !q.completed);
      const certList = certificates.length > 0
        ? certificates.map((c: any) => `- ${c.name || c.title} (${c.date || 'obtenu'})`).join('\n')
        : 'Aucun certificat obtenu pour le moment.';
      return {
        content: [
          '=== QUIZ & CERTIFICATIONS ===',
          '',
          `Quiz disponibles: ${availableQuizzes.length}`,
          `Quiz complétés: ${quizzes.filter((q: any) => q.completed).length}`,
          '',
          'Certificats obtenus:',
          certList,
        ].join('\n'),
      };
    },
  },

  {
    pattern: /congé restant|solde congé|combien de congé/,
    handler: (_q, _ctx, extra = {}) => {
      const leaveBalance = extra.leaveBalance ?? {};
      const annual = leaveBalance.annual ?? '—';
      const sick = leaveBalance.sick ?? '—';
      const special = leaveBalance.special ?? '—';
      return {
        content: [
          '=== SOLDE DE CONGÉS ===',
          '',
          `Congés annuels restants: ${annual} jours`,
          `Congés maladie restants: ${sick} jours`,
          `Congés spéciaux restants: ${special} jours`,
        ].join('\n'),
      };
    },
  },
];

function fallbackResponse(): RuleResponse {
  return {
    content: [
      'J\'ai bien reçu votre question. Je peux vous aider avec:',
      '',
      '- Résumé complet - Vue complète de l\'entreprise',
      '- Salaires - Budget, écarts, détails',
      '- Présences - Absences, retards, taux',
      '- Congés - Demandes, statistiques',
      '- Départements - Stats par service',
      '- Anomalies - Détection automatique',
      '- Recommandations - Conseils IA',
      '',
      'Reformulez votre question pour une réponse plus précise !',
    ].join('\n'),
    suggestions: ['Résumé complet', 'Qui est absent ?', 'Analyse des salaires', 'Recommandations'],
  };
}

export function processQuestion(
  question: string,
  employees: Employee[],
  attendance: Attendance[],
  leaves: Leave[],
  company: Company | null,
  extraContext: Record<string, any> = {},
): RuleResponse {
  const q = question.toLowerCase().trim();
  const ctx: RuleContext = { employees, attendance, leaves, company };

  for (const rule of rules) {
    if (rule.pattern.test(q)) {
      const result = rule.handler(q, ctx, extraContext);
      if (result) return result;
    }
  }

  return fallbackResponse();
}
