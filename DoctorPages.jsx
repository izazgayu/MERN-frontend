import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/DemoContext.jsx';
import { api } from '../services/api.js';
import {
  DataTable, MetricGrid, PageHeading, Panel, SearchBox, StatusBadge,
} from '../components/DashboardUI.jsx';

const today = () => new Date().toISOString().slice(0, 10);
const dateLabel = (d) => d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-IN') : '—';

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

// ─── Doctor Overview ──────────────────────────────────────────────────────────
export function DoctorOverview() {
  const { user } = useAuth();
  const { data: appointments } = useApi('/api/appointments');
  const { data: notifications } = useApi('/api/notifications');

  const appts = (appointments || []);
  const todayAppts = appts.filter((a) => a.date === today());
  const upcoming = appts.filter((a) => a.date >= today() && !['Cancelled', 'Completed'].includes(a.status));
  const notes = (notifications || []).slice(0, 4);

  return (
    <>
      <PageHeading eyebrow="DOCTOR WORKSPACE" title={`Good day, ${user.name}`} description="Your appointments and recent messages." />
      <MetricGrid items={[
        { label: "Today's appointments", value: todayAppts.length },
        { label: 'Upcoming appointments', value: upcoming.length },
        { label: 'Completed', value: appts.filter((a) => a.status === 'Completed').length },
        { label: 'Pending', value: appts.filter((a) => a.status === 'Pending').length },
        { label: 'Notifications', value: notes.length },
      ]} />
      <div className="portal-two-column">
        <Panel title="Today's schedule">
          <div className="portal-appointment-list">
            {todayAppts.map((a) => (
              <article key={a._id}>
                <time>{a.time}</time>
                <div>
                  <b>{a.petId?.name || '—'} · {a.petId?.species || '—'}</b>
                  <small>{a.ownerId?.name || '—'} · {a.reason}</small>
                </div>
                <StatusBadge>{a.status}</StatusBadge>
              </article>
            ))}
            {!todayAppts.length && <p className="portal-empty-message">No appointments today.</p>}
          </div>
        </Panel>
        <Panel title="Recent notifications">
          <div className="portal-notification-list">
            {notes.map((item) => (
              <article key={item._id}>
                <span className="notification-icon">!</span>
                <div>
                  <b>{item.title}</b>
                  <p>{item.message}</p>
                  <small>{dateLabel(item.createdAt)}</small>
                </div>
              </article>
            ))}
            {!notes.length && <p className="portal-empty-message">No notifications.</p>}
          </div>
        </Panel>
      </div>
      <Panel title="Upcoming appointments">
        <DataTable columns={[
          { key: 'date', label: 'Date', render: (row) => dateLabel(row.date) },
          { key: 'time', label: 'Time' },
          { key: 'pet', label: 'Patient' },
          { key: 'owner', label: 'Owner' },
          { key: 'reason', label: 'Reason' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
        ]} rows={upcoming.slice(0, 6).map((a) => ({
          id: a._id, date: a.date, time: a.time,
          pet: a.petId?.name || '—', owner: a.ownerId?.name || '—',
          reason: a.reason, status: a.status,
        }))} />
      </Panel>
    </>
  );
}

// ─── Doctor Appointments ──────────────────────────────────────────────────────
export function DoctorAppointmentsPage() {
  const { data: appointments, loading } = useApi('/api/appointments');
  const [query, setQuery] = useState('');

  const rows = (appointments || [])
    .map((a) => ({
      id: a._id,
      pet: a.petId?.name || '—',
      species: a.petId?.species || '—',
      owner: a.ownerId?.name || '—',
      ownerPhone: a.ownerId?.phone || '—',
      date: a.date,
      time: a.time,
      reason: a.reason,
      status: a.status,
    }))
    .filter((a) => `${a.pet} ${a.owner} ${a.reason} ${a.status}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <PageHeading eyebrow="MY SCHEDULE" title="My appointments" />
      <Panel title={`${rows.length} appointments`} action={<SearchBox value={query} onChange={setQuery} placeholder="Search" />}>
        {loading && <p className="portal-empty-message">Loading…</p>}
        <DataTable columns={[
          { key: 'pet', label: 'Pet' }, { key: 'species', label: 'Type' },
          { key: 'owner', label: 'Owner' }, { key: 'ownerPhone', label: 'Contact' },
          { key: 'date', label: 'Date', render: (row) => dateLabel(row.date) },
          { key: 'time', label: 'Time' }, { key: 'reason', label: 'Reason' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
        ]} rows={rows} />
      </Panel>
    </>
  );
}

// ─── Doctor Calendar ──────────────────────────────────────────────────────────
export function DoctorCalendarPage() {
  const { user } = useAuth();
  const { data: appointments } = useApi('/api/appointments');
  const [range, setRange] = useState('week');

  function inRange(date) {
    if (!date) return false;
    const d = new Date(`${date}T00:00:00`);
    const now = new Date(`${today()}T00:00:00`);
    if (range === 'day') return date === today();
    if (range === 'week') {
      const start = new Date(now); start.setDate(now.getDate() - now.getDay());
      const end = new Date(start); end.setDate(start.getDate() + 6);
      return d >= start && d <= end;
    }
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }

  const rows = (appointments || [])
    .filter((a) => inRange(a.date))
    .map((a) => ({
      id: a._id, date: a.date, time: a.time,
      pet: a.petId?.name || '—', reason: a.reason, status: a.status,
    }));

  return (
    <>
      <PageHeading eyebrow="MY SCHEDULE" title="My calendar" />
      <Panel title="Calendar" action={
        <select className="table-select" value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
      }>
        <DataTable columns={[
          { key: 'date', label: 'Date', render: (row) => dateLabel(row.date) },
          { key: 'time', label: 'Time' }, { key: 'pet', label: 'Patient' },
          { key: 'reason', label: 'Reason' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge>{row.status}</StatusBadge> },
        ]} rows={rows} />
      </Panel>
      <Panel title="My availability">
        <div className="profile-summary">
          <div><small>Working days</small><b>{user.availability || 'Contact Admin'}</b></div>
          <div><small>Working hours</small><b>{user.workingHours || 'Contact Admin'}</b></div>
        </div>
      </Panel>
    </>
  );
}

// ─── Doctor Patients ──────────────────────────────────────────────────────────
export function DoctorPatientsPage() {
  const { data: pets, loading } = useApi('/api/pets');
  const { data: appointments } = useApi('/api/appointments');
  const { data: treatments } = useApi('/api/treatments');
  const { user } = useAuth();
  const [query, setQuery] = useState('');

  const myPetIds = new Set(
    (appointments || []).map((a) => String(a.petId?._id || a.petId))
  );

  const patients = (pets || [])
    .filter((p) => myPetIds.has(String(p._id)))
    .map((p) => ({
      id: p._id,
      name: p.name, species: p.species, breed: p.breed, age: p.age,
      owner: p.ownerId?.name || '—', ownerPhone: p.ownerId?.phone || '—',
      visits: (appointments || []).filter((a) => String(a.petId?._id || a.petId) === String(p._id)).length,
      history: (treatments || []).filter((t) => String(t.petId?._id || t.petId) === String(p._id)).length,
    }))
    .filter((p) => `${p.name} ${p.owner} ${p.species}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <PageHeading eyebrow="MY PATIENTS" title="Assigned patients" />
      <Panel title={`${patients.length} patients`} action={<SearchBox value={query} onChange={setQuery} placeholder="Search patients" />}>
        {loading && <p className="portal-empty-message">Loading…</p>}
        <DataTable columns={[
          { key: 'name', label: 'Pet' }, { key: 'species', label: 'Species' }, { key: 'breed', label: 'Breed' },
          { key: 'age', label: 'Age' }, { key: 'owner', label: 'Owner' }, { key: 'ownerPhone', label: 'Contact' },
          { key: 'visits', label: 'Visits' }, { key: 'history', label: 'Records' },
        ]} rows={patients} />
      </Panel>
    </>
  );
}

// ─── Doctor Treatments ────────────────────────────────────────────────────────
export function DoctorTreatmentsPage() {
  const { data: pets } = useApi('/api/pets');
  const { data: appointments } = useApi('/api/appointments');
  const { data: treatments, setData } = useApi('/api/treatments');
  const [form, setForm] = useState({ petId: '', symptoms: '', diagnosis: '', treatment: '', prescription: '', followUpDate: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const myPetIds = new Set((appointments || []).map((a) => String(a.petId?._id || a.petId)));
  const myPets = (pets || []).filter((p) => myPetIds.has(String(p._id)));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const record = await api.post('/api/treatments', {
        petId: form.petId,
        symptoms: form.symptoms,
        diagnosis: form.diagnosis,
        treatment: form.treatment,
        prescription: form.prescription,
        followUpDate: form.followUpDate,
      });
      setData((prev) => [record, ...(prev || [])]);
      setForm({ petId: myPets[0]?._id || '', symptoms: '', diagnosis: '', treatment: '', prescription: '', followUpDate: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      const updated = await api.patch(`/api/treatments/${id}`, { status });
      setData((prev) => prev.map((r) => r._id === id ? { ...r, ...updated } : r));
    } catch (err) {
      alert(err.message);
    }
  }

  const records = (treatments || []).map((r) => ({
    id: r._id,
    date: r.date,
    pet: r.petId?.name || '—',
    symptoms: r.symptoms,
    diagnosis: r.diagnosis,
    prescription: r.prescription,
    followUpDate: r.followUpDate,
    status: r.status,
  }));

  return (
    <>
      <PageHeading eyebrow="CLINICAL NOTES" title="Treatment records" />
      <Panel title="Add treatment record">
        <form className="portal-form" onSubmit={submit}>
          <label>Patient
            <select required value={form.petId} onChange={(e) => setForm({ ...form, petId: e.target.value })}>
              <option value="">Select patient</option>
              {myPets.map((p) => <option key={p._id} value={p._id}>{p.name} · {p.species}</option>)}
            </select>
          </label>
          <label>Symptoms<input value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} required /></label>
          <label>Diagnosis<input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} required /></label>
          <label>Treatment details<input value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} required /></label>
          <label>Prescription<input value={form.prescription} onChange={(e) => setForm({ ...form, prescription: e.target.value })} required /></label>
          <label>Follow-up date<input type="date" min={today()} value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} required /></label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="portal-primary-button" disabled={saving || !myPets.length}>
            {saving ? 'Saving…' : 'Save treatment record'}
          </button>
        </form>
      </Panel>
      <Panel title="My recent records">
        <DataTable columns={[
          { key: 'date', label: 'Date', render: (row) => dateLabel(row.date) },
          { key: 'pet', label: 'Patient' }, { key: 'symptoms', label: 'Symptoms' },
          { key: 'diagnosis', label: 'Diagnosis' }, { key: 'prescription', label: 'Prescription' },
          { key: 'followUpDate', label: 'Follow-up', render: (row) => dateLabel(row.followUpDate) },
          { key: 'status', label: 'Status', render: (row) => (
            <select className="table-select" value={row.status}
              onChange={(e) => updateStatus(row.id, e.target.value)}>
              {['In progress', 'Follow-up due', 'Completed'].map((s) => <option key={s}>{s}</option>)}
            </select>
          )},
        ]} rows={records} />
      </Panel>
    </>
  );
}

// ─── Doctor Notifications ─────────────────────────────────────────────────────
export function DoctorNotificationsPage() {
  const { data: notifications, loading } = useApi('/api/notifications');

  return (
    <>
      <PageHeading eyebrow="MESSAGES" title="My notifications" description="Announcements and messages from hospital administration." />
      {loading && <p className="portal-empty-message">Loading…</p>}
      <div className="portal-notification-list notification-page">
        {(notifications || []).map((item) => (
          <article key={item._id}>
            <span className="notification-icon">!</span>
            <div>
              <b>{item.title}</b>
              <p>{item.message}</p>
              <small>{dateLabel(item.createdAt)} · {item.type}</small>
            </div>
          </article>
        ))}
        {!loading && !(notifications || []).length && (
          <p className="portal-empty-message">No notifications yet.</p>
        )}
      </div>
    </>
  );
}

// ─── Doctor Profile ───────────────────────────────────────────────────────────
export function DoctorProfilePage() {
  const { user } = useAuth();
  return (
    <>
      <PageHeading eyebrow="ACCOUNT" title="My profile" description="Your professional and contact details." />
      <Panel title="Doctor information">
        <div className="profile-summary">
          <div><small>Name</small><b>{user.name}</b></div>
          <div><small>Qualification</small><b>{user.qualification || 'Not provided'}</b></div>
          <div><small>Specialization</small><b>{user.specialization || 'Not provided'}</b></div>
          <div><small>Email</small><b>{user.email}</b></div>
          <div><small>Phone</small><b>{user.phone || 'Not provided'}</b></div>
          <div><small>Working days</small><b>{user.availability || 'Not provided'}</b></div>
          <div><small>Working hours</small><b>{user.workingHours || 'Not provided'}</b></div>
        </div>
        <p className="portal-muted">Contact the Admin to update profile or availability details.</p>
      </Panel>
    </>
  );
}

// ─── Staff Overview ───────────────────────────────────────────────────────────
export function StaffOverview() {
  const { user } = useAuth();
  const { data: appointments } = useApi('/api/appointments');
  const { data: pets } = useApi('/api/pets');

  const appts = appointments || [];
  const todayCount = appts.filter((a) => a.date === today()).length;
  const pendingCount = appts.filter((a) => a.status === 'Pending').length;

  return (
    <>
      <PageHeading eyebrow="STAFF WORKSPACE" title={`Welcome, ${user.name}`} description="Appointment and front-desk coordination." />
      <MetricGrid items={[
        { label: 'Appointments today', value: todayCount },
        { label: 'Pending requests', value: pendingCount },
        { label: 'Registered pets', value: (pets || []).length },
      ]} />
      <Panel title="Appointment management">
        <p className="portal-muted">
          {pendingCount} appointment requests are currently pending. Go to{' '}
          <a href="/staff/appointments">Appointments</a> to review and confirm.
        </p>
      </Panel>
    </>
  );
}

// ─── Staff Appointments ───────────────────────────────────────────────────────
export function StaffAppointmentsPage() {
  const { data: appointments, loading, setData } = useApi('/api/appointments');

  async function updateStatus(id, status) {
    try {
      const updated = await api.patch(`/api/appointments/${id}`, { status });
      setData((prev) => prev.map((a) => a._id === id ? { ...a, ...updated } : a));
    } catch (err) {
      alert(err.message);
    }
  }

  const rows = (appointments || []).map((a) => ({
    id: a._id,
    date: a.date,
    time: a.time,
    pet: a.petId?.name || '—',
    owner: a.ownerId?.name || '—',
    doctor: a.doctorId?.name || '—',
    reason: a.reason,
    status: a.status,
  }));

  return (
    <>
      <PageHeading eyebrow="FRONT DESK" title="Hospital appointments" description="Review requests and update appointment status." />
      <Panel title="Appointments">
        {loading && <p className="portal-empty-message">Loading…</p>}
        <DataTable columns={[
          { key: 'date', label: 'Date', render: (row) => dateLabel(row.date) },
          { key: 'time', label: 'Time' }, { key: 'pet', label: 'Pet' },
          { key: 'owner', label: 'Owner' }, { key: 'doctor', label: 'Doctor' },
          { key: 'reason', label: 'Reason' },
          { key: 'status', label: 'Status', render: (row) => (
            <select className="table-select" value={row.status}
              onChange={(e) => updateStatus(row.id, e.target.value)}>
              {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
            </select>
          )},
        ]} rows={rows} />
      </Panel>
    </>
  );
}
