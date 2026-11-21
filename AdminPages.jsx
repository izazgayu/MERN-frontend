import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Bell, CalendarDays, ClipboardPlus, Dog, Users } from 'lucide-react';
import { useAuth } from '../contexts/DemoContext.jsx';
import { api } from '../services/api.js';
import {
  DataTable, MetricGrid, PageHeading, Panel, RevenueChart, SearchBox, StatusBadge,
} from '../components/DashboardUI.jsx';

const today = () => new Date().toISOString().slice(0, 10);
const dateLabel = (d) => d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-IN') : '—';

// ─── Shared fetch hook ────────────────────────────────────────────────────────
function useApi(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(() => {
    setLoading(true);
    api.get(path)
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [path]);
  useEffect(() => { refresh(); }, [refresh]);
  return { data, loading, error, refresh, setData };
}

// ─── Admin Overview ───────────────────────────────────────────────────────────
export function AdminOverview() {
  const { data: users } = useApi('/api/users');
  const { data: appointments } = useApi('/api/appointments');
  const { data: pets } = useApi('/api/pets');
  const { data: owners } = useApi('/api/owners');
  const { data: invoices } = useApi('/api/billing');
  const { data: treatments } = useApi('/api/treatments');
  const { data: inventory } = useApi('/api/inventory');

  const doctors = (users || []).filter((u) => u.role === 'Doctor');
  const staff = (users || []).filter((u) => u.role === 'Staff');
  const appts = appointments || [];
  const todayAppts = appts.filter((a) => a.date === today());
  const completed = appts.filter((a) => a.status === 'Completed').length;
  const pending = appts.filter((a) => a.status === 'Pending').length;
  const invList = invoices || [];
  const revenue = invList.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const pendingPayments = invList.filter((i) => i.status === 'Pending').reduce((s, i) => s + i.amount, 0);
  const lowStock = (inventory || []).filter((item) => item.quantity <= item.reorderLevel);

  const recent = appts.slice(0, 7).map((a) => ({
    id: a._id,
    date: a.date,
    time: a.time,
    pet: a.petId?.name || '—',
    owner: a.ownerId?.name || '—',
    doctor: a.doctorId?.name || '—',
    status: a.status,
  }));

  return (
    <>
      <PageHeading eyebrow="HOSPITAL MANAGEMENT" title="Admin overview" description="Live data from MongoDB." />
      <MetricGrid items={[
        { label: 'Doctors', value: doctors.length, note: `${doctors.filter((d) => d.active).length} active`, icon: Users },
        { label: 'Staff members', value: staff.length, note: `${staff.filter((s) => s.active).length} active`, icon: Users },
        { label: 'Registered pets', value: (pets || []).length, icon: Dog },
        { label: 'Pet owners', value: (owners || []).length, icon: Users },
        { label: "Today's appointments", value: todayAppts.length, icon: CalendarDays },
        { label: 'Completed appointments', value: completed, icon: ClipboardPlus },
        { label: 'Treatment records', value: (treatments || []).length, icon: ClipboardPlus },
        { label: 'Pending appointments', value: pending, icon: Bell },
        { label: 'Total revenue', value: `₹${revenue.toLocaleString('en-IN')}`, note: 'Paid invoices' },
        { label: 'Pending payments', value: `₹${pendingPayments.toLocaleString('en-IN')}`, note: 'Unpaid invoices' },
      ]} />
      <div className="portal-two-column">
        <Panel title="Inventory alerts">
          <ul className="portal-alert-list">
            {lowStock.map((item) => (
              <li key={item._id}><b>{item.name}</b><span>{item.quantity} {item.unit} remaining</span></li>
            ))}
            {!lowStock.length && <li>All items are adequately stocked.</li>}
          </ul>
          <Link className="portal-inline-link" to="/admin/inventory">Review inventory →</Link>
        </Panel>
        <Panel title="Quick links">
          <ul className="portal-alert-list">
            <li><Link to="/admin/appointments">Manage appointments</Link></li>
            <li><Link to="/admin/doctors">Doctor management</Link></li>
            <li><Link to="/admin/billing">Billing &amp; payments</Link></li>
            <li><Link to="/admin/notifications">Send notifications</Link></li>
          </ul>
        </Panel>
      </div>
      <Panel title="Recent appointments" action={<Link className="portal-inline-link" to="/admin/appointments">View all →</Link>}>
        <DataTable
          columns={[
            { key: 'date', label: 'Date', render: (row) => dateLabel(row.date) },
            { key: 'time', label: 'Time' },
            { key: 'pet', label: 'Pet' },
            { key: 'owner', label: 'Owner' },
            { key: 'doctor', label: 'Doctor' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
          ]}
          rows={recent}
        />
      </Panel>
    </>
  );
}

// ─── Doctor Management ────────────────────────────────────────────────────────
export function DoctorManagement() {
  const { data: users, refresh, setData } = useApi('/api/users?role=Doctor');
  const { data: appointments } = useApi('/api/appointments');
  const [query, setQuery] = useState('');

  const doctors = (users || []);
  const appts = appointments || [];

  const rows = doctors
    .filter((d) => `${d.name} ${d.email} ${d.specialization}`.toLowerCase().includes(query.toLowerCase()))
    .map((d) => ({
      ...d,
      id: d.id || d._id,
      appointmentCount: appts.filter((a) => String(a.doctorId?._id || a.doctorId) === String(d.id || d._id)).length,
    }));

  async function toggleActive(doctor) {
    try {
      const updated = await api.patch(`/api/users/${doctor.id || doctor._id}/toggle-active`);
      setData((prev) => prev.map((u) => String(u.id || u._id) === String(doctor.id || doctor._id) ? { ...u, ...updated.user } : u));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <>
      <PageHeading eyebrow="PEOPLE" title="Doctor management" description="Doctor profiles, specialization and availability."
        actions={<Link className="portal-primary-button" to="/admin/accounts/new?role=Doctor">Add doctor</Link>} />
      <Panel title="Doctors" action={<SearchBox value={query} onChange={setQuery} placeholder="Search doctors" />}>
        <DataTable columns={[
          { key: 'name', label: 'Doctor' },
          { key: 'specialization', label: 'Specialization' },
          { key: 'qualification', label: 'Qualification' },
          { key: 'availability', label: 'Availability' },
          { key: 'appointmentCount', label: 'Appointments' },
          { key: 'active', label: 'Account', render: (row) => <StatusBadge>{row.active ? 'Active' : 'Inactive'}</StatusBadge> },
          { key: 'actions', label: 'Actions', render: (row) => (
            <div className="portal-row-actions">
              <Link to={`/admin/doctors/${row.id || row._id}`}>Profile</Link>
              <Link to={`/admin/accounts/${row.id || row._id}/edit`}>Edit</Link>
              <button onClick={() => toggleActive(row)}>{row.active ? 'Deactivate' : 'Activate'}</button>
            </div>
          )},
        ]} rows={rows} />
      </Panel>
    </>
  );
}

// ─── Admin Doctor Profile ─────────────────────────────────────────────────────
export function AdminDoctorProfilePage() {
  const { doctorId } = useParams();
  const { data: users } = useApi('/api/users?role=Doctor');
  const { data: appointments } = useApi('/api/appointments');

  const doctor = (users || []).find((u) => String(u.id || u._id) === doctorId);
  if (!doctor) return <PageHeading eyebrow="PEOPLE" title="Doctor not found" />;

  const rows = (appointments || [])
    .filter((a) => String(a.doctorId?._id || a.doctorId) === doctorId)
    .map((a) => ({
      id: a._id,
      date: a.date,
      time: a.time,
      pet: a.petId?.name || '—',
      owner: a.ownerId?.name || '—',
      reason: a.reason,
      status: a.status,
    }));

  return (
    <>
      <PageHeading eyebrow="DOCTOR PROFILE" title={doctor.name} description={doctor.specialization || 'Specialization not set'}
        actions={<Link className="portal-primary-button" to={`/admin/accounts/${doctor.id || doctor._id}/edit`}>Edit profile</Link>} />
      <Panel title="Professional details">
        <div className="profile-summary">
          <div><small>Qualification</small><b>{doctor.qualification || 'Not provided'}</b></div>
          <div><small>Specialization</small><b>{doctor.specialization || 'Not provided'}</b></div>
          <div><small>Contact</small><b>{doctor.phone || 'Not provided'} · {doctor.email}</b></div>
          <div><small>Availability</small><b>{doctor.availability || 'Not provided'} · {doctor.workingHours || 'Hours not set'}</b></div>
          <div><small>Account status</small><StatusBadge>{doctor.active ? 'Active' : 'Inactive'}</StatusBadge></div>
        </div>
      </Panel>
      <Panel title="Appointment history">
        <DataTable columns={[
          { key: 'date', label: 'Date', render: (row) => dateLabel(row.date) },
          { key: 'time', label: 'Time' }, { key: 'pet', label: 'Pet' }, { key: 'owner', label: 'Owner' },
          { key: 'reason', label: 'Reason' }, { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
        ]} rows={rows} />
      </Panel>
    </>
  );
}

// ─── Staff Management ─────────────────────────────────────────────────────────
export function StaffManagement() {
  const { data: users, setData } = useApi('/api/users?role=Staff');
  const [query, setQuery] = useState('');

  const rows = (users || []).filter((p) =>
    `${p.name} ${p.email} ${p.jobTitle}`.toLowerCase().includes(query.toLowerCase())
  );

  async function toggleActive(person) {
    try {
      const updated = await api.patch(`/api/users/${person.id || person._id}/toggle-active`);
      setData((prev) => prev.map((u) => String(u.id || u._id) === String(person.id || person._id) ? { ...u, ...updated.user } : u));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <>
      <PageHeading eyebrow="PEOPLE" title="Staff & accounts" description="Manage staff access and accounts."
        actions={<Link className="portal-primary-button" to="/admin/accounts/new?role=Staff">Add staff account</Link>} />
      <Panel title="Staff accounts" action={<SearchBox value={query} onChange={setQuery} placeholder="Search staff" />}>
        <DataTable columns={[
          { key: 'name', label: 'Name' }, { key: 'jobTitle', label: 'Staff role' },
          { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' },
          { key: 'active', label: 'Status', render: (row) => <StatusBadge>{row.active ? 'Active' : 'Inactive'}</StatusBadge> },
          { key: 'actions', label: 'Actions', render: (row) => (
            <div className="portal-row-actions">
              <Link to={`/admin/accounts/${row.id || row._id}/edit`}>Edit</Link>
              <button onClick={() => toggleActive(row)}>{row.active ? 'Deactivate' : 'Activate'}</button>
            </div>
          )},
        ]} rows={rows.map((r) => ({ ...r, id: r.id || r._id }))} />
      </Panel>
    </>
  );
}

// ─── Account Form (create/edit Doctor or Staff) ───────────────────────────────
export function AccountFormPage() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [existing, setExisting] = useState(null);
  const initialRole = params.get('role') === 'Staff' ? 'Staff' : 'Doctor';
  const [form, setForm] = useState({
    name: '', email: '', phone: '', role: initialRole,
    qualification: '', specialization: '', availability: 'Mon–Sat',
    workingHours: '9 AM–5 PM', jobTitle: '', password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    api.get(`/api/users`).then((users) => {
      const found = users.find((u) => String(u.id || u._id) === userId);
      if (found) {
        setExisting(found);
        setForm({
          name: found.name || '', email: found.email || '', phone: found.phone || '',
          role: found.role || initialRole, qualification: found.qualification || '',
          specialization: found.specialization || '', availability: found.availability || 'Mon–Sat',
          workingHours: found.workingHours || '9 AM–5 PM', jobTitle: found.jobTitle || '', password: '',
        });
      }
    }).catch(() => {});
  }, [userId]);

  function update(e) {
    setForm((c) => ({ ...c, [e.target.name]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!existing && !form.password) {
      setError('Password is required for a new account.');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (existing) {
        await api.patch(`/api/users/${userId}`, payload);
      } else {
        await api.post('/api/users', payload);
      }
      navigate(form.role === 'Doctor' ? '/admin/doctors' : '/admin/staff');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!user || user.role !== 'Admin') return <PageHeading title="Access denied" />;

  return (
    <>
      <PageHeading eyebrow="ADMIN ONLY" title={existing ? 'Edit account' : 'Create staff account'}
        description="Only Doctor and Staff accounts can be created here." />
      <Panel title="Account details">
        <form className="portal-form" onSubmit={submit}>
          <label>Full name<input name="name" value={form.name} onChange={update} required /></label>
          <label>Email address<input name="email" type="email" value={form.email} onChange={update} required /></label>
          <label>Phone<input name="phone" type="tel" value={form.phone} onChange={update} /></label>
          <label>Account type
            <select name="role" value={form.role} onChange={update} disabled={Boolean(existing)}>
              <option value="Doctor">Doctor</option>
              <option value="Staff">Staff</option>
            </select>
          </label>
          {form.role === 'Doctor' ? (
            <>
              <label>Qualification<input name="qualification" value={form.qualification} onChange={update} required /></label>
              <label>Specialization<input name="specialization" value={form.specialization} onChange={update} required /></label>
              <label>Availability<input name="availability" value={form.availability} onChange={update} required /></label>
              <label>Working hours<input name="workingHours" value={form.workingHours} onChange={update} required /></label>
            </>
          ) : (
            <label>Staff role<input name="jobTitle" value={form.jobTitle} onChange={update} required placeholder="e.g. Receptionist" /></label>
          )}
          <label>{existing ? 'Set new password (optional)' : 'Password *'}
            <input name="password" type="password" value={form.password} onChange={update}
              autoComplete="new-password" required={!existing} placeholder="Min 8 characters" />
          </label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <div className="portal-form-actions">
            <button className="portal-primary-button" disabled={loading}>
              {loading ? 'Saving…' : existing ? 'Save changes' : 'Create account'}
            </button>
            <button type="button" className="portal-secondary-button" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </Panel>
    </>
  );
}

// ─── Patients ─────────────────────────────────────────────────────────────────
export function PatientsPage() {
  const { data: pets, loading } = useApi('/api/pets');
  const [query, setQuery] = useState('');

  const rows = (pets || [])
    .map((pet) => ({
      id: pet._id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      owner: pet.ownerId?.name || '—',
      ownerPhone: pet.ownerId?.phone || '—',
      doctor: pet.assignedDoctorId?.name || '—',
    }))
    .filter((p) => `${p.name} ${p.owner} ${p.species} ${p.breed}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <PageHeading eyebrow="PATIENTS" title="Pet patients" description={`${(pets || []).length} registered patients.`} />
      <Panel title="All pets" action={<SearchBox value={query} onChange={setQuery} placeholder="Search pets or owners" />}>
        {loading && <p className="portal-empty-message">Loading…</p>}
        <DataTable columns={[
          { key: 'name', label: 'Pet' }, { key: 'species', label: 'Species' }, { key: 'breed', label: 'Breed' },
          { key: 'age', label: 'Age' }, { key: 'owner', label: 'Owner' }, { key: 'ownerPhone', label: 'Owner phone' },
          { key: 'doctor', label: 'Assigned doctor' },
        ]} rows={rows} />
      </Panel>
    </>
  );
}

// ─── Owners ───────────────────────────────────────────────────────────────────
export function OwnersPage() {
  const { data: owners, loading } = useApi('/api/owners');
  const [query, setQuery] = useState('');

  const rows = (owners || [])
    .map((owner) => ({
      id: owner._id,
      name: owner.name,
      phone: owner.phone,
      email: owner.email,
      city: owner.city,
      pets: (owner.pets || []).join(', '),
    }))
    .filter((o) => `${o.name} ${o.phone} ${o.city}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <PageHeading eyebrow="CLIENTS" title="Pet owners" description="Owner contact information and registered pets." />
      <Panel title="All owners" action={<SearchBox value={query} onChange={setQuery} placeholder="Search owners" />}>
        {loading && <p className="portal-empty-message">Loading…</p>}
        <DataTable columns={[
          { key: 'name', label: 'Owner' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' },
          { key: 'city', label: 'City' }, { key: 'pets', label: 'Pets' },
        ]} rows={rows} />
      </Panel>
    </>
  );
}

// ─── Appointments ─────────────────────────────────────────────────────────────
export function AppointmentsPage() {
  const { data: appointments, loading, setData } = useApi('/api/appointments');
  const { data: users } = useApi('/api/users');
  const { data: pets } = useApi('/api/pets');
  const [query, setQuery] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newAppt, setNewAppt] = useState({ petId: '', doctorId: '', date: today(), time: '09:00 AM', reason: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const doctors = (users || []).filter((u) => u.role === 'Doctor' && u.active);
  const petList = pets || [];
  const appts = appointments || [];

  const rows = appts
    .map((a) => ({
      id: a._id,
      date: a.date,
      time: a.time,
      pet: a.petId?.name || '—',
      owner: a.ownerId?.name || '—',
      doctor: a.doctorId?.name || '—',
      doctorId: String(a.doctorId?._id || a.doctorId || ''),
      reason: a.reason,
      status: a.status,
    }))
    .filter((a) => `${a.pet} ${a.owner} ${a.doctor} ${a.reason} ${a.status}`.toLowerCase().includes(query.toLowerCase()));

  async function updateAppt(id, updates) {
    try {
      const updated = await api.patch(`/api/appointments/${id}`, updates);
      setData((prev) => prev.map((a) => a._id === id ? { ...a, ...updated } : a));
    } catch (err) {
      alert(err.message);
    }
  }

  async function createAppt(e) {
    e.preventDefault();
    setFormError('');
    if (!newAppt.petId) { setFormError('Select a pet.'); return; }
    setSaving(true);
    try {
      const pet = petList.find((p) => p._id === newAppt.petId);
      const payload = {
        ownerName: pet?.ownerId?.name || '',
        petName: pet?.name || '',
        species: pet?.species || 'Dog',
        doctorId: newAppt.doctorId || undefined,
        date: newAppt.date,
        time: newAppt.time,
        reason: newAppt.reason,
      };
      const created = await api.post('/api/appointments', payload);
      setData((prev) => [created, ...(prev || [])]);
      setShowNew(false);
      setNewAppt({ petId: '', doctorId: '', date: today(), time: '09:00 AM', reason: '' });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeading eyebrow="SCHEDULING" title="Appointment management"
        actions={<button className="portal-primary-button" onClick={() => setShowNew((v) => !v)}>{showNew ? 'Close' : 'Add appointment'}</button>} />
      {showNew && (
        <Panel title="Create appointment">
          <form className="portal-form" onSubmit={createAppt}>
            <label>Pet
              <select required value={newAppt.petId} onChange={(e) => setNewAppt({ ...newAppt, petId: e.target.value })}>
                <option value="">Select pet</option>
                {petList.map((p) => <option key={p._id} value={p._id}>{p.name} · {p.species}</option>)}
              </select>
            </label>
            <label>Assign doctor
              <select value={newAppt.doctorId} onChange={(e) => setNewAppt({ ...newAppt, doctorId: e.target.value })}>
                <option value="">Any available</option>
                {doctors.map((d) => <option key={d.id || d._id} value={d.id || d._id}>{d.name}</option>)}
              </select>
            </label>
            <label>Date<input type="date" min={today()} required value={newAppt.date} onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })} /></label>
            <label>Time
              <select value={newAppt.time} onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}>
                {['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:30 PM'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="portal-form-wide">Reason
              <input required value={newAppt.reason} onChange={(e) => setNewAppt({ ...newAppt, reason: e.target.value })} />
            </label>
            {formError && <p className="login-error">{formError}</p>}
            <button className="portal-primary-button" disabled={saving}>{saving ? 'Creating…' : 'Create appointment'}</button>
          </form>
        </Panel>
      )}
      <Panel title="All appointments" action={<SearchBox value={query} onChange={setQuery} placeholder="Search appointments" />}>
        {loading && <p className="portal-empty-message">Loading…</p>}
        <DataTable columns={[
          { key: 'date', label: 'Date', render: (row) => (
            <input className="table-input" type="date" value={row.date}
              onChange={(e) => updateAppt(row.id, { date: e.target.value })} />
          )},
          { key: 'time', label: 'Time', render: (row) => (
            <select className="table-select" value={row.time}
              onChange={(e) => updateAppt(row.id, { time: e.target.value })}>
              {['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:30 PM'].map((t) => <option key={t}>{t}</option>)}
            </select>
          )},
          { key: 'pet', label: 'Pet' },
          { key: 'owner', label: 'Owner' },
          { key: 'doctor', label: 'Assigned doctor' },
          { key: 'reason', label: 'Reason' },
          { key: 'status', label: 'Status', render: (row) => (
            <select className="table-select" value={row.status}
              onChange={(e) => updateAppt(row.id, { status: e.target.value })}>
              {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
            </select>
          )},
        ]} rows={rows} />
      </Panel>
    </>
  );
}

// ─── Treatments ───────────────────────────────────────────────────────────────
export function AdminTreatmentsPage() {
  const { data: treatments, loading } = useApi('/api/treatments');

  const rows = (treatments || []).map((r) => ({
    id: r._id,
    date: r.date,
    pet: r.petId?.name || '—',
    owner: r.ownerId?.name || '—',
    doctor: r.doctorId?.name || '—',
    symptoms: r.symptoms,
    diagnosis: r.diagnosis,
    treatment: r.treatment,
    prescription: r.prescription,
    followUpDate: r.followUpDate,
    status: r.status,
  }));

  return (
    <>
      <PageHeading eyebrow="CLINICAL WORKSPACE" title="Treatment records" description="All diagnoses, prescriptions and follow-up history." />
      <Panel title="All treatment records">
        {loading && <p className="portal-empty-message">Loading…</p>}
        <DataTable columns={[
          { key: 'date', label: 'Date', render: (row) => dateLabel(row.date) },
          { key: 'pet', label: 'Patient' }, { key: 'owner', label: 'Owner' }, { key: 'doctor', label: 'Doctor' },
          { key: 'symptoms', label: 'Symptoms' }, { key: 'diagnosis', label: 'Diagnosis' },
          { key: 'treatment', label: 'Treatment' }, { key: 'prescription', label: 'Prescription' },
          { key: 'followUpDate', label: 'Follow-up', render: (row) => dateLabel(row.followUpDate) },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
        ]} rows={rows} />
      </Panel>
    </>
  );
}

// ─── Billing ──────────────────────────────────────────────────────────────────
export function BillingPage() {
  const { data: invoices, loading, setData } = useApi('/api/billing');
  const invList = invoices || [];
  const paid = invList.filter((i) => i.status === 'Paid');
  const revenue = paid.reduce((s, i) => s + i.amount, 0);
  const pendingTotal = invList.filter((i) => i.status === 'Pending').reduce((s, i) => s + i.amount, 0);

  async function updateStatus(id, status) {
    try {
      const updated = await api.patch(`/api/billing/${id}`, { status });
      setData((prev) => prev.map((i) => i._id === id ? { ...i, ...updated } : i));
    } catch (err) {
      alert(err.message);
    }
  }

  const rows = invList.map((i) => ({
    id: i._id,
    invoiceId: i._id?.toString().slice(-6).toUpperCase(),
    date: i.date,
    owner: i.ownerId?.name || '—',
    amount: i.amount,
    method: i.method,
    status: i.status,
  }));

  return (
    <>
      <PageHeading eyebrow="FINANCE" title="Billing & payments" description="Invoices, collections and payment status." />
      <MetricGrid items={[
        { label: 'Total collected', value: `₹${revenue.toLocaleString('en-IN')}` },
        { label: 'Pending payments', value: `₹${pendingTotal.toLocaleString('en-IN')}` },
        { label: 'Invoices', value: invList.length },
        { label: 'Payment methods', value: 'UPI · Cash · Card' },
      ]} />
      <Panel title="Invoices and payments">
        {loading && <p className="portal-empty-message">Loading…</p>}
        <DataTable columns={[
          { key: 'invoiceId', label: 'Invoice' },
          { key: 'date', label: 'Date', render: (row) => dateLabel(row.date) },
          { key: 'owner', label: 'Owner' },
          { key: 'amount', label: 'Amount', render: (row) => `₹${row.amount?.toLocaleString('en-IN')}` },
          { key: 'method', label: 'Method' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
          { key: 'actions', label: 'Actions', render: (row) => row.status !== 'Refunded' && (
            <button className="table-action"
              onClick={() => updateStatus(row.id, row.status === 'Paid' ? 'Refunded' : 'Paid')}>
              {row.status === 'Paid' ? 'Refund' : 'Mark paid'}
            </button>
          )},
        ]} rows={rows} />
      </Panel>
    </>
  );
}

// ─── Inventory ────────────────────────────────────────────────────────────────
export function InventoryPage() {
  const { data: inventory, loading, setData } = useApi('/api/inventory');
  const [form, setForm] = useState({ name: '', category: '', quantity: '', unit: 'units', expiry: '', reorderLevel: '10' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const lowStock = (inventory || []).filter((item) => item.quantity <= item.reorderLevel);

  async function addItem(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const item = await api.post('/api/inventory', {
        ...form,
        quantity: Number(form.quantity),
        reorderLevel: Number(form.reorderLevel),
      });
      setData((prev) => [...(prev || []), item]);
      setForm({ name: '', category: '', quantity: '', unit: 'units', expiry: '', reorderLevel: '10' });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeading eyebrow="OPERATIONS" title="Medicine inventory"
        description={`${lowStock.length} items at or below reorder level.`} />
      <Panel title="Add medicine">
        <form className="portal-inline-form" onSubmit={addItem}>
          <input aria-label="Medicine name" placeholder="Medicine name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input aria-label="Category" placeholder="Category" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <input aria-label="Quantity" type="number" min="0" placeholder="Quantity" value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
          <input aria-label="Expiry date" type="date" value={form.expiry}
            onChange={(e) => setForm({ ...form, expiry: e.target.value })} required />
          {formError && <p className="login-error">{formError}</p>}
          <button className="portal-primary-button" disabled={saving}>{saving ? 'Adding…' : 'Add item'}</button>
        </form>
      </Panel>
      {lowStock.length > 0 && (
        <div className="portal-alert-banner">
          Low stock: {lowStock.map((item) => item.name).join(', ')}
        </div>
      )}
      <Panel title="Current stock">
        {loading && <p className="portal-empty-message">Loading…</p>}
        <DataTable columns={[
          { key: 'name', label: 'Medicine' }, { key: 'category', label: 'Category' },
          { key: 'quantity', label: 'Available', render: (row) => `${row.quantity} ${row.unit}` },
          { key: 'expiry', label: 'Expiry', render: (row) => dateLabel(row.expiry) },
          { key: 'reorderLevel', label: 'Reorder at' },
          { key: 'status', label: 'Stock status', render: (row) => (
            <StatusBadge>{row.quantity <= row.reorderLevel ? 'Low stock' : 'In stock'}</StatusBadge>
          )},
        ]} rows={(inventory || []).map((i) => ({ ...i, id: i._id }))} />
      </Panel>
    </>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────
export function AdminNotificationsPage() {
  const { data: notifications, loading, setData } = useApi('/api/notifications');
  const { data: users } = useApi('/api/users?role=Doctor');
  const [form, setForm] = useState({ title: '', message: '', audience: 'all' });
  const [saving, setSaving] = useState(false);

  async function send(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await api.post('/api/notifications', {
        ...form,
        type: form.audience === 'all' ? 'Announcement' : 'Direct message',
      });
      setData((prev) => [created, ...(prev || [])]);
      setForm({ title: '', message: '', audience: 'all' });
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeading eyebrow="COMMUNICATION" title="Notifications" description="Send announcements or messages to individual doctors." />
      <Panel title="Compose notification">
        <form className="portal-form" onSubmit={send}>
          <label>Send to
            <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
              <option value="all">All doctors</option>
              {(users || []).map((d) => (
                <option key={d.id || d._id} value={d.id || d._id}>{d.name}</option>
              ))}
            </select>
          </label>
          <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
          <label className="portal-form-wide">Message
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows="3" />
          </label>
          <button className="portal-primary-button" disabled={saving}>{saving ? 'Sending…' : 'Send notification'}</button>
        </form>
      </Panel>
      <Panel title="Recent notifications">
        {loading && <p className="portal-empty-message">Loading…</p>}
        <div className="portal-notification-list">
          {(notifications || []).map((item) => (
            <article key={item._id}>
              <span className="notification-icon"><Bell size={17} /></span>
              <div>
                <b>{item.title}</b>
                <p>{item.message}</p>
                <small>{dateLabel(item.createdAt)} · {item.audience === 'all' ? 'All doctors' : 'Direct message'}</small>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export function ReportsPage() {
  const { data: appointments } = useApi('/api/appointments');
  const { data: treatments } = useApi('/api/treatments');
  const { data: owners } = useApi('/api/owners');
  const { data: invoices } = useApi('/api/billing');
  const { data: users } = useApi('/api/users');

  const appts = appointments || [];
  const treats = treatments || [];
  const invList = invoices || [];
  const revenue = invList.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);

  const treatmentSummary = Object.values(treats.reduce((summary, record) => {
    const key = record.diagnosis || 'Unspecified';
    summary[key] = summary[key] || { id: key, diagnosis: key, cases: 0 };
    summary[key].cases += 1;
    return summary;
  }, {}));

  const doctors = (users || []).filter((u) => u.role === 'Doctor').map((d) => ({
    ...d,
    id: d.id || d._id,
    appointments: appts.filter((a) => String(a.doctorId?._id || a.doctorId) === String(d.id || d._id)).length,
    completed: appts.filter((a) => String(a.doctorId?._id || a.doctorId) === String(d.id || d._id) && a.status === 'Completed').length,
  }));

  return (
    <>
      <PageHeading eyebrow="ANALYTICS" title="Hospital reports" description="Live statistics from MongoDB." />
      <MetricGrid items={[
        { label: 'Patient visits', value: appts.length },
        { label: 'Treatment records', value: treats.length },
        { label: 'Registered owners', value: (owners || []).length },
        { label: 'Revenue collected', value: `₹${revenue.toLocaleString('en-IN')}` },
      ]} />
      <Panel title="Doctor-wise activity">
        <DataTable columns={[
          { key: 'name', label: 'Doctor' }, { key: 'specialization', label: 'Specialization' },
          { key: 'appointments', label: 'Appointments' }, { key: 'completed', label: 'Completed' },
        ]} rows={doctors} />
      </Panel>
      <Panel title="Treatment statistics">
        <DataTable columns={[
          { key: 'diagnosis', label: 'Diagnosis / category' },
          { key: 'cases', label: 'Recorded cases' },
        ]} rows={treatmentSummary} />
      </Panel>
    </>
  );
}
