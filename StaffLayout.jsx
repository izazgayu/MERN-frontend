import { Outlet, Navigate } from 'react-router-dom';
import { CalendarDays, LayoutDashboard } from 'lucide-react';
import PortalShell from './PortalShell.jsx';
import { useAuth } from '../contexts/DemoContext.jsx';

const navigation = [
  { label: 'Staff dashboard', to: '/staff/dashboard', icon: LayoutDashboard },
  { label: 'Appointments', to: '/staff/appointments', icon: CalendarDays },
];

export default function StaffLayout() {
  const { user } = useAuth();
  if (!user || user.role !== 'Staff') return <Navigate to="/staff-login" replace />;
  return <PortalShell role="Staff" navigation={navigation}><Outlet /></PortalShell>;
}
