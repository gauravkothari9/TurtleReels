import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { GROUPS, FAQ, QUOTES, buildDescription, buildTags, buildTitle, media, styles } from './data';
import { PLAN_NAMES } from '../planRows';
import { useStore } from '../store';
import './landing.css';


/** Adds .is-in to every [data-reveal] block as it scrolls into view. Content stays visible without script. */
function useReveal(root) {
  useEffect(() => {
    const el = root.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    el.classList.add('lp-js');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }),
      { rootMargin: '0px 0px -5% 0px', threshold: 0 },
    );
    el.querySelectorAll('[data-reveal]').forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [root]);
}

/** Autoplaying loops pause while off screen, so the page never decodes a dozen videos at once. */
function useOffscreenPause(root) {
  useEffect(() => {
    const el = root.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }), { rootMargin: '200px 0px' });
    const watch = () => el.querySelectorAll('video[autoplay]').forEach((v) => io.observe(v));
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(el, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [root]);
}

function Loop({ src, poster, className = '', alt, eager }) {
  return (
    <video
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      autoPlay
      playsInline
      preload={eager ? 'auto' : 'metadata'}
      aria-label={alt}
    />
  );
}

function Hero() {
  const shutter = useRef(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => shutter.current?.classList.add('is-in'));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <header className="lp-hero" id="top">
      <div className="lp-tile lp-name">
        <h1>
          TurtleReels
          <span>YouTube Shorts on autopilot</span>
        </h1>
      </div>
      <div className="lp-tile lp-hero-shorts">
        <figure className="lp-shutter" ref={shutter}>
          <Loop src="/landing/short.mp4" poster="/landing/short.jpg" alt="A finished Short: a pentagon spiral drawing itself under the quote Be your own masterpiece" eager />
        </figure>
        <figure><Loop src={media('mandala').video} poster={media('mandala').poster} alt="Mandala style drawing itself" eager /></figure>
        <figure><Loop src={media('phyllotaxis').video} poster={media('phyllotaxis').poster} alt="Phyllotaxis style drawing itself" eager /></figure>
      </div>
      <div className="lp-tile lp-hero-long">
        <Loop src="/landing/long.mp4" poster="/landing/long.jpg" alt="A 16:9 long video drawing designs one after another" eager />
        <p className="lp-caption">Long video, 16:9. Designs drawn one after another for up to ten minutes.</p>
      </div>
      <div className="lp-hero-pair">
        <p className="lp-tile lp-statement">
          Python draws a new geometric design for every Short, scores it with original music and posts it to your channel on schedule.
        </p>
        <div className="lp-tile lp-accent-tile">
          <p>52 styles, and no two renders alike. Your first Short is free.</p>
          <Link to="/signup" className="lp-btn lp-btn-dark">Start free</Link>
        </div>
      </div>
    </header>
  );
}

function Faq() {
  const [sel, setSel] = useState(0);
  return (
    <section className="lp-section lp-faq" id="faq" aria-labelledby="faq-h">
      <div className="lp-faq-list" data-reveal>
        <h2 id="faq-h">Fair questions</h2>
        <ul>
          {FAQ.map((f, i) => (
            <li key={f.q} className={sel === i ? 'is-sel' : ''}>
              <button
                type="button"
                aria-expanded={sel === i}
                aria-controls={`faq-a-${i}`}
                onClick={() => setSel(i)}
                onMouseEnter={() => window.matchMedia('(hover: hover) and (min-width: 900px)').matches && setSel(i)}
                onFocus={() => setSel(i)}
              >
                {f.q}
              </button>
              <p className="lp-faq-inline" id={`faq-a-${i}`} hidden={sel !== i}>{f.a}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="lp-faq-pane" aria-live="polite" data-reveal>
        <div key={sel}>
          <h3>{FAQ[sel].q}</h3>
          <p>{FAQ[sel].a}</p>
        </div>
      </div>
    </section>
  );
}

function Close() {
  return (
    <section className="lp-close" aria-labelledby="close-h">
      <div className="lp-tile lp-close-side t-plum" aria-hidden="true" />
      <div className="lp-tile lp-close-main" data-reveal>
        <h2 id="close-h">Put your channel on autopilot</h2>
        <p>Make your free trial Short in a minute. Pick a plan when you want it posting on its own.</p>
        <Link to="/signup" className="lp-btn lp-btn-dark lp-btn-big">Create free account</Link>
      </div>
      <div className="lp-tile lp-close-side lp-close-img">
        <img src={media('chrysanthemum').poster} alt="Chrysanthemum style, finished" loading="lazy" width="360" height="640" />
      </div>
    </section>
  );
}

export function Footer() {
  const letters = 'TURTLEREELS'.split('');
  const heights = [100, 78, 92, 66, 86, 72, 96, 70, 88, 62, 82];
  const tones = ['plum', 'paper', 'accent', 'surface', 'cyan', 'paper', 'surface', 'plum', 'yellow', 'surface', 'accent'];
  return (
    <footer className="lp-footer">
      <div className="lp-blocks" aria-label="TurtleReels" role="img">
        {letters.map((l, i) => (
          <span key={i} className={`t-${tones[i]}`} style={{ height: `${heights[i]}%` }} aria-hidden="true">{l}</span>
        ))}
      </div>
      <div className="lp-foot-cols">
        <div><h3>Product</h3><Link to="/output">Output</Link><Link to="/styles">Styles</Link><Link to="/pricing">Pricing</Link></div>
        <div><h3>Help</h3><Link to="/faq">Questions</Link><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms of Service</Link></div>
        <div><h3>Account</h3><Link to="/signup">Create account</Link><Link to="/login">Log in</Link></div>
        <div className="lp-foot-about">
          <p>Every design on this page was drawn by the TurtleReels engine with Python’s turtle graphics.</p>
          <p>Uploads use the YouTube Data API. YouTube is a trademark of Google LLC.</p>
        </div>
      </div>
      <div className="lp-foot-last">
        <span>© {new Date().getFullYear()} TurtleReels</span>
        <button type="button" className="lp-btn lp-btn-small" onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' })}>Back to top</button>
      </div>
    </footer>
  );
}

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Shared shell: one nav and footer for every public page ---------- */

const NAV = [['/', 'Home'], ['/output', 'Output'], ['/styles', 'Styles'], ['/pricing', 'Pricing'], ['/faq', 'FAQ']];

export function SiteNav() {
  const { pathname } = useLocation();
  const { account } = useStore();
  return (
    <nav className="lp-top" aria-label="Main">
      <Link to="/" className="lp-tile lp-logo" aria-label="TurtleReels home"><img src="/landing/logo-mark.png" alt="" width="46" height="46" /></Link>
      <div className="lp-tile lp-links site-links">
        {NAV.map(([to, label]) => (
          <Link key={to} to={to} aria-current={pathname === to ? 'page' : undefined}>{label}</Link>
        ))}
        {!account && <Link to="/login" className="lp-login">Log in</Link>}
      </div>
      <Link to={account ? '/' : '/signup'} className="lp-tile lp-top-action">{account ? 'Dashboard' : 'Start free'}</Link>
    </nav>
  );
}

function SiteShell({ title, children }) {
  const root = useRef(null);
  useReveal(root);
  useOffscreenPause(root);
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    window.scrollTo(0, 0);
    return () => { document.title = prev; };
  }, [title]);
  return (
    <div className="lp" ref={root}>
      <SiteNav />
      {children}
      <Footer />
    </div>
  );
}

function PageHead({ title, lead, children }) {
  return (
    <header className="lp-page-head">
      <div className="lp-tile lp-page-title">
        <h1>{title}</h1>
      </div>
      <div className="lp-tile lp-page-lead">
        <p>{lead}</p>
        {children}
      </div>
    </header>
  );
}

/* ---------- Home: what lands on the channel ---------- */

// Finished Shorts: the video plus everything uploaded with it. Moods rotate through all four.
const MOOD_NAMES = ['Calm', 'Dreamy', 'Cosmic', 'Upbeat'];
const LENGTHS = [23, 28, 23, 33, 18, 28, 23, 38];
const makeOutputs = (ids) => ids.map((id, i) => {
  const style = styles.find((s) => s.id === id) || styles[i];
  return {
    style, seconds: LENGTHS[i % LENGTHS.length], mood: MOOD_NAMES[i % 4],
    title: buildTitle(style, 'short', i), quote: QUOTES[(i * 5 + 2) % QUOTES.length],
  };
});
const HOME_PICKS = ['mandala', 'chrysanthemum', 'torus_knot', 'golden_spiral'];
const OUTPUT_PICKS = [...HOME_PICKS, 'fractal_tree', 'phyllotaxis', 'barnsley_fern', 'flow_field'];
const HOME_OUTPUTS = makeOutputs(HOME_PICKS);

function Output({ items, heading = true }) {
  const [sel, setSel] = useState(0);
  const pick = items[sel] || items[0];
  const { tags, chars } = useMemo(() => buildTags(pick.style), [pick]);
  const description = buildDescription(pick.style);
  return (
    <section className="lp-section lp-output" aria-labelledby="output-h">
      <div className={`lp-demo-head ${heading ? '' : 'lp-sr'}`} data-reveal>
        <h2 id="output-h">What lands on your channel</h2>
        <p>These are finished uploads, not mock-ups. Each one has its own design, palette, quote and original track, plus a title, description and tags ready for YouTube.</p>
      </div>

      <ul className="lp-out-grid" aria-label="Finished Shorts">
        {items.map((o, i) => {
          const m = media(o.style.id);
          return (
            <li key={o.style.id} data-reveal>
              <button type="button" className="lp-out-card" aria-pressed={sel === i} onClick={() => setSel(i)}>
                <Loop src={m.video} poster={m.poster} alt={`Finished ${o.style.name} Short`} />
                <span className="lp-quote">“{o.quote}”</span>
                <span className="lp-out-meta">
                  <strong>{o.title}</strong>
                  <span>♪ Original {o.mood.toLowerCase()} track · 0:{String(o.seconds).padStart(2, '0')}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="lp-out-row">
        <article className="lp-tile lp-out-details" aria-live="polite" data-reveal>
          <p className="lp-out-kicker">Uploaded with the {pick.style.name} Short</p>
          <dl>
            <div><dt>Title</dt><dd className="lp-out-title">{pick.title}</dd></div>
            <div><dt>Description</dt><dd className="lp-out-desc">{description}</dd></div>
            <div><dt>Tags · {chars} of 500 characters</dt><dd className="lp-out-tags">{tags.slice(0, 12).join(', ')}…</dd></div>
            <div className="lp-out-facts">
              <div><dt>Format</dt><dd>1080×1920, 30 fps</dd></div>
              <div><dt>Length</dt><dd>{pick.seconds} seconds</dd></div>
              <div><dt>Music</dt><dd>{pick.mood}, royalty-free</dd></div>
            </div>
          </dl>
        </article>
        <article className="lp-tile lp-out-long" data-reveal>
          <figure>
            <Loop src="/landing/long.mp4" poster="/landing/long.jpg" alt="Finished long video, designs drawn one after another" />
          </figure>
          <div className="lp-out-long-cap">
            <p className="lp-out-kicker">Long video · 16:9</p>
            <h3>3 Minutes of Satisfying Geometry Drawn by Python Turtle</h3>
            <p>1920×1080 for the watch page. 1 to 10 minutes, a new design every 20 seconds or so, each with its own palette, quote and music.</p>
          </div>
        </article>
      </div>
      <p className="lp-demo-after" data-reveal>
        Want one of these for your channel? <Link to="/signup" className="lp-link">Make your free trial Short</Link>
      </p>
    </section>
  );
}

export function Home() {
  return (
    <SiteShell title="TurtleReels · YouTube Shorts on autopilot">
      <Hero />
      <main className="lp-main">
        <Output items={HOME_OUTPUTS} />
        <Close />
      </main>
    </SiteShell>
  );
}

/* ---------- Styles: all 52 ---------- */

/** Cheapest plan with this style: Basic unlocks the first 5, Pro the first 30, Max the first 50, Max+ all (as the server does). */
const tierOf = (id) => {
  const i = styles.findIndex((s) => s.id === id);
  return i < 5 ? 'basic' : i < 30 ? 'pro' : i < 50 ? 'max' : 'maxplus';
};

function StyleGallery() {
  const [group, setGroup] = useState('All');
  const navigate = useNavigate();
  const list = group === 'All' ? styles : styles.filter((s) => s.group === group);
  const play = (e, on) => {
    const v = e.currentTarget.querySelector('video');
    if (!v) return;
    if (on) v.play().catch(() => {});
    else v.pause();
  };
  return (
    <section className="lp-section lp-wall lp-gallery-section" aria-label="All styles">
      <div className="lp-wall-head">
        <div className="lp-filters" role="group" aria-label="Filter by family">
          {['All', ...GROUPS].map((g) => (
            <button key={g} type="button" aria-pressed={group === g} onClick={() => setGroup(g)}>
              {g}<span>{g === 'All' ? styles.length : styles.filter((s) => s.group === g).length}</span>
            </button>
          ))}
        </div>
      </div>
      <ul className="lp-gallery">
        {list.map((s) => {
          const m = media(s.id);
          return (
            <li key={s.id}>
              <button
                type="button"
                className="lp-style"
                onMouseEnter={(e) => play(e, true)}
                onMouseLeave={(e) => play(e, false)}
                onFocus={(e) => play(e, true)}
                onBlur={(e) => play(e, false)}
                onClick={() => navigate(`/output?style=${s.id}`)}
                aria-label={`${s.name}: ${s.description} See it as a finished Short.`}
              >
                <img src={m.poster} alt="" loading="lazy" width="360" height="640" />
                <video src={m.video} poster={m.poster} muted loop playsInline preload="none" aria-hidden="true" />
                <span className="lp-style-name">{s.name}<small>{PLAN_NAMES[tierOf(s.id)]} plan</small></span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function StylesPage() {
  return (
    <SiteShell title="Styles · TurtleReels">
      <PageHead title="52 styles" lead="Six families: fractals, curves, symmetry, patterns, spirals and waves. Hover to watch one draw, click to see it as a finished Short. Every render is new, so two Shorts of the same style never match." />
      <main className="lp-main">
        <StyleGallery />
        <Close />
      </main>
    </SiteShell>
  );
}

/* ---------- Output: finished videos, no setup ---------- */

export function OutputPage() {
  const [params] = useSearchParams();
  const wanted = params.get('style');
  const ids = styles.some((s) => s.id === wanted) ? [wanted, ...OUTPUT_PICKS.filter((id) => id !== wanted)].slice(0, 8) : OUTPUT_PICKS;
  const key = ids.join();
  const items = useMemo(() => makeOutputs(key.split(',')), [key]);
  return (
    <SiteShell title="Output · TurtleReels">
      <PageHead title="The output" lead="Finished Shorts and long videos exactly as they post to your channel: the video, its quote and music, and the title, description and tags that go with it." />
      <main className="lp-main">
        <Output key={key} items={items} heading={false} />
        <Close />
      </main>
    </SiteShell>
  );
}

/* ---------- FAQ ---------- */

export function FaqPage() {
  return (
    <SiteShell title="FAQ · TurtleReels">
      <PageHead title="Questions" lead="Music, scheduling, long videos, plans and cancelling. Still stuck? Email us from the address on the Privacy Policy." />
      <main className="lp-main">
        <Faq />
        <Close />
      </main>
    </SiteShell>
  );
}

export default Home;
