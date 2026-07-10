import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Company, Employee, Attendance, Leave, Payslip, Notification, Invitation, Mission, JobOffer, Course, BankAccount, CalendarEvent, Meeting } from '../types';
import { authClient } from '../services/authService';
import * as EmployeeService from '../services/employeeService';
import * as AttendanceService from '../services/attendanceService';
import * as LeaveService from '../services/leaveService';
import * as PayrollService from '../services/payrollService';
import * as MissionService from '../services/missionService';
import * as RecruitmentService from '../services/recruitmentService';
import * as TrainingService from '../services/trainingService';
import * as BankingService from '../services/bankingService';
import * as CalendarService from '../services/calendarService';
import * as NotificationService from '../services/notificationService';
import api from '../lib/axios';

interface AppState {
  isLoggedIn: boolean;
  currentUser: Employee | null;
  currentCompany: Company | null;
  companies: Company[];
  employees: Employee[];
  attendance: Attendance[];
  leaves: Leave[];
  payslips: Payslip[];
  notifications: Notification[];
  invitations: Invitation[];
  missions: Mission[];
  jobOffers: JobOffer[];
  courses: Course[];
  bankAccounts: BankAccount[];
  calendarEvents: CalendarEvent[];
  meetings: Meeting[];
  login: (email: string, password: string, type: 'company' | 'employee') => Promise<boolean>;
  logout: () => void;
  registerCompany: (company: Omit<Company, 'id' | 'uniqueId' | 'createdAt' | 'balance'> & { password?: string }) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  sendInvitation: (email: string) => void;
  acceptInvitation: (id: string) => void;
  clockIn: () => void;
  startBreak: () => void;
  endBreak: () => void;
  clockOut: () => void;
  requestLeave: (leave: Omit<Leave, 'id'>) => void;
  approveLeave: (id: string, comment?: string) => void;
  rejectLeave: (id: string, comment?: string) => void;
  processPayment: (employeeId: string, amount: number) => void;
  generatePayslip: (employeeId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const useApi = !!import.meta.env.VITE_API_BASE_URL;

const mockCompany: Company = {
  id: '1', name: 'TechAfrique Solutions', logo: '', ownerFirstName: 'Kofi', ownerLastName: 'Mensah',
  email: 'admin@techafrique.com', phone: '+228 90 12 34 56', employeeCount: 25,
  address: 'Lomé, Togo', website: 'www.techafrique.com', uniqueId: 'TA-2024-001',
  createdAt: new Date('2024-01-15'), balance: 5000000,
};

const mockEmployees: Employee[] = [
  { id: '1', companyId: '1', firstName: 'Kofi', lastName: 'Mensah', email: 'admin@techafrique.com', phone: '+228 90 12 34 56', dateOfBirth: new Date('1985-06-15'), position: 'Directeur Général', department: 'Direction', photo: '', salary: 1500000, status: 'active', joinDate: new Date('2024-01-15'),   role: 'ADMIN' },
  { id: '2', companyId: '1', firstName: 'Ama', lastName: 'Gbeko', email: 'ama@techafrique.com', phone: '+228 91 23 45 67', dateOfBirth: new Date('1990-03-20'), position: 'Responsable RH', department: 'Ressources Humaines', photo: '', salary: 800000, status: 'active', joinDate: new Date('2024-02-01'), role: 'RH' },
  { id: '3', companyId: '1', firstName: 'Kwame', lastName: 'Adjei', email: 'kwame@techafrique.com', phone: '+228 92 34 56 78', dateOfBirth: new Date('1992-08-10'), position: 'Développeur Senior', department: 'Informatique', photo: '', salary: 750000, status: 'active', joinDate: new Date('2024-03-15'), role: 'MANAGER' },
  { id: '4', companyId: '1', firstName: 'Efua', lastName: 'Asante', email: 'efua@techafrique.com', phone: '+228 93 45 67 89', dateOfBirth: new Date('1988-12-05'), position: 'Comptable', department: 'Finance', photo: '', salary: 700000, status: 'active', joinDate: new Date('2024-04-01'), role: 'EMPLOYEE' },
  { id: '5', companyId: '1', firstName: 'Yaw', lastName: 'Boakye', email: 'yaw@techafrique.com', phone: '+228 94 56 78 90', dateOfBirth: new Date('1995-05-22'), position: 'Designer UI/UX', department: 'Marketing', photo: '', salary: 600000, status: 'active', joinDate: new Date('2024-05-15'), role: 'EMPLOYEE' },
  { id: '6', companyId: '1', firstName: 'Abla', lastName: 'Dosso', email: 'abla@techafrique.com', phone: '+228 95 67 89 01', dateOfBirth: new Date('1993-09-18'), position: 'Chargé de Marketing', department: 'Marketing', photo: '', salary: 550000, status: 'inactive', joinDate: new Date('2024-06-01'), role: 'EMPLOYEE' },
  { id: '7', companyId: '1', firstName: 'Kossi', lastName: 'Amoussou', email: 'kossi@techafrique.com', phone: '+228 96 78 90 12', dateOfBirth: new Date('1991-02-28'), position: 'Développeur Full Stack', department: 'Informatique', photo: '', salary: 700000, status: 'active', joinDate: new Date('2024-07-01'), role: 'EMPLOYEE' },
];

const mockAttendance: Attendance[] = [
  { id: '1', employeeId: '1', date: new Date(), checkIn: new Date(new Date().setHours(8, 0)), breakStart: new Date(new Date().setHours(12, 0)), breakEnd: new Date(new Date().setHours(13, 0)), checkOut: null, totalHours: 4, overtime: 0, status: 'present' },
  { id: '2', employeeId: '2', date: new Date(), checkIn: new Date(new Date().setHours(7, 45)), breakStart: null, breakEnd: null, checkOut: null, totalHours: 4.25, overtime: 0, status: 'present' },
  { id: '3', employeeId: '3', date: new Date(), checkIn: new Date(new Date().setHours(9, 15)), breakStart: null, breakEnd: null, checkOut: null, totalHours: 3, overtime: 0, status: 'late' },
  { id: '4', employeeId: '4', date: new Date(), checkIn: null, breakStart: null, breakEnd: null, checkOut: null, totalHours: 0, overtime: 0, status: 'absent' },
  { id: '5', employeeId: '5', date: new Date(), checkIn: new Date(new Date().setHours(8, 0)), breakStart: new Date(new Date().setHours(12, 0)), breakEnd: new Date(new Date().setHours(12, 45)), checkOut: null, totalHours: 4, overtime: 0, status: 'present' },
];

const mockLeaves: Leave[] = [
  { id: '1', employeeId: '3', type: 'annual', startDate: new Date('2024-12-20'), endDate: new Date('2024-12-31'), reason: 'Vacances de fin d\'année', status: 'pending' },
  { id: '2', employeeId: '5', type: 'sick', startDate: new Date('2024-12-18'), endDate: new Date('2024-12-19'), reason: 'Grippe', status: 'approved', approvedBy: '1' },
  { id: '3', employeeId: '7', type: 'annual', startDate: new Date('2024-12-25'), endDate: new Date('2024-12-27'), reason: 'Congé personnel', status: 'rejected' },
];

const mockNotifications: Notification[] = [
  { id: '1', userId: '1', title: 'Nouvelle demande de congé', message: 'Kwame Adjei a demandé un congé du 20 au 31 décembre', type: 'leave', read: false, createdAt: new Date() },
  { id: '2', userId: '1', title: 'Retard détecté', message: 'Kwame Adjei est arrivé en retard à 9h15', type: 'attendance', read: false, createdAt: new Date() },
  { id: '3', userId: '1', title: 'Bulletin de paie disponible', message: 'Les bulletins de paie de novembre sont prêts', type: 'payslip', read: true, createdAt: new Date(Date.now() - 86400000) },
];

function generateId() {
  return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [attendance, setAttendance] = useState<Attendance[]>(mockAttendance);
  const [leaves, setLeaves] = useState<Leave[]>(mockLeaves);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const loadInitialData = useCallback(async (companyId: string, userId: string) => {
    try {
      const [employeesData, leavesData, payslipsData, attendanceData, notificationsData,
        missionsData, jobOffersData, coursesData, bankAccountsData, calendarEventsData, meetingsData] = await Promise.all([
        EmployeeService.getEmployees(companyId).catch(() => []),
        LeaveService.getLeaves(companyId).catch(() => []),
        PayrollService.getPayslips(companyId).catch(() => []),
        AttendanceService.getAttendance(companyId).catch(() => []),
        NotificationService.getNotifications({ userId }).catch(() => []),
        MissionService.getMissions({ companyId }).catch(() => []),
        RecruitmentService.getJobOffers({ companyId }).catch(() => []),
        TrainingService.getCourses({ companyId }).catch(() => []),
        BankingService.getBankAccounts({ companyId }).catch(() => []),
        CalendarService.getCalendarEvents({ companyId }).catch(() => []),
        api.get('/meetings', { params: { companyId } }).then(r => r.data).catch(() => []),
      ]);
      if (employeesData.length) setEmployees(employeesData);
      if (leavesData.length) setLeaves(leavesData);
      if (payslipsData.length) setPayslips(payslipsData);
      if (attendanceData.length) setAttendance(attendanceData);
      if (notificationsData.length) setNotifications(notificationsData);
      if (missionsData.length) setMissions(missionsData);
      if (jobOffersData.length) setJobOffers(jobOffersData);
      if (coursesData.length) setCourses(coursesData);
      if (bankAccountsData.length) setBankAccounts(bankAccountsData);
      if (calendarEventsData.length) setCalendarEvents(calendarEventsData);
      if (meetingsData.length) setMeetings(meetingsData);
    } catch { /* silent - keep mock data as fallback */ }
  }, []);

  const login = useCallback(async (email: string, password: string, type: 'company' | 'employee'): Promise<boolean> => {
    if (useApi) {
      try {
        const { data } = await authClient.signIn.email({ email, password });
        if (data?.user) {
          setCurrentUser(data.user as unknown as Employee);
          setIsLoggedIn(true);

          if (type === 'company') {
            const companies = await EmployeeService.getEmployees();
            const companyId = companies[0]?.companyId;
            if (companyId) {
              const { data: companyData } = await api.get(`/companies/${companyId}`);
              setCurrentCompany(companyData);
              await loadInitialData(companyId, data.user.id);
            }
          }
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }
    if (email === 'admin@techafrique.com') {
      setCurrentCompany(mockCompany);
      setCurrentUser(mockEmployees[0]);
      setIsLoggedIn(true);
      return true;
    }
    const employee = employees.find(e => e.email === email);
    if (employee) {
      setCurrentUser(employee);
      setCurrentCompany(mockCompany);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  }, [employees, loadInitialData]);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentCompany(null);
  }, []);

  const registerCompany = useCallback(async (companyData: Omit<Company, 'id' | 'uniqueId' | 'createdAt' | 'balance'> & { password?: string }) => {
    if (useApi && companyData.password) {
      try {
        const { data } = await authClient.signUp.email({
          email: companyData.email,
          password: companyData.password,
          name: `${companyData.ownerFirstName} ${companyData.ownerLastName}`,
        });
        if (data?.user) {
          setCurrentUser(data.user as unknown as Employee);
          setIsLoggedIn(true);
          return;
        }
      } catch { /* fallback to mock */ }
    }
    const newCompany: Company = {
      ...companyData,
      id: generateId(),
      uniqueId: `EP-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date(),
      balance: 0,
    };
    setCurrentCompany(newCompany);
    const adminEmployee: Employee = {
      id: '1', companyId: newCompany.id, firstName: companyData.ownerFirstName, lastName: companyData.ownerLastName,
      email: companyData.email, phone: companyData.phone, dateOfBirth: new Date(),
      position: 'Directeur Général', department: 'Direction', photo: companyData.logo,
      salary: 0, status: 'active', joinDate: new Date(), role: 'ADMIN',
    };
    if (!useApi || !companyData.password) {
      setCurrentUser(adminEmployee);
      setIsLoggedIn(true);
    }
  }, []);

  const addEmployee = useCallback(async (employee: Omit<Employee, 'id'>) => {
    if (useApi) {
      try {
        const created = await EmployeeService.createEmployee(employee);
        setEmployees(prev => [...prev, created]);
        return;
      } catch { /* fallback to mock */ }
    }
    const newEmployee: Employee = { ...employee, id: generateId() };
    setEmployees(prev => [...prev, newEmployee]);
  }, []);

  const updateEmployee = useCallback(async (id: string, data: Partial<Employee>) => {
    if (useApi) {
      try {
        const updated = await EmployeeService.updateEmployee(id, data);
        setEmployees(prev => prev.map(e => e.id === id ? updated : e));
        return;
      } catch { /* fallback */ }
    }
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  }, []);

  const deleteEmployee = useCallback(async (id: string) => {
    if (useApi) {
      try {
        await EmployeeService.deleteEmployee(id);
      } catch { /* fallback */ }
    }
    setEmployees(prev => prev.filter(e => e.id !== id));
  }, []);

  const sendInvitation = useCallback(async (email: string) => {
    if (useApi) {
      try {
        await EmployeeService.sendInvitation(email, currentCompany?.id || '');
        return;
      } catch { /* fallback */ }
    }
    const newInvitation: Invitation = {
      id: generateId(), companyId: currentCompany?.id || '', email, status: 'pending', sentAt: new Date(),
    };
    setInvitations(prev => [...prev, newInvitation]);
    addNotification({
      userId: currentUser?.id || '', title: 'Invitation envoyée',
      message: `Une invitation a été envoyée à ${email}`, type: 'invitation', read: false,
    });
  }, [currentCompany?.id, currentUser?.id]);

  const acceptInvitation = useCallback(async (id: string) => {
    if (useApi) {
      try {
        await EmployeeService.acceptInvitation(id);
      } catch { /* fallback */ }
    }
    setInvitations(prev => prev.map(i => i.id === id ? { ...i, status: 'accepted' } : i));
  }, []);

  const clockIn = useCallback(async () => {
    const employeeId = currentUser?.id;
    if (!employeeId) return;
    if (useApi) {
      try {
        const record = await AttendanceService.clockIn(employeeId);
        setAttendance(prev => [...prev.filter(a => a.id !== record.id), record]);
        return;
      } catch { /* fallback */ }
    }
    const today = new Date();
    const newAttendance: Attendance = {
      id: generateId(), employeeId, date: today, checkIn: today,
      breakStart: null, breakEnd: null, checkOut: null, totalHours: 0, overtime: 0,
      status: today.getHours() > 9 ? 'late' : 'present',
    };
    setAttendance(prev => [...prev, newAttendance]);
  }, [currentUser?.id]);

  const startBreak = useCallback(async () => {
    const record = attendance.find(
      a => a.employeeId === currentUser?.id && new Date(a.date).toDateString() === new Date().toDateString()
    );
    if (!record) return;
    if (useApi) {
      try {
        const updated = await AttendanceService.startBreak(record.id);
        setAttendance(prev => prev.map(a => a.id === record.id ? updated : a));
        return;
      } catch { /* fallback */ }
    }
    setAttendance(prev => prev.map(a => a.id === record.id ? { ...a, breakStart: new Date() } : a));
  }, [attendance, currentUser?.id]);

  const endBreak = useCallback(async () => {
    const record = attendance.find(
      a => a.employeeId === currentUser?.id && new Date(a.date).toDateString() === new Date().toDateString()
    );
    if (!record) return;
    if (useApi) {
      try {
        const updated = await AttendanceService.endBreak(record.id);
        setAttendance(prev => prev.map(a => a.id === record.id ? updated : a));
        return;
      } catch { /* fallback */ }
    }
    setAttendance(prev => prev.map(a => a.id === record.id ? { ...a, breakEnd: new Date() } : a));
  }, [attendance, currentUser?.id]);

  const clockOut = useCallback(async () => {
    const record = attendance.find(
      a => a.employeeId === currentUser?.id && new Date(a.date).toDateString() === new Date().toDateString()
    );
    if (!record) return;
    if (useApi) {
      try {
        const updated = await AttendanceService.clockOut(record.id);
        setAttendance(prev => prev.map(a => a.id === record.id ? updated : a));
        return;
      } catch { /* fallback */ }
    }
    const now = new Date();
    const totalHours = record.checkIn ? (now.getTime() - record.checkIn.getTime()) / (1000 * 60 * 60) : 0;
    const overtime = totalHours > 8 ? totalHours - 8 : 0;
    setAttendance(prev => prev.map(a => a.id === record.id
      ? { ...a, checkOut: now, totalHours: Math.round(totalHours * 100) / 100, overtime } : a
    ));
  }, [attendance, currentUser?.id]);

  const requestLeave = useCallback(async (leave: Omit<Leave, 'id'>) => {
    if (useApi) {
      try {
        const created = await LeaveService.requestLeave({
          employeeId: leave.employeeId, type: leave.type,
          startDate: leave.startDate.toISOString(), endDate: leave.endDate.toISOString(), reason: leave.reason,
        });
        setLeaves(prev => [...prev, created]);
        return;
      } catch { /* fallback */ }
    }
    const newLeave: Leave = { ...leave, id: generateId() };
    setLeaves(prev => [...prev, newLeave]);
    addNotification({
      userId: currentUser?.id || '', title: 'Demande de congé',
      message: 'Votre demande de congé a été soumise', type: 'leave', read: false,
    });
  }, [currentUser?.id]);

  const approveLeave = useCallback(async (id: string, comment?: string) => {
    if (useApi) {
      try {
        const updated = await LeaveService.approveLeave(id);
        setLeaves(prev => prev.map(l => l.id === id ? updated : l));
        return;
      } catch { /* fallback */ }
    }
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'approved', approvedBy: currentUser?.id, approvalComment: comment } : l));
  }, [currentUser?.id]);

  const rejectLeave = useCallback(async (id: string, comment?: string) => {
    if (useApi) {
      try {
        const updated = await LeaveService.rejectLeave(id, comment || '');
        setLeaves(prev => prev.map(l => l.id === id ? updated : l));
        return;
      } catch { /* fallback */ }
    }
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected', approvedBy: currentUser?.id, approvalComment: comment } : l));
  }, [currentUser?.id]);

  const processPayment = useCallback((employeeId: string, amount: number) => {
    const newPayslip: Payslip = {
      id: generateId(), employeeId, month: new Date().getMonth() + 1, year: new Date().getFullYear(),
      basicSalary: amount, bonuses: 0, deductions: amount * 0.15, netSalary: amount * 0.85, generatedAt: new Date(),
    };
    setPayslips(prev => [...prev, newPayslip]);
    addNotification({
      userId: employeeId, title: 'Paiement effectué',
      message: `Votre salaire de ${amount.toLocaleString()} FCFA a été versé`, type: 'payment', read: false,
    });
  }, []);

  const generatePayslip = useCallback(async (employeeId: string) => {
    if (useApi) {
      try {
        const created = await PayrollService.generatePayslip(employeeId, new Date().getMonth() + 1, new Date().getFullYear());
        setPayslips(prev => [...prev, created]);
        return;
      } catch { /* fallback */ }
    }
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      const newPayslip: Payslip = {
        id: generateId(), employeeId, month: new Date().getMonth() + 1, year: new Date().getFullYear(),
        basicSalary: employee.salary, bonuses: employee.salary * 0.1,
        deductions: employee.salary * 0.15, netSalary: employee.salary * 0.95, generatedAt: new Date(),
      };
      setPayslips(prev => [...prev, newPayslip]);
    }
  }, [employees]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = { ...notification, id: generateId(), createdAt: new Date() };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const companies = [mockCompany];

  return (
    <AppContext.Provider value={{
      isLoggedIn, currentUser, currentCompany, companies, employees, attendance,
      leaves, payslips, notifications, invitations, missions, jobOffers, courses,
      bankAccounts, calendarEvents, meetings, login, logout, registerCompany,
      addEmployee, updateEmployee, deleteEmployee, sendInvitation, acceptInvitation,
      clockIn, startBreak, endBreak, clockOut, requestLeave, approveLeave, rejectLeave,
      processPayment, generatePayslip, markAllNotificationsRead, markNotificationRead, addNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
