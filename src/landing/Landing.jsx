import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { FALLBACK_PLANS, FAQ, GROUPS, MOODS, QUOTES, buildTags, buildTitle, media, styles } from './data';
import { FREE_PLAN, PLAN_NAMES, PLAN_ROWS } from '../planRows';
import './landing.css';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

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

const NAV = [['demo', 'Try it'], ['styles', 'Styles'], ['pricing', 'Pricing'], ['faq', 'FAQ']];

function TopRow() {
  const [active, setActive] = useState('');
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', ...NAV.map(([id]) => id)].forEach((id) => { const n = document.getElementById(id); if (n) io.observe(n); });
    return () => io.disconnect();
  }, []);
  return (
    <nav className="lp-top" aria-label="Main">
      <a href="#top" className="lp-tile lp-logo" aria-label="TurtleReels home"><img src="/landing/logo-mark.png" alt="" width="46" height="46" /></a>
      <div className="lp-tile lp-links">
        {NAV.map(([id, label]) => (
          <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined}>{label}</a>
        ))}
        <Link to="/login" className="lp-login">Log in</Link>
      </div>
      <Link to="/signup" className="lp-tile lp-top-action">Start free</Link>
    </nav>
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

function Demo({ styleId, setStyleId }) {
  const [format, setFormat] = useState('short');
  const [mood, setMood] = useState('dreamy');
  const [drawSeconds, setDrawSeconds] = useState(20);
  const [visibility, setVisibility] = useState('public');
  const [time, setTime] = useState('18:00');
  const [perSlot, setPerSlot] = useState(1);
  const [minutes, setMinutes] = useState(3);
  const [seed, setSeed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audio = useRef(null);

  const style = styles.find((s) => s.id === styleId) || styles[0];
  const idx = styles.indexOf(style);
  const title = buildTitle(style, format, seed, minutes);
  const { tags, chars } = useMemo(() => buildTags(style), [style]);
  const quote = QUOTES[(seed + idx) % QUOTES.length];
  const length = format === 'short' ? `${drawSeconds + 3} seconds` : `${minutes} minute${minutes > 1 ? 's' : ''}`;
  const designs = format === 'long' ? Math.max(1, Math.round((minutes * 60) / (drawSeconds + 3))) : 1;
  const renderLead = format === 'short' ? 20 : 20 + 4 * minutes;

  const step = (d) => {
    setStyleId(styles[(idx + d + styles.length) % styles.length].id);
    setSeed((s) => s + 1);
  };

  const toggleMusic = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else {
      a.pause();
      setPlaying(false);
    }
  };
  useEffect(() => {
    const a = audio.current;
    if (a && playing) {
      a.load();
      a.play().catch(() => setPlaying(false));
    }
  }, [mood]); // eslint-disable-line react-hooks/exhaustive-deps

  const m = media(style.id);
  const publishNote = visibility === 'public'
    ? `Uploaded as private, then YouTube makes it public at ${time} on the minute.`
    : `Held on our server and uploaded as ${visibility} at ${time}.`;

  return (
    <section className="lp-section lp-demo" id="demo" aria-labelledby="demo-h">
      <div className="lp-demo-head" data-reveal>
        <h2 id="demo-h">Set up a Short</h2>
        <p>Change any setting and the Short, its title and its upload plan change with it. This is what the platform sends to YouTube.</p>
      </div>
      <div className="lp-panel" data-reveal>
        <div className={`lp-stage ${format}`}>
          <div className="lp-frame">
            <video key={style.id} src={m.video} poster={m.poster} muted loop autoPlay playsInline aria-label={`${style.name} style drawing itself`} />
            <span className="lp-quote">“{quote}”</span>
          </div>
          <div className="lp-upload" data-ui>
            <p className="lp-upload-title">{title}</p>
            <dl>
              <div><dt>Style</dt><dd>{style.name} · {style.group}</dd></div>
              <div><dt>Length</dt><dd>{length}{format === 'long' ? `, ${designs} designs` : ''}</dd></div>
              <div><dt>Music</dt><dd>Original {mood} track</dd></div>
              <div><dt>Rendering starts</dt><dd>{renderLead} minutes before {time}</dd></div>
              <div><dt>Publishing</dt><dd>{publishNote}</dd></div>
            </dl>
            <p className="lp-tags"><span>{chars} of 500 tag characters</span>{tags.slice(0, 9).join(', ')}…</p>
          </div>
        </div>
        <div className="lp-controls" data-ui>
          <div className="lp-row">
            <label htmlFor="d-style">Style</label>
            <div className="lp-stepper">
              <button type="button" onClick={() => step(-1)} aria-label="Previous style">‹</button>
              <select id="d-style" value={style.id} onChange={(e) => { setStyleId(e.target.value); setSeed((s) => s + 1); }}>
                {GROUPS.map((g) => (
                  <optgroup key={g} label={g}>
                    {styles.filter((s) => s.group === g).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </optgroup>
                ))}
              </select>
              <button type="button" onClick={() => step(1)} aria-label="Next style">›</button>
            </div>
          </div>
          <div className="lp-row">
            <span id="d-format">Format</span>
            <div className="lp-seg" role="group" aria-labelledby="d-format">
              <button type="button" aria-pressed={format === 'short'} onClick={() => setFormat('short')}>Short 9:16</button>
              <button type="button" aria-pressed={format === 'long'} onClick={() => setFormat('long')}>Long 16:9</button>
            </div>
          </div>
          {format === 'long' ? (
            <div className="lp-row">
              <label htmlFor="d-min">Length</label>
              <select id="d-min" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
                {[1, 2, 3, 5, 10].map((n) => <option key={n} value={n}>{n} min</option>)}
              </select>
            </div>
          ) : null}
          <div className="lp-row">
            <label htmlFor="d-draw">Drawing time</label>
            <div className="lp-range">
              <input id="d-draw" type="range" min="10" max="40" step="5" value={drawSeconds} onChange={(e) => setDrawSeconds(Number(e.target.value))} />
              <output htmlFor="d-draw">{drawSeconds}s</output>
            </div>
          </div>
          <div className="lp-row lp-row-mood">
            <span id="d-mood">Music</span>
            <div className="lp-seg lp-seg-4" role="group" aria-labelledby="d-mood">
              {MOODS.map((x) => (
                <button key={x.id} type="button" aria-pressed={mood === x.id} onClick={() => setMood(x.id)}>{x.name}</button>
              ))}
            </div>
            <button type="button" className="lp-play" onClick={toggleMusic} aria-pressed={playing}>
              {playing ? 'Pause sample' : `Hear ${mood}`}
            </button>
            <audio ref={audio} src={`/landing/music/${mood}.mp3`} preload="none" onEnded={() => setPlaying(false)} />
          </div>
          <div className="lp-row">
            <label htmlFor="d-vis">Visibility</label>
            <select id="d-vis" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="lp-row">
            <label htmlFor="d-time">Publish at</label>
            <input id="d-time" type="time" value={time} onChange={(e) => setTime(e.target.value || '18:00')} />
          </div>
          <div className="lp-row">
            <span id="d-slot">Per slot</span>
            <div className="lp-seg" role="group" aria-labelledby="d-slot">
              {[1, 2, 3].map((n) => (
                <button key={n} type="button" aria-pressed={perSlot === n} onClick={() => setPerSlot(n)}>{n}</button>
              ))}
            </div>
          </div>
          <div className="lp-controls-foot">
            <button type="button" className="lp-link" onClick={() => setSeed((s) => s + 1)}>New title and quote</button>
            <span>{perSlot * 7} Shorts a week at this pace</span>
          </div>
        </div>
      </div>
      <p className="lp-demo-after" data-reveal>
        Ready to post it for real? <Link to="/signup" className="lp-link">Make your free trial Short</Link>
      </p>
    </section>
  );
}

function Stages() {
  const stages = [
    { grow: 2, dur: 'Two minutes', text: 'First, sign in with Google and pick the channel to post to.', tone: 'paper' },
    { grow: 1, dur: 'One minute', text: 'Then choose days, times, styles and how many Shorts per slot.', tone: 'plum' },
    { grow: 20, dur: 'Twenty minutes before each slot', text: 'Next, the server draws, scores, titles and tags every Short ahead of time.', tone: 'surface' },
    { grow: 1, dur: 'On the minute', text: 'Finally, YouTube publishes it at the exact time you set.', tone: 'accent' },
  ];
  return (
    <section className="lp-section lp-stages" aria-labelledby="stages-h">
      <h2 id="stages-h" data-reveal>Set it once, then wait</h2>
      <ol className="lp-bar" data-ui data-reveal>
        {stages.map((s, i) => (
          <li key={s.dur} style={{ '--grow': s.grow, '--i': i }} className={`lp-seg-${s.tone}`}>
            <div className="lp-bar-block"><span>{s.dur}</span></div>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Features() {
  const [auto, setAuto] = useState(true);
  return (
    <section className="lp-section lp-features" aria-labelledby="features-h">
      <div className="lp-mosaic">
        <div className="lp-tile f-head" data-reveal><h2 id="features-h">What runs for you</h2></div>

        <div className="lp-tile f-sched t-plum" data-reveal>
          <div className="f-ui" data-ui aria-hidden="true"><span className="f-status">Scheduled</span><span className="f-when">Fri 18:00 IST</span></div>
          <div className="f-cap"><h3>Exact-time publishing</h3><p>Public Shorts carry YouTube’s publish time, so they go live even while our server sleeps.</p></div>
        </div>

        <div className="lp-tile f-auto t-paper" data-reveal>
          <button type="button" className="f-ui f-toggle" data-ui role="switch" aria-checked={auto} onClick={() => setAuto((a) => !a)} aria-label="Auto upload">
            <span className="f-track"><span className="f-knob" /></span>
          </button>
          <div className="f-cap"><h3>Auto upload</h3><p>Finished Shorts go straight to your channel with title, description and tags filled in.</p></div>
        </div>

        <div className="lp-tile f-music t-surface" data-reveal>
          <div className="f-ui f-keys" data-ui aria-hidden="true">{MOODS.map((x) => <kbd key={x.id}>{x.name}</kbd>)}</div>
          <div className="f-cap"><h3>Original music</h3><p>A new track for every Short in one of four moods. Nothing for Content ID to claim.</p></div>
        </div>

        <div className="lp-tile f-long t-image" data-reveal>
          <img src={media('torus_knot').poster} alt="Torus knot style, finished" loading="lazy" width="360" height="640" />
          <div className="f-cap"><h3>Long videos</h3><p>One to ten minutes, 16:9, for the watch page.</p></div>
        </div>

        <div className="lp-tile f-tags t-paper" data-reveal>
          <div className="f-ui f-figure" data-ui aria-hidden="true">480<small>/500</small></div>
          <div className="f-cap"><h3>Tags that fit</h3><p>Your tags first, kept under YouTube’s limit.</p></div>
        </div>

        <div className="lp-tile f-slot t-surface" data-reveal>
          <div className="f-ui f-slider" data-ui aria-hidden="true"><span className="f-rail"><span className="f-fill" /><span className="f-thumb" /></span><span>3 per slot</span></div>
          <div className="f-cap"><h3>Up to three per slot</h3><p>Post more without more work.</p></div>
        </div>

        <div className="lp-tile f-quote t-plum" data-reveal>
          <div className="f-ui f-chip" data-ui aria-hidden="true">“Nothing blooms in a hurry.”</div>
          <div className="f-cap"><h3>A quote on every Short</h3><p>120 lines, never repeated recently.</p></div>
        </div>

        <div className="lp-tile f-catch t-surface" data-reveal>
          <div className="f-ui f-figure" data-ui aria-hidden="true">+2<small>h</small></div>
          <div className="f-cap"><h3>Missed-slot catch-up</h3><p>A slot missed by up to two hours still runs.</p></div>
        </div>
      </div>
    </section>
  );
}

// Seven picks shown on the landing page, one or more from each family.
const PICKS = ['fractal_spiral', 'mandala', 'chrysanthemum', 'phyllotaxis', 'torus_knot', 'barnsley_fern', 'flow_field'];

/** Cheapest plan with this style: Basic unlocks the first 5, Pro the first 30, Max all (as the server does). */
const tierOf = (id) => {
  const i = styles.findIndex((s) => s.id === id);
  return i < 5 ? 'basic' : i < 30 ? 'pro' : 'max';
};

function StyleWall({ onPick }) {
  const list = PICKS.map((id) => styles.find((s) => s.id === id)).filter(Boolean);
  const play = (e, on) => {
    const v = e.currentTarget.querySelector('video');
    if (!v) return;
    if (on) v.play().catch(() => {});
    else v.pause();
  };
  return (
    <section className="lp-section lp-wall" id="styles" aria-labelledby="styles-h">
      <div className="lp-wall-head" data-reveal>
        <h2 id="styles-h">A few of the 52 styles</h2>
        <p>Seven picks from six families: fractals, curves, symmetry, patterns, spirals and waves.</p>
      </div>
      <ul className="lp-wall-grid">
        {list.map((s) => {
          const m = media(s.id);
          return (
            <li key={s.id} data-reveal>
              <button
                type="button"
                className="lp-style"
                onMouseEnter={(e) => play(e, true)}
                onMouseLeave={(e) => play(e, false)}
                onFocus={(e) => play(e, true)}
                onBlur={(e) => play(e, false)}
                onClick={() => onPick(s.id)}
                aria-label={`${s.name}: ${s.description} Load it in the setup above.`}
              >
                <img src={m.poster} alt="" loading="lazy" width="360" height="640" />
                <video src={m.video} poster={m.poster} muted loop playsInline preload="none" aria-hidden="true" />
                <span className="lp-style-name">{s.name}<small>{PLAN_NAMES[tierOf(s.id)]} plan</small></span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="lp-wall-foot" data-reveal>
        All 52 are in the app. <Link to="/signup" className="lp-link">Make a free account to browse them</Link>
      </p>
    </section>
  );
}

function Pricing() {
  const [plans, setPlans] = useState(null);
  useEffect(() => {
    api.plans()
      .then((d) => setPlans((d?.plans || []).filter((p) => p.monthly > 0).length ? d.plans.filter((p) => p.monthly > 0) : FALLBACK_PLANS))
      .catch(() => setPlans(FALLBACK_PLANS));
  }, []);
  const list = plans || FALLBACK_PLANS;
  const cols = [FREE_PLAN, ...list];
  const recommended = list.find((p) => p.id === 'pro')?.id || list[Math.floor(list.length / 2)]?.id;
  const rows = PLAN_ROWS;

  return (
    <section className="lp-section lp-pricing" id="pricing" aria-labelledby="pricing-h">
      <div className="lp-table-wrap" data-reveal>
        <table className="lp-table" style={{ '--cols': cols.length }}>
          <thead>
            <tr>
              <th scope="col"><h2 id="pricing-h">Pick your pace</h2></th>
              {cols.map((p) => (
                <th scope="col" key={p.id} className={p.id === recommended ? 'is-rec' : ''}>
                  <span className="lp-plan">{p.name}</span>
                  <span className="lp-price">{p.free ? '₹0' : inr(p.monthly)}</span>
                  <span className="lp-period">{p.free ? 'forever' : 'a month'}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, fn]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {cols.map((p) => <td key={p.id} className={p.id === recommended ? 'is-rec' : ''}>{fn(p)}</td>)}
              </tr>
            ))}
            <tr className="lp-table-actions">
              <th scope="row"><span className="lp-sr">Choose</span></th>
              {cols.map((p) => (
                <td key={p.id} className={p.id === recommended ? 'is-rec' : ''}>
                  <Link to={p.free ? '/signup' : `/signup?next=${encodeURIComponent('/pricing')}`} className={`lp-btn ${p.id === recommended ? 'lp-btn-dark' : ''}`}>
                    {p.free ? 'Start free' : `Choose ${p.name}`}
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="lp-plan-stack">
        <h2>Pick your pace</h2>
        {cols.map((p) => (
          <article key={p.id} className={`lp-plan-block ${p.id === recommended ? 'is-rec' : ''}`} data-reveal>
            <h3>{p.name} <span>{p.free ? '₹0' : `${inr(p.monthly)}/mo`}</span></h3>
            <dl>
              {rows.map(([label, fn]) => (
                <div key={label}><dt>{label}</dt><dd>{fn(p)}</dd></div>
              ))}
            </dl>
            <Link to="/signup" className={`lp-btn ${p.id === recommended ? 'lp-btn-dark' : ''}`}>{p.free ? 'Start free' : `Choose ${p.name}`}</Link>
          </article>
        ))}
      </div>
      <p className="lp-note" data-reveal>Prices in Indian rupees, billed through Razorpay. A year costs the same as five months.</p>
    </section>
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

function Footer() {
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
        <div><h3>Product</h3><a href="#demo">Try the setup</a><a href="#styles">Styles</a><a href="#pricing">Pricing</a></div>
        <div><h3>Help</h3><a href="#faq">Questions</a><Link to="/pricing">Plans and billing</Link></div>
        <div><h3>Account</h3><Link to="/signup">Create account</Link><Link to="/login">Log in</Link></div>
        <div className="lp-foot-about">
          <p>Every design on this page was drawn by the TurtleReels engine with Python’s turtle graphics.</p>
          <p>Uploads use the YouTube Data API. YouTube is a trademark of Google LLC.</p>
        </div>
      </div>
      <div className="lp-foot-last">
        <span>© {new Date().getFullYear()} TurtleReels</span>
        <a href="#top" className="lp-btn lp-btn-small">Back to top</a>
      </div>
    </footer>
  );
}

export default function Landing() {
  const root = useRef(null);
  const [styleId, setStyleId] = useState('golden_spiral');
  useReveal(root);
  useOffscreenPause(root);
  useEffect(() => {
    const prev = document.title;
    document.title = 'TurtleReels · YouTube Shorts on autopilot';
    return () => { document.title = prev; };
  }, []);
  const pick = (id) => {
    setStyleId(id);
    document.getElementById('demo')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  return (
    <div className="lp" ref={root}>
      <TopRow />
      <Hero />
      <main className="lp-main">
        <Demo styleId={styleId} setStyleId={setStyleId} />
        <Stages />
        <Features />
        <StyleWall onPick={pick} />
        <Pricing />
        <Faq />
        <Close />
      </main>
      <Footer />
    </div>
  );
}
