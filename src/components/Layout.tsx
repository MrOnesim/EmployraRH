import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from './ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { Bell, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

export default function Layout() {
  const { currentUser, logout, notifications, markNotificationRead } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';
  const unreadNotifications = notifications.filter(n => !n.read && n.userId === currentUser?.id);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/employee-dashboard') return 'Tableau de bord';
    const segment = path.split('/').pop() || '';
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <div className="flex items-center gap-2 flex-1">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold text-foreground">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 size-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                    {unreadNotifications.length}
                  </span>
                )}
              </Button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-popover rounded-xl shadow-lg border z-50">
                  <div className="p-3 border-b">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.filter(n => n.userId === currentUser?.id).length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground text-center">Aucune notification</p>
                    ) : (
                      notifications
                        .filter(n => n.userId === currentUser?.id)
                        .slice(0, 5)
                        .map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-accent ${
                              !n.read ? 'bg-accent/50' : ''
                            }`}
                          >
                            <p className="text-sm font-medium">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                          </div>
                        ))
                    )}
                  </div>
                  <div className="p-2 border-t">
                    <Link
                      to={isAdmin ? '/admin/notifications' : '/employee-dashboard/notifications'}
                      onClick={() => setNotificationsOpen(false)}
                      className="block text-center text-xs text-primary hover:underline"
                    >
                      Voir toutes les notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">
                  {currentUser?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Déconnexion">
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
