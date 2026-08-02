import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { eventBus, EVENTS } from '../utils/eventBus';
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
import { useApp } from './AppContext';
import { PAYROLL, PAYROLL_COUNTRIES } from '../constants';
import { DataState } from './DataContext.types';
import {
  mockEmployees,
  mockAttendance,
  mockLeaves,
  mockDocuments,
  mockEvents,
  mockConversations,
  mockTeams,
  mockPosts,
  mockNotifications,
  mockJobOffers,
  mockCandidates,
  mockObjectives,
  mockPerformanceReviews,
  mockTimelineEvents,
  mockBankAccounts,
  mockTransactions,
  mockTaxDeclarations,
  mockCourses,
  mockEnrollments,
  mockMissions,
  mockExpenses,
  mockJobPosts,
  mockVaultItems,
  mockRewardTransactions,
  mockRewardCatalog,
  mockEquipment,
  mockEquipmentAssignments,
  mockWellnessSurveys,
  mockWellnessResponses,
  mockSalaryAdvances,
  mockSalaryTransfers,
  mockQuizzes,
  mockQuizAttempts,
  mockCertificates,
  mockSignatureRequests,
  mockSignatureTemplates,
} from './mockData';
import * as EmployeeService from '../services/employeeService';
import * as AttendanceService from '../services/attendanceService';
import * as LeaveService from '../services/leaveService';
import * as PayrollService from '../services/payrollService';
import * as MissionService from '../services/missionService';
import * as RecruitmentService from '../services/recruitmentService';
import * as TrainingService from '../services/trainingService';
import * as BankingService from '../services/bankingService';
import * as EquipmentService from '../services/equipmentService';
import * as WellnessService from '../services/wellnessService';
import * as TaxService from '../services/taxService';
import * as CalendarService from '../services/calendarService';
import * as SignatureService from '../services/signatureService';
import * as NotificationService from '../services/notificationService';
import * as TeamService from '../services/teamService';
import * as FeedService from '../services/feedService';
import * as VaultService from '../services/vaultService';
import * as RewardService from '../services/rewardService';
import * as TimelineApiService from '../services/timelineService';
import * as ContractApiService from '../services/contractService';
import api from '../lib/axios';

const DataContext = createContext<DataState | undefined>(undefined);

const useApi = !!import.meta.env.VITE_API_BASE_URL;

export function DataProvider({ children }: { children: ReactNode }) {
  const { currentCompany } = useApp();
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
  const [performanceReviews, setPerformanceReviews] =
    useState<PerformanceReview[]>(mockPerformanceReviews);
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
  const [rewardTransactions, setRewardTransactions] =
    useState<RewardTransaction[]>(mockRewardTransactions);
  const [rewardCatalog, setRewardCatalog] = useState<RewardCatalog[]>(mockRewardCatalog);
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);
  const [equipmentAssignments, setEquipmentAssignments] =
    useState<EquipmentAssignment[]>(mockEquipmentAssignments);
  const [wellnessSurveys, setWellnessSurveys] = useState<WellnessSurvey[]>(mockWellnessSurveys);
  const [wellnessResponses, setWellnessResponses] =
    useState<WellnessResponse[]>(mockWellnessResponses);
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>(mockSalaryAdvances);
  const [salaryTransfers, setSalaryTransfers] = useState<SalaryTransfer[]>(mockSalaryTransfers);
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(mockQuizAttempts);
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);
  const [signatureRequests, setSignatureRequests] =
    useState<SignatureRequest[]>(mockSignatureRequests);
  const [signatureTemplates, setSignatureTemplates] =
    useState<SignatureTemplate[]>(mockSignatureTemplates);

  useEffect(() => {
    if (!useApi || !currentCompany?.id) return;
    const loadAllData = async () => {
      try {
        const companyId = currentCompany.id;
        const [
          emps,
          att,
          lv,
          pays,
          docs,
          evts,
          notifs,
          offers,
          cands,
          objs,
          reviews,
          bankAccs,
          txns,
          taxDecs,
          cours,
          enrols,
          miss,
          exp,
          meetings,
          equip,
          eqAssign,
          wellnessS,
          wellnessR,
          adv,
          transfers,
          sigReqs,
          sigTmpls,
          tms,
          psts,
          rwdCatalog,
          tline,
        ] = await Promise.all([
          EmployeeService.getEmployees(companyId).catch(() => []),
          AttendanceService.getAttendance(companyId).catch(() => []),
          LeaveService.getLeaves(companyId).catch(() => []),
          PayrollService.getPayslips(companyId).catch(() => []),
          api
            .get('/documents', { params: { companyId } })
            .then((r) => r.data)
            .catch(() => []),
          CalendarService.getCalendarEvents({ companyId }).catch(() => []),
          NotificationService.getNotifications({ userId: '' }).catch(() => []),
          RecruitmentService.getJobOffers({ companyId }).catch(() => []),
          RecruitmentService.getCandidates({ companyId }).catch(() => []),
          api
            .get('/objectives', { params: { companyId } })
            .then((r) => r.data)
            .catch(() => []),
          api
            .get('/performance-reviews', { params: { companyId } })
            .then((r) => r.data)
            .catch(() => []),
          BankingService.getBankAccounts({ companyId }).catch(() => []),
          BankingService.getBankTransactions({ companyId }).catch(() => []),
          TaxService.getTaxDeclarations({ companyId }).catch(() => []),
          TrainingService.getCourses({ companyId }).catch(() => []),
          api
            .get('/enrollments/company/' + companyId)
            .then((r) => r.data)
            .catch(() => []),
          MissionService.getMissions({ companyId }).catch(() => []),
          api
            .get('/expense-reports', { params: { companyId } })
            .then((r) => r.data)
            .catch(() => []),
          api
            .get('/meetings', { params: { companyId } })
            .then((r) => r.data)
            .catch(() => []),
          EquipmentService.getEquipmentList({ companyId }).catch(() => []),
          api
            .get('/equipment-assignments', { params: { companyId } })
            .then((r) => r.data)
            .catch(() => []),
          WellnessService.getWellnessSurveys({ companyId }).catch(() => []),
          api
            .get('/wellness-responses', { params: { companyId } })
            .then((r) => r.data)
            .catch(() => []),
          BankingService.getSalaryAdvances({ companyId }).catch(() => []),
          BankingService.getSalaryTransfers(companyId).catch(() => []),
          SignatureService.getSignatureRequests({ companyId }).catch(() => []),
          SignatureService.getSignatureTemplates({ companyId }).catch(() => []),
          TeamService.getTeams(companyId).catch(() => []),
          FeedService.getPosts(companyId).catch(() => []),
          RewardService.getCatalog(companyId).catch(() => []),
          TimelineApiService.getTimeline(companyId).catch(() => []),
        ]);
        if (emps.length) setEmployees(emps);
        if (att.length) setAttendance(att);
        if (lv.length) setLeaves(lv);
        if (pays.length) setPayslips(pays);
        if (docs.length) setDocuments(docs);
        if (evts.length) setEvents(evts);
        if (notifs.length) setNotifications(notifs);
        if (offers.length) setJobOffers(offers);
        if (cands.length) setCandidates(cands);
        if (objs.length) setObjectives(objs);
        if (reviews.length) setPerformanceReviews(reviews);
        if (bankAccs.length) setBankAccounts(bankAccs);
        if (txns.length) setTransactions(txns);
        if (taxDecs.length) setTaxDeclarations(taxDecs);
        if (cours.length) setCourses(cours);
        if (enrols.length) setEnrollments(enrols);
        if (miss.length) setMissions(miss);
        if (exp.length) setExpenses(exp);
        if (meetings.length) setMeetings(meetings);
        if (equip.length) setEquipment(equip);
        if (eqAssign.length) setEquipmentAssignments(eqAssign);
        if (wellnessS.length) setWellnessSurveys(wellnessS);
        if (wellnessR.length) setWellnessResponses(wellnessR);
        if (adv.length) setSalaryAdvances(adv);
        if (transfers.length) setSalaryTransfers(transfers);
        if (sigReqs.length) setSignatureRequests(sigReqs);
        if (sigTmpls.length) setSignatureTemplates(sigTmpls);
        if (tms.length) setTeams(tms);
        if (psts.length) setPosts(psts);
        if (rwdCatalog.length) setRewardCatalog(rwdCatalog);
        if (tline.length) setTimelineEvents(tline);
      } catch {
        /* keep mock data */
      }
    };
    loadAllData();
  }, [currentCompany?.id]);

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
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: message.content,
              lastMessageTime: new Date(),
            }
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
        if (
          a.employeeId !== employeeId ||
          new Date(a.date).toDateString() !== new Date().toDateString()
        )
          return a;
        if (!a.checkIn) return a;
        const now = new Date();
        const totalHours = (now.getTime() - a.checkIn.getTime()) / (1000 * 60 * 60);
        const overtime = totalHours > 8 ? totalHours - 8 : 0;
        return {
          ...a,
          checkOut: now,
          gpsCheckOut: gpsLocation,
          totalHours: Math.round(totalHours * 100) / 100,
          overtime,
        };
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
    setEmployees((prev) => [
      ...prev,
      ...emps.map((e) => ({ ...e, id: String(Date.now()) + String(Math.random()) })),
    ]);
  };

  const addTeam = (team: Omit<Team, 'id' | 'createdAt'>) => {
    if (useApi && currentCompany?.id) {
      TeamService.createTeam({ companyId: currentCompany.id, ...team })
        .then((created) => setTeams((prev) => [...prev, created]))
        .catch(() =>
          setTeams((prev) => [...prev, { ...team, id: String(Date.now()), createdAt: new Date() }]),
        );
      return;
    }
    setTeams((prev) => [...prev, { ...team, id: String(Date.now()), createdAt: new Date() }]);
  };

  const updateTeam = (id: string, data: Partial<Team>) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    if (useApi) TeamService.updateTeam(id, data).catch(() => {});
  };

  const deleteTeam = (id: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
    if (useApi) TeamService.deleteTeam(id).catch(() => {});
  };

  const addPost = (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => {
    if (useApi && currentCompany?.id) {
      FeedService.createPost({
        companyId: currentCompany.id,
        authorId: post.authorId,
        authorName: post.authorName,
        content: post.content,
      })
        .then((created) => setPosts((prev) => [created, ...prev]))
        .catch(() =>
          setPosts((prev) => [
            { ...post, id: String(Date.now()), createdAt: new Date(), likes: [], comments: [] },
            ...prev,
          ]),
        );
      return;
    }
    setPosts((prev) => [
      { ...post, id: String(Date.now()), createdAt: new Date(), likes: [], comments: [] },
      ...prev,
    ]);
  };

  const likePost = (postId: string, userId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likes: p.likes.includes(userId)
                ? p.likes.filter((id) => id !== userId)
                : [...p.likes, userId],
            }
          : p,
      ),
    );
    if (useApi) FeedService.toggleLike(postId, userId).catch(() => {});
  };

  const addComment = (postId: string, comment: Omit<PostComment, 'id' | 'createdAt'>) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                { ...comment, id: String(Date.now()), createdAt: new Date() },
              ],
            }
          : p,
      ),
    );
    if (useApi) {
      FeedService.addComment(postId, {
        authorId: comment.authorId,
        authorName: comment.authorName,
        content: comment.content,
      })
        .then((updated) => setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p))))
        .catch(() => {});
    }
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
    addNotification({
      userId: '1',
      title: "Nouvelle offre d'emploi",
      message: `Offre "${offer.title}" créée`,
      type: 'recruitment',
      read: false,
    });
  };

  const updateJobOffer = (id: string, data: Partial<JobOffer>) => {
    setJobOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } : o)));
  };

  const deleteJobOffer = (id: string) => {
    setJobOffers((prev) => prev.filter((o) => o.id !== id));
  };

  const addCandidate = (candidate: Omit<Candidate, 'id' | 'appliedAt'>) => {
    setCandidates((prev) => [
      { ...candidate, id: String(Date.now()), appliedAt: new Date() },
      ...prev,
    ]);
    const offer = jobOffers.find((o) => o.id === candidate.jobOfferId);
    addNotification({
      userId: '1',
      title: 'Nouveau candidat',
      message: `${candidate.firstName} ${candidate.lastName} a postulé à "${offer?.title}"`,
      type: 'recruitment',
      read: false,
    });
  };

  const updateCandidate = (id: string, data: Partial<Candidate>) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const addObjective = (objective: Omit<Objective, 'id' | 'createdAt'>) => {
    setObjectives((prev) => [
      { ...objective, id: String(Date.now()), createdAt: new Date() },
      ...prev,
    ]);
    addTimelineEvent({
      employeeId: objective.employeeId,
      type: 'objective',
      title: 'Objectif créé',
      description: objective.title,
      date: new Date(),
    });
    addNotification({
      userId: objective.employeeId,
      title: 'Nouvel objectif',
      message: `Objectif "${objective.title}" assigné`,
      type: 'objective',
      read: false,
    });
  };

  const updateObjective = (id: string, data: Partial<Objective>) => {
    setObjectives((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } : o)));
  };

  const deleteObjective = (id: string) => {
    setObjectives((prev) => prev.filter((o) => o.id !== id));
  };

  const addPerformanceReview = (review: Omit<PerformanceReview, 'id' | 'createdAt'>) => {
    setPerformanceReviews((prev) => [
      { ...review, id: String(Date.now()), createdAt: new Date() },
      ...prev,
    ]);
    addTimelineEvent({
      employeeId: review.employeeId,
      type: 'review',
      title: 'Évaluation',
      description: `Note: ${review.rating}/5`,
      date: review.reviewDate,
    });
    addNotification({
      userId: review.employeeId,
      title: 'Évaluation reçue',
      message: `Votre évaluation: ${review.rating}/5`,
      type: 'review',
      read: false,
    });
  };

  const updatePerformanceReview = (id: string, data: Partial<PerformanceReview>) => {
    setPerformanceReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
  };

  const addTimelineEvent = (event: Omit<TimelineEvent, 'id'>) => {
    setTimelineEvents((prev) => [{ ...event, id: String(Date.now()) }, ...prev]);
    if (useApi) {
      TimelineApiService.createTimelineEvent({
        employeeId: event.employeeId,
        type: event.type,
        title: event.title,
        description: event.description,
        date: event.date instanceof Date ? event.date.toISOString() : event.date,
      }).catch(() => {});
    }
  };

  const updateEmployeeContract = (employeeId: string, contract: Contract) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === employeeId
          ? { ...e, contract, contractHistory: [...(e.contractHistory || []), contract] }
          : e,
      ),
    );
    if (useApi) {
      ContractApiService.createContract({
        employeeId,
        type: contract.type,
        position: contract.position,
        startDate:
          contract.startDate instanceof Date
            ? contract.startDate.toISOString()
            : contract.startDate,
        endDate:
          contract.endDate instanceof Date ? contract.endDate.toISOString() : contract.endDate,
        salary: contract.salary,
        documentUrl: contract.documentUrl,
      }).catch(() => {});
    }
    addTimelineEvent({
      employeeId,
      type: 'contract',
      title: 'Contrat mis à jour',
      description: `${contract.type} - ${contract.position}`,
      date: contract.startDate,
    });
    addNotification({
      userId: employeeId,
      title: 'Contrat mis à jour',
      message: `Nouveau contrat: ${contract.type}`,
      type: 'contract',
      read: false,
    });
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
    setEnrollments((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        courseId,
        employeeId,
        progress: 0,
        completedLessons: [],
        startedAt: new Date(),
        status: 'enrolled',
      },
    ]);
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, enrolledCount: c.enrolledCount + 1 } : c)),
    );
    addNotification({
      userId: employeeId,
      title: 'Inscription formation',
      message: `Inscrit au cours`,
      type: 'payslip',
      read: false,
    });
  };

  const updateLessonProgress = (enrollmentId: string, lessonId: string) => {
    setEnrollments((prev) =>
      prev.map((e) => {
        if (e.id !== enrollmentId) return e;
        const completed = e.completedLessons.includes(lessonId)
          ? e.completedLessons
          : [...e.completedLessons, lessonId];
        const course = courses.find((c) => c.id === e.courseId);
        const totalLessons = course?.lessons.length || 1;
        const progress = Math.round((completed.length / totalLessons) * 100);
        const status = progress >= 100 ? ('completed' as const) : ('in_progress' as const);
        return {
          ...e,
          completedLessons: completed,
          progress,
          status,
          completedAt: progress >= 100 ? new Date() : e.completedAt,
        };
      }),
    );
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
    setMeetings((prev) => [...prev, newMeeting]);
  };

  const updateMeeting = (id: string, data: Partial<Meeting>) => {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
  };

  const addMeetingNote = (meetingId: string, note: Omit<MeetingNote, 'id' | 'createdAt'>) => {
    const newNote: MeetingNote = { ...note, id: String(Date.now()), createdAt: new Date() };
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, notes: [...m.notes, newNote] } : m)),
    );
  };

  const addMeetingTask = (meetingId: string, task: Omit<MeetingTask, 'id' | 'createdAt'>) => {
    const newTask: MeetingTask = { ...task, id: String(Date.now()), createdAt: new Date() };
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, tasks: [...m.tasks, newTask] } : m)),
    );
  };

  const updateMeetingTask = (meetingId: string, taskId: string, data: Partial<MeetingTask>) => {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? { ...m, tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, ...data } : t)) }
          : m,
      ),
    );
  };

  const updateParticipantStatus = (
    meetingId: string,
    employeeId: string,
    status: ParticipantStatus,
  ) => {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              participants: m.participants.map((p) =>
                p.employeeId === employeeId ? { ...p, status } : p,
              ),
            }
          : m,
      ),
    );
  };

  const joinMeeting = (meetingId: string, employeeId: string) => {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              participants: m.participants.map((p) =>
                p.employeeId === employeeId
                  ? { ...p, joinedAt: new Date(), status: 'accepted' }
                  : p,
              ),
            }
          : m,
      ),
    );
  };

  const leaveMeeting = (meetingId: string, employeeId: string) => {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              participants: m.participants.map((p) => {
                if (p.employeeId !== employeeId) return p;
                const joined = p.joinedAt ? p.joinedAt.getTime() : Date.now();
                const duration = (Date.now() - joined) / 60000;
                return {
                  ...p,
                  leftAt: new Date(),
                  attendanceDuration: (p.attendanceDuration || 0) + duration,
                };
              }),
            }
          : m,
      ),
    );
  };

  // Coffre-fort numérique
  const addVaultItem = (item: Omit<EmployeeVaultItem, 'id'>) => {
    setVaultItems((prev) => [{ ...item, id: String(Date.now()) }, ...prev]);
    eventBus.emit(EVENTS.VAULT_ITEM_ADDED);
    if (useApi) {
      VaultService.createVaultItem({
        employeeId: item.employeeId,
        type: item.type,
        name: item.name,
        fileUrl: item.fileUrl,
        expiresAt: item.expiresAt instanceof Date ? item.expiresAt.toISOString() : item.expiresAt,
      }).catch(() => {});
    }
  };
  const deleteVaultItem = (id: string) => {
    setVaultItems((prev) => prev.filter((v) => v.id !== id));
    if (useApi) VaultService.deleteVaultItem(id).catch(() => {});
  };

  // Récompenses
  const addRewardTransaction = (tx: Omit<RewardTransaction, 'id' | 'createdAt'>) => {
    const newTx: RewardTransaction = { ...tx, id: String(Date.now()), createdAt: new Date() };
    setRewardTransactions((prev) => [newTx, ...prev]);
    eventBus.emit(tx.type === 'earned' ? EVENTS.REWARD_EARNED : EVENTS.REWARD_REDEEMED);
    addNotification({
      userId: tx.employeeId,
      title: 'Points récompense',
      message: `${tx.points > 0 ? '+' : ''}${tx.points} points - ${tx.reason}`,
      type: 'payslip',
      read: false,
    });
    if (useApi) {
      RewardService.addTransaction({
        employeeId: tx.employeeId,
        points: Math.abs(tx.points),
        type: tx.type,
        reason: tx.reason,
      }).catch(() => {});
    }
  };

  const addRewardCatalogItem = (item: Omit<RewardCatalog, 'id'>) => {
    setRewardCatalog((prev) => [...prev, { ...item, id: String(Date.now()) }]);
    if (useApi && currentCompany?.id) {
      RewardService.createCatalogItem({
        companyId: currentCompany.id,
        name: item.name,
        description: item.description,
        pointsCost: item.pointsCost,
        stock: item.stock,
        category: item.category,
        active: item.active,
      }).catch(() => {});
    }
  };

  const redeemReward = (employeeId: string, catalogItemId: string) => {
    const item = rewardCatalog.find((c) => c.id === catalogItemId);
    if (!item || item.stock <= 0) return;
    const totalEarned = rewardTransactions
      .filter((t) => t.employeeId === employeeId && t.type === 'earned')
      .reduce((s, t) => s + t.points, 0);
    const totalRedeemed = rewardTransactions
      .filter((t) => t.employeeId === employeeId && t.type === 'redeemed')
      .reduce((s, t) => s + t.points, 0);
    const balance = totalEarned - totalRedeemed;
    if (balance < item.pointsCost) return;
    if (useApi) {
      RewardService.redeemReward(employeeId, catalogItemId).catch(() => {});
      const newTx: RewardTransaction = {
        id: String(Date.now()),
        employeeId,
        points: -item.pointsCost,
        type: 'redeemed',
        reason: item.name,
        createdAt: new Date(),
      };
      setRewardTransactions((prev) => [newTx, ...prev]);
      eventBus.emit(EVENTS.REWARD_REDEEMED);
      addNotification({
        userId: employeeId,
        title: 'Points récompense',
        message: `-${item.pointsCost} points - ${item.name}`,
        type: 'payslip',
        read: false,
      });
      setRewardCatalog((prev) =>
        prev.map((c) => (c.id === catalogItemId ? { ...c, stock: c.stock - 1 } : c)),
      );
      return;
    }
    addRewardTransaction({
      employeeId,
      points: -item.pointsCost,
      type: 'redeemed',
      reason: item.name,
    });
    setRewardCatalog((prev) =>
      prev.map((c) => (c.id === catalogItemId ? { ...c, stock: c.stock - 1 } : c)),
    );
  };

  // Matériel
  const addEquipment = (eq: Omit<Equipment, 'id'>) => {
    setEquipment((prev) => [{ ...eq, id: String(Date.now()) }, ...prev]);
  };
  const updateEquipmentFn = (id: string, data: Partial<Equipment>) => {
    setEquipment((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
  };
  const assignEquipment = (equipmentId: string, employeeId: string) => {
    const now = new Date();
    setEquipment((prev) =>
      prev.map((e) =>
        e.id === equipmentId
          ? {
              ...e,
              status: 'assigned',
              assigneeId: employeeId,
              assignedAt: now,
              returnedAt: undefined,
              condition: 'good',
            }
          : e,
      ),
    );
    setEquipmentAssignments((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        equipmentId,
        employeeId,
        assignedAt: now,
        conditionAtAssignment: 'good',
      },
    ]);
    eventBus.emit(EVENTS.EQUIPMENT_ASSIGNED);
    addNotification({
      userId: employeeId,
      title: 'Équipement assigné',
      message: `Un équipement vous a été assigné`,
      type: 'payslip',
      read: false,
    });
  };
  const returnEquipment = (equipmentId: string, condition?: 'good' | 'fair' | 'damaged') => {
    const now = new Date();
    setEquipment((prev) =>
      prev.map((e) =>
        e.id === equipmentId
          ? {
              ...e,
              status: 'available',
              assigneeId: undefined,
              assignedAt: undefined,
              returnedAt: now,
              condition: condition || 'good',
            }
          : e,
      ),
    );
    setEquipmentAssignments((prev) =>
      prev.map((a) =>
        a.equipmentId === equipmentId && !a.returnedAt
          ? { ...a, returnedAt: now, conditionAtReturn: condition }
          : a,
      ),
    );
  };

  // Bien-être
  const addWellnessSurvey = (survey: Omit<WellnessSurvey, 'id' | 'createdAt'>) => {
    setWellnessSurveys((prev) => [
      { ...survey, id: String(Date.now()), createdAt: new Date() },
      ...prev,
    ]);
  };
  const submitWellnessResponse = (response: Omit<WellnessResponse, 'id'>) => {
    setWellnessResponses((prev) => [{ ...response, id: String(Date.now()) }, ...prev]);
    eventBus.emit(EVENTS.SURVEY_SUBMITTED);
  };

  // Banque salariale fintech
  const requestSalaryAdvance = (
    advance: Omit<SalaryAdvance, 'id' | 'requestedAt' | 'status' | 'repaymentStatus'>,
  ) => {
    setSalaryAdvances((prev) => [
      {
        ...advance,
        id: String(Date.now()),
        status: 'requested',
        requestedAt: new Date(),
        repaymentStatus: 'pending',
      },
      ...prev,
    ]);
    eventBus.emit(EVENTS.ADVANCE_REQUESTED);
    addNotification({
      userId: advance.employeeId,
      title: "Demande d'avance",
      message: `Avance de ${advance.amount.toLocaleString()} FCFA demandée`,
      type: 'payslip',
      read: false,
    });
  };
  const approveSalaryAdvance = (id: string) => {
    setSalaryAdvances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'approved', approvedAt: new Date() } : a)),
    );
    eventBus.emit(EVENTS.ADVANCE_APPROVED);
  };
  const paySalaryAdvance = (id: string) => {
    const advance = salaryAdvances.find((a) => a.id === id);
    setSalaryAdvances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'paid', paidAt: new Date() } : a)),
    );
    eventBus.emit(EVENTS.ADVANCE_PAID);
    if (advance) {
      addSalaryTransfer({
        employeeId: advance.employeeId,
        amount: advance.amount,
        currency: 'FCFA',
        type: 'advance',
        status: 'completed',
        description: 'Avance sur salaire',
      });
    }
  };
  const rejectSalaryAdvance = (id: string) => {
    setSalaryAdvances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'rejected', rejectedAt: new Date() } : a)),
    );
  };
  const addSalaryTransfer = (transfer: Omit<SalaryTransfer, 'id' | 'createdAt'>) => {
    setSalaryTransfers((prev) => [
      { ...transfer, id: String(Date.now()), createdAt: new Date() },
      ...prev,
    ]);
  };

  // Quiz et certificats
  const addQuiz = (quiz: Omit<Quiz, 'id'>) => {
    setQuizzes((prev) => [{ ...quiz, id: String(Date.now()) }, ...prev]);
  };
  const submitQuizAttempt = (
    attempt: Omit<QuizAttempt, 'id' | 'startedAt' | 'completedAt' | 'passed'>,
  ): QuizAttempt => {
    const quiz = quizzes.find((q) => q.id === attempt.quizId);
    const totalPoints = quiz?.questions.reduce((s, q) => s + q.points, 0) || 0;
    let score = 0;
    if (quiz?.questions && quiz.questions.length > 0) {
      quiz.questions.forEach((q, i) => {
        if (attempt.answers[i] === q.correctAnswer) score += q.points;
      });
    }
    const passed = totalPoints > 0 && score >= (quiz?.passingScore || totalPoints);
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: String(Date.now()),
      score,
      totalPoints,
      passed,
      startedAt: new Date(),
      completedAt: new Date(),
    };
    setQuizAttempts((prev) => [...prev, newAttempt]);
    eventBus.emit(EVENTS.QUIZ_COMPLETED);
    if (passed && quiz) {
      issueCertificate({
        courseId: quiz.courseId,
        employeeId: attempt.employeeId,
        expiresAt: new Date(Date.now() + 365 * 86400000),
      });
      addRewardTransaction({
        employeeId: attempt.employeeId,
        points: 300,
        type: 'earned',
        reason: `Quiz réussi: ${quiz.title}`,
      });
    }
    return newAttempt;
  };
  const issueCertificate = (cert: Omit<Certificate, 'id' | 'issuedAt'>) => {
    setCertificates((prev) => [{ ...cert, id: String(Date.now()), issuedAt: new Date() }, ...prev]);
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
    setSignatureRequests((prev) => [newReq, ...prev]);
    eventBus.emit(EVENTS.SIGNATURE_SENT);
    req.recipients.forEach((r) => {
      addNotification({
        userId: r.employeeId,
        title: 'Document à signer',
        message: `${req.documentName} - Veuillez signer le document`,
        type: 'contract',
        read: false,
      });
    });
  };

  const signDocumentFn = (
    requestId: string,
    recipientEmployeeId: string,
    signatureDataUrl: string,
  ) => {
    let allSigned = false;
    setSignatureRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;
        const updatedRecipients = req.recipients.map((r) =>
          r.employeeId === recipientEmployeeId
            ? { ...r, status: 'signed' as const, signedAt: new Date(), signatureDataUrl }
            : r,
        );
        allSigned = updatedRecipients.every((r) => r.status === 'signed');
        return {
          ...req,
          recipients: updatedRecipients,
          status: allSigned ? ('completed' as const) : ('signed' as const),
          completedAt: allSigned ? new Date() : req.completedAt,
        };
      }),
    );
    if (allSigned) {
      eventBus.emit(EVENTS.SIGNATURE_COMPLETED);
    } else {
      eventBus.emit(EVENTS.SIGNATURE_SIGNED);
    }
    addNotification({
      userId: recipientEmployeeId,
      title: 'Document signé',
      message: 'Vous avez signé avec succès',
      type: 'contract',
      read: false,
    });
  };

  const rejectSignature = (requestId: string, recipientEmployeeId: string, reason: string) => {
    setSignatureRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              recipients: req.recipients.map((r) =>
                r.employeeId === recipientEmployeeId
                  ? { ...r, status: 'rejected' as const, rejectionReason: reason }
                  : r,
              ),
              status: 'rejected' as const,
            }
          : req,
      ),
    );
  };

  const addSignatureTemplate = (tpl: Omit<SignatureTemplate, 'id' | 'createdAt'>) => {
    setSignatureTemplates((prev) => [
      ...prev,
      { ...tpl, id: String(Date.now()), createdAt: new Date() },
    ]);
  };

  const deleteSignatureTemplate = (id: string) => {
    setSignatureTemplates((prev) => prev.filter((t) => t.id !== id));
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
