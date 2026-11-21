import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/DemoContext.jsx';
import { api } from '../services/api.js';

const speciesOptions = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'];
const cityOptions = [
  'Coimbatore', 'Chennai', 'Madurai', 'Salem', 'Tiruchirappalli',
  'Erode', 'Tiruppur', 'Other – Tamil Nadu',
];
const paymentOptions = ['UPI', 'Cash', 'Card'];
const timeOptions = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
];

const initialForm = {
  ownerName: '',
  phone: '',
  pet: '',
  species: 'Dog',
  doctor: '',
  date: '',
  time: '',
  city: 'Coimbatore',
  payment: 'UPI',
  reason: '',
};

export default function AppointmentForm({ doctors }) {
  const { user } = useAuth();
  const [doctors_api, setDoctorsApi] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill name and phone from logged-in user (safe even if phone is undefined)
  useEffect(() => {
    setForm((current) => ({
      ...current,
      ownerName: user?.name || '',
      phone: (user?.phone || '').replace(/^\+91\s*/, ''),
    }));
  }, [user]);

  // Load real doctors from the public endpoint (no auth needed)
  useEffect(() => {
    api.get('/api/users/doctors-public')
      .then((data) => setDoctorsApi(Array.isArray(data) ? data : []))
      .catch(() => {
        // Fall back to the static doctor list passed as prop
        if (doctors?.length) {
          setDoctorsApi(doctors.map(([name], i) => ({ _id: '', name })));
        }
      });
  }, []);

  const today = new Date();
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ownerName: form.ownerName,
        ownerPhone: form.phone ? `+91 ${form.phone}` : '',
        ownerCity: form.city,
        petName: form.pet.trim(),
        species: form.species,
        doctorId: form.doctor || undefined,
        date: form.date,
        time: form.time,
        reason: form.reason.trim() || 'Appointment request',
        payment: form.payment,
        city: form.city,
      };

      const appointment = await api.post('/api/appointments', payload);
      setSubmitted(appointment);
    } catch (err) {
      setError(err.message || 'Could not submit appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <section className="wrap section formsplit">
        <aside>
          <h2>Appointment request</h2>
          <p><a href="tel:+919940749535">☎ +91 99407 49535</a></p>
          <p><a href="mailto:laxgayu2@gmail.com">✉ laxgayu2@gmail.com</a></p>
          <p>◷ Mon–Sat, 9 AM–7 PM</p>
          <p>⌖ Coimbatore, Tamil Nadu</p>
        </aside>
        <div className="formcard">
          <div className="success">
            <CheckCircle2 size={48} />
            <h2>Appointment request submitted!</h2>
            <p>
              Your request for <strong>{submitted.petId?.name || form.pet}</strong> on{' '}
              <strong>{submitted.date}</strong> at <strong>{submitted.time}</strong> has been
              saved and is now <strong>Pending</strong> confirmation.
            </p>
            <p>Request ID: {submitted._id}</p>
            <p>Preferred payment: {submitted.payment}</p>
            <p className="muted">
              The hospital team will confirm your appointment by phone or email.
            </p>
            <button className="btn" onClick={() => { setSubmitted(null); setForm(initialForm); }}>
              Submit another request
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="wrap section formsplit">
      <aside>
        <h2>Appointment request</h2>
        <p>Fill in the form and our team will confirm your appointment.</p>
        <p><a href="tel:+919940749535">☎ +91 99407 49535</a></p>
        <p><a href="mailto:laxgayu2@gmail.com">✉ laxgayu2@gmail.com</a></p>
        <p>◷ Mon–Sat, 9 AM–7 PM</p>
        <p>⌖ Coimbatore, Tamil Nadu</p>
      </aside>
      <div className="formcard">
        <form onSubmit={submitForm} className="formgrid">
          <label>
            Pet owner&apos;s name *
            <input required name="ownerName" value={form.ownerName} onChange={updateField} placeholder="Your full name" />
          </label>
          <label>
            Mobile number *
            <div className="phone">
              <span>+91</span>
              <input
                required name="phone" type="tel" inputMode="numeric"
                pattern="[6-9][0-9]{9}" maxLength="10"
                value={form.phone} onChange={updateField} placeholder="10-digit number"
              />
            </div>
          </label>
          <label>
            Pet&apos;s name *
            <input required name="pet" value={form.pet} onChange={updateField} placeholder="e.g. Bruno" />
          </label>
          <label>
            Animal type
            <select name="species" value={form.species} onChange={updateField}>
              {speciesOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>
            Preferred doctor
            <select name="doctor" value={form.doctor} onChange={updateField}>
              <option value="">Any available doctor</option>
              {doctors_api.map((d) => (
                <option key={d._id || d.id} value={d._id || d.id}>{d.name}</option>
              ))}
            </select>
          </label>
          <label>
            Preferred date *
            <input required type="date" min={minDate} name="date" value={form.date} onChange={updateField} />
          </label>
          <label>
            Preferred time (IST) *
            <select required name="time" value={form.time} onChange={updateField}>
              <option value="">Select time</option>
              {timeOptions.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>
            City / district
            <select name="city" value={form.city} onChange={updateField}>
              {cityOptions.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>
            Preferred payment method
            <select name="payment" value={form.payment} onChange={updateField}>
              {paymentOptions.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label className="wide">
            Reason for visit
            <textarea name="reason" value={form.reason} onChange={updateField} placeholder="Tell us how we can help…" />
          </label>
          <button className="btn wide" disabled={loading}>
            {loading ? 'Submitting…' : 'Send appointment request →'}
          </button>
          {error && <p className="login-error wide" role="alert">{error}</p>}
        </form>
      </div>
    </section>
  );
}
