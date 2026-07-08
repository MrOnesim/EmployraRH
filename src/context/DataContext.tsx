import { createContext, useContext, useState, type ReactNode } from 'react';
import { eventBus, EVENTS } from '../utils/eventBus';
import type { Employee, Attendance, Leave, Payslip, Notification, Invitation, Document as AppDocument, CalendarEvent, Conversation, ChatMessage, Team, Post, PayrollConfig, PostComment, JobOffer, Candidate, Objective, PerformanceReview, TimelineEvent, Contract, BankAccount, BankTransaction, TaxDeclaration, Course, Enrollment, Mission, ExpenseReport, JobPost, GPSLocation, Meeting, MeetingTask, MeetingNote, ParticipantStatus, EmployeeVaultItem, RewardTransaction, RewardCatalog, Equipment, EquipmentAssignment, WellnessSurvey, WellnessResponse, SalaryAdvance, SalaryTransfer, Quiz, QuizAttempt, Certificate, SignatureRequest, SignatureTemplate } from '../types';
import { PAYROLL, PAYROLL_COUNTRIES } from '../constants';

interface DataState {
  employees: Employee[];
  attendance: Attendance[];
  leaves: Leave[];
  payslips: Payslip[];
  notifications: Notification[];
  invitations: Invitation[];
  documents: AppDocument[];
  events: CalendarEvent[];
  conversations: Conversation[];
  teams: Team[];
  posts: Post[];
  payrollConfig: PayrollConfig;
  signatures: Record<string, string>;
  jobOffers: JobOffer[];
  candidates: Candidate[];
  objectives: Objective[];
  performanceReviews: PerformanceReview[];
  timelineEvents: TimelineEvent[];
  addDocument: (doc: Omit<AppDocument, 'id'>) => void;
  deleteDocument: (id: string) => void;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  addMessage: (conversationId: string, message: Omit<ChatMessage, 'id'>) => void;
  addConversation: (participant: { id: string; name: string; position: string }) => void;
  readConversation: (conversationId: string) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  addMultipleEmployees: (emps: Omit<Employee, 'id'>[]) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  sendInvitation: (email: string) => void;
  acceptInvitation: (id: string) => void;
  clockIn: (employeeId: string, gpsLocation?: GPSLocation) => void;
  startBreak: (employeeId: string) => void;
  endBreak: (employeeId: string) => void;
  clockOut: (employeeId: string, gpsLocation?: GPSLocation) => void;
  requestLeave: (leave: Omit<Leave, 'id'>) => void;
  approveLeave: (id: string) => void;
  rejectLeave: (id: string) => void;
  processPayment: (employeeId: string, amount: number) => void;
  generatePayslip: (employeeId: string) => void;
  markNotificationRead: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  addTeam: (team: Omit<Team, 'id' | 'createdAt'>) => void;
  updateTeam: (id: string, data: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => void;
  likePost: (postId: string, userId: string) => void;
  addComment: (postId: string, comment: Omit<PostComment, 'id' | 'createdAt'>) => void;
  updatePayrollConfig: (config: Partial<PayrollConfig>) => void;
  signDocument: (docId: string, signatureDataUrl: string) => void;
  getSignatures: () => Record<string, string>;
  addJobOffer: (offer: Omit<JobOffer, 'id' | 'createdAt'>) => void;
  updateJobOffer: (id: string, data: Partial<JobOffer>) => void;
  deleteJobOffer: (id: string) => void;
  addCandidate: (candidate: Omit<Candidate, 'id' | 'appliedAt'>) => void;
  updateCandidate: (id: string, data: Partial<Candidate>) => void;
  addObjective: (objective: Omit<Objective, 'id' | 'createdAt'>) => void;
  updateObjective: (id: string, data: Partial<Objective>) => void;
  deleteObjective: (id: string) => void;
  addPerformanceReview: (review: Omit<PerformanceReview, 'id' | 'createdAt'>) => void;
  updatePerformanceReview: (id: string, data: Partial<PerformanceReview>) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  updateEmployeeContract: (employeeId: string, contract: Contract) => void;
  bankAccounts: BankAccount[];
  transactions: BankTransaction[];
  taxDeclarations: TaxDeclaration[];
  courses: Course[];
  enrollments: Enrollment[];
  missions: Mission[];
  expenses: ExpenseReport[];
  jobPosts: JobPost[];
  addBankAccount: (acc: Omit<BankAccount, 'id'>) => void;
  addTransaction: (tx: Omit<BankTransaction, 'id'>) => void;
  addTaxDeclaration: (d: Omit<TaxDeclaration, 'id'>) => void;
  updateTaxDeclaration: (id: string, data: Partial<TaxDeclaration>) => void;
  addCourse: (c: Omit<Course, 'id' | 'createdAt'>) => void;
  enrollCourse: (employeeId: string, courseId: string) => void;
  updateLessonProgress: (enrollmentId: string, lessonId: string) => void;
  addMission: (m: Omit<Mission, 'id' | 'createdAt'>) => void;
  updateMission: (id: string, data: Partial<Mission>) => void;
  addExpense: (e: Omit<ExpenseReport, 'id'>) => void;
  updateExpense: (id: string, data: Partial<ExpenseReport>) => void;
  addJobPost: (p: Omit<JobPost, 'id' | 'createdAt'>) => void;
  updateJobPost: (id: string, data: Partial<JobPost>) => void;
  deleteJobPost: (id: string) => void;
  meetings: Meeting[];
  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'status'>) => void;
  updateMeeting: (id: string, data: Partial<Meeting>) => void;
  addMeetingNote: (meetingId: string, note: Omit<MeetingNote, 'id' | 'createdAt'>) => void;
  addMeetingTask: (meetingId: string, task: Omit<MeetingTask, 'id' | 'createdAt'>) => void;
  updateMeetingTask: (meetingId: string, taskId: string, data: Partial<MeetingTask>) => void;
  updateParticipantStatus: (meetingId: string, employeeId: string, status: ParticipantStatus) => void;
  joinMeeting: (meetingId: string, employeeId: string) => void;
  leaveMeeting: (meetingId: string, employeeId: string) => void;
  // Coffre-fort
  vaultItems: EmployeeVaultItem[];
  addVaultItem: (item: Omit<EmployeeVaultItem, 'id'>) => void;
  deleteVaultItem: (id: string) => void;
  // Récompenses
  rewardTransactions: RewardTransaction[];
  rewardCatalog: RewardCatalog[];
  addRewardTransaction: (tx: Omit<RewardTransaction, 'id' | 'createdAt'>) => void;
  addRewardCatalogItem: (item: Omit<RewardCatalog, 'id'>) => void;
  redeemReward: (employeeId: string, catalogItemId: string) => void;
  // Matériel
  equipment: Equipment[];
  equipmentAssignments: EquipmentAssignment[];
  addEquipment: (eq: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: string, data: Partial<Equipment>) => void;
  assignEquipment: (equipmentId: string, employeeId: string) => void;
  returnEquipment: (equipmentId: string, condition?: 'good' | 'fair' | 'damaged') => void;
  // Bien-être
  wellnessSurveys: WellnessSurvey[];
  wellnessResponses: WellnessResponse[];
  addWellnessSurvey: (survey: Omit<WellnessSurvey, 'id' | 'createdAt'>) => void;
  submitWellnessResponse: (response: Omit<WellnessResponse, 'id'>) => void;
  // Banque salariale fintech
  salaryAdvances: SalaryAdvance[];
  salaryTransfers: SalaryTransfer[];
  requestSalaryAdvance: (advance: Omit<SalaryAdvance, 'id' | 'requestedAt' | 'status' | 'repaymentStatus'>) => void;
  approveSalaryAdvance: (id: string) => void;
  paySalaryAdvance: (id: string) => void;
  rejectSalaryAdvance: (id: string) => void;
  addSalaryTransfer: (transfer: Omit<SalaryTransfer, 'id' | 'createdAt'>) => void;
  // Quiz et certificats
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  certificates: Certificate[];
  addQuiz: (quiz: Omit<Quiz, 'id'>) => void;
  submitQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'startedAt' | 'completedAt' | 'passed'>) => QuizAttempt;
  issueCertificate: (cert: Omit<Certificate, 'id' | 'issuedAt'>) => void;
  // Signature électronique
  signatureRequests: SignatureRequest[];
  signatureTemplates: SignatureTemplate[];
  sendSignatureRequest: (req: Omit<SignatureRequest, 'id' | 'initiatedAt' | 'status'>) => void;
  signSignatureRequest: (requestId: string, recipientEmployeeId: string, signatureDataUrl: string) => void;
  rejectSignature: (requestId: string, recipientEmployeeId: string, reason: string) => void;
  addSignatureTemplate: (tpl: Omit<SignatureTemplate, 'id' | 'createdAt'>) => void;
  deleteSignatureTemplate: (id: string) => void;
}

const DataContext = createContext<DataState | undefined>(undefined);

const mockEmployees: Employee[] = [
  { id: '1', companyId: '1', firstName: 'Kofi', lastName: 'Mensah', email: 'admin@techafrique.com', phone: '+228 90 12 34 56', dateOfBirth: new Date('1985-06-15'), position: 'Directeur Général', department: 'Direction', photo: '', salary: 1500000, status: 'active', joinDate: new Date('2024-01-15'), role: 'admin' },
  { id: '2', companyId: '1', firstName: 'Ama', lastName: 'Gbeko', email: 'ama@techafrique.com', phone: '+228 91 23 45 67', dateOfBirth: new Date('1990-03-20'), position: 'Responsable RH', department: 'Ressources Humaines', photo: '', salary: 800000, status: 'active', joinDate: new Date('2024-02-01'), role: 'rh' },
  { id: '3', companyId: '1', firstName: 'Kwame', lastName: 'Adjei', email: 'kwame@techafrique.com', phone: '+228 92 34 56 78', dateOfBirth: new Date('1992-08-10'), position: 'Développeur Senior', department: 'Informatique', photo: '', salary: 750000, status: 'active', joinDate: new Date('2024-03-15'), role: 'manager' },
  { id: '4', companyId: '1', firstName: 'Efua', lastName: 'Asante', email: 'efua@techafrique.com', phone: '+228 93 45 67 89', dateOfBirth: new Date('1988-12-05'), position: 'Comptable', department: 'Finance', photo: '', salary: 700000, status: 'active', joinDate: new Date('2024-04-01'), role: 'employee' },
  { id: '5', companyId: '1', firstName: 'Yaw', lastName: 'Boakye', email: 'yaw@techafrique.com', phone: '+228 94 56 78 90', dateOfBirth: new Date('1995-05-22'), position: 'Designer UI/UX', department: 'Marketing', photo: '', salary: 600000, status: 'active', joinDate: new Date('2024-05-15'), role: 'employee' },
  { id: '6', companyId: '1', firstName: 'Abla', lastName: 'Dosso', email: 'abla@techafrique.com', phone: '+228 95 67 89 01', dateOfBirth: new Date('1993-09-18'), position: 'Chargé de Marketing', department: 'Marketing', photo: '', salary: 550000, status: 'inactive', joinDate: new Date('2024-06-01'), role: 'employee' },
  { id: '7', companyId: '1', firstName: 'Kossi', lastName: 'Amoussou', email: 'kossi@techafrique.com', phone: '+228 96 78 90 12', dateOfBirth: new Date('1991-02-28'), position: 'Développeur Full Stack', department: 'Informatique', photo: '', salary: 700000, status: 'active', joinDate: new Date('2024-07-01'), role: 'employee' },
];

const mockAttendance: Attendance[] = [
  { id: '1', employeeId: '1', date: new Date(), checkIn: new Date(new Date().setHours(8, 0)), breakStart: new Date(new Date().setHours(12, 0)), breakEnd: new Date(new Date().setHours(13, 0)), checkOut: null, totalHours: 4, overtime: 0, status: 'present' },
  { id: '2', employeeId: '2', date: new Date(), checkIn: new Date(new Date().setHours(7, 45)), breakStart: null, breakEnd: null, checkOut: null, totalHours: 4.25, overtime: 0, status: 'present' },
  { id: '3', employeeId: '3', date: new Date(), checkIn: new Date(new Date().setHours(9, 15)), breakStart: null, breakEnd: null, checkOut: null, totalHours: 3, overtime: 0, status: 'late' },
  { id: '4', employeeId: '4', date: new Date(), checkIn: null, breakStart: null, breakEnd: null, checkOut: null, totalHours: 0, overtime: 0, status: 'absent' },
  { id: '5', employeeId: '5', date: new Date(), checkIn: new Date(new Date().setHours(8, 0)), breakStart: new Date(new Date().setHours(12, 0)), breakEnd: new Date(new Date().setHours(12, 45)), checkOut: null, totalHours: 4, overtime: 0, status: 'present' },
];

const mockLeaves: Leave[] = [
  { id: '1', employeeId: '3', type: 'annual', startDate: new Date('2024-12-20'), endDate: new Date('2024-12-31'), reason: "Vacances de fin d'année", status: 'pending' },
  { id: '2', employeeId: '5', type: 'sick', startDate: new Date('2024-12-18'), endDate: new Date('2024-12-19'), reason: 'Grippe', status: 'approved', approvedBy: '1' },
  { id: '3', employeeId: '7', type: 'annual', startDate: new Date('2024-12-25'), endDate: new Date('2024-12-27'), reason: 'Congé personnel', status: 'rejected' },
];

const mockDocuments: AppDocument[] = [
  { id: '1', name: 'Politique RH 2024.pdf', type: 'policy', department: 'Ressources Humaines', uploadedBy: 'Ama Gbeko', uploadedAt: new Date('2024-01-15'), size: '2.4 MB', category: 'Politiques' },
  { id: '2', name: 'Contrat - Kwame Adjei.pdf', type: 'contract', department: 'Informatique', uploadedBy: 'Ama Gbeko', uploadedAt: new Date('2024-03-15'), size: '1.1 MB', category: 'Contrats' },
  { id: '3', name: 'Rapport financier Q3.pdf', type: 'report', department: 'Finance', uploadedBy: 'Efua Asante', uploadedAt: new Date('2024-10-01'), size: '3.8 MB', category: 'Rapports' },
  { id: '4', name: 'Certificat - Efua Asante.pdf', type: 'certificate', department: 'Finance', uploadedBy: 'Ama Gbeko', uploadedAt: new Date('2024-09-30'), size: '0.5 MB', category: 'Certificats' },
  { id: '5', name: 'Manuel des procédures.pdf', type: 'policy', department: 'Ressources Humaines', uploadedBy: 'Kofi Mensah', uploadedAt: new Date('2024-02-01'), size: '5.2 MB', category: 'Politiques' },
  { id: '6', name: 'Contrat - Yaw Boakye.pdf', type: 'contract', department: 'Marketing', uploadedBy: 'Ama Gbeko', uploadedAt: new Date('2024-05-15'), size: '1.0 MB', category: 'Contrats' },
  { id: '7', name: 'Rapport de présence mensuel.pdf', type: 'report', department: 'Ressources Humaines', uploadedBy: 'Ama Gbeko', uploadedAt: new Date('2024-12-01'), size: '1.5 MB', category: 'Rapports' },
  { id: '8', name: 'Charte informatique.pdf', type: 'policy', department: 'Informatique', uploadedBy: 'Kwame Adjei', uploadedAt: new Date('2024-04-01'), size: '800 KB', category: 'Politiques' },
];

const mockEvents: CalendarEvent[] = [
  { id: '1', title: 'Réunion d\'équipe', description: 'Point hebdomadaire avec toute l\'équipe', date: new Date().toISOString().split('T')[0], time: '10:00', location: 'Salle de conférence', type: 'meeting', attendees: ['1', '2', '3', '5'], allDay: false },
  { id: '2', title: 'Anniversaire Ama', description: 'Joyeux anniversaire Ama Gbeko !', date: '2024-03-20', time: '', location: '', type: 'birthday', attendees: [], allDay: true },
  { id: '3', title: 'Noël - Fermeture', description: 'Fermeture annuelle de l\'entreprise', date: '2024-12-25', time: '', location: '', type: 'holiday', attendees: [], allDay: true },
  { id: '4', title: 'Team Building', description: 'Journée de cohésion d\'équipe au bord de la mer', date: '2024-12-20', time: '09:00', location: 'Lomé, Plage du Togo', type: 'team', attendees: ['1', '2', '3', '4', '5', '7'], allDay: true },
  { id: '5', title: 'Formation Sécurité', description: 'Formation obligatoire sur la sécurité informatique', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '14:00', location: 'Salle de formation', type: 'meeting', attendees: ['3', '7'], allDay: false },
  { id: '6', title: 'Anniversaire Kwame', description: 'Joyeux anniversaire Kwame Adjei !', date: '2024-08-10', time: '', location: '', type: 'birthday', attendees: [], allDay: true },
  { id: '7', title: 'Nouvel an africain', description: 'Journée fériée', date: '2025-01-08', time: '', location: '', type: 'holiday', attendees: [], allDay: true },
  { id: '8', title: 'Soirée de fin d\'année', description: 'Gala annuel de l\'entreprise', date: '2024-12-31', time: '19:00', location: 'Hôtel du Lac', type: 'team', attendees: ['1', '2', '3', '4', '5', '7'], allDay: false },
];

const mockConversations: Conversation[] = [
  {
    id: '1', participantId: '2', participantName: 'Ama Gbeko', participantPosition: 'Responsable RH',
    lastMessage: 'Le rapport de ce mois est prêt !', lastMessageTime: new Date(Date.now() - 300000), unread: 2, online: true,
    messages: [
      { id: '1', senderId: '2', senderName: 'Ama Gbeko', content: "Bonjour Kofi ! J'ai besoin de votre signature sur les contrats.", timestamp: new Date(Date.now() - 3600000), type: 'text' as const },
      { id: '2', senderId: '1', senderName: 'Kofi Mensah', content: 'Bien sûr, je les signe ce matin.', timestamp: new Date(Date.now() - 3500000), type: 'text' as const },
      { id: '3', senderId: '2', senderName: 'Ama Gbeko', content: 'Merci ! Le rapport de ce mois est prêt !', timestamp: new Date(Date.now() - 300000), type: 'text' as const },
    ],
  },
  {
    id: '2', participantId: '3', participantName: 'Kwame Adjei', participantPosition: 'Développeur Senior',
    lastMessage: "La fonctionnalité est déployée !", lastMessageTime: new Date(Date.now() - 1800000), unread: 0, online: true,
    messages: [
      { id: '1', senderId: '3', senderName: 'Kwame Adjei', content: "J'ai terminé la refacturation du module de paie.", timestamp: new Date(Date.now() - 7200000), type: 'text' as const },
      { id: '2', senderId: '1', senderName: 'Kofi Mensah', content: 'Excellent ! On peut faire un test ?', timestamp: new Date(Date.now() - 5400000), type: 'text' as const },
      { id: '3', senderId: '3', senderName: 'Kwame Adjei', content: "La fonctionnalité est déployée !", timestamp: new Date(Date.now() - 1800000), type: 'text' as const },
    ],
  },
  {
    id: '3', participantId: '4', participantName: 'Efua Asante', participantPosition: 'Comptable',
    lastMessage: 'Les factures de novembre sont traitées', lastMessageTime: new Date(Date.now() - 7200000), unread: 1, online: false,
    messages: [
      { id: '1', senderId: '4', senderName: 'Efua Asante', content: 'Les factures de novembre sont traitées et envoyées par email.', timestamp: new Date(Date.now() - 7200000), type: 'text' as const },
    ],
  },
  {
    id: '4', participantId: '5', participantName: 'Yaw Boakye', participantPosition: 'Designer UI/UX',
    lastMessage: 'Tu as vu les nouvelles maquettes ?', lastMessageTime: new Date(Date.now() - 86400000), unread: 0, online: false,
    messages: [
      { id: '1', senderId: '5', senderName: 'Yaw Boakye', content: 'Tu as vu les nouvelles maquettes ? Je les ai mises dans le dossier partagé.', timestamp: new Date(Date.now() - 86400000), type: 'text' as const },
    ],
  },
  {
    id: '5', participantId: '7', participantName: 'Kossi Amoussou', participantPosition: 'Développeur Full Stack',
    lastMessage: 'Je vais corriger le bug ce soir', lastMessageTime: new Date(Date.now() - 172800000), unread: 0, online: true,
    messages: [
      { id: '1', senderId: '1', senderName: 'Kofi Mensah', content: "Il y a un bug sur le pointage, les employés ne peuvent pas se connecter.", timestamp: new Date(Date.now() - 200000000), type: 'text' as const },
      { id: '2', senderId: '7', senderName: 'Kossi Amoussou', content: 'Je vais corriger le bug ce soir', timestamp: new Date(Date.now() - 172800000), type: 'text' as const },
    ],
  },
];

const mockTeams: Team[] = [
  { id: '1', name: 'Développement', description: 'Équipe technique chargée du développement logiciel', leaderId: '3', memberIds: ['3', '7'], createdAt: new Date('2024-01-15') },
  { id: '2', name: 'Design & Marketing', description: 'Équipe créative pour le design et le marketing', leaderId: '5', memberIds: ['5', '6'], createdAt: new Date('2024-02-01') },
  { id: '3', name: 'Finance & RH', description: 'Gestion financière et ressources humaines', leaderId: '2', memberIds: ['2', '4'], createdAt: new Date('2024-03-01') },
];

const mockPosts: Post[] = [
  { id: '1', authorId: '1', authorName: 'Kofi Mensah', content: 'Bienvenue à tous sur EmployéPro Africa ! Nouveau module de paie disponible.', createdAt: new Date(Date.now() - 86400000), likes: ['2', '3'], comments: [{ id: 'c1', authorId: '2', authorName: 'Ama Gbeko', content: 'Super nouvelle !', createdAt: new Date(Date.now() - 43200000) }] },
  { id: '2', authorId: '2', authorName: 'Ama Gbeko', content: 'Rappel : les demandes de congé pour les fêtes de fin d\'année doivent être soumises avant le 15 décembre.', createdAt: new Date(Date.now() - 172800000), likes: ['1', '4', '5'], comments: [] },
];

const mockNotifications: Notification[] = [
  { id: '1', userId: '1', title: 'Nouvelle demande de congé', message: 'Kwame Adjei a demandé un congé du 20 au 31 décembre', type: 'leave', read: false, createdAt: new Date() },
  { id: '2', userId: '1', title: 'Retard détecté', message: 'Kwame Adjei est arrivé en retard à 9h15', type: 'attendance', read: false, createdAt: new Date() },
  { id: '3', userId: '1', title: 'Bulletin de paie disponible', message: 'Les bulletins de paie de novembre sont prêts', type: 'payslip', read: true, createdAt: new Date(Date.now() - 86400000) },
];

const mockJobOffers: JobOffer[] = [
  { id: '1', title: 'Développeur Full Stack', department: 'Informatique', description: 'Développement d\'applications web et mobile', requirements: 'React, Node.js, 3 ans exp.', salary: 800000, location: 'Lomé', type: 'CDI', status: 'open', createdAt: new Date('2024-11-01'), createdBy: '1' },
  { id: '2', title: 'Comptable Senior', department: 'Finance', description: 'Gestion comptable de l\'entreprise', requirements: 'DCG, 5 ans exp.', salary: 600000, location: 'Lomé', type: 'CDI', status: 'open', createdAt: new Date('2024-11-15'), createdBy: '1' },
  { id: '3', title: 'Stagiaire Marketing Digital', department: 'Marketing', description: 'Support marketing et réseaux sociaux', requirements: 'Étudiant en marketing', salary: 150000, location: 'Lomé', type: 'stage', status: 'open', createdAt: new Date('2024-12-01'), createdBy: '1' },
];

const mockCandidates: Candidate[] = [
  { id: '1', jobOfferId: '1', firstName: 'Jean', lastName: 'Kouassi', email: 'jean@email.com', phone: '+228 97 65 43 21', status: 'interview', appliedAt: new Date('2024-11-20'), coverLetter: 'Passionné par le développement web...', interviewDate: new Date('2024-12-10') },
  { id: '2', jobOfferId: '1', firstName: 'Marie', lastName: 'Bamba', email: 'marie@email.com', phone: '+228 98 76 54 32', status: 'received', appliedAt: new Date('2024-11-25') },
  { id: '3', jobOfferId: '2', firstName: 'Paul', lastName: 'Yao', email: 'paul@email.com', phone: '+228 99 87 65 43', status: 'accepted', appliedAt: new Date('2024-11-18'), interviewDate: new Date('2024-12-05'), notes: 'Très bon profil' },
];

const mockObjectives: Objective[] = [
  { id: '1', employeeId: '3', title: 'Refonte module paie', description: 'Moderniser l\'interface du module de paie', deadline: new Date('2025-03-01'), status: 'in_progress', category: 'Développement', createdAt: new Date('2024-12-01'), createdBy: '1' },
  { id: '2', employeeId: '5', title: 'Campagne marketing Q1', description: 'Lancer la campagne pour le nouveau produit', deadline: new Date('2025-02-15'), status: 'pending', category: 'Marketing', createdAt: new Date('2024-12-10'), createdBy: '1' },
];

const mockPerformanceReviews: PerformanceReview[] = [
  { id: '1', employeeId: '3', reviewerId: '1', reviewDate: new Date('2024-12-15'), rating: 4, feedback: 'Excellent travail sur les projets récents', strengths: ['Technique', 'Autonomie'], improvements: ['Communication écrite'], objectiveIds: ['1'], status: 'submitted', createdAt: new Date('2024-12-15') },
];

const mockBankAccounts: BankAccount[] = [
  { id: '1', companyId: '1', bankName: 'Ecobank Togo', accountName: 'TechAfrique Solutions', accountNumber: 'TG1234567890', iban: 'TG53 ECOB 0001 2345 6789 0', swift: 'ECOCTGTG', currency: 'FCFA', isMobileMoney: false, isDefault: true },
  { id: '2', companyId: '1', bankName: 'MTN Mobile Money', accountName: 'Kofi Mensah', accountNumber: '+228 90 12 34 56', currency: 'FCFA', isMobileMoney: true, mobileProvider: 'MTN', isDefault: false },
];

const mockTransactions: BankTransaction[] = [
  { id: '1', companyId: '1', type: 'deposit', amount: 5000000, currency: 'FCFA', description: 'Dépôt initial', reference: 'DEP-001', status: 'completed', date: new Date('2024-01-15'), accountId: '1' },
  { id: '2', companyId: '1', type: 'payment', amount: 750000, currency: 'FCFA', description: 'Salaire Kofi Mensah', reference: 'PAY-001', status: 'completed', date: new Date('2024-12-01'), accountId: '1' },
];

const mockTaxDeclarations: TaxDeclaration[] = [
  { id: '1', companyId: '1', country: 'TG', period: '2024-Q4', type: 'IRPP', totalSalary: 5600000, totalTax: 840000, status: 'submitted', dueDate: new Date('2025-01-15'), submittedAt: new Date('2025-01-10') },
  { id: '2', companyId: '1', country: 'TG', period: '2024-Q4', type: 'CNSS', totalSalary: 5600000, totalTax: 392000, status: 'paid', dueDate: new Date('2025-01-15'), submittedAt: new Date('2025-01-05') },
];

const mockCourses: Course[] = [
  { id: '1', title: 'Introduction à React', description: 'Apprenez les bases de React et du développement frontend moderne', category: 'Développement', duration: 20, instructor: 'Kwame Adjei', enrolledCount: 3, lessons: [
    { id: 'l1', courseId: '1', title: 'Les fondamentaux de React', content: 'JSX, composants, props et state', duration: 4, order: 1 },
    { id: 'l2', courseId: '1', title: 'Hooks et useEffect', content: 'useState, useEffect, useContext en profondeur', duration: 6, order: 2 },
    { id: 'l3', courseId: '1', title: 'Projet pratique', content: 'Construisez une application TODO complète', duration: 10, order: 3 },
  ], createdAt: new Date('2024-06-01') },
  { id: '2', title: 'Gestion RH et Paie', description: 'Maîtrisez les processus RH et la gestion de la paie', category: 'RH', duration: 15, instructor: 'Ama Gbeko', enrolledCount: 5, lessons: [
    { id: 'l4', courseId: '2', title: 'Droit du travail', content: 'Base légale des contrats et conventions', duration: 5, order: 1 },
    { id: 'l5', courseId: '2', title: 'Calcul de paie', content: 'Méthodes de calcul des salaires et cotisations', duration: 10, order: 2 },
  ], createdAt: new Date('2024-07-01') },
];

const mockEnrollments: Enrollment[] = [
  { id: '1', courseId: '1', employeeId: '2', progress: 60, completedLessons: ['l1'], startedAt: new Date('2024-12-01'), status: 'in_progress' },
  { id: '2', courseId: '2', employeeId: '3', progress: 100, completedLessons: ['l4', 'l5'], startedAt: new Date('2024-11-01'), completedAt: new Date('2024-11-20'), status: 'completed' },
];

const mockMissions: Mission[] = [
  { id: '1', employeeId: '3', title: 'Déploiement client Abidjan', destination: 'Abidjan, Côte d\'Ivoire', startDate: new Date('2025-01-10'), endDate: new Date('2025-01-15'), objectives: 'Installation et formation sur le module paie', transportType: 'Avion', budget: 1500000, status: 'approved', approvedBy: '1', createdAt: new Date('2024-12-20') },
  { id: '2', employeeId: '5', title: 'Salon marketing Dakar', destination: 'Dakar, Sénégal', startDate: new Date('2025-02-01'), endDate: new Date('2025-02-03'), objectives: 'Présentation EmployéPro au salon RH Afrique', transportType: 'Avion', budget: 2000000, status: 'pending', createdAt: new Date('2024-12-25') },
];

const mockExpenses: ExpenseReport[] = [
  { id: '1', missionId: '1', employeeId: '3', category: 'Transport', amount: 350000, currency: 'FCFA', date: new Date('2025-01-10'), description: 'Billet avion Lomé-Abidjan', status: 'approved', approvedBy: '1' },
  { id: '2', missionId: '1', employeeId: '3', category: 'Hébergement', amount: 450000, currency: 'FCFA', date: new Date('2025-01-10'), description: 'Hôtel 5 nuits Abidjan', status: 'pending' },
  { id: '3', employeeId: '5', category: 'Repas client', amount: 85000, currency: 'FCFA', date: new Date('2024-12-15'), description: 'Déjeuner client Société Générale', status: 'approved', approvedBy: '1' },
];

const mockJobPosts: JobPost[] = [
  { id: '1', title: 'Développeur Full Stack', company: 'TechAfrique Solutions', companyId: '1', description: 'Développement d\'applications web et mobile pour nos clients', requirements: 'React, Node.js, 3 ans exp.', location: 'Lomé, Togo', type: 'CDI', salary: '800K - 1.2M FCFA', category: 'Informatique', status: 'published', featured: true, views: 245, applications: 12, createdAt: new Date('2024-12-01'), expiresAt: new Date('2025-02-01') },
  { id: '2', title: 'Comptable', company: 'TechAfrique Solutions', companyId: '1', description: 'Gestion comptable et reporting financier', requirements: 'DCG, 3 ans exp.', location: 'Lomé, Togo', type: 'CDI', salary: '500K - 700K FCFA', category: 'Finance', status: 'published', featured: false, views: 120, applications: 8, createdAt: new Date('2024-12-10'), expiresAt: new Date('2025-02-10') },
  { id: '3', title: 'Stagiaire Marketing Digital', company: 'TechAfrique Solutions', companyId: '1', description: 'Support marketing et réseaux sociaux', requirements: 'Étudiant en marketing ou communication', location: 'Lomé, Togo', type: 'stage', salary: '150K FCFA', category: 'Marketing', status: 'published', featured: false, views: 78, applications: 5, createdAt: new Date('2024-12-15'), expiresAt: new Date('2025-01-15') },
];

const mockTimelineEvents: TimelineEvent[] = [
  { id: '1', employeeId: '3', type: 'hire', title: 'Embauche', description: 'A rejoint l\'entreprise comme Développeur Senior', date: new Date('2024-03-15') },
  { id: '2', employeeId: '3', type: 'objective', title: 'Objectif créé', description: 'Refonte module paie', date: new Date('2024-12-01') },
  { id: '3', employeeId: '3', type: 'review', title: 'Évaluation annuelle', description: 'Note: 4/5', date: new Date('2024-12-15') },
];

const mockVaultItems: EmployeeVaultItem[] = [
  { id: 'v1', employeeId: '1', type: 'contract', name: 'Contrat Directeur Général.pdf', uploadedAt: new Date('2024-01-15'), status: 'active' },
  { id: 'v2', employeeId: '1', type: 'diploma', name: 'Master Management - HEC Paris.pdf', uploadedAt: new Date('2024-01-15'), status: 'active' },
  { id: 'v3', employeeId: '2', type: 'contract', name: 'Contrat Responsable RH.pdf', uploadedAt: new Date('2024-02-01'), status: 'active' },
  { id: 'v4', employeeId: '3', type: 'id_card', name: 'CNI Kwame Adjei.pdf', uploadedAt: new Date('2024-03-15'), status: 'active' },
  { id: 'v5', employeeId: '3', type: 'certificate', name: 'Certification React.pdf', uploadedAt: new Date('2024-06-01'), expiresAt: new Date('2026-06-01'), status: 'active' },
  { id: 'v6', employeeId: '5', type: 'evaluation', name: 'Évaluation annuelle 2024.pdf', uploadedAt: new Date('2024-12-15'), status: 'active' },
];

const mockRewardTransactions: RewardTransaction[] = [
  { id: 'r1', employeeId: '3', points: 500, type: 'earned', reason: 'Présence parfaite - Décembre 2024', createdAt: new Date('2025-01-01') },
  { id: 'r2', employeeId: '2', points: 750, type: 'earned', reason: 'Objectif Q4 atteint', createdAt: new Date('2024-12-31') },
  { id: 'r3', employeeId: '5', points: 300, type: 'earned', reason: 'Formation complétée', createdAt: new Date('2024-12-20') },
  { id: 'r4', employeeId: '3', points: 200, type: 'redeemed', reason: 'Bon d\'achat Amazon', createdAt: new Date('2025-01-05') },
];

const mockRewardCatalog: RewardCatalog[] = [
  { id: 'rc1', name: 'Prime de 50 000 FCFA', description: 'Prime exceptionnelle sur salaire', pointsCost: 1000, stock: 10, category: 'bonus', active: true },
  { id: 'rc2', name: 'Bon d\'achat 25 000 FCFA', description: 'Carte cadeau utilisable en ligne', pointsCost: 500, stock: 20, category: 'gift', active: true },
  { id: 'rc3', name: 'Jour de congé supplémentaire', description: 'Un jour de congé payé additionnel', pointsCost: 750, stock: 5, category: 'advantage', active: true },
  { id: 'rc4', name: 'Formation certifiante', description: 'Formation au choix (jusqu\'à 200 000 FCFA)', pointsCost: 1500, stock: 3, category: 'training', active: true },
  { id: 'rc5', name: 'Abonnement sport/fitness', description: 'Abonnement mensuel dans une salle de sport', pointsCost: 400, stock: 8, category: 'advantage', active: true },
];

const mockEquipment: Equipment[] = [
  { id: 'eq1', companyId: '1', name: 'Dell Latitude 5540', type: 'computer', serialNumber: 'DL-5540-001', status: 'assigned', purchaseDate: new Date('2024-01-10'), purchasePrice: 1200000, assigneeId: '1', assignedAt: new Date('2024-01-15'), condition: 'good' },
  { id: 'eq2', companyId: '1', name: 'MacBook Pro 16"', type: 'computer', serialNumber: 'MBP-2024-002', status: 'assigned', purchaseDate: new Date('2024-02-01'), purchasePrice: 2500000, assigneeId: '3', assignedAt: new Date('2024-03-01'), condition: 'good' },
  { id: 'eq3', companyId: '1', name: 'iPhone 15 Pro', type: 'phone', serialNumber: 'IP15-003', status: 'assigned', purchaseDate: new Date('2024-06-01'), purchasePrice: 900000, assigneeId: '1', assignedAt: new Date('2024-06-15'), condition: 'good' },
  { id: 'eq4', companyId: '1', name: 'Toyota Hilux', type: 'vehicle', serialNumber: 'TG-1234-AB', status: 'assigned', purchaseDate: new Date('2023-12-01'), purchasePrice: 25000000, assigneeId: '1', assignedAt: new Date('2024-01-01'), condition: 'fair' },
  { id: 'eq5', companyId: '1', name: 'Badge Accès Siège', type: 'access_card', serialNumber: 'ACC-005', status: 'assigned', assigneeId: '2', assignedAt: new Date('2024-02-01'), condition: 'good' },
  { id: 'eq6', companyId: '1', name: 'Dell Latitude 5550', type: 'computer', serialNumber: 'DL-5550-006', status: 'available', purchaseDate: new Date('2024-12-01'), purchasePrice: 1300000, condition: 'good' },
  { id: 'eq7', companyId: '1', name: 'Imprimante HP LaserJet', type: 'other', serialNumber: 'HP-LJ-007', status: 'maintenance', purchaseDate: new Date('2023-06-01'), purchasePrice: 350000, condition: 'damaged' },
];

const mockEquipmentAssignments: EquipmentAssignment[] = [
  { id: 'ea1', equipmentId: 'eq1', employeeId: '1', assignedAt: new Date('2024-01-15'), conditionAtAssignment: 'good' },
  { id: 'ea2', equipmentId: 'eq2', employeeId: '3', assignedAt: new Date('2024-03-01'), conditionAtAssignment: 'good' },
  { id: 'ea3', equipmentId: 'eq3', employeeId: '1', assignedAt: new Date('2024-06-15'), conditionAtAssignment: 'good' },
  { id: 'ea4', equipmentId: 'eq4', employeeId: '1', assignedAt: new Date('2024-01-01'), conditionAtAssignment: 'fair' },
];

const mockWellnessSurveys: WellnessSurvey[] = [
  { id: 'ws1', title: 'Enquête de satisfaction Q4 2024', description: 'Évaluez votre niveau de satisfaction au travail', questions: [
    { id: 'wq1', text: 'Dans l\'ensemble, êtes-vous satisfait de votre travail ?', type: 'rating', category: 'satisfaction' },
    { id: 'wq2', text: 'Comment évaluez-vous votre niveau de stress ?', type: 'rating', category: 'stress' },
    { id: 'wq3', text: 'Vous sentez-vous motivé au travail ?', type: 'rating', category: 'motivation' },
    { id: 'wq4', text: 'Avez-vous les ressources nécessaires pour faire votre travail ?', type: 'yesno', category: 'workload' },
    { id: 'wq5', text: 'Comment évaluez-vous l\'environnement de travail ?', type: 'rating', category: 'environment' },
  ], active: true, createdAt: new Date('2024-12-01') },
  { id: 'ws2', title: 'Sondage bien-être mensuel', description: 'Suivi mensuel du bien-être des employés', questions: [
    { id: 'wq6', text: 'Comment vous sentez-vous cette semaine ?', type: 'rating', category: 'satisfaction' },
    { id: 'wq7', text: 'Avez-vous des difficultés particulières ?', type: 'text', category: 'stress' },
    { id: 'wq8', text: 'Recommanderiez-vous notre entreprise ?', type: 'yesno', category: 'motivation' },
  ], active: true, createdAt: new Date('2025-01-01') },
];

const mockWellnessResponses: WellnessResponse[] = [];

const mockSalaryAdvances: SalaryAdvance[] = [
  { id: 'sa1', employeeId: '5', amount: 200000, currency: 'FCFA', status: 'approved', requestedAt: new Date('2024-12-20'), approvedAt: new Date('2024-12-22'), repaymentDate: new Date('2025-01-25'), repaymentStatus: 'pending', reason: 'Urgence familiale', approvedBy: '1' },
  { id: 'sa2', employeeId: '7', amount: 350000, currency: 'FCFA', status: 'requested', requestedAt: new Date('2025-01-05'), repaymentStatus: 'pending', reason: 'Achat matériel informatique' },
  { id: 'sa3', employeeId: '3', amount: 150000, currency: 'FCFA', status: 'paid', requestedAt: new Date('2024-11-01'), approvedAt: new Date('2024-11-02'), paidAt: new Date('2024-11-03'), repaymentDate: new Date('2024-12-25'), repaymentStatus: 'repaid', repaymentAmount: 150000, reason: 'Frais de scolarité', approvedBy: '1' },
];

const mockSalaryTransfers: SalaryTransfer[] = [
  { id: 'st1', employeeId: '1', amount: 1500000, currency: 'FCFA', type: 'salary', status: 'completed', createdAt: new Date('2024-12-01'), completedAt: new Date('2024-12-01'), description: 'Salaire décembre 2024' },
  { id: 'st2', employeeId: '2', amount: 800000, currency: 'FCFA', type: 'salary', status: 'completed', createdAt: new Date('2024-12-01'), completedAt: new Date('2024-12-01'), description: 'Salaire décembre 2024' },
  { id: 'st3', employeeId: '5', amount: 200000, currency: 'FCFA', type: 'advance', status: 'completed', createdAt: new Date('2024-12-22'), completedAt: new Date('2024-12-23'), description: 'Avance sur salaire - Urgence' },
  { id: 'st4', employeeId: '3', amount: 150000, currency: 'FCFA', type: 'transfer', status: 'pending', createdAt: new Date('2025-01-10'), description: 'Virement compte épargne' },
];

const mockQuizzes: Quiz[] = [
  { id: 'qz1', courseId: '1', title: 'Quiz React Fondamentaux', description: 'Testez vos connaissances sur les bases de React', questions: [
    { id: 'qq1', quizId: 'qz1', text: 'Qu\'est-ce que JSX ?', options: ['Une extension JavaScript', 'Un framework CSS', 'Un serveur web', 'Une base de données'], correctAnswer: 0, points: 10 },
    { id: 'qq2', quizId: 'qz1', text: 'Quel hook permet de gérer l\'état local ?', options: ['useEffect', 'useState', 'useContext', 'useReducer'], correctAnswer: 1, points: 10 },
    { id: 'qq3', quizId: 'qz1', text: 'Qu\'est-ce qu\'un composant React ?', options: ['Une fonction ou classe qui retourne du JSX', 'Un élément HTML', 'Une API REST', 'Un type de donnée'], correctAnswer: 0, points: 10 },
  ], passingScore: 15, timeLimit: 30 },
  { id: 'qz2', courseId: '2', title: 'Quiz Gestion RH', description: 'Évaluez vos compétences en gestion RH', questions: [
    { id: 'qq4', quizId: 'qz2', text: 'Quel est le taux CNSS au Togo ?', options: ['14%', '7%', '21%', '10%'], correctAnswer: 0, points: 10 },
    { id: 'qq5', quizId: 'qz2', text: 'Quelle est la durée légale du préavis ?', options: ['1 mois', '3 mois', 'Variable selon ancienneté', '15 jours'], correctAnswer: 2, points: 10 },
  ], passingScore: 10, timeLimit: 20 },
];

const mockQuizAttempts: QuizAttempt[] = [
  { id: 'qa1', quizId: 'qz1', courseId: '1', employeeId: '2', score: 20, totalPoints: 30, answers: [0, 1, 0], passed: true, startedAt: new Date('2024-12-10'), completedAt: new Date('2024-12-10') },
  { id: 'qa2', quizId: 'qz2', courseId: '2', employeeId: '3', score: 20, totalPoints: 20, answers: [0, 2], passed: true, startedAt: new Date('2024-11-15'), completedAt: new Date('2024-11-15') },
];

const mockCertificates: Certificate[] = [
  { id: 'cert1', courseId: '2', employeeId: '3', issuedAt: new Date('2024-11-20'), certificateUrl: '/certificates/gestion-rh-2024.pdf' },
];

const mockSignatureRequests: SignatureRequest[] = [
  { id: 'sig1', documentName: 'Contrat de travail - Kossi Amoussou', documentType: 'contract', initiatedBy: '2', initiatedByName: 'Ama Gbeko', initiatedAt: new Date('2025-01-10'), status: 'sent', recipients: [{ employeeId: '7', name: 'Kossi Amoussou', email: 'kossi@techafrique.com', status: 'pending' }], message: 'Merci de signer votre contrat de travail', expiresAt: new Date('2025-02-10') },
  { id: 'sig2', documentName: 'Avenant - Changement poste Kwame Adjei', documentType: 'amendment', initiatedBy: '2', initiatedByName: 'Ama Gbeko', initiatedAt: new Date('2025-01-05'), status: 'completed', recipients: [
    { employeeId: '3', name: 'Kwame Adjei', email: 'kwame@techafrique.com', status: 'signed', signedAt: new Date('2025-01-06'), signatureDataUrl: '' },
    { employeeId: '1', name: 'Kofi Mensah', email: 'admin@techafrique.com', status: 'signed', signedAt: new Date('2025-01-07'), signatureDataUrl: '' },
  ], completedAt: new Date('2025-01-07') },
  { id: 'sig3', documentName: 'Politique de télétravail 2025', documentType: 'policy', initiatedBy: '1', initiatedByName: 'Kofi Mensah', initiatedAt: new Date('2025-01-01'), status: 'draft', recipients: [], message: 'Approbation par les chefs de service' },
  { id: 'sig4', documentName: 'NDA - Partenariat Client', documentType: 'nda', initiatedBy: '1', initiatedByName: 'Kofi Mensah', initiatedAt: new Date('2024-12-20'), status: 'signed', recipients: [
    { employeeId: '2', name: 'Ama Gbeko', email: 'ama@techafrique.com', status: 'signed', signedAt: new Date('2024-12-21'), signatureDataUrl: '' },
  ], completedAt: new Date('2024-12-21') },
];

const mockSignatureTemplates: SignatureTemplate[] = [
  { id: 'stpl1', name: 'Contrat CDI Standard', description: 'Modèle de contrat à durée indéterminée', documentType: 'contract', content: 'Entre la société {{company_name}} et {{employee_name}}...', placeholders: [{ key: 'employee_name', label: 'Nom employé', fieldType: 'employee_name' }, { key: 'employee_position', label: 'Poste', fieldType: 'employee_position' }, { key: 'salary', label: 'Salaire', fieldType: 'salary' }, { key: 'date', label: 'Date', fieldType: 'date' }], createdAt: new Date('2024-06-01') },
  { id: 'stpl2', name: 'Avenant changement poste', description: 'Modèle d\'avenant pour modification de poste', documentType: 'amendment', content: 'Avenant au contrat de travail de {{employee_name}}...', placeholders: [{ key: 'employee_name', label: 'Nom employé', fieldType: 'employee_name' }, { key: 'employee_position', label: 'Nouveau poste', fieldType: 'employee_position' }, { key: 'date', label: 'Date d\'effet', fieldType: 'date' }], createdAt: new Date('2024-07-01') },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [attendance, setAttendance] = useState<Attendance[]>(mockAttendance);
  const [leaves, setLeaves] = useState<Leave[]>(mockLeaves);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [documents, setDocuments] = useState<AppDocument[]>(mockDocuments);
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [payrollConfig, setPayrollConfig] = useState<PayrollConfig>(PAYROLL_COUNTRIES[0]);
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const [jobOffers, setJobOffers] = useState<JobOffer[]>(mockJobOffers);
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [objectives, setObjectives] = useState<Objective[]>(mockObjectives);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(mockPerformanceReviews);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(mockTimelineEvents);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(mockBankAccounts);
  const [transactions, setTransactions] = useState<BankTransaction[]>(mockTransactions);
  const [taxDeclarations, setTaxDeclarations] = useState<TaxDeclaration[]>(mockTaxDeclarations);
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(mockEnrollments);
  const [missions, setMissions] = useState<Mission[]>(mockMissions);
  const [expenses, setExpenses] = useState<ExpenseReport[]>(mockExpenses);
  const [jobPosts, setJobPosts] = useState<JobPost[]>(mockJobPosts);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [vaultItems, setVaultItems] = useState<EmployeeVaultItem[]>(mockVaultItems);
  const [rewardTransactions, setRewardTransactions] = useState<RewardTransaction[]>(mockRewardTransactions);
  const [rewardCatalog, setRewardCatalog] = useState<RewardCatalog[]>(mockRewardCatalog);
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);
  const [equipmentAssignments, setEquipmentAssignments] = useState<EquipmentAssignment[]>(mockEquipmentAssignments);
  const [wellnessSurveys, setWellnessSurveys] = useState<WellnessSurvey[]>(mockWellnessSurveys);
  const [wellnessResponses, setWellnessResponses] = useState<WellnessResponse[]>(mockWellnessResponses);
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>(mockSalaryAdvances);
  const [salaryTransfers, setSalaryTransfers] = useState<SalaryTransfer[]>(mockSalaryTransfers);
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(mockQuizAttempts);
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);
  const [signatureRequests, setSignatureRequests] = useState<SignatureRequest[]>(mockSignatureRequests);
  const [signatureTemplates, setSignatureTemplates] = useState<SignatureTemplate[]>(mockSignatureTemplates);

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    setEmployees((prev) => [...prev, { ...employee, id: String(Date.now()) }]);
  };

  const updateEmployee = (id: string, data: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const sendInvitation = (email: string) => {
    const newInvitation: Invitation = {
      id: String(Date.now()),
      companyId: '1',
      email,
      status: 'pending',
      sentAt: new Date(),
    };
    setInvitations((prev) => [...prev, newInvitation]);
  };

  const addDocument = (doc: Omit<AppDocument, 'id'>) => {
    setDocuments((prev) => [{ ...doc, id: String(Date.now()) }, ...prev]);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    setEvents((prev) => [...prev, { ...event, id: String(Date.now()) }]);
  };

  const acceptInvitation = (id: string) => {
    setInvitations((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'accepted' } : i)));
  };

  const addMessage = (conversationId: string, message: Omit<ChatMessage, 'id'>) => {
    const newMsg = { ...message, id: String(Date.now()) };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: message.content, lastMessageTime: new Date() }
          : c,
      ),
    );
  };

  const addConversation = (participant: { id: string; name: string; position: string }) => {
    setConversations((prev) => {
      if (prev.some((c) => c.participantId === participant.id)) return prev;
      return [
        {
          id: String(Date.now()),
          participantId: participant.id,
          participantName: participant.name,
          participantPosition: participant.position,
          lastMessage: '',
          lastMessageTime: new Date(),
          unread: 0,
          online: false,
          messages: [],
        },
        ...prev,
      ];
    });
  };

  const readConversation = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c)),
    );
  };

  const clockIn = (employeeId: string, gpsLocation?: GPSLocation) => {
    const today = new Date();
    setAttendance((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        employeeId,
        date: today,
        checkIn: today,
        breakStart: null,
        breakEnd: null,
        checkOut: null,
        totalHours: 0,
        overtime: 0,
        status: today.getHours() > 9 ? 'late' : 'present',
        gpsCheckIn: gpsLocation,
      },
    ]);
    eventBus.emit(EVENTS.CLOCK_IN);
  };

  const startBreak = (employeeId: string) => {
    setAttendance((prev) =>
      prev.map((a) =>
        a.employeeId === employeeId && new Date(a.date).toDateString() === new Date().toDateString()
          ? { ...a, breakStart: new Date() }
          : a,
      ),
    );
  };

  const endBreak = (employeeId: string) => {
    setAttendance((prev) =>
      prev.map((a) =>
        a.employeeId === employeeId && new Date(a.date).toDateString() === new Date().toDateString()
          ? { ...a, breakEnd: new Date() }
          : a,
      ),
    );
  };

  const clockOut = (employeeId: string, gpsLocation?: GPSLocation) => {
    setAttendance((prev) =>
      prev.map((a) => {
        if (a.employeeId !== employeeId || new Date(a.date).toDateString() !== new Date().toDateString()) return a;
        if (!a.checkIn) return a;
        const now = new Date();
        const totalHours = (now.getTime() - a.checkIn.getTime()) / (1000 * 60 * 60);
        const overtime = totalHours > 8 ? totalHours - 8 : 0;
        return { ...a, checkOut: now, gpsCheckOut: gpsLocation, totalHours: Math.round(totalHours * 100) / 100, overtime };
      }),
    );
    eventBus.emit(EVENTS.CLOCK_OUT);
  };

  const requestLeave = (leave: Omit<Leave, 'id'>) => {
    setLeaves((prev) => [...prev, { ...leave, id: String(Date.now()) }]);
    eventBus.emit(EVENTS.LEAVE_REQUESTED);
  };

  const approveLeave = (id: string) => {
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'approved' } : l)));
    eventBus.emit(EVENTS.LEAVE_APPROVED);
  };

  const rejectLeave = (id: string) => {
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'rejected' } : l)));
    eventBus.emit(EVENTS.LEAVE_REJECTED);
  };

  const processPayment = (employeeId: string, amount: number) => {
    const bonus = amount * PAYROLL.BONUS_RATE;
    const deduction = amount * PAYROLL.DEDUCTION_RATE;
    const net = amount + bonus - deduction;
    setPayslips((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        employeeId,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basicSalary: amount,
        bonuses: bonus,
        deductions: deduction,
        netSalary: net,
        generatedAt: new Date(),
      },
    ]);
    addNotification({
      userId: employeeId,
      title: 'Paiement effectué',
      message: `Votre salaire de ${amount.toLocaleString()} FCFA a été versé`,
      type: 'payment',
      read: false,
    });
  };

  const generatePayslip = (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    const salary = employee?.salary || 0;
    setPayslips((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        employeeId,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basicSalary: salary,
        bonuses: salary * PAYROLL.BONUS_RATE,
        deductions: salary * PAYROLL.DEDUCTION_RATE,
        netSalary: salary + salary * PAYROLL.BONUS_RATE - salary * PAYROLL.DEDUCTION_RATE,
        generatedAt: new Date(),
      },
    ]);
    eventBus.emit(EVENTS.PAYSLIP_GENERATED);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    setNotifications((prev) => [
      { ...notification, id: String(prev.length + 1), createdAt: new Date() },
      ...prev,
    ]);
    eventBus.emit(EVENTS.NOTIFICATION_SENT);
  };

  const addMultipleEmployees = (emps: Omit<Employee, 'id'>[]) => {
    setEmployees((prev) => [...prev, ...emps.map((e) => ({ ...e, id: String(Date.now()) + String(Math.random()) }))]);
  };

  const addTeam = (team: Omit<Team, 'id' | 'createdAt'>) => {
    setTeams((prev) => [...prev, { ...team, id: String(Date.now()), createdAt: new Date() }]);
  };

  const updateTeam = (id: string, data: Partial<Team>) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  };

  const deleteTeam = (id: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  const addPost = (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => {
    setPosts((prev) => [{ ...post, id: String(Date.now()), createdAt: new Date(), likes: [], comments: [] }, ...prev]);
  };

  const likePost = (postId: string, userId: string) => {
    setPosts((prev) => prev.map((p) =>
      p.id === postId
        ? { ...p, likes: p.likes.includes(userId) ? p.likes.filter((id) => id !== userId) : [...p.likes, userId] }
        : p,
    ));
  };

  const addComment = (postId: string, comment: Omit<PostComment, 'id' | 'createdAt'>) => {
    setPosts((prev) => prev.map((p) =>
      p.id === postId
        ? { ...p, comments: [...p.comments, { ...comment, id: String(Date.now()), createdAt: new Date() }] }
        : p,
    ));
  };

  const updatePayrollConfig = (config: Partial<PayrollConfig>) => {
    setPayrollConfig((prev) => ({ ...prev, ...config }));
  };

  const signDocument = (docId: string, signatureDataUrl: string) => {
    setSignatures((prev) => ({ ...prev, [docId]: signatureDataUrl }));
  };

  const getSignatures = () => signatures;

  const addJobOffer = (offer: Omit<JobOffer, 'id' | 'createdAt'>) => {
    setJobOffers((prev) => [{ ...offer, id: String(Date.now()), createdAt: new Date() }, ...prev]);
    addNotification({ userId: '1', title: 'Nouvelle offre d\'emploi', message: `Offre "${offer.title}" créée`, type: 'recruitment', read: false });
  };

  const updateJobOffer = (id: string, data: Partial<JobOffer>) => {
    setJobOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } : o)));
  };

  const deleteJobOffer = (id: string) => {
    setJobOffers((prev) => prev.filter((o) => o.id !== id));
  };

  const addCandidate = (candidate: Omit<Candidate, 'id' | 'appliedAt'>) => {
    setCandidates((prev) => [{ ...candidate, id: String(Date.now()), appliedAt: new Date() }, ...prev]);
    const offer = jobOffers.find((o) => o.id === candidate.jobOfferId);
    addNotification({ userId: '1', title: 'Nouveau candidat', message: `${candidate.firstName} ${candidate.lastName} a postulé à "${offer?.title}"`, type: 'recruitment', read: false });
  };

  const updateCandidate = (id: string, data: Partial<Candidate>) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const addObjective = (objective: Omit<Objective, 'id' | 'createdAt'>) => {
    setObjectives((prev) => [{ ...objective, id: String(Date.now()), createdAt: new Date() }, ...prev]);
    addTimelineEvent({ employeeId: objective.employeeId, type: 'objective', title: 'Objectif créé', description: objective.title, date: new Date() });
    addNotification({ userId: objective.employeeId, title: 'Nouvel objectif', message: `Objectif "${objective.title}" assigné`, type: 'objective', read: false });
  };

  const updateObjective = (id: string, data: Partial<Objective>) => {
    setObjectives((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } : o)));
  };

  const deleteObjective = (id: string) => {
    setObjectives((prev) => prev.filter((o) => o.id !== id));
  };

  const addPerformanceReview = (review: Omit<PerformanceReview, 'id' | 'createdAt'>) => {
    setPerformanceReviews((prev) => [{ ...review, id: String(Date.now()), createdAt: new Date() }, ...prev]);
    addTimelineEvent({ employeeId: review.employeeId, type: 'review', title: 'Évaluation', description: `Note: ${review.rating}/5`, date: review.reviewDate });
    addNotification({ userId: review.employeeId, title: 'Évaluation reçue', message: `Votre évaluation: ${review.rating}/5`, type: 'review', read: false });
  };

  const updatePerformanceReview = (id: string, data: Partial<PerformanceReview>) => {
    setPerformanceReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
  };

  const addTimelineEvent = (event: Omit<TimelineEvent, 'id'>) => {
    setTimelineEvents((prev) => [{ ...event, id: String(Date.now()) }, ...prev]);
  };

  const updateEmployeeContract = (employeeId: string, contract: Contract) => {
    setEmployees((prev) => prev.map((e) =>
      e.id === employeeId ? { ...e, contract, contractHistory: [...(e.contractHistory || []), contract] } : e,
    ));
    addTimelineEvent({ employeeId, type: 'contract', title: 'Contrat mis à jour', description: `${contract.type} - ${contract.position}`, date: contract.startDate });
    addNotification({ userId: employeeId, title: 'Contrat mis à jour', message: `Nouveau contrat: ${contract.type}`, type: 'contract', read: false });
  };

  const addBankAccount = (acc: Omit<BankAccount, 'id'>) => {
    setBankAccounts((prev) => [{ ...acc, id: String(Date.now()) }, ...prev]);
  };

  const addTransaction = (tx: Omit<BankTransaction, 'id'>) => {
    setTransactions((prev) => [{ ...tx, id: String(Date.now()) }, ...prev]);
    eventBus.emit(EVENTS.TRANSACTION_ADDED);
  };

  const addTaxDeclaration = (d: Omit<TaxDeclaration, 'id'>) => {
    setTaxDeclarations((prev) => [{ ...d, id: String(Date.now()) }, ...prev]);
    eventBus.emit(EVENTS.TAX_SUBMITTED);
  };
  const updateTaxDeclaration = (id: string, data: Partial<TaxDeclaration>) => {
    setTaxDeclarations((prev) => prev.map((x) => (x.id === id ? { ...x, ...data } : x)));
    eventBus.emit(EVENTS.TAX_SUBMITTED);
  };

  const addCourse = (c: Omit<Course, 'id' | 'createdAt'>) => {
    setCourses((prev) => [{ ...c, id: String(Date.now()), createdAt: new Date() }, ...prev]);
  };

  const enrollCourse = (employeeId: string, courseId: string) => {
    setEnrollments((prev) => [...prev, { id: String(Date.now()), courseId, employeeId, progress: 0, completedLessons: [], startedAt: new Date(), status: 'enrolled' }]);
    setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, enrolledCount: c.enrolledCount + 1 } : c));
    addNotification({ userId: employeeId, title: 'Inscription formation', message: `Inscrit au cours`, type: 'payslip', read: false });
  };

  const updateLessonProgress = (enrollmentId: string, lessonId: string) => {
    setEnrollments((prev) => prev.map((e) => {
      if (e.id !== enrollmentId) return e;
      const completed = e.completedLessons.includes(lessonId) ? e.completedLessons : [...e.completedLessons, lessonId];
      const course = courses.find((c) => c.id === e.courseId);
      const totalLessons = course?.lessons.length || 1;
      const progress = Math.round((completed.length / totalLessons) * 100);
      const status = progress >= 100 ? 'completed' as const : 'in_progress' as const;
      return { ...e, completedLessons: completed, progress, status, completedAt: progress >= 100 ? new Date() : e.completedAt };
    }));
  };

  const addMission = (m: Omit<Mission, 'id' | 'createdAt'>) => {
    setMissions((prev) => [{ ...m, id: String(Date.now()), createdAt: new Date() }, ...prev]);
  };
  const updateMission = (id: string, data: Partial<Mission>) => {
    setMissions((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
    eventBus.emit(EVENTS.MISSION_UPDATED);
  };

  const addExpense = (e: Omit<ExpenseReport, 'id'>) => {
    setExpenses((prev) => [{ ...e, id: String(Date.now()) }, ...prev]);
  };
  const updateExpense = (id: string, data: Partial<ExpenseReport>) => {
    setExpenses((prev) => prev.map((x) => (x.id === id ? { ...x, ...data } : x)));
    eventBus.emit(EVENTS.EXPENSE_UPDATED);
  };

  const addJobPost = (p: Omit<JobPost, 'id' | 'createdAt'>) => {
    setJobPosts((prev) => [{ ...p, id: String(Date.now()), createdAt: new Date() }, ...prev]);
  };
  const updateJobPost = (id: string, data: Partial<JobPost>) => {
    setJobPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };
  const deleteJobPost = (id: string) => {
    setJobPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const addMeeting = (meeting: Omit<Meeting, 'id' | 'createdAt' | 'status'>) => {
    const newMeeting: Meeting = {
      ...meeting,
      id: String(Date.now()),
      status: 'scheduled',
      createdAt: new Date(),
    };
    setMeetings(prev => [...prev, newMeeting]);
  };

  const updateMeeting = (id: string, data: Partial<Meeting>) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const addMeetingNote = (meetingId: string, note: Omit<MeetingNote, 'id' | 'createdAt'>) => {
    const newNote: MeetingNote = { ...note, id: String(Date.now()), createdAt: new Date() };
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, notes: [...m.notes, newNote] } : m));
  };

  const addMeetingTask = (meetingId: string, task: Omit<MeetingTask, 'id' | 'createdAt'>) => {
    const newTask: MeetingTask = { ...task, id: String(Date.now()), createdAt: new Date() };
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, tasks: [...m.tasks, newTask] } : m));
  };

  const updateMeetingTask = (meetingId: string, taskId: string, data: Partial<MeetingTask>) => {
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, tasks: m.tasks.map(t => t.id === taskId ? { ...t, ...data } : t) } : m));
  };

  const updateParticipantStatus = (meetingId: string, employeeId: string, status: ParticipantStatus) => {
    setMeetings(prev => prev.map(m => m.id === meetingId ? {
      ...m,
      participants: m.participants.map(p => p.employeeId === employeeId ? { ...p, status } : p),
    } : m));
  };

  const joinMeeting = (meetingId: string, employeeId: string) => {
    setMeetings(prev => prev.map(m => m.id === meetingId ? {
      ...m,
      participants: m.participants.map(p => p.employeeId === employeeId ? { ...p, joinedAt: new Date(), status: 'accepted' } : p),
    } : m));
  };

  const leaveMeeting = (meetingId: string, employeeId: string) => {
    setMeetings(prev => prev.map(m => m.id === meetingId ? {
      ...m,
      participants: m.participants.map(p => {
        if (p.employeeId !== employeeId) return p;
        const joined = p.joinedAt ? p.joinedAt.getTime() : Date.now();
        const duration = (Date.now() - joined) / 60000;
        return { ...p, leftAt: new Date(), attendanceDuration: (p.attendanceDuration || 0) + duration };
      }),
    } : m));
  };

  // Coffre-fort numérique
  const addVaultItem = (item: Omit<EmployeeVaultItem, 'id'>) => {
    setVaultItems(prev => [{ ...item, id: String(Date.now()) }, ...prev]);
    eventBus.emit(EVENTS.VAULT_ITEM_ADDED);
  };
  const deleteVaultItem = (id: string) => {
    setVaultItems(prev => prev.filter(v => v.id !== id));
  };

  // Récompenses
  const addRewardTransaction = (tx: Omit<RewardTransaction, 'id' | 'createdAt'>) => {
    const newTx: RewardTransaction = { ...tx, id: String(Date.now()), createdAt: new Date() };
    setRewardTransactions(prev => [newTx, ...prev]);
    eventBus.emit(tx.type === 'earned' ? EVENTS.REWARD_EARNED : EVENTS.REWARD_REDEEMED);
    addNotification({ userId: tx.employeeId, title: 'Points récompense', message: `${tx.points > 0 ? '+' : ''}${tx.points} points - ${tx.reason}`, type: 'payslip', read: false });
  };

  const addRewardCatalogItem = (item: Omit<RewardCatalog, 'id'>) => {
    setRewardCatalog(prev => [...prev, { ...item, id: String(Date.now()) }]);
  };

  const redeemReward = (employeeId: string, catalogItemId: string) => {
    const item = rewardCatalog.find(c => c.id === catalogItemId);
    if (!item || item.stock <= 0) return;
    const totalEarned = rewardTransactions.filter(t => t.employeeId === employeeId && t.type === 'earned').reduce((s, t) => s + t.points, 0);
    const totalRedeemed = rewardTransactions.filter(t => t.employeeId === employeeId && t.type === 'redeemed').reduce((s, t) => s + t.points, 0);
    const balance = totalEarned - totalRedeemed;
    if (balance < item.pointsCost) return;
    addRewardTransaction({ employeeId, points: -item.pointsCost, type: 'redeemed', reason: item.name });
    setRewardCatalog(prev => prev.map(c => c.id === catalogItemId ? { ...c, stock: c.stock - 1 } : c));
  };

  // Matériel
  const addEquipment = (eq: Omit<Equipment, 'id'>) => {
    setEquipment(prev => [{ ...eq, id: String(Date.now()) }, ...prev]);
  };
  const updateEquipmentFn = (id: string, data: Partial<Equipment>) => {
    setEquipment(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };
  const assignEquipment = (equipmentId: string, employeeId: string) => {
    const now = new Date();
    setEquipment(prev => prev.map(e => e.id === equipmentId ? { ...e, status: 'assigned', assigneeId: employeeId, assignedAt: now, returnedAt: undefined, condition: 'good' } : e));
    setEquipmentAssignments(prev => [...prev, { id: String(Date.now()), equipmentId, employeeId, assignedAt: now, conditionAtAssignment: 'good' }]);
    eventBus.emit(EVENTS.EQUIPMENT_ASSIGNED);
    addNotification({ userId: employeeId, title: 'Équipement assigné', message: `Un équipement vous a été assigné`, type: 'payslip', read: false });
  };
  const returnEquipment = (equipmentId: string, condition?: 'good' | 'fair' | 'damaged') => {
    const now = new Date();
    setEquipment(prev => prev.map(e => e.id === equipmentId ? { ...e, status: 'available', assigneeId: undefined, assignedAt: undefined, returnedAt: now, condition: condition || 'good' } : e));
    setEquipmentAssignments(prev => prev.map(a => a.equipmentId === equipmentId && !a.returnedAt ? { ...a, returnedAt: now, conditionAtReturn: condition } : a));
  };

  // Bien-être
  const addWellnessSurvey = (survey: Omit<WellnessSurvey, 'id' | 'createdAt'>) => {
    setWellnessSurveys(prev => [{ ...survey, id: String(Date.now()), createdAt: new Date() }, ...prev]);
  };
  const submitWellnessResponse = (response: Omit<WellnessResponse, 'id'>) => {
    setWellnessResponses(prev => [{ ...response, id: String(Date.now()) }, ...prev]);
    eventBus.emit(EVENTS.SURVEY_SUBMITTED);
  };

  // Banque salariale fintech
  const requestSalaryAdvance = (advance: Omit<SalaryAdvance, 'id' | 'requestedAt' | 'status' | 'repaymentStatus'>) => {
    setSalaryAdvances(prev => [{ ...advance, id: String(Date.now()), status: 'requested', requestedAt: new Date(), repaymentStatus: 'pending' }, ...prev]);
    eventBus.emit(EVENTS.ADVANCE_REQUESTED);
    addNotification({ userId: advance.employeeId, title: 'Demande d\'avance', message: `Avance de ${advance.amount.toLocaleString()} FCFA demandée`, type: 'payslip', read: false });
  };
  const approveSalaryAdvance = (id: string) => {
    setSalaryAdvances(prev => prev.map(a => a.id === id ? { ...a, status: 'approved', approvedAt: new Date() } : a));
    eventBus.emit(EVENTS.ADVANCE_APPROVED);
  };
  const paySalaryAdvance = (id: string) => {
    const advance = salaryAdvances.find(a => a.id === id);
    setSalaryAdvances(prev => prev.map(a => a.id === id ? { ...a, status: 'paid', paidAt: new Date() } : a));
    eventBus.emit(EVENTS.ADVANCE_PAID);
    if (advance) {
      addSalaryTransfer({ employeeId: advance.employeeId, amount: advance.amount, currency: 'FCFA', type: 'advance', status: 'completed', description: 'Avance sur salaire' });
    }
  };
  const rejectSalaryAdvance = (id: string) => {
    setSalaryAdvances(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected', rejectedAt: new Date() } : a));
  };
  const addSalaryTransfer = (transfer: Omit<SalaryTransfer, 'id' | 'createdAt'>) => {
    setSalaryTransfers(prev => [{ ...transfer, id: String(Date.now()), createdAt: new Date() }, ...prev]);
  };

  // Quiz et certificats
  const addQuiz = (quiz: Omit<Quiz, 'id'>) => {
    setQuizzes(prev => [{ ...quiz, id: String(Date.now()) }, ...prev]);
  };
  const submitQuizAttempt = (attempt: Omit<QuizAttempt, 'id' | 'startedAt' | 'completedAt' | 'passed'>): QuizAttempt => {
    const quiz = quizzes.find(q => q.id === attempt.quizId);
    const totalPoints = quiz?.questions.reduce((s, q) => s + q.points, 0) || 0;
    let score = 0;
    if (quiz?.questions && quiz.questions.length > 0) {
      quiz.questions.forEach((q, i) => {
        if (attempt.answers[i] === q.correctAnswer) score += q.points;
      });
    }
    const passed = totalPoints > 0 && score >= (quiz?.passingScore || totalPoints);
    const newAttempt: QuizAttempt = { ...attempt, id: String(Date.now()), score, totalPoints, passed, startedAt: new Date(), completedAt: new Date() };
    setQuizAttempts(prev => [...prev, newAttempt]);
    eventBus.emit(EVENTS.QUIZ_COMPLETED);
    if (passed && quiz) {
      issueCertificate({ courseId: quiz.courseId, employeeId: attempt.employeeId, expiresAt: new Date(Date.now() + 365 * 86400000) });
      addRewardTransaction({ employeeId: attempt.employeeId, points: 300, type: 'earned', reason: `Quiz réussi: ${quiz.title}` });
    }
    return newAttempt;
  };
  const issueCertificate = (cert: Omit<Certificate, 'id' | 'issuedAt'>) => {
    setCertificates(prev => [{ ...cert, id: String(Date.now()), issuedAt: new Date() }, ...prev]);
    eventBus.emit(EVENTS.CERTIFICATE_ISSUED);
  };

  // Signature électronique
  const sendSignatureRequest = (req: Omit<SignatureRequest, 'id' | 'initiatedAt' | 'status'>) => {
    const newReq: SignatureRequest = {
      ...req,
      id: String(Date.now()),
      status: 'sent',
      initiatedAt: new Date(),
    };
    setSignatureRequests(prev => [newReq, ...prev]);
    eventBus.emit(EVENTS.SIGNATURE_SENT);
    req.recipients.forEach(r => {
      addNotification({ userId: r.employeeId, title: 'Document à signer', message: `${req.documentName} - Veuillez signer le document`, type: 'contract', read: false });
    });
  };

  const signDocumentFn = (requestId: string, recipientEmployeeId: string, signatureDataUrl: string) => {
    let allSigned = false;
    setSignatureRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      const updatedRecipients = req.recipients.map(r =>
        r.employeeId === recipientEmployeeId ? { ...r, status: 'signed' as const, signedAt: new Date(), signatureDataUrl } : r
      );
      allSigned = updatedRecipients.every(r => r.status === 'signed');
      return { ...req, recipients: updatedRecipients, status: allSigned ? 'completed' as const : 'signed' as const, completedAt: allSigned ? new Date() : req.completedAt };
    }));
    if (allSigned) {
      eventBus.emit(EVENTS.SIGNATURE_COMPLETED);
    } else {
      eventBus.emit(EVENTS.SIGNATURE_SIGNED);
    }
    addNotification({ userId: recipientEmployeeId, title: 'Document signé', message: 'Vous avez signé avec succès', type: 'contract', read: false });
  };

  const rejectSignature = (requestId: string, recipientEmployeeId: string, reason: string) => {
    setSignatureRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, recipients: req.recipients.map(r => r.employeeId === recipientEmployeeId ? { ...r, status: 'rejected' as const, rejectionReason: reason } : r), status: 'rejected' as const } : req
    ));
  };

  const addSignatureTemplate = (tpl: Omit<SignatureTemplate, 'id' | 'createdAt'>) => {
    setSignatureTemplates(prev => [...prev, { ...tpl, id: String(Date.now()), createdAt: new Date() }]);
  };

  const deleteSignatureTemplate = (id: string) => {
    setSignatureTemplates(prev => prev.filter(t => t.id !== id));
  };

  return (
    <DataContext.Provider
      value={{
        employees,
        attendance,
        leaves,
        payslips,
        documents,
        events,
        conversations,
        notifications,
        invitations,
        teams,
        posts,
        payrollConfig,
        signatures,
        jobOffers,
        candidates,
        objectives,
        performanceReviews,
        timelineEvents,
        bankAccounts,
        transactions,
        taxDeclarations,
        courses,
        enrollments,
        missions,
        expenses,
        jobPosts,
        meetings,
        addDocument,
        deleteDocument,
        addEvent,
        addMessage,
        addConversation,
        readConversation,
        addEmployee,
        addMultipleEmployees,
        updateEmployee,
        deleteEmployee,
        sendInvitation,
        acceptInvitation,
        clockIn,
        startBreak,
        endBreak,
        clockOut,
        requestLeave,
        approveLeave,
        rejectLeave,
        addTeam,
        updateTeam,
        deleteTeam,
        addPost,
        likePost,
        addComment,
        updatePayrollConfig,
        signDocument,
        getSignatures,
        addJobOffer,
        updateJobOffer,
        deleteJobOffer,
        addCandidate,
        updateCandidate,
        addObjective,
        updateObjective,
        deleteObjective,
        addPerformanceReview,
        updatePerformanceReview,
        addTimelineEvent,
        updateEmployeeContract,
        addBankAccount,
        addTransaction,
        addTaxDeclaration,
        updateTaxDeclaration,
        addCourse,
        enrollCourse,
        updateLessonProgress,
        addMission,
        updateMission,
        addExpense,
        updateExpense,
        addJobPost,
        updateJobPost,
        deleteJobPost,
        addMeeting,
        updateMeeting,
        addMeetingNote,
        addMeetingTask,
        updateMeetingTask,
        updateParticipantStatus,
        joinMeeting,
        leaveMeeting,
        vaultItems,
        rewardTransactions,
        rewardCatalog,
        equipment,
        equipmentAssignments,
        wellnessSurveys,
        wellnessResponses,
        salaryAdvances,
        salaryTransfers,
        quizzes,
        quizAttempts,
        certificates,
        addVaultItem,
        deleteVaultItem,
        addRewardTransaction,
        addRewardCatalogItem,
        redeemReward,
        addEquipment,
        updateEquipment: updateEquipmentFn,
        assignEquipment,
        returnEquipment,
        addWellnessSurvey,
        submitWellnessResponse,
        requestSalaryAdvance,
        approveSalaryAdvance,
        paySalaryAdvance,
        rejectSalaryAdvance,
        addSalaryTransfer,
        addQuiz,
        submitQuizAttempt,
        issueCertificate,
        signatureRequests,
        signatureTemplates,
        sendSignatureRequest,
        signSignatureRequest: signDocumentFn,
        rejectSignature,
        addSignatureTemplate,
        deleteSignatureTemplate,
        processPayment,
        generatePayslip,
        markNotificationRead,
        addNotification,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
