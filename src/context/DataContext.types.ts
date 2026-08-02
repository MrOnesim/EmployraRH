import type {
  Employee,
  Attendance,
  Leave,
  Payslip,
  Notification,
  Invitation,
  Document as AppDocument,
  CalendarEvent,
  Conversation,
  ChatMessage,
  Team,
  Post,
  PayrollConfig,
  PostComment,
  JobOffer,
  Candidate,
  Objective,
  PerformanceReview,
  TimelineEvent,
  Contract,
  BankAccount,
  BankTransaction,
  TaxDeclaration,
  Course,
  Enrollment,
  Mission,
  ExpenseReport,
  JobPost,
  GPSLocation,
  Meeting,
  MeetingTask,
  MeetingNote,
  ParticipantStatus,
  EmployeeVaultItem,
  RewardTransaction,
  RewardCatalog,
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
} from '../types';

export interface DataState {
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
  updateParticipantStatus: (
    meetingId: string,
    employeeId: string,
    status: ParticipantStatus,
  ) => void;
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
  requestSalaryAdvance: (
    advance: Omit<SalaryAdvance, 'id' | 'requestedAt' | 'status' | 'repaymentStatus'>,
  ) => void;
  approveSalaryAdvance: (id: string) => void;
  paySalaryAdvance: (id: string) => void;
  rejectSalaryAdvance: (id: string) => void;
  addSalaryTransfer: (transfer: Omit<SalaryTransfer, 'id' | 'createdAt'>) => void;
  // Quiz et certificats
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  certificates: Certificate[];
  addQuiz: (quiz: Omit<Quiz, 'id'>) => void;
  submitQuizAttempt: (
    attempt: Omit<QuizAttempt, 'id' | 'startedAt' | 'completedAt' | 'passed'>,
  ) => QuizAttempt;
  issueCertificate: (cert: Omit<Certificate, 'id' | 'issuedAt'>) => void;
  // Signature électronique
  signatureRequests: SignatureRequest[];
  signatureTemplates: SignatureTemplate[];
  sendSignatureRequest: (req: Omit<SignatureRequest, 'id' | 'initiatedAt' | 'status'>) => void;
  signSignatureRequest: (
    requestId: string,
    recipientEmployeeId: string,
    signatureDataUrl: string,
  ) => void;
  rejectSignature: (requestId: string, recipientEmployeeId: string, reason: string) => void;
  addSignatureTemplate: (tpl: Omit<SignatureTemplate, 'id' | 'createdAt'>) => void;
  deleteSignatureTemplate: (id: string) => void;
}
