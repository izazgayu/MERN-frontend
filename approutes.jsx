import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/DemoContext.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import DoctorLayout from './components/DoctorLayout.jsx';
import StaffLayout from './components/StaffLayout.jsx';
import StaffLoginPage from './pages/StaffLoginPage.jsx';
import { CustomerDashboard, CustomerLoginPage, CustomerSignupPage } from './pages/CustomerPages.jsx';
import {
  About, Availability, Booking, ContactUs, Doctors, FAQ, ForgotPassword,
  Home, Missing, Privacy, Services, Terms,
} from './App.jsx';
import {
  AccountFormPage, AdminDoctorProfilePage, AdminNotificationsPage, AdminOverview,
  AdminTreatmentsPage, AppointmentsPage, BillingPage, DoctorManagement,
  InventoryPage, OwnersPage, PatientsPage, ReportsPage, StaffManagement,
} from './pages/AdminPages.jsx';
import {
  DoctorAppointmentsPage, DoctorCalendarPage, DoctorNotificationsPage,
  DoctorOverview, DoctorPatientsPage, DoctorProfilePage, DoctorTreatmentsPage,
  StaffAppointmentsPage, StaffOverview,
} from './pages/DoctorPages.jsx';

function RequireRole({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    const loginPath = roles.includes('Customer') ? '/customer-login'
      : roles.includes('Doctor') ? '/staff-login?role=Doctor' : '/staff-login?role=Admin';
    return (
      <Navigate
        to={loginPath}
        state={{ from: location }}
        replace
      />
    );
  }
  if (roles.includes(user.role)) return children;
  const destination = user.role === 'Admin' ? '/admin/dashboard'
    : user.role === 'Doctor' ? '/doctor/dashboard'
      : user.role === 'Customer' ? '/customer/dashboard' : '/staff/dashboard';
  return <Navigate to={destination} replace />;
}

function roleHome(role) {
  return role === 'Admin' ? '/admin/dashboard'
    : role === 'Doctor' ? '/doctor/dashboard'
      : role === 'Customer' ? '/customer/dashboard' : '/staff/dashboard';
}

function RoleHomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/staff-login?role=Admin" replace />;
  return <Navigate to={roleHome(user.role)} replace />;
}

function LegacyAdminRedirect({ to }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/staff-login?role=Admin" replace />;
  if (user.role === 'Admin') return <Navigate to={to} replace />;
  return <Navigate to={roleHome(user.role)} replace />;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }, [pathname]);

  return null;
}

function RouteTree() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/services" element={<Services />} />
      <Route path="/availability" element={<Availability />} />
      <Route path="/book" element={<RequireRole roles={['Customer']}><Booking /></RequireRole>} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/staff-login" element={<StaffLoginPage />} />
      <Route path="/customer-login" element={<CustomerLoginPage />} />
      <Route path="/customer-signup" element={<CustomerSignupPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/customer/dashboard" element={<RequireRole roles={['Customer']}><CustomerDashboard /></RequireRole>} />
      <Route path="/dashboard" element={<RoleHomeRedirect />} />
      <Route path="/pets" element={<LegacyAdminRedirect to="/admin/patients" />} />
      <Route path="/owners" element={<LegacyAdminRedirect to="/admin/owners" />} />
      <Route path="/management" element={<LegacyAdminRedirect to="/admin/appointments" />} />
      <Route path="/billing" element={<LegacyAdminRedirect to="/admin/billing" />} />
      <Route path="/admin" element={<RequireRole roles={['Admin']}><AdminLayout /></RequireRole>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminOverview />} />
        <Route path="doctors" element={<DoctorManagement />} />
        <Route path="doctors/:doctorId" element={<AdminDoctorProfilePage />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="accounts/new" element={<AccountFormPage />} />
        <Route path="accounts/:userId/edit" element={<AccountFormPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="owners" element={<OwnersPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="treatments" element={<AdminTreatmentsPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
      <Route path="/doctor" element={<RequireRole roles={['Doctor']}><DoctorLayout /></RequireRole>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DoctorOverview />} />
        <Route path="appointments" element={<DoctorAppointmentsPage />} />
        <Route path="calendar" element={<DoctorCalendarPage />} />
        <Route path="patients" element={<DoctorPatientsPage />} />
        <Route path="treatments" element={<DoctorTreatmentsPage />} />
        <Route path="notifications" element={<DoctorNotificationsPage />} />
        <Route path="profile" element={<DoctorProfilePage />} />
      </Route>
      <Route path="/staff" element={<RequireRole roles={['Staff']}><StaffLayout /></RequireRole>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StaffOverview />} />
        <Route path="appointments" element={<StaffAppointmentsPage />} />
      </Route>
      <Route path="*" element={<Missing />} />
    </Routes>
  );
}

export default function AppRoutes() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <RouteTree />
    </AuthProvider>
  );
}
