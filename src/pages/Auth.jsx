import { useEffect, useId, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '../api';
import { useStore } from '../store';
import '../landing/landing.css';
import './auth.css';

function safeNext(params) {
  const next = params.get('next') || '/';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

/** Keeps ?next= when switching between log in and sign up. */
const withNext = (path, params) => (params.get('next') ? `${path}?next=${encodeURIComponent(params.get('next'))}` : path);

function AuthShell({ title, lead, children, aside, switchTo }) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} · TurtleReels`;
    return () => { document.title = prev; };
  }, [title]);
  return (
    <div className="lp lp-auth">
      <nav className="lp-top" aria-label="Main">
        <Link to="/" className="lp-tile lp-logo" aria-label="TurtleReels home">
          <img src="/landing/logo-mark.png" alt="" width="46" height="46" />
        </Link>
        <div className="lp-tile lp-links auth-links">
          <Link to="/">Home</Link>
          <Link to="/pricing">Pricing</Link>
        </div>
        <Link to={switchTo.to} className="lp-tile lp-top-action">{switchTo.label}</Link>
      </nav>
      <main className="auth-board">
        <section className="lp-tile auth-form-tile" aria-labelledby="auth-h">
          <div className="auth-form-inner">
            <h1 id="auth-h">{title}</h1>
            <p className="auth-lead">{lead}</p>
            {children}
          </div>
        </section>
        {aside}
      </main>
    </div>
  );
}

function Field({ label, hint, error, children }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      {children({ id, 'aria-describedby': hintId, 'aria-invalid': error ? true : undefined })}
      {hint && <span className="auth-hint" id={hintId}>{hint}</span>}
    </div>
  );
}

function PasswordInput({ show, onToggle, ...props }) {
  return (
    <span className="auth-password">
      <input type={show ? 'text' : 'password'} {...props} />
      <button type="button" onClick={onToggle} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </span>
  );
}

const MINIS = [['mandala', 'Mandala'], ['phyllotaxis', 'Golden Phyllotaxis'], ['chrysanthemum', 'Chrysanthemum']];

function ShortAside({ text, children }) {
  return (
    <aside className="auth-aside" aria-label="About TurtleReels">
      <figure className="lp-tile auth-video">
        <video src="/landing/short.mp4" poster="/landing/short.jpg" muted loop autoPlay playsInline aria-label="A finished Short: a pentagon spiral drawing itself" />
      </figure>
      <ul className="auth-minis" aria-label="Three of the 52 styles">
        {MINIS.map(([id, name]) => (
          <li key={id} className="lp-tile">
            <video src={`/landing/styles/${id}.mp4`} poster={`/landing/styles/${id}.jpg`} muted loop autoPlay playsInline aria-label={`${name} style drawing itself`} />
            <span>{name}</span>
          </li>
        ))}
      </ul>
      <div className="lp-tile auth-note">
        <p>{text}</p>
        {children}
      </div>
    </aside>
  );
}

export function Login() {
  const { account, setAccount } = useStore();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (account) return <Navigate to={safeNext(params)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      setAccount(await api.login(form));
      navigate(safeNext(params), { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Log in to TurtleReels"
      lead="Welcome back. Your schedules kept posting while you were away."
      switchTo={{ to: withNext('/signup', params), label: 'Create account' }}
      aside={<ShortAside text="Every Short is drawn fresh by code, set to original music and posted on your schedule." />}
    >
      <form className="auth-form" onSubmit={submit}>
        <Field label="Email">
          {(a) => <input {...a} type="email" value={form.email} autoComplete="email" required autoFocus
            onChange={(e) => setForm({ ...form, email: e.target.value })} />}
        </Field>
        <Field label="Password">
          {(a) => <PasswordInput {...a} show={show} onToggle={() => setShow((s) => !s)} value={form.password}
            autoComplete="current-password" required onChange={(e) => setForm({ ...form, password: e.target.value })} />}
        </Field>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="lp-btn auth-submit" disabled={busy}>
          {busy && <Loader2 className="spin" size={18} />} {busy ? 'Logging in' : 'Log in'}
        </button>
        <p className="auth-switch">New here? <Link to={withNext('/signup', params)} className="lp-link">Create a free account</Link></p>
      </form>
    </AuthShell>
  );
}

export function Signup() {
  const { account, setAccount } = useStore();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', agree: false });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (account) return <Navigate to={safeNext(params)} replace />;
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const longEnough = form.password.length >= 8;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!longEnough) return setError('Password must be at least 8 characters');
    if (!form.agree) return setError('Please accept the terms to continue');
    setBusy(true);
    try {
      setAccount(await api.signup({ name: form.name, email: form.email, password: form.password }));
      navigate(safeNext(params), { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your free account"
      lead="No card needed. Make one trial Short, then pick a plan when you want it posting on its own."
      switchTo={{ to: withNext('/login', params), label: 'Log in' }}
      aside={(
        <ShortAside text="What the free account includes">
          <dl className="auth-free">
            <div><dt>Shorts</dt><dd>One trial Short</dd></div>
            <div><dt>Styles</dt><dd>Browse all 52</dd></div>
            <div><dt>Watermark</dt><dd>Yes, on the trial</dd></div>
            <div><dt>Plans</dt><dd>From ₹2,000 a month</dd></div>
          </dl>
        </ShortAside>
      )}
    >
      <form className="auth-form" onSubmit={submit}>
        <Field label="Name">
          {(a) => <input {...a} value={form.name} autoComplete="name" required autoFocus maxLength={80}
            onChange={(e) => set({ name: e.target.value })} />}
        </Field>
        <Field label="Email">
          {(a) => <input {...a} type="email" value={form.email} autoComplete="email" required
            onChange={(e) => set({ email: e.target.value })} />}
        </Field>
        <Field label="Password" hint={form.password && longEnough ? 'Good length' : 'At least 8 characters'}>
          {(a) => <PasswordInput {...a} show={show} onToggle={() => setShow((s) => !s)} value={form.password}
            autoComplete="new-password" required minLength={8} onChange={(e) => set({ password: e.target.value })} />}
        </Field>
        <label className="auth-check">
          <input type="checkbox" checked={form.agree} onChange={(e) => set({ agree: e.target.checked })} />
          <span>I agree to the Terms of Service and Privacy Policy</span>
        </label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="lp-btn auth-submit" disabled={busy}>
          {busy && <Loader2 className="spin" size={18} />} {busy ? 'Creating account' : 'Create free account'}
        </button>
        <p className="auth-switch">Already have an account? <Link to={withNext('/login', params)} className="lp-link">Log in</Link></p>
      </form>
    </AuthShell>
  );
}
