import { Link, useLocation } from 'react-router-dom';
import {
  Home, Users, DollarSign, Clock, Calendar, FileText,
  Settings, Bell, MessageSquare, TrendingUp, File,
  Bot, BarChart3, QrCode, Landmark, GraduationCap, UserPlus,
  Briefcase, Receipt, Award, PiggyBank, Shield, Monitor, Heart,
  Target, GitBranch, Video, Upload, Rss, CheckCircle2, PartyPopper,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { canAccessMenu } from '../utils/permissions';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from './ui/sidebar';
import { Button } from './ui/button';

type MenuItem = { path: string; icon: React.ComponentType<{ className?: string }>; label: string };

function NavGroup({ label, items }: { label: string; items: MenuItem[] }) {
  const location = useLocation();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && item.path !== '/admin' && item.path !== '/employee-dashboard' && location.pathname.startsWith(item.path));
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton isActive={isActive} asChild>
                  <Link to={item.path}>
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { currentUser, currentCompany } = useApp();
  const { theme, toggleTheme } = useTheme();
  const isAdmin = currentUser?.role === 'admin';

  const dashboard = isAdmin
    ? { path: '/admin', icon: Home, label: 'Tableau de bord' }
    : { path: '/employee-dashboard', icon: Home, label: 'Tableau de bord' };

  const rh: MenuItem[] = [
    { path: '/admin/employees', icon: Users, label: 'EmployÃ©s' },
    { path: '/admin/onboarding', icon: CheckCircle2, label: 'Onboarding' },
    { path: '/admin/org-chart', icon: GitBranch, label: 'Organigramme' },
    { path: '/admin/teams', icon: Users, label: 'Ã‰quipes' },
  ];

  const time: MenuItem[] = (isAdmin ? [
    { path: '/admin/attendance', icon: Clock, label: 'PrÃ©sences' },
    { path: '/admin/leaves', icon: Calendar, label: 'CongÃ©s' },
    { path: '/admin/leave-policy', icon: Calendar, label: 'Politique congÃ©s' },
  ] : [
    { path: '/employee-dashboard/attendance', icon: Clock, label: 'Pointage' },
    { path: '/employee-dashboard/leaves', icon: Calendar, label: 'CongÃ©s' },
  ]);

  const payroll: MenuItem[] = (isAdmin ? [
    { path: '/admin/payslips', icon: FileText, label: 'Bulletins' },
    { path: '/admin/salary', icon: DollarSign, label: 'Salaires' },
    { path: '/admin/banking', icon: Landmark, label: 'Banque' },
    { path: '/admin/tax', icon: Receipt, label: 'DÃ©clarations' },
    { path: '/admin/fintech', icon: PiggyBank, label: 'Banque salariale' },
    { path: '/admin/rewards', icon: Award, label: 'RÃ©compenses' },
  ] : [
    { path: '/employee-dashboard/payslips', icon: FileText, label: 'Bulletins' },
  ]);

  const performance: MenuItem[] = (isAdmin ? [
    { path: '/admin/performance', icon: TrendingUp, label: 'Performance' },
    { path: '/admin/objectives', icon: Target, label: 'Objectifs' },
  ] : []);

  const tools: MenuItem[] = (isAdmin ? [
    { path: '/admin/meetings', icon: Video, label: 'RÃ©unions' },
    { path: '/admin/documents', icon: File, label: 'Documents' },
    { path: '/admin/import', icon: Upload, label: 'Import' },
    { path: '/admin/calendar', icon: PartyPopper, label: 'Calendrier' },
    { path: '/admin/recruitment', icon: UserPlus, label: 'Recrutement' },
    { path: '/admin/training', icon: GraduationCap, label: 'Formations' },
    { path: '/admin/missions', icon: Briefcase, label: 'Missions' },
    { path: '/admin/equipment', icon: Monitor, label: 'Ã‰quipements' },
    { path: '/admin/wellness', icon: Heart, label: 'Bien-Ãªtre' },
    { path: '/admin/vault', icon: Shield, label: 'Coffre-fort' },
  ] : []);

  const insights: MenuItem[] = (isAdmin ? [
    { path: '/admin/reports', icon: BarChart3, label: 'Rapports' },
    { path: '/admin/ai-assistant', icon: Bot, label: 'Assistant IA' },
    { path: '/admin/qr-settings', icon: QrCode, label: 'Pointage QR' },
    { path: '/admin/roles', icon: Shield, label: 'RÃ´les' },
  ] : []);

  const communication: MenuItem[] = [
    { path: '/feed', icon: Rss, label: "Fil d'actualitÃ©" },
    ...(isAdmin
      ? [{ path: '/admin/messages', icon: MessageSquare, label: 'Messages' } as MenuItem]
      : [{ path: '/employee-dashboard/messages', icon: MessageSquare, label: 'Messages' } as MenuItem]),
    ...(isAdmin
      ? [{ path: '/admin/notifications', icon: Bell, label: 'Notifications' } as MenuItem]
      : [{ path: '/employee-dashboard/notifications', icon: Bell, label: 'Notifications' } as MenuItem]),
  ];

  const settings: MenuItem[] = (isAdmin
    ? [{ path: '/admin/settings', icon: Settings, label: 'ParamÃ¨tres' }]
    : [{ path: '/employee-dashboard/settings', icon: Settings, label: 'ParamÃ¨tres' }]
  );

  const filtered = (items: MenuItem[]) => items.filter(item => canAccessMenu(currentUser?.role, item.path));

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            EP
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{currentCompany?.name || 'EmployÃ©Pro'}</span>
            {currentCompany?.uniqueId && (
              <span className="truncate text-xs text-muted-foreground">{currentCompany.uniqueId}</span>
            )}
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="GÃ©nÃ©ral" items={filtered([dashboard])} />
        {isAdmin && rh.length > 0 && <NavGroup label="Ressources humaines" items={filtered(rh)} />}
        {time.length > 0 && <NavGroup label="Temps & PrÃ©sence" items={filtered(time)} />}
        {payroll.length > 0 && <NavGroup label="Paie & Finances" items={filtered(payroll)} />}
        {isAdmin && performance.length > 0 && <NavGroup label="Performance" items={filtered(performance)} />}
        {isAdmin && tools.length > 0 && <NavGroup label="Outils" items={filtered(tools)} />}
        {isAdmin && insights.length > 0 && <NavGroup label="Insights" items={filtered(insights)} />}
        <NavGroup label="Communication" items={filtered(communication)} />
        <NavGroup label="SystÃ¨me" items={filtered(settings)} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium">
            {currentUser?.firstName?.charAt(0) || 'U'}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{currentUser?.firstName} {currentUser?.lastName}</span>
            <span className="truncate text-xs text-muted-foreground">{currentUser?.position}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <span className="text-xs">â˜€ï¸</span> : <span className="text-xs">ðŸŒ™</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
