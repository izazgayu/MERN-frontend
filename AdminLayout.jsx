import { Outlet, Navigate } from 'react-router-dom';
import {
  Activity, BadgeIndianRupee, BarChart3, Bell, CalendarDays, ClipboardPlus,
  Dog, Pill, Stethoscope, UserRound, Users,
} from 'lucide-react';
import PortalShell from './PortalShell.jsx';
import { useAuth } from '../contexts/DemoContext.jsx';

const navigation = [
  { label: 'Overview', to: '/admin/dashboard', icon: BarChart3 },
  { label: 'Doctors', to: '/admin/doctors', icon: Stethoscope },
  { label: 'Staff & accounts', to: '/admin/staff', icon: Users },
  { label: 'Patients', to: '/admin/patients', icon: Dog },
  { label: 'Owners', to: '/admin/owners', icon: UserRound },
  { label: 'Appointments', to: '/admin/appointments', icon: CalendarDays },
  { label: 'Treatment records', to: '/admin/treatments', icon: ClipboardPlus },
  { label: 'Billing', to: '/admin/billing', icon: BadgeIndianRupee },
  { label: 'Inventory', to: '/admin/inventory', icon: Pill },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
  { label: 'Reports', to: '/admin/reports', icon: Activity },
];

export default function AdminLayout() {
  const { user } = useAuth();
  if (!user || user.role !== 'Admin') return <Navigate to="/staff-login" replace />;
  return <PortalShell role="Admin" navigation={navigation}><Outlet /></PortalShell>;
}
