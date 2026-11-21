import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { useAuth } from '../contexts/DemoContext.jsx';
import { API_BASE_URL, api } from '../services/api.js';
import { Brand, Shell } from '../components/SiteLayout.jsx';
import PortalShell from '../components/PortalShell.jsx';
import { DataTable, PageHeading, Panel, StatusBadge } from '../components/DashboardUI.jsx';

const customerDestination = '/customer/dashboard';
const customerNavigation = [
  { label: 'My appointments', to: customerDestination, icon: CalendarDays },
];

function customerHome(user) {
  if (user?.role === 'Customer') return customerDestination;
  if (user?.role === 'Admin') return '/admin/dashboard';
  if (user?.role === 'Doctor') return '/doctor/dashboard';
  if (user?.role === 'Staff') return '/staff/dashboard';
  return customerDestination;
}

function AuthFrame({ children, imageText }) {
  return (
    <Shell>
      <section className="login customer-auth">
        <div className="loginphoto">
          <img className="login-background" src="/images/vet-clinic.jpg" alt="" />
          <Brand />
          <h2>{imageText}</h2>
        </div>
        <div className="loginform">{children}</div>
      </section>
    </Shell>
  );
}

// ─── Customer Login ───────────────────────────────────────────────────────────
export function CustomerLoginPage() {
  const { completeLogin, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate(customerHome(user), { replace: true });
  }, [navigate, user]);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`https://github.com/izazgayu/MERN-Backend.git/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'Customer' }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || `Sign in failed (${response.status}). Please try again.`);
        return;
      }
      if (!data.token || data.user?.role !== 'Customer') {
        setError('The server returned an invalid customer login response.');
        return;
      }

      completeLogin(data.user, data.token);
      navigate(location.state?.from?.pathname || customerDestination, { replace: true });
    } catch {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame imageText="Your pet's next visit is just a few steps away.">
      <small>CUSTOMER PORTAL</small>
      <h1>Customer login</h1>
      <p>Sign in to book appointments and view your visit history.</p>
      {location.state?.registrationSuccess && (
        <p className="form-confirm">{location.state.registrationSuccess}</p>
      )}
      <form onSubmit={submit}>
        <label>
          Email address
          <input type="email" autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input type="password" autoComplete="current-password" value={password}
            onChange={(e) => setPassword(e.target.value)} required placeholder="Your password" />
        </label>
        {error && <p className="login-error" role="alert">{error}</p>}
        <button className="btn" disabled={loading}>{loading ? 'Signing in…' : 'Sign in →'}</button>
      </form>
      <p className="customer-auth-links">
        New here? <Link to="/customer-signup" state={location.state}>Create an account</Link>
      </p>
    </AuthFrame>
  );
}

// ─── Customer Signup ──────────────────────────────────────────────────────────
export function CustomerSignupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate(customerHome(user), { replace: true });
  }, [navigate, user]);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const data = await api.post('/api/auth/signup', {
        name: form.name,
        phone: form.phone ? `+91 ${form.phone}` : '',
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      navigate('/customer-login', {
        replace: true,
        state: { registrationSuccess: data.message || 'Account created successfully. Please sign in.' },
      });
    } catch (err) {
      setError(err.message || 'Could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame imageText="A little more love. A lot more care.">
      <small>CUSTOMER PORTAL</small>
      <h1>Create your account</h1>
      <p>Register to book appointments online.</p>
      <form onSubmit={submit}>
        <label>
          Full name
          <input name="name" autoComplete="name" value={form.name} onChange={update}
            required maxLength="100" placeholder="Your full name" />
        </label>
        <label>
          Mobile number
          <div className="phone">
            <span>+91</span>
            <input name="phone" type="tel" inputMode="numeric" autoComplete="tel-national"
              pattern="[6-9][0-9]{9}" maxLength="10" value={form.phone} onChange={update}
              required placeholder="10-digit number" />
          </div>
        </label>
        <label>
          Email address
          <input name="email" type="email" autoComplete="email" value={form.email}
            onChange={update} required placeholder="you@example.com" />
        </label>
        <label>
          Create password
          <input name="password" type="password" autoComplete="new-password" minLength="8"
            value={form.password} onChange={update} required placeholder="At least 8 characters" />
        </label>
        <label>
          Confirm password
          <input name="confirmPassword" type="password" autoComplete="new-password" minLength="8"
            value={form.confirmPassword} onChange={update} required placeholder="Enter password again" />
        </label>
        {error && <p className="login-error" role="alert">{error}</p>}
        <button className="btn" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account →'}
        </button>
      </form>
      <p className="customer-auth-links">
        Already registered? <Link to="/customer-login" state={location.state}>Sign in</Link>
      </p>
      <small className="muted">Your account is stored securely in MongoDB with a hashed password.</small>
    </AuthFrame>
  );
}

// ─── Customer Dashboard ───────────────────────────────────────────────────────
export function CustomerDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/appointments')
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const rows = appointments.map((item) => ({
    id: item._id,
    date: item.date,
    time: item.time,
    pet: item.petId?.name || '—',
    doctor: item.doctorId?.name || '—',
    reason: item.reason,
    status: item.status,
  }));

  return (
    <PortalShell role="Customer" navigation={customerNavigation}>
      <PageHeading
        eyebrow="CUSTOMER WORKSPACE"
        title={`Hello, ${user.name}`}
        description="Your appointment requests booked through this portal."
        actions={<Link className="portal-primary-button" to="/book">Book appointment</Link>}
      />
      <Panel title="My appointment requests">
        {loading && <p className="portal-empty-message">Loading…</p>}
        {error && <p className="login-error">{error}</p>}
        {!loading && !error && (
          <DataTable
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'time', label: 'Time' },
              { key: 'pet', label: 'Pet' },
              { key: 'doctor', label: 'Doctor' },
              { key: 'reason', label: 'Reason' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
            ]}
            rows={rows}
          />
        )}
        {!loading && !error && !rows.length && (
          <p className="portal-empty-message">
            You have no appointments yet. <Link to="/book">Book your first appointment →</Link>
          </p>
        )}
      </Panel>
    </PortalShell>
  );
}
