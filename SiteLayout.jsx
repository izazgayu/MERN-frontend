import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Clock, Mail, MapPin, Menu, Phone, X } from 'lucide-react';

const links = [
  ['Home', '/'],
  ['About', '/about'],
  ['Doctors', '/doctors'],
  ['Services', '/services'],
  ['Availability', '/availability'],
  ['Book Appointment', '/book'],
  ['Contact Us', '/contact'],
];

const pageLabels = {
  '/about': 'About',
  '/doctors': 'Doctors',
  '/services': 'Services',
  '/availability': 'Availability',
  '/book': 'Book Appointment',
  '/contact': 'Contact Us',
  '/faq': 'FAQs',
  '/terms': 'Terms and Conditions',
  '/privacy': 'Privacy Policy',
};

export function Brand() {
  return (
    <Link className="brand" to="/">
      <img src="/logo.svg" alt="" />
      <span>
        <b>GAYATHRI</b>
        <small>VETERINARY HOSPITAL · COIMBATORE</small>
      </span>
    </Link>
  );
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header>
      <div className="nav">
        <Brand />
        <button
          className="toggle"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
        <nav className={isMenuOpen ? 'open' : ''}>
          {links.map(([name, path]) => (
            <NavLink
              end={path === '/'}
              to={path}
              onClick={closeMenu}
              className={name === 'Book Appointment' ? 'nav-book' : undefined}
              key={path}
            >
              {name}
            </NavLink>
          ))}
          <a
            className="navcontact"
            href="tel:+919940749535"
            onClick={closeMenu}
            aria-label="Call +91 99407 49535"
          >
            <Phone size={15} />
            <span>+91 99407 49535</span>
          </a>
          <a
            className="navcontact mail"
            href="mailto:laxgayu2@gmail.com"
            onClick={closeMenu}
            aria-label="Email laxgayu2@gmail.com"
          >
            <Mail size={15} />
            <span>laxgayu2@gmail.com</span>
          </a>
          <Link to="/customer-login" onClick={closeMenu}>
            Customer Login
          </Link>
          <Link className="staff" to="/staff-login" onClick={closeMenu}>
            Admin / Doctor Login ↗
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="foot">
        <div>
          <Brand />
          <p>
            Compassionate care for every paw. Your pet&apos;s health, comfort
            and happiness matter to us.
          </p>
        </div>
        <div>
          <b>Explore</b>
          <Link to="/services">Our services</Link>
          <Link to="/doctors">Meet our doctors</Link>
          <Link to="/availability">Doctor availability</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/terms">Terms and Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
        <div>
          <b>Contact</b>
          <span>
            <MapPin /> Coimbatore, Tamil Nadu
          </span>
          <a href="tel:+919940749535">
            <Phone /> +91 99407 49535
          </a>
          <a href="mailto:laxgayu2@gmail.com">
            <Mail /> laxgayu2@gmail.com
          </a>
          <span>
            <Clock /> Mon–Sat, 9 AM–7 PM
          </span>
        </div>
      </div>
      <small className="copy">
        © 2026 Gayathri Veterinary Hospital · Frontend demo project
      </small>
    </footer>
  );
}

export function Shell({ children }) {
  const { pathname } = useLocation();
  const minimalPage = ['/customer-login', '/customer-signup', '/staff-login', '/forgot-password'].includes(pathname);
  return (
    <>
      {!minimalPage && <Header />}
      {children}
      {!minimalPage && <Footer />}
    </>
  );
}

export function HeroPage({ title, desc }) {
  const { pathname } = useLocation();
  const pageLabel = pageLabels[pathname];

  return (
    <section className="pagehero">
      <div className="wrap">
        <small>GAYATHRI VETERINARY HOSPITAL</small>
        <h1>{pageLabel || title}</h1>
        {pageLabel && pageLabel !== title && <h2 className="pagehero-subtitle">{title}</h2>}
        <p>{desc}</p>
      </div>
    </section>
  );
}
