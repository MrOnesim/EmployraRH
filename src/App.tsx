import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { hasPermission, type Permission } from './utils/permissions';
import { RegionProvider } from './context/RegionContext';
import { ThemeProvider } from './context/ThemeContext';
import { QRCodeProvider } from './context/QRCodeContext';
import { ToastProvider } from './context/ToastContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const DocumentationPage = lazy(() => import('./pages/DocumentationPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterCompanyPage = lazy(() => import('./pages/RegisterCompanyPage'));
const EmployeeInvitationPage = lazy(() => import('./pages/EmployeeInvitationPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard'));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'));
const SalaryPage = lazy(() => import('./pages/SalaryPage'));
const AttendancePage = lazy(() => import('./pages/AttendancePage'));
const EmployeeAttendancePage = lazy(() => import('./pages/EmployeeAttendancePage'));
const LeavesPage = lazy(() => import('./pages/LeavesPage'));
const EmployeeLeavesPage = lazy(() => import('./pages/EmployeeLeavesPage'));
const PayslipsPage = lazy(() => import('./pages/PayslipsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const PerformancePage = lazy(() => import('./pages/PerformancePage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const QRDisplayPage = lazy(() => import('./pages/QRDisplayPage'));
const QRScanPage = lazy(() => import('./pages/QRScanPage'));
const AdminQRCodeSettings = lazy(() => import('./pages/AdminQRCodeSettings'));
const BankingPage = lazy(() => import('./pages/BankingPage'));
const TrainingPage = lazy(() => import('./pages/TrainingPage'));
const RecruitmentPage = lazy(() => import('./pages/RecruitmentPage'));
const MissionsPage = lazy(() => import('./pages/MissionsPage'));
const TaxPage = lazy(() => import('./pages/TaxPage'));
const RewardsPage = lazy(() => import('./pages/RewardsPage'));
const FintechPage = lazy(() => import('./pages/FintechPage'));
const EmployeeVaultPage = lazy(() => import('./pages/EmployeeVaultPage'));
const EquipmentPage = lazy(() => import('./pages/EquipmentPage'));
const WellnessPage = lazy(() => import('./pages/WellnessPage'));
const ObjectivesPage = lazy(() => import('./pages/ObjectivesPage'));
const OrgChartPage = lazy(() => import('./pages/OrgChartPage'));
const TeamsPage = lazy(() => import('./pages/TeamsPage'));
const MeetingPage = lazy(() => import('./pages/MeetingPage'));
const ImportPage = lazy(() => import('./pages/ImportPage'));
const SignaturePage = lazy(() => import('./pages/SignaturePage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const FeedPage = lazy(() => import('./pages/FeedPage'));
const RolesPage = lazy(() => import('./pages/RolesPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const LeavePolicyPage = lazy(() => import('./pages/LeavePolicyPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const SecurityGuardsPage = lazy(() => import('./pages/SecurityGuardsPage'));
const GuardScanPage = lazy(() => import('./pages/GuardScanPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function ProtectedRoute({ children, adminOnly = false, requiredPermission }: { children: React.ReactNode; adminOnly?: boolean; requiredPermission?: Permission }) {
  const { isLoggedIn, currentUser } = useApp();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && currentUser?.role !== 'admin') {
    return <Navigate to="/employee-dashboard" replace />;
  }
  
  if (requiredPermission && !hasPermission(currentUser?.role, requiredPermission)) {
    return <Navigate to={currentUser?.role === 'admin' ? '/admin' : '/employee-dashboard'} replace />;
  }
  
  return <>{children}</>;
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" role="status" />
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><PricingPage /></PageTransition>} />
        <Route path="/faq" element={<PageTransition><FAQPage /></PageTransition>} />
        <Route path="/docs" element={<PageTransition><DocumentationPage /></PageTransition>} />
        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register-company" element={<PageTransition><RegisterCompanyPage /></PageTransition>} />
        <Route path="/invite/:token" element={<PageTransition><EmployeeInvitationPage /></PageTransition>} />
        <Route path="/qr-display" element={<PageTransition><QRDisplayPage /></PageTransition>} />
        <Route path="/signature" element={<PageTransition><SignaturePage /></PageTransition>} />
        <Route path="/marketplace" element={<PageTransition><MarketplacePage /></PageTransition>} />
        <Route path="/guard-scan" element={
          <ProtectedRoute>
            <PageTransition><GuardScanPage /></PageTransition>
          </ProtectedRoute>
        } />
        
        {/* QR Scan / Feed (protected) */}
        <Route path="/scan" element={
          <ProtectedRoute>
            <PageTransition><QRScanPage /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/feed" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<PageTransition><FeedPage /></PageTransition>} />
        </Route>
        
        {/* Protected Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="employees" element={<PageTransition><EmployeesPage /></PageTransition>} />
          <Route path="salary" element={<PageTransition><SalaryPage /></PageTransition>} />
          <Route path="attendance" element={<PageTransition><AttendancePage /></PageTransition>} />
          <Route path="leaves" element={<PageTransition><LeavesPage /></PageTransition>} />
          <Route path="payslips" element={<PageTransition><PayslipsPage /></PageTransition>} />
          <Route path="performance" element={<PageTransition><PerformancePage /></PageTransition>} />
          <Route path="documents" element={<PageTransition><DocumentsPage /></PageTransition>} />
          <Route path="calendar" element={<PageTransition><CalendarPage /></PageTransition>} />
          <Route path="messages" element={<PageTransition><MessagesPage /></PageTransition>} />
          <Route path="reports" element={<PageTransition><ReportsPage /></PageTransition>} />
          <Route path="ai-assistant" element={<PageTransition><AIAssistant /></PageTransition>} />
          <Route path="qr-settings" element={<PageTransition><AdminQRCodeSettings /></PageTransition>} />
          <Route path="banking" element={<PageTransition><BankingPage /></PageTransition>} />
          <Route path="training" element={<PageTransition><TrainingPage /></PageTransition>} />
          <Route path="recruitment" element={<PageTransition><RecruitmentPage /></PageTransition>} />
          <Route path="missions" element={<PageTransition><MissionsPage /></PageTransition>} />
          <Route path="tax" element={<PageTransition><TaxPage /></PageTransition>} />
          <Route path="rewards" element={<PageTransition><RewardsPage /></PageTransition>} />
          <Route path="fintech" element={<PageTransition><FintechPage /></PageTransition>} />
          <Route path="vault" element={<PageTransition><EmployeeVaultPage /></PageTransition>} />
          <Route path="equipment" element={<PageTransition><EquipmentPage /></PageTransition>} />
          <Route path="wellness" element={<PageTransition><WellnessPage /></PageTransition>} />
          <Route path="objectives" element={<PageTransition><ObjectivesPage /></PageTransition>} />
          <Route path="org-chart" element={<PageTransition><OrgChartPage /></PageTransition>} />
          <Route path="teams" element={<PageTransition><TeamsPage /></PageTransition>} />
          <Route path="meetings" element={<PageTransition><MeetingPage /></PageTransition>} />
          <Route path="import" element={<PageTransition><ImportPage /></PageTransition>} />
          <Route path="roles" element={<PageTransition><RolesPage /></PageTransition>} />
          <Route path="onboarding" element={<PageTransition><OnboardingPage /></PageTransition>} />
          <Route path="leave-policy" element={<PageTransition><LeavePolicyPage /></PageTransition>} />
          <Route path="notifications" element={<PageTransition><NotificationsPage /></PageTransition>} />
          <Route path="settings" element={<PageTransition><SettingsPage /></PageTransition>} />
          <Route path="security-guards" element={<PageTransition><SecurityGuardsPage /></PageTransition>} />
        </Route>
        
        {/* Protected Employee routes */}
        <Route path="/employee-dashboard" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<PageTransition><EmployeeDashboard /></PageTransition>} />
          <Route path="attendance" element={<PageTransition><EmployeeAttendancePage /></PageTransition>} />
          <Route path="leaves" element={<PageTransition><EmployeeLeavesPage /></PageTransition>} />
          <Route path="payslips" element={<PageTransition><PayslipsPage /></PageTransition>} />
          <Route path="messages" element={<PageTransition><MessagesPage /></PageTransition>} />
          <Route path="calendar" element={<PageTransition><CalendarPage /></PageTransition>} />
          <Route path="notifications" element={<PageTransition><NotificationsPage /></PageTransition>} />
          <Route path="settings" element={<PageTransition><SettingsPage /></PageTransition>} />
        </Route>
        
        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RegionProvider>
        <ThemeProvider>
          <DataProvider>
            <ToastProvider>
              <Router>
                <QRCodeProvider>
                  <ErrorBoundary>
                    <AppRoutes />
                  </ErrorBoundary>
                </QRCodeProvider>
              </Router>
            </ToastProvider>
          </DataProvider>
        </ThemeProvider>
      </RegionProvider>
    </AppProvider>
  );
}
