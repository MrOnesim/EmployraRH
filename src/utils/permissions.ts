import type { UserRole } from '../types';

export type Permission =
  | 'view_employees'
  | 'manage_employees'
  | 'view_salary'
  | 'manage_salary'
  | 'view_attendance'
  | 'manage_attendance'
  | 'view_leaves'
  | 'manage_leaves'
  | 'view_payslips'
  | 'manage_payslips'
  | 'view_recruitment'
  | 'manage_recruitment'
  | 'view_objectives'
  | 'manage_objectives'
  | 'view_performance'
  | 'manage_performance'
  | 'view_documents'
  | 'manage_documents'
  | 'view_banking'
  | 'manage_banking'
  | 'view_tax'
  | 'manage_tax'
  | 'view_training'
  | 'manage_training'
  | 'view_missions'
  | 'manage_missions'
  | 'view_marketplace'
  | 'manage_marketplace'
  | 'view_orgchart'
  | 'view_reports'
  | 'manage_reports'
  | 'view_ai_assistant'
  | 'view_settings'
  | 'manage_settings'
  | 'view_teams'
  | 'manage_teams'
  | 'view_feed'
  | 'manage_feed'
  | 'view_messages'
  | 'view_calendar'
  | 'view_import'
  | 'manage_import'
  | 'view_vault'
  | 'view_rewards'
  | 'manage_rewards'
  | 'view_equipment'
  | 'manage_equipment'
  | 'view_wellness'
  | 'manage_wellness'
  | 'view_fintech'
  | 'manage_fintech'
  | 'view_quizzes'
  | 'manage_quizzes'
  | 'view_signatures'
  | 'manage_signatures';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'view_employees', 'manage_employees',
    'view_salary', 'manage_salary',
    'view_attendance', 'manage_attendance',
    'view_leaves', 'manage_leaves',
    'view_payslips', 'manage_payslips',
    'view_recruitment', 'manage_recruitment',
    'view_objectives', 'manage_objectives',
    'view_performance', 'manage_performance',
    'view_documents', 'manage_documents',
    'view_banking', 'manage_banking',
    'view_tax', 'manage_tax',
    'view_training', 'manage_training',
    'view_missions', 'manage_missions',
    'view_marketplace', 'manage_marketplace',
    'view_orgchart',
    'view_reports', 'manage_reports',
    'view_ai_assistant',
    'view_settings', 'manage_settings',
    'view_teams', 'manage_teams',
    'view_feed', 'manage_feed',
    'view_messages',
    'view_calendar',
    'view_import', 'manage_import',
    'view_vault', 'view_rewards', 'manage_rewards',
    'view_equipment', 'manage_equipment',
    'view_wellness', 'manage_wellness',
    'view_fintech', 'manage_fintech',
    'view_quizzes', 'manage_quizzes',
    'view_signatures', 'manage_signatures',
  ],
  ADMIN: [
    'view_employees', 'manage_employees',
    'view_salary', 'manage_salary',
    'view_attendance', 'manage_attendance',
    'view_leaves', 'manage_leaves',
    'view_payslips', 'manage_payslips',
    'view_recruitment', 'manage_recruitment',
    'view_objectives', 'manage_objectives',
    'view_performance', 'manage_performance',
    'view_documents', 'manage_documents',
    'view_banking', 'manage_banking',
    'view_tax', 'manage_tax',
    'view_training', 'manage_training',
    'view_missions', 'manage_missions',
    'view_marketplace', 'manage_marketplace',
    'view_orgchart',
    'view_reports', 'manage_reports',
    'view_ai_assistant',
    'view_settings', 'manage_settings',
    'view_teams', 'manage_teams',
    'view_feed', 'manage_feed',
    'view_messages',
    'view_calendar',
    'view_import', 'manage_import',
    'view_vault', 'view_rewards', 'manage_rewards',
    'view_equipment', 'manage_equipment',
    'view_wellness', 'manage_wellness',
    'view_fintech', 'manage_fintech',
    'view_quizzes', 'manage_quizzes',
    'view_signatures', 'manage_signatures',
  ],
  RH: [
    'view_employees', 'manage_employees',
    'view_attendance', 'manage_attendance',
    'view_leaves', 'manage_leaves',
    'view_recruitment', 'manage_recruitment',
    'view_objectives', 'manage_objectives',
    'view_performance', 'manage_performance',
    'view_documents', 'manage_documents',
    'view_training',
    'view_missions',
    'view_marketplace',
    'view_orgchart',
    'view_reports',
    'view_ai_assistant',
    'view_settings',
    'view_teams', 'manage_teams',
    'view_feed', 'manage_feed',
    'view_messages',
    'view_calendar',
    'view_import',
    'view_vault', 'view_rewards',
    'view_equipment', 'view_wellness', 'manage_wellness',
    'view_fintech',
    'view_quizzes',
    'view_signatures', 'manage_signatures',
  ],
  MANAGER: [
    'view_employees',
    'view_attendance',
    'view_leaves', 'manage_leaves',
    'view_objectives', 'manage_objectives',
    'view_performance',
    'view_documents',
    'view_training',
    'view_missions',
    'view_marketplace',
    'view_orgchart',
    'view_reports',
    'view_teams',
    'view_feed', 'manage_feed',
    'view_messages',
    'view_calendar',
    'view_vault', 'view_rewards', 'view_equipment', 'view_wellness',
    'view_fintech', 'view_quizzes',
  ],
  EMPLOYEE: [
    'view_attendance',
    'view_leaves',
    'view_payslips',
    'view_objectives',
    'view_documents',
    'view_training',
    'view_missions',
    'view_orgchart',
    'view_messages',
    'view_calendar',
  ],
  DEPARTMENT_HEAD: [
    'view_employees',
    'view_attendance',
    'view_leaves', 'manage_leaves',
    'view_objectives', 'manage_objectives',
    'view_performance',
    'view_documents',
    'view_training',
    'view_missions',
    'view_marketplace',
    'view_orgchart',
    'view_reports',
    'view_teams',
    'view_feed', 'manage_feed',
    'view_messages',
    'view_calendar',
    'view_vault', 'view_rewards', 'view_equipment', 'view_wellness',
    'view_fintech', 'view_quizzes',
  ],
  SECURITY_GUARD: [
    'view_attendance',
    'view_leaves',
    'view_payslips',
    'view_objectives',
    'view_documents',
    'view_training',
    'view_missions',
    'view_orgchart',
    'view_messages',
    'view_calendar',
  ],
};

export function hasPermission(userRole: UserRole | undefined, permission: Permission): boolean {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
}

export function canAccessMenu(userRole: UserRole | undefined, path: string): boolean {
  const pathPermissionMap: Record<string, Permission> = {
    '/admin/employees': 'view_employees',
    '/admin/teams': 'view_teams',
    '/admin/feed': 'view_feed',
    '/admin/import': 'view_import',
    '/admin/salary': 'view_salary',
    '/admin/attendance': 'view_attendance',
    '/admin/leaves': 'view_leaves',
    '/admin/leave-policy': 'manage_leaves',
    '/admin/payslips': 'view_payslips',
    '/admin/performance': 'view_performance',
    '/admin/recruitment': 'view_recruitment',
    '/admin/objectives': 'view_objectives',
    '/admin/documents': 'view_documents',
    '/admin/calendar': 'view_calendar',
    '/admin/messages': 'view_messages',
    '/admin/notifications': 'view_messages',
    '/admin/reports': 'view_reports',
    '/admin/banking': 'view_banking',
    '/admin/tax': 'view_tax',
    '/admin/training': 'view_training',
    '/admin/missions': 'view_missions',
    '/admin/marketplace': 'view_marketplace',
    '/admin/org-chart': 'view_orgchart',
    '/admin/ai-assistant': 'view_ai_assistant',
    '/admin/vault': 'view_vault',
    '/admin/rewards': 'view_rewards',
    '/admin/equipment': 'view_equipment',
    '/admin/wellness': 'view_wellness',
    '/admin/fintech': 'view_fintech',
    '/admin/signatures': 'view_signatures',
    '/admin/roles': 'manage_settings',
    '/admin/onboarding': 'manage_settings',
    '/admin/settings': 'view_settings',
    '/employee/vault': 'view_vault',
    '/employee/rewards': 'view_rewards',
    '/employee/equipment': 'view_equipment',
    '/employee/wellness': 'view_wellness',
    '/employee/fintech': 'view_fintech',
    '/employee/attendance': 'view_attendance',
    '/employee/leaves': 'view_leaves',
    '/employee/payslips': 'view_payslips',
    '/employee/messages': 'view_messages',
    '/employee/notifications': 'view_messages',
    '/employee-dashboard/notifications': 'view_messages',
    '/employee/calendar': 'view_calendar',
  };
  const perm = pathPermissionMap[path];
  if (!perm) return true;
  return hasPermission(userRole, perm);
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  RH: 3,
  MANAGER: 3,
  DEPARTMENT_HEAD: 2,
  EMPLOYEE: 1,
  SECURITY_GUARD: 1,
};

export function isRoleSufficient(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
