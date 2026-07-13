import type {
  Employee,
  Attendance,
  Leave,
  Payslip,
  Company,
  Notification,
  Invitation,
  CalendarEvent,
  PayrollConfig,
  JobOffer,
  Candidate,
  Objective,
  PerformanceReview,
  BankAccount,
  BankTransaction,
  TaxDeclaration,
  Course,
  Enrollment,
  Mission,
  ExpenseReport,
  Meeting,
  Equipment,
  EquipmentAssignment,
  WellnessSurvey,
  WellnessResponse,
  SalaryAdvance,
  SalaryTransfer,
  Quiz,
  QuizAttempt,
  Certificate,
  SignatureRequest,
  SignatureTemplate,
  SecurityGuard,
  Terminal,
  Document,
  Team,
  Post,
  PostComment,
  EmployeeVaultItem,
  RewardTransaction,
  RewardCatalog,
  Contract,
  TimelineEvent,
} from '../types';

export function mapEmployee(raw: any): Employee {
  return {
    id: raw.id,
    companyId: raw.companyId,
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    phone: raw.phone || '',
    dateOfBirth: raw.dateOfBirth || new Date(),
    position: raw.position || '',
    department: raw.department || '',
    photo: raw.photo || '',
    salary: raw.salary || 0,
    status: raw.status || 'active',
    joinDate: raw.hireDate || raw.joinDate || new Date(),
    role: raw.role || 'employee',
  };
}

export function mapEmployees(raw: any[]): Employee[] {
  return (raw || []).map(mapEmployee);
}

export function mapAttendance(raw: any): Attendance {
  return {
    id: raw.id,
    employeeId: raw.employeeId,
    date: raw.clockIn ? new Date(raw.clockIn) : new Date(),
    checkIn: raw.clockIn ? new Date(raw.clockIn) : null,
    breakStart: raw.breakStart ? new Date(raw.breakStart) : null,
    breakEnd: raw.breakEnd ? new Date(raw.breakEnd) : null,
    checkOut: raw.clockOut ? new Date(raw.clockOut) : null,
    totalHours: raw.totalHours ?? 0,
    overtime: raw.overtime ?? 0,
    status: raw.status || 'present',
  };
}

export function mapAttendances(raw: any[]): Attendance[] {
  return (raw || []).map(mapAttendance);
}

export function mapLeave(raw: any): Leave {
  return {
    id: raw.id,
    employeeId: raw.employeeId,
    type: raw.type || 'annual',
    startDate: new Date(raw.startDate),
    endDate: new Date(raw.endDate),
    reason: raw.reason || '',
    status: raw.status || 'pending',
    approvedBy: raw.approvedBy || undefined,
    approvalComment: raw.comment || undefined,
  };
}

export function mapLeaves(raw: any[]): Leave[] {
  return (raw || []).map(mapLeave);
}

export function mapPayslip(raw: any): Payslip {
  const grossSalary = raw.grossSalary || raw.basicSalary || 0;
  const netSalary = raw.netSalary || 0;
  return {
    id: raw.id,
    employeeId: raw.employeeId,
    month: raw.month,
    year: raw.year,
    basicSalary: grossSalary,
    bonuses: raw.bonuses || 0,
    deductions: grossSalary - netSalary,
    netSalary,
    generatedAt: raw.createdAt || raw.generatedAt || new Date(),
  };
}

export function mapPayslips(raw: any[]): Payslip[] {
  return (raw || []).map(mapPayslip);
}

export function mapCompany(raw: any): Company {
  return {
    id: raw.id,
    name: raw.name,
    logo: raw.logo || '',
    ownerFirstName: raw.ownerFirstName || raw.name?.split(' ')[0] || '',
    ownerLastName: raw.ownerLastName || raw.name?.split(' ').slice(1).join(' ') || '',
    email: raw.email || '',
    phone: raw.phone || '',
    employeeCount: raw._count?.employees || raw.employeeCount || 0,
    address: raw.address || '',
    website: raw.website || '',
    uniqueId: raw.slug || raw.uniqueId || raw.id,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    balance: raw.balance || 0,
  };
}

export function mapCompanies(raw: any[]): Company[] {
  return (raw || []).map(mapCompany);
}

export function mapNotification(raw: any): Notification {
  return {
    id: raw.id,
    userId: raw.userId,
    title: raw.title || '',
    message: raw.message || '',
    type: raw.type || 'invitation',
    read: raw.read ?? false,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
  };
}

export function mapNotifications(raw: any[]): Notification[] {
  return (raw || []).map(mapNotification);
}

export function mapInvitation(raw: any): Invitation {
  return {
    id: raw.id,
    companyId: raw.companyId,
    email: raw.email || '',
    status: raw.status || 'pending',
    sentAt: raw.sentAt || raw.createdAt ? new Date(raw.sentAt || raw.createdAt) : new Date(),
  };
}

export function mapInvitations(raw: any[]): Invitation[] {
  return (raw || []).map(mapInvitation);
}

export function mapCalendarEvent(raw: any): CalendarEvent {
  return {
    id: raw.id,
    title: raw.title || '',
    description: raw.description || '',
    date: raw.startDate || raw.date || '',
    time: raw.time || '',
    location: raw.location || '',
    type: raw.type || 'other',
    attendees: raw.attendees || raw.participantIds || [],
    allDay: raw.allDay ?? false,
  };
}

export function mapCalendarEvents(raw: any[]): CalendarEvent[] {
  return (raw || []).map(mapCalendarEvent);
}

export function mapPayrollConfig(raw: any): PayrollConfig {
  return {
    id: raw.id,
    companyId: raw.companyId,
    country: raw.country || '',
    countryName: raw.countryName || '',
    bonusRate: raw.bonusRate || 0,
    deductionRate: raw.deductionRate || 0,
    currency: raw.currency || '',
    currencyLocale: raw.currencyLocale || '',
    taxRate: raw.taxRate || 0,
    socialChargesRate: raw.socialChargesRate || 0,
    paymentDay: raw.paymentDay || 0,
    overtimeRate: raw.overtimeRate || 0,
  };
}

export function mapPayrollConfigs(raw: any[]): PayrollConfig[] {
  return (raw || []).map(mapPayrollConfig);
}

export function mapJobOffer(raw: any): JobOffer {
  return {
    id: raw.id,
    title: raw.title || '',
    department: raw.department || '',
    description: raw.description || '',
    requirements: raw.requirements || '',
    salary: raw.salary || 0,
    location: raw.location || '',
    type: raw.type || '',
    status: raw.status || 'draft',
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    createdBy: raw.createdBy || '',
  };
}

export function mapJobOffers(raw: any[]): JobOffer[] {
  return (raw || []).map(mapJobOffer);
}

export function mapCandidate(raw: any): Candidate {
  return {
    id: raw.id,
    jobOfferId: raw.jobOfferId,
    firstName: raw.firstName || '',
    lastName: raw.lastName || '',
    email: raw.email || '',
    phone: raw.phone || '',
    status: raw.status || 'received',
    interviewDate: raw.interviewDate ? new Date(raw.interviewDate) : undefined,
    coverLetter: raw.coverLetter || undefined,
    resumeUrl: raw.resumeUrl || undefined,
    notes: raw.notes || undefined,
    appliedAt: raw.appliedAt ? new Date(raw.appliedAt) : new Date(),
  };
}

export function mapCandidates(raw: any[]): Candidate[] {
  return (raw || []).map(mapCandidate);
}

export function mapObjective(raw: any): Objective {
  return {
    id: raw.id,
    employeeId: raw.employeeId,
    title: raw.title || '',
    description: raw.description || '',
    deadline: raw.deadline ? new Date(raw.deadline) : new Date(),
    status: raw.status || 'pending',
    category: raw.category || '',
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    createdBy: raw.createdBy || '',
  };
}

export function mapObjectives(raw: any[]): Objective[] {
  return (raw || []).map(mapObjective);
}

export function mapPerformanceReview(raw: any): PerformanceReview {
  return {
    id: raw.id,
    employeeId: raw.employeeId,
    reviewerId: raw.reviewerId,
    rating: raw.rating || 0,
    feedback: raw.feedback || '',
    strengths: raw.strengths || [],
    improvements: raw.improvements || [],
    status: raw.status || 'draft',
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    objectiveIds: raw.objectiveIds || [],
    reviewDate: raw.reviewDate ? new Date(raw.reviewDate) : new Date(),
  };
}

export function mapPerformanceReviews(raw: any[]): PerformanceReview[] {
  return (raw || []).map(mapPerformanceReview);
}

export function mapBankAccount(raw: any): BankAccount {
  return {
    id: raw.id,
    companyId: raw.companyId,
    bankName: raw.bankName || '',
    accountName: raw.accountName || '',
    accountNumber: raw.accountNumber || '',
    iban: raw.iban || undefined,
    swift: raw.swift || undefined,
    currency: raw.currency || '',
    isMobileMoney: raw.isMobileMoney ?? false,
    mobileProvider: raw.mobileProvider || undefined,
    isDefault: raw.isDefault ?? false,
  };
}

export function mapBankAccounts(raw: any[]): BankAccount[] {
  return (raw || []).map(mapBankAccount);
}

export function mapBankTransaction(raw: any): BankTransaction {
  return {
    id: raw.id,
    companyId: raw.companyId,
    type: raw.type || 'deposit',
    amount: raw.amount || 0,
    currency: raw.currency || '',
    description: raw.description || '',
    reference: raw.reference || '',
    status: raw.status || 'pending',
    date: raw.createdAt || raw.date ? new Date(raw.createdAt || raw.date) : new Date(),
    accountId: raw.accountId,
  };
}

export function mapBankTransactions(raw: any[]): BankTransaction[] {
  return (raw || []).map(mapBankTransaction);
}

export function mapTaxDeclaration(raw: any): TaxDeclaration {
  return {
    id: raw.id,
    companyId: raw.companyId,
    type: raw.taxType || raw.type || 'IRPP',
    period: raw.period || '',
    totalSalary: raw.totalSalary || 0,
    totalTax: raw.totalTax || 0,
    status: raw.status || 'draft',
    dueDate: raw.dueDate ? new Date(raw.dueDate) : new Date(),
    submittedAt: raw.submittedAt ? new Date(raw.submittedAt) : undefined,
    country: raw.country || '',
  };
}

export function mapTaxDeclarations(raw: any[]): TaxDeclaration[] {
  return (raw || []).map(mapTaxDeclaration);
}

export function mapCourse(raw: any): Course {
  return {
    id: raw.id,
    companyId: raw.companyId,
    title: raw.title || '',
    description: raw.description || '',
    category: raw.category || '',
    duration: raw.duration || 0,
    instructor: raw.instructor || '',
    lessons: raw.lessons || [],
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    enrolledCount: raw.enrolledCount || 0,
  };
}

export function mapCourses(raw: any[]): Course[] {
  return (raw || []).map(mapCourse);
}

export function mapEnrollment(raw: any): Enrollment {
  return {
    id: raw.id,
    courseId: raw.courseId,
    employeeId: raw.employeeId,
    status: raw.status || 'enrolled',
    startedAt: raw.startedAt ? new Date(raw.startedAt) : new Date(),
    completedAt: raw.completedAt ? new Date(raw.completedAt) : undefined,
    progress: raw.progress || 0,
    completedLessons: raw.completedLessons || [],
  };
}

export function mapEnrollments(raw: any[]): Enrollment[] {
  return (raw || []).map(mapEnrollment);
}

export function mapMission(raw: any): Mission {
  return {
    id: raw.id,
    employeeId: raw.employeeId,
    title: raw.title || '',
    destination: raw.destination || '',
    startDate: raw.startDate ? new Date(raw.startDate) : new Date(),
    endDate: raw.endDate ? new Date(raw.endDate) : new Date(),
    objectives: raw.objectives || '',
    transportType: raw.transportType || '',
    budget: raw.budget || 0,
    status: raw.status || 'pending',
    approvedBy: raw.approvedBy || undefined,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
  };
}

export function mapMissions(raw: any[]): Mission[] {
  return (raw || []).map(mapMission);
}

export function mapExpenseReport(raw: any): ExpenseReport {
  return {
    id: raw.id,
    employeeId: raw.employeeId,
    missionId: raw.missionId || undefined,
    category: raw.category || '',
    amount: raw.amount || 0,
    currency: raw.currency || '',
    description: raw.description || '',
    receiptUrl: raw.receiptUrl || undefined,
    status: raw.status || 'pending',
    approvedBy: raw.approvedBy || undefined,
    date: raw.date ? new Date(raw.date) : new Date(),
  };
}

export function mapExpenseReports(raw: any[]): ExpenseReport[] {
  return (raw || []).map(mapExpenseReport);
}

export function mapMeeting(raw: any): Meeting {
  return {
    id: raw.id,
    companyId: raw.companyId,
    title: raw.title || '',
    description: raw.description || '',
    date: raw.startTime || raw.date ? new Date(raw.startTime || raw.date) : new Date(),
    startTime: raw.startTime || '',
    endTime: raw.endTime || '',
    department: raw.department || undefined,
    type: raw.type || 'physical',
    status: raw.status || 'scheduled',
    createdBy: raw.createdBy || undefined,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    participants: raw.participants || [],
    notes: raw.notes || [],
    tasks: raw.tasks || [],
    agenda: raw.agenda || undefined,
    virtualRoomUrl: raw.virtualRoomUrl || undefined,
    summary: raw.summary || undefined,
    priority: raw.priority || 'normal',
  };
}

export function mapMeetings(raw: any[]): Meeting[] {
  return (raw || []).map(mapMeeting);
}

export function mapEquipment(raw: any): Equipment {
  return {
    id: raw.id,
    companyId: raw.companyId,
    name: raw.name || '',
    type: raw.type || 'other',
    serialNumber: raw.serialNumber || '',
    status: raw.status || 'available',
    purchaseDate: raw.purchaseDate ? new Date(raw.purchaseDate) : undefined,
    purchasePrice: raw.purchasePrice || undefined,
    condition: raw.condition || 'good',
    notes: raw.notes || undefined,
    assigneeId: raw.assigneeId || undefined,
    assignedAt: raw.assignedAt ? new Date(raw.assignedAt) : undefined,
    returnedAt: raw.returnedAt ? new Date(raw.returnedAt) : undefined,
  };
}

export function mapEquipments(raw: any[]): Equipment[] {
  return (raw || []).map(mapEquipment);
}

export function mapEquipmentAssignment(raw: any): EquipmentAssignment {
  return {
    id: raw.id,
    equipmentId: raw.equipmentId,
    employeeId: raw.employeeId,
    assignedAt: raw.assignedAt ? new Date(raw.assignedAt) : new Date(),
    returnedAt: raw.returnedAt ? new Date(raw.returnedAt) : undefined,
    conditionAtAssignment: raw.conditionAtAssignment || 'good',
    conditionAtReturn: raw.conditionAtReturn || undefined,
  };
}

export function mapEquipmentAssignments(raw: any[]): EquipmentAssignment[] {
  return (raw || []).map(mapEquipmentAssignment);
}

export function mapWellnessSurvey(raw: any): WellnessSurvey {
  return {
    id: raw.id,
    companyId: raw.companyId,
    title: raw.title || '',
    description: raw.description || '',
    questions: raw.questions || [],
    active: raw.active ?? false,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    expiresAt: raw.expiresAt ? new Date(raw.expiresAt) : undefined,
  };
}

export function mapWellnessSurveys(raw: any[]): WellnessSurvey[] {
  return (raw || []).map(mapWellnessSurvey);
}

export function mapWellnessResponse(raw: any): WellnessResponse {
  return {
    id: raw.id,
    surveyId: raw.surveyId,
    employeeId: raw.employeeId,
    answers: raw.answers || {},
    submittedAt: raw.submittedAt ? new Date(raw.submittedAt) : new Date(),
    anonymous: raw.anonymous ?? false,
  };
}

export function mapWellnessResponses(raw: any[]): WellnessResponse[] {
  return (raw || []).map(mapWellnessResponse);
}

export function mapSalaryAdvance(raw: any): SalaryAdvance {
  return {
    id: raw.id,
    employeeId: raw.employeeId,
    amount: raw.amount || 0,
    currency: raw.currency || '',
    status: raw.status || 'requested',
    reason: raw.reason || '',
    requestedAt:
      raw.createdAt || raw.requestedAt ? new Date(raw.createdAt || raw.requestedAt) : new Date(),
    approvedAt: raw.approvedAt ? new Date(raw.approvedAt) : undefined,
    paidAt: raw.paidAt ? new Date(raw.paidAt) : undefined,
    approvedBy: raw.approvedBy || undefined,
    repaymentStatus: raw.repaymentStatus || 'pending',
    repaymentAmount: raw.repaymentAmount || undefined,
    rejectedAt: raw.rejectedAt ? new Date(raw.rejectedAt) : undefined,
    repaymentDate: raw.repaymentDate ? new Date(raw.repaymentDate) : undefined,
  };
}

export function mapSalaryAdvances(raw: any[]): SalaryAdvance[] {
  return (raw || []).map(mapSalaryAdvance);
}

export function mapSalaryTransfer(raw: any): SalaryTransfer {
  return {
    id: raw.id,
    employeeId: raw.employeeId,
    amount: raw.amount || 0,
    currency: raw.currency || '',
    type: raw.type || 'salary',
    status: raw.status || 'pending',
    description: raw.description || '',
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    completedAt: raw.completedAt ? new Date(raw.completedAt) : undefined,
  };
}

export function mapSalaryTransfers(raw: any[]): SalaryTransfer[] {
  return (raw || []).map(mapSalaryTransfer);
}

export function mapQuiz(raw: any): Quiz {
  return {
    id: raw.id,
    courseId: raw.courseId,
    title: raw.title || '',
    description: raw.description || '',
    questions: raw.questions || [],
    passingScore: raw.passingScore || 0,
    timeLimit: raw.timeLimit || 0,
  };
}

export function mapQuizzes(raw: any[]): Quiz[] {
  return (raw || []).map(mapQuiz);
}

export function mapQuizAttempt(raw: any): QuizAttempt {
  return {
    id: raw.id,
    quizId: raw.quizId,
    courseId: raw.courseId || raw.quiz?.courseId || '',
    employeeId: raw.employeeId,
    score: raw.score || 0,
    totalPoints: raw.totalPoints || 0,
    answers: raw.answers || [],
    passed: raw.passed ?? false,
    startedAt: raw.startedAt ? new Date(raw.startedAt) : new Date(),
    completedAt: raw.completedAt ? new Date(raw.completedAt) : new Date(),
  };
}

export function mapQuizAttempts(raw: any[]): QuizAttempt[] {
  return (raw || []).map(mapQuizAttempt);
}

export function mapCertificate(raw: any): Certificate {
  return {
    id: raw.id,
    courseId: raw.courseId,
    employeeId: raw.employeeId,
    issuedAt: raw.issuedAt ? new Date(raw.issuedAt) : new Date(),
    certificateUrl: raw.certificateUrl || undefined,
    expiresAt: raw.expiresAt ? new Date(raw.expiresAt) : undefined,
  };
}

export function mapCertificates(raw: any[]): Certificate[] {
  return (raw || []).map(mapCertificate);
}

export function mapSignatureRequest(raw: any): SignatureRequest {
  return {
    id: raw.id,
    documentName: raw.documentName || '',
    documentType: raw.documentType || 'other',
    initiatedBy: raw.initiatedBy,
    initiatedByName: raw.initiatedByName || '',
    status: raw.status || 'draft',
    recipients: raw.recipients || [],
    message: raw.message || undefined,
    documentId: raw.documentId || undefined,
    expiresAt: raw.expiresAt ? new Date(raw.expiresAt) : undefined,
    completedAt: raw.completedAt ? new Date(raw.completedAt) : undefined,
    initiatedAt:
      raw.createdAt || raw.initiatedAt ? new Date(raw.createdAt || raw.initiatedAt) : new Date(),
  };
}

export function mapSignatureRequests(raw: any[]): SignatureRequest[] {
  return (raw || []).map(mapSignatureRequest);
}

export function mapSignatureTemplate(raw: any): SignatureTemplate {
  return {
    id: raw.id,
    companyId: raw.companyId,
    name: raw.name || '',
    description: raw.description || '',
    documentType: raw.documentType || '',
    content: raw.content || '',
    placeholders: raw.placeholders || [],
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
  };
}

export function mapSignatureTemplates(raw: any[]): SignatureTemplate[] {
  return (raw || []).map(mapSignatureTemplate);
}

export function mapSecurityGuard(raw: any): SecurityGuard {
  return {
    id: raw.id,
    companyId: raw.companyId,
    employeeId: raw.employeeId,
    isActive: raw.isActive ?? true,
    assignedAt:
      raw.assignedAt || raw.createdAt ? new Date(raw.assignedAt || raw.createdAt) : new Date(),
  };
}

export function mapSecurityGuards(raw: any[]): SecurityGuard[] {
  return (raw || []).map(mapSecurityGuard);
}

export function mapTerminal(raw: any): Terminal {
  return {
    id: raw.id,
    companyId: raw.companyId,
    name: raw.name || '',
    deviceFingerprint: raw.deviceFingerprint || '',
    isActive: raw.isActive ?? true,
    lastSeen: raw.lastSeen ? new Date(raw.lastSeen) : undefined,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
  };
}

export function mapTerminals(raw: any[]): Terminal[] {
  return (raw || []).map(mapTerminal);
}

export function mapAppDocument(raw: any): Document {
  return {
    id: raw.id,
    companyId: raw.companyId,
    employeeId: raw.employeeId,
    name: raw.name || '',
    type: raw.type || '',
    url: raw.url || '',
    size: raw.size || '',
    uploadedBy: raw.uploadedBy || '',
    uploadedAt: raw.uploadedAt ? new Date(raw.uploadedAt) : new Date(),
    department: raw.department || '',
    category: raw.category || '',
  };
}

export function mapAppDocuments(raw: any[]): Document[] {
  return (raw || []).map(mapAppDocument);
}

export function mapTeam(raw: any): Team {
  return {
    id: raw.id,
    name: raw.name || '',
    description: raw.description || '',
    leaderId: raw.leaderId || '',
    memberIds: raw.memberIds || [],
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
  };
}

export function mapTeams(raw: any[]): Team[] {
  return (raw || []).map(mapTeam);
}

export function mapPostComment(raw: any): PostComment {
  return {
    id: raw.id,
    authorId: raw.authorId,
    authorName: raw.authorName || '',
    content: raw.content || '',
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
  };
}

export function mapPost(raw: any): Post {
  return {
    id: raw.id,
    authorId: raw.authorId,
    authorName: raw.authorName || '',
    content: raw.content || '',
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    likes: raw.likes || [],
    comments: (raw.comments || []).map(mapPostComment),
  };
}

export function mapPosts(raw: any[]): Post[] {
  return (raw || []).map(mapPost);
}

export function mapVaultItem(raw: any): EmployeeVaultItem {
  return {
    id: raw.id,
    employeeId: raw.employeeId,
    type: raw.type || 'other',
    name: raw.name || '',
    fileUrl: raw.fileUrl || undefined,
    uploadedAt: raw.uploadedAt ? new Date(raw.uploadedAt) : new Date(),
    expiresAt: raw.expiresAt ? new Date(raw.expiresAt) : undefined,
    status: raw.status || 'active',
  };
}

export function mapVaultItems(raw: any[]): EmployeeVaultItem[] {
  return (raw || []).map(mapVaultItem);
}

export function mapRewardTransaction(raw: any): RewardTransaction {
  return {
    id: raw.id,
    employeeId: raw.employeeId,
    points: raw.points ?? 0,
    type: raw.type || 'earned',
    reason: raw.reason || '',
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
  };
}

export function mapRewardTransactions(raw: any[]): RewardTransaction[] {
  return (raw || []).map(mapRewardTransaction);
}

export function mapRewardCatalog(raw: any): RewardCatalog {
  return {
    id: raw.id,
    name: raw.name || '',
    description: raw.description || '',
    pointsCost: raw.pointsCost ?? 0,
    stock: raw.stock ?? 0,
    category: raw.category || 'gift',
    active: raw.active ?? true,
  };
}

export function mapRewardCatalogs(raw: any[]): RewardCatalog[] {
  return (raw || []).map(mapRewardCatalog);
}

export function mapContract(raw: any): Contract {
  return {
    id: raw.id,
    type: raw.type || 'CDI',
    position: raw.position || '',
    startDate: raw.startDate ? new Date(raw.startDate) : new Date(),
    endDate: raw.endDate ? new Date(raw.endDate) : undefined,
    salary: raw.salary ?? 0,
    status: raw.status || 'active',
    documentUrl: raw.documentUrl || undefined,
  };
}

export function mapContracts(raw: any[]): Contract[] {
  return (raw || []).map(mapContract);
}

export function mapTimelineEvent(raw: any): TimelineEvent {
  return {
    id: raw.id,
    employeeId: raw.employeeId,
    type: raw.type || 'other',
    title: raw.title || '',
    description: raw.description || '',
    date: raw.date ? new Date(raw.date) : new Date(),
  };
}

export function mapTimelineEvents(raw: any[]): TimelineEvent[] {
  return (raw || []).map(mapTimelineEvent);
}
