import { Outlet, Navigate } from 'react-router-dom';
import { Bell, CalendarDays, ClipboardPlus, Dog, LayoutDashboard, UserRound } from 'lucide-react';
import PortalShell from './PortalShell.jsx';
import { useAuth } from '../contexts/DemoContext.jsx';

const navigation = [
  { label: 'My dashboard', to: '/doctor/dashboard', icon: LayoutDashboard },
  { label: 'My appointments', to: '/doctor/appointments', icon: CalendarDays },
  { label: 'My calendar', to: '/doctor/calendar', icon: CalendarDays },
  { label: 'My patients', to: '/doctor/patients', icon: Dog },
  { label: 'Treatment records', to: '/doctor/treatments', icon: ClipboardPlus },
  { label: 'Notifications', to: '/doctor/notifications', icon: Bell },
  { label: 'My profile', to: '/doctor/profile', icon: UserRound },
];

export default function DoctorLayout() {
  const { user } = useAuth();
  if (!user || user.role !== 'Doctor') return <Navigate to="/staff-login" replace />;
  return <PortalShell role="Doctor" navigation={navigation}><Outlet /></PortalShell>;
}
