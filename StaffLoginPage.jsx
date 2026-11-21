import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Shell } from '../components/SiteLayout.jsx';
import { useAuth } from '../contexts/DemoContext.jsx';

const roleHome = {
  Admin: '/admin/dashboard',
  Doctor: '/doctor/dashboard',
  Staff: '/staff/dashboard',
};

export default function StaffLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRole = ['Doctor', 'Staff'].includes(searchParams.get('role'))
    ? searchParams.get('role')
    : 'Admin';

  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password, role);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(roleHome[result.user.role] || '/staff-login', { replace: true });
  }

  return (
    <Shell>
      <section className="login staff-login">
        <div className="loginphoto">
          <img className="login-background" src="/images/vet-clinic.jpg" alt="" />
          <h2>Good care starts with a great team.</h2>
        </div>
        <div className="loginform">
          <small>ADMIN · DOCTOR · STAFF PORTAL</small>
          <h1>Welcome back</h1>
          <p>Sign in to your hospital portal account.</p>
          <form onSubmit={submit}>
            <label>
              Login type
              <select value={role} onChange={(event) => setRole(event.target.value)}>
                <option value="Admin">Admin Login</option>
                <option value="Doctor">Doctor Login</option>
                <option value="Staff">Staff Login</option>
              </select>
            </label>
            <label>
              Email address
              <input
                autoComplete="username"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="name@gayathrivets.com"
              />
            </label>
            <label>
              Password
              <span className="password-field">
                <input
                  autoComplete="current-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
            {error && <p className="login-error" role="alert">{error}</p>}
            <button className="btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in to portal →'}
            </button>
          </form>
          <Link className="forgot-link" to="/forgot-password">Forgot password?</Link>
          <div className="demo-credentials">
            <b>Default sign-in credentials</b>
            <span>Admin: admin@gayathrivets.com / Admin@123</span>
            <span>Doctor: doctor@gayathrivets.com / Doctor@123</span>
            <span>Staff: staff@gayathrivets.com / Staff@123</span>
          </div>
          <small className="muted">
            All logins are authenticated against MongoDB. Run <code>npm run seed</code> to create default accounts.
          </small>
        </div>
      </section>
    </Shell>
  );
}
