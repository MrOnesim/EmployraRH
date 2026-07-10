export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'RH' | 'MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE' | 'SECURITY_GUARD';

export interface Company {
  id: string;
  name: string;
  logo: string;
  ownerFirstName: string;
  ownerLastName: string;
  email: string;
  phone: string;
  employeeCount: number;
  address: string;
  website: string;
  uniqueId: string;
  createdAt: Date;
  balance: number;
}

export interface Employee {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  position: string;
  department: string;
  photo: string;
  salary: number;
  status: 'active' | 'inactive' | 'pending';
  joinDate: Date;
  role: UserRole;
  contract?: Contract;
  contractHistory?: Contract[];
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: Date;
  checkIn: Date | null;
  breakStart: Date | null;
  breakEnd: Date | null;
  checkOut: Date | null;
  totalHours: number;
  overtime: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
  gpsCheckIn?: GPSLocation;
  gpsCheckOut?: GPSLocation;
}

export interface Leave {
  id: string;
  employeeId: string;
  type: 'annual' | 'sick' | 'maternity' | 'special';
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalComment?: string;
}

export interface Payslip {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  basicSalary: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  generatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'invitation' | 'payment' | 'leave' | 'attendance' | 'payslip' | 'recruitment' | 'objective' | 'review' | 'contract' | 'document';
  read: boolean;
  createdAt: Date;
}

export interface Invitation {
  id: string;
  companyId: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  sentAt: Date;
}

export interface LeaveBalance {
  employeeId: string;
  annual: { total: number; used: number };
  sick: { total: number; used: number };
  maternity: { total: number; used: number };
  special: { total: number; used: number };
}

export interface LeavePolicy {
  annual: number;
  sick: number;
  maternity: number;
  special: number;
}

export interface Document {
  id: string;
  companyId?: string;
  employeeId?: string;
  name: string;
  type: string;
  department: string;
  uploadedBy: string;
  uploadedAt: Date;
  size: string;
  category: string;
  url?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'meeting' | 'birthday' | 'holiday' | 'team' | 'training' | 'other';
  attendees: string[];
  allDay: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantPosition: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
  online: boolean;
  messages: ChatMessage[];
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  memberIds: string[];
  createdAt: Date;
}

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  likes: string[];
  comments: PostComment[];
}

export interface PayrollConfig {
  id: string;
  companyId: string;
  country: string;
  countryName: string;
  bonusRate: number;
  deductionRate: number;
  currency: string;
  currencyLocale: string;
  taxRate: number;
  socialChargesRate: number;
  paymentDay: number;
  overtimeRate: number;
}

export interface JobOffer {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string;
  salary: number;
  location: string;
  type: string;
  status: 'open' | 'closed' | 'draft';
  createdAt: Date;
  createdBy: string;
}

export type CandidateStatus = 'received' | 'interview' | 'accepted' | 'rejected';
export type ObjectiveStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Candidate {
  id: string;
  jobOfferId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: CandidateStatus;
  appliedAt: Date;
  coverLetter?: string;
  resumeUrl?: string;
  interviewDate?: Date;
  notes?: string;
}

export interface Objective {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  deadline: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  category: string;
  createdAt: Date;
  createdBy: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewDate: Date;
  rating: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  objectiveIds: string[];
  status: 'draft' | 'submitted' | 'acknowledged';
  createdAt: Date;
}

export interface TimelineEvent {
  id: string;
  employeeId: string;
  type: 'hire' | 'promotion' | 'objective' | 'review' | 'contract' | 'certificate' | 'other';
  title: string;
  description: string;
  date: Date;
}

export interface Contract {
  id: string;
  type: 'CDI' | 'CDD' | 'stage' | 'freelance';
  position: string;
  startDate: Date;
  endDate?: Date;
  salary: number;
  status: 'active' | 'expired' | 'terminated';
  documentUrl?: string;
}

export interface BankAccount {
  id: string;
  companyId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban?: string;
  swift?: string;
  currency: string;
  isMobileMoney: boolean;
  mobileProvider?: string;
  isDefault: boolean;
}

export interface BankTransaction {
  id: string;
  companyId: string;
  type: 'deposit' | 'payment' | 'transfer' | 'withdrawal' | 'fee';
  amount: number;
  currency: string;
  description: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  date: Date;
  accountId: string;
}

export interface TaxDeclaration {
  id: string;
  companyId: string;
  country: string;
  period: string;
  type: 'IRPP' | 'CNSS' | 'TVA' | 'IS' | 'other';
  totalSalary: number;
  totalTax: number;
  status: 'draft' | 'submitted' | 'paid';
  dueDate: Date;
  submittedAt?: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  duration: number;
  order: number;
}

export interface Course {
  id: string;
  companyId: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  instructor: string;
  enrolledCount: number;
  lessons: Lesson[];
  createdAt: Date;
}

export interface Enrollment {
  id: string;
  courseId: string;
  employeeId: string;
  progress: number;
  completedLessons: string[];
  startedAt: Date;
  completedAt?: Date;
  status: 'enrolled' | 'in_progress' | 'completed';
}

export interface Mission {
  id: string;
  employeeId: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  objectives: string;
  transportType: string;
  budget: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: string;
  createdAt: Date;
}

export interface ExpenseReport {
  id: string;
  missionId?: string;
  employeeId: string;
  category: string;
  amount: number;
  currency: string;
  date: Date;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  receiptUrl?: string;
}

export interface JobPost {
  id: string;
  title: string;
  company: string;
  companyId: string;
  description: string;
  requirements: string;
  location: string;
  type: string;
  salary: string;
  category: string;
  status: 'draft' | 'published' | 'closed';
  featured: boolean;
  views: number;
  applications: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface MeetingNote {
  id: string;
  meetingId: string;
  content: string;
  authorId: string;
  type?: 'comment' | 'action' | 'decision';
  createdAt: Date;
}

export interface MeetingTask {
  id: string;
  meetingId: string;
  title: string;
  assignedTo?: string;
  deadline?: Date;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
}

export type ParticipantStatus = 'pending' | 'accepted' | 'declined' | 'tentative';

export interface MeetingParticipant {
  employeeId: string;
  name?: string;
  email?: string;
  status: ParticipantStatus;
  joinedAt?: Date;
  leftAt?: Date;
  attendanceDuration?: number;
}

export interface Meeting {
  id: string;
  companyId?: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  department?: string;
  type: 'physical' | 'online' | 'hybrid';
  priority?: 'normal' | 'important' | 'urgent';
  createdBy?: string;
  participants: MeetingParticipant[];
  notes: MeetingNote[];
  tasks: MeetingTask[];
  agenda?: string[];
  virtualRoomUrl?: string;
  summary?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface EmployeeVaultItem {
  id: string;
  employeeId: string;
  type: 'contract' | 'diploma' | 'id_card' | 'certificate' | 'evaluation' | 'payslip' | 'other';
  name: string;
  fileUrl?: string;
  uploadedAt: Date;
  expiresAt?: Date;
  status: 'active' | 'expired' | 'archived';
}

export interface RewardTransaction {
  id: string;
  employeeId: string;
  points: number;
  type: 'earned' | 'redeemed';
  reason: string;
  createdAt: Date;
}

export interface RewardCatalog {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  stock: number;
  category: 'bonus' | 'gift' | 'advantage' | 'training';
  active: boolean;
}

export interface Equipment {
  id: string;
  companyId: string;
  name: string;
  type: 'computer' | 'phone' | 'vehicle' | 'access_card' | 'other';
  serialNumber: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  purchaseDate?: Date;
  purchasePrice?: number;
  assigneeId?: string;
  assignedAt?: Date;
  returnedAt?: Date;
  condition: 'good' | 'fair' | 'damaged';
  notes?: string;
}

export interface EquipmentAssignment {
  id: string;
  equipmentId: string;
  employeeId: string;
  assignedAt: Date;
  returnedAt?: Date;
  conditionAtAssignment: 'good' | 'fair' | 'damaged';
  conditionAtReturn?: 'good' | 'fair' | 'damaged';
}

export interface WellnessQuestion {
  id: string;
  text: string;
  type: 'rating' | 'yesno' | 'text' | 'multiple_choice' | 'multiple';
  category: 'satisfaction' | 'stress' | 'motivation' | 'workload' | 'environment' | 'other';
  options?: string[];
}

export interface WellnessSurvey {
  id: string;
  companyId?: string;
  title: string;
  description: string;
  questions: WellnessQuestion[];
  active: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface WellnessResponse {
  id: string;
  surveyId: string;
  employeeId: string;
  answers: Record<string, string | number | boolean>;
  submittedAt: Date;
  anonymous?: boolean;
}

export interface SalaryAdvance {
  id: string;
  employeeId: string;
  amount: number;
  currency: string;
  status: 'requested' | 'approved' | 'paid' | 'rejected';
  requestedAt: Date;
  approvedAt?: Date;
  paidAt?: Date;
  rejectedAt?: Date;
  repaymentDate?: Date;
  repaymentStatus: 'pending' | 'repaid' | 'overdue';
  repaymentAmount?: number;
  reason: string;
  approvedBy?: string;
}

export interface SalaryTransfer {
  id: string;
  employeeId: string;
  amount: number;
  currency: string;
  type: 'salary' | 'advance' | 'bonus' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  description: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  text: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  courseId: string;
  employeeId: string;
  score: number;
  totalPoints: number;
  answers: number[];
  passed: boolean;
  startedAt: Date;
  completedAt: Date;
}

export interface Certificate {
  id: string;
  courseId: string;
  employeeId: string;
  issuedAt: Date;
  expiresAt?: Date;
  certificateUrl?: string;
}

export interface SignatureRecipient {
  employeeId: string;
  name: string;
  email: string;
  status: 'pending' | 'signed' | 'rejected';
  signedAt?: Date;
  signatureDataUrl?: string;
  rejectionReason?: string;
}

export interface SignatureRequest {
  id: string;
  documentName: string;
  documentType: 'contract' | 'amendment' | 'policy' | 'nda' | 'other';
  initiatedBy: string;
  initiatedByName: string;
  initiatedAt: Date;
  status: 'draft' | 'sent' | 'signed' | 'completed' | 'rejected';
  recipients: SignatureRecipient[];
  message?: string;
  documentId?: string;
  expiresAt?: Date;
  completedAt?: Date;
}

export interface SignaturePlaceholder {
  key: string;
  label: string;
  fieldType: string;
}

export interface SignatureTemplate {
  id: string;
  companyId?: string;
  name: string;
  description: string;
  documentType: string;
  content: string;
  placeholders: SignaturePlaceholder[];
  createdAt: Date;
}

export type Department = 
  | 'Direction'
  | 'Ressources Humaines'
  | 'Finance'
  | 'Informatique'
  | 'Marketing'
  | 'Ventes'
  | 'Operations'
  | 'Juridique'
  | 'Autre';

export type QRCodeType = 'arrival' | 'lunch_start' | 'lunch_end' | 'departure';

export interface QRCodeConfig {
  arrivalTime: string;
  lunchStartTime: string;
  lunchEndTime: string;
  departureTime: string;
  lateTolerance: number;
  gpsRadius: number;
  requireSelfie: boolean;
  companyLat: number;
  companyLng: number;
}

export interface QRCodeSession {
  id: string;
  companyId: string;
  date: string;
  type: QRCodeType;
  code: string;
  generatedAt: string;
  expiresAt: string;
}

export interface QRScanLog {
  id: string;
  employeeId: string;
  sessionId: string;
  type: QRCodeType;
  scannedAt: string;
  latitude?: number;
  longitude?: number;
  selfie?: string;
  status: 'approved' | 'rejected' | 'pending';
  rejectReason?: string;
}

export interface SecurityGuard {
  id: string;
  companyId: string;
  employeeId: string;
  employee?: Employee;
  isActive: boolean;
  assignedAt: Date;
}

export interface Terminal {
  id: string;
  companyId: string;
  name: string;
  deviceFingerprint: string;
  isActive: boolean;
  lastSeen?: Date;
  createdAt: Date;
}
