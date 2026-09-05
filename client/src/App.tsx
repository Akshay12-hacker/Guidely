import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ToastProvider, useToast } from './context/ToastContext.js';
import { WebSocketProvider } from './context/WebSocketContext.js';

// Layout
import { QuickRoleSwitcher } from './components/ui/QuickRoleSwitcher.js';
import { Navbar } from './components/layout/Navbar.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { Footer } from './components/layout/Footer.js';

// Feature screens
import { LandingPage } from './features/landing/LandingPage.js';
import { LoginPage } from './features/auth/LoginPage.js';
import { RegisterPage } from './features/auth/RegisterPage.js';
import { RoleSelectionPage } from './features/auth/RoleSelectionPage.js';
import { StudentOnboarding } from './features/student/StudentOnboarding.js';
import { MentorOnboarding } from './features/mentor/MentorOnboarding.js';
import { StudentDashboard } from './features/student/StudentDashboard.js';
import { MentorDashboard } from './features/mentor/MentorDashboard.js';
import { MentorActiveStudentsPage } from './features/mentor/MentorActiveStudentsPage.js';
import { MentorDiscovery } from './features/mentor/MentorDiscovery.js';
import { MentorProfilePage } from './features/mentor/MentorProfilePage.js';
import { StudentRequestsPage } from './features/mentorship/StudentRequestsPage.js';
import { MentorRequestsPage } from './features/mentorship/MentorRequestsPage.js';
import { ProjectWorkspace } from './features/projects/ProjectWorkspace.js';
import { SessionsPage } from './features/sessions/SessionsPage.js';
import { MessagingPage } from './features/messaging/MessagingPage.js';
import { NotificationsPage } from './features/notifications/NotificationsPage.js';
import { AdminDashboard } from './features/admin/AdminDashboard.js';

const MainApp: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>('landing');
  const [routeParams, setRouteParams] = useState<any>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Set initial route based on authentication status and role
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        if (currentRoute === 'landing' || currentRoute === 'login' || currentRoute === 'register') {
          if (user.role === 'ADMIN') {
            setCurrentRoute('admin-overview');
          } else if (user.role === 'MENTOR') {
            setCurrentRoute('mentor-dashboard');
          } else {
            setCurrentRoute('student-dashboard');
          }
        }
      } else {
        if (
          currentRoute.includes('dashboard') ||
          currentRoute.includes('project') ||
          currentRoute.includes('sessions') ||
          currentRoute.includes('requests') ||
          currentRoute.includes('admin') ||
          currentRoute === 'messages' ||
          currentRoute === 'notifications'
        ) {
          setCurrentRoute('landing');
        }
      }
    }
  }, [isAuthenticated, user?.role, isLoading]);

  const handleNavigate = (route: string, params?: any) => {
    setCurrentRoute(route);
    setRouteParams(params || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isPublicRoute =
    !isAuthenticated ||
    currentRoute === 'landing' ||
    currentRoute === 'login' ||
    currentRoute === 'register' ||
    currentRoute === 'role-selection';

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton-pulse" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading Guidly Platform...</p>
        </div>
      );
    }

    switch (currentRoute) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'role-selection':
        return <RoleSelectionPage onSelectRole={(role) => handleNavigate(role === 'STUDENT' ? 'student-onboarding' : 'mentor-onboarding')} />;
      case 'student-onboarding':
        return <StudentOnboarding onComplete={() => handleNavigate('student-dashboard')} />;
      case 'mentor-onboarding':
        return <MentorOnboarding onComplete={() => handleNavigate('mentor-dashboard')} />;
      case 'student-dashboard':
      case 'dashboard':
        return user?.role === 'ADMIN' ? (
          <AdminDashboard initialTab="overview" onNavigate={handleNavigate} />
        ) : user?.role === 'MENTOR' ? (
          <MentorDashboard onNavigate={handleNavigate} />
        ) : (
          <StudentDashboard onNavigate={handleNavigate} />
        );
      case 'mentor-dashboard':
        return <MentorDashboard onNavigate={handleNavigate} />;
      case 'mentor-students':
        return <MentorActiveStudentsPage onNavigate={handleNavigate} />;
      case 'find-mentor':
        return <MentorDiscovery initialMentorId={routeParams?.mentorId} onNavigate={handleNavigate} />;
      case 'mentor-profile':
        return <MentorProfilePage mentorId={routeParams?.mentorId} onNavigate={handleNavigate} />;
      case 'student-requests':
        return <StudentRequestsPage onNavigate={handleNavigate} />;
      case 'mentor-requests':
        return <MentorRequestsPage onNavigate={handleNavigate} />;
      case 'student-project':
      case 'project-workspace':
        return <ProjectWorkspace projectId={routeParams?.projectId} onNavigate={handleNavigate} />;
      case 'student-sessions':
      case 'mentor-sessions':
        return <SessionsPage onNavigate={handleNavigate} />;
      case 'messages':
        return <MessagingPage />;
      case 'notifications':
        return <NotificationsPage onNavigate={handleNavigate} />;
      case 'student-profile':
        return <StudentOnboarding onComplete={() => handleNavigate('student-dashboard')} />;

      // Admin routes
      case 'admin':
      case 'admin-overview':
        return <AdminDashboard initialTab="overview" onNavigate={handleNavigate} />;
      case 'admin-users':
        return <AdminDashboard initialTab="users" onNavigate={handleNavigate} />;
      case 'admin-verifications':
        return <AdminDashboard initialTab="verifications" onNavigate={handleNavigate} />;
      case 'admin-projects':
        return <AdminDashboard initialTab="projects" onNavigate={handleNavigate} />;
      case 'admin-reports':
        return <AdminDashboard initialTab="reports" onNavigate={handleNavigate} />;
      case 'admin-reviews':
        return <AdminDashboard initialTab="reviews" onNavigate={handleNavigate} />;

      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
      {/* 1-Click Role Switcher Demo Bar */}
      <QuickRoleSwitcher />

      {/* Main Top Navbar */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* App Body Container */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Role-Aware Sidebar for Logged-In Users */}
        {!isPublicRoute && (
          <Sidebar
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            isOpen={isSidebarOpen}
          />
        )}

        {/* Main Content Area */}
        <main
          style={{
            flex: 1,
            padding: isPublicRoute && currentRoute === 'landing' ? '0px' : isPublicRoute ? '24px 16px' : '32px 32px',
            maxWidth: isPublicRoute && currentRoute === 'landing' ? '100%' : '1280px',
            margin: '0 auto',
            width: '100%',
            overflowY: 'auto'
          }}
        >
          {renderContent()}
        </main>
      </div>

      {/* Footer on landing and auth pages */}
      {isPublicRoute && <Footer onNavigate={handleNavigate} />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <WebSocketProvider>
          <MainApp />
        </WebSocketProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
