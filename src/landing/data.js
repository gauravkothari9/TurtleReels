import styles from './styles.json';

export { styles };

export const GROUPS = ['Fractals', 'Curves', 'Symmetry', 'Patterns', 'Spirals & Vortex', 'Waves & Flow'];

export const media = (id) => ({ video: `/landing/styles/${id}.mp4`, poster: `/landing/styles/${id}.jpg` });

export const MOODS = [
  { id: 'calm', name: 'Calm' },
  { id: 'dreamy', name: 'Dreamy' },
  { id: 'upbeat', name: 'Upbeat' },
  { id: 'cosmic', name: 'Cosmic' },
];

// A sample of engine/quotes.json: one of these sits on top of every Short.
export const QUOTES = [
  'Small steps still count.', 'Calm is a superpower.', 'Keep going. It gets better.', 'Trust the process.',
  'Nothing blooms in a hurry.', 'Progress over perfection.', 'Beautiful things take time.', 'Stay curious.',
  'Protect your peace.', 'Keep showing up.', 'Start where you are.', 'Growth is quiet.', 'Breathe. Let it unfold.',
  'Be your own masterpiece.',
];

// Same list and limit as server/src/services/metadata.js, so the demo shows what the platform really sends.
const HIGH_VOLUME_TAGS = [
  'shorts', 'satisfying', 'oddly satisfying', 'satisfying video', 'geometry', 'generative art',
  'python', 'python turtle', 'coding', 'programming', 'creative coding', 'math art', 'digital art',
  'relaxing', 'hypnotic', 'trending', 'viral shorts', 'art',
];
const YT_TAG_LIMIT = 480;

export function buildTags(style) {
  const out = [];
  const seen = new Set();
  let used = 0;
  for (const raw of [...style.hashtags, ...HIGH_VOLUME_TAGS]) {
    const tag = raw.trim();
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    const cost = tag.length + (tag.includes(' ') ? 2 : 0) + (out.length ? 1 : 0);
    if (used + cost > YT_TAG_LIMIT) break;
    seen.add(key);
    out.push(tag);
    used += cost;
  }
  return { tags: out, chars: used };
}

export function buildTitle(style, format, seed, minutes) {
  if (format === 'long') {
    const length = `${minutes} Minute${minutes > 1 ? 's' : ''}`;
    return seed % 2 ? `${length} of Satisfying ${style.name} Drawn by Python Turtle` : `Satisfying ${style.name} Compilation | ${length} of Code Art`;
  }
  const generic = [
    `${style.name} Drawn by Python Turtle`,
    `Satisfying ${style.name} Animation`,
    `Watch This ${style.name} Form`,
    `${style.name} Made With Pure Code`,
  ];
  const all = [...style.titles, ...generic];
  return `${all[seed % all.length]} #shorts`.slice(0, 100);
}

// Fallback when the plans API is unreachable; the live page reads /api/billing/plans.
export const FALLBACK_PLANS = [
  { id: 'basic', name: 'Basic', monthly: 2000, yearly: 10000, shortsPerPeriod: 15, schedules: 1, timesPerDay: 1, perSlot: 1, everyOtherDay: true,
    styles: 5, totalStyles: 52, ownMusic: false, musicTracks: 0, priority: false },
  { id: 'pro', name: 'Pro', monthly: 3000, yearly: 15000, shortsPerPeriod: 270, schedules: 3, timesPerDay: 3, perSlot: 3, everyOtherDay: false,
    styles: 30, totalStyles: 52, ownMusic: true, musicTracks: 2, priority: false },
  { id: 'max', name: 'Max', monthly: 5000, yearly: 25000, shortsPerPeriod: 750, schedules: 5, timesPerDay: 5, perSlot: 5, everyOtherDay: false,
    styles: 50, totalStyles: 52, ownMusic: true, musicTracks: null, priority: true },
  { id: 'maxplus', name: 'Max+', monthly: 10000, yearly: 50000, shortsPerPeriod: 1680, schedules: 8, timesPerDay: 8, perSlot: 7, everyOtherDay: false,
    styles: 52, totalStyles: 52, ownMusic: true, musicTracks: null, priority: true },
  { id: 'ultra', name: 'Ultra', monthly: 15000, yearly: 75000, shortsPerPeriod: 3600, schedules: 12, timesPerDay: 12, perSlot: 10, everyOtherDay: false,
    styles: 52, totalStyles: 52, ownMusic: true, musicTracks: null, priority: true },
];

export const FAQ = [
  {
    q: 'Will YouTube claim the music?',
    a: 'No. Each track is composed for that one Short from a random key, chords and tempo, so it is original and royalty-free. Content ID has nothing to match it against.',
  },
  {
    q: 'Does my computer need to stay on?',
    a: 'No. Rendering and uploading run on our server. Public Shorts are handed to YouTube with a publish time, so YouTube itself makes them public on the minute.',
  },
  {
    q: 'Is every video different?',
    a: 'Yes. Every render draws its design from a fresh random seed and palette, picks a quote it has not used recently and writes a new track. Two Shorts of the same style never match.',
  },
  {
    q: 'Can I make long videos too?',
    a: 'Yes. Switch the format to 16:9 and choose 1, 2, 3, 5 or 10 minutes. Designs are drawn one after another, each with its own palette, quote and music. A long video uses one Short per minute.',
  },
  {
    q: 'What if a slot is missed?',
    a: 'If the server is down at slot time, a slot missed by up to two hours still runs as soon as it is back. Older slots are skipped so your channel never gets a burst of stale posts.',
  },
  {
    q: 'Can I use my own music?',
    a: 'On Pro you can upload 2 tracks you hold the rights to, and on Max as many as you like. Each Short then takes a random one from your library: short tracks loop and long ones are trimmed.',
  },
  {
    q: 'What does the free account include?',
    a: 'You can browse every style and make one watermarked trial Short. Uploading, scheduling and more Shorts come with a plan.',
  },
  {
    q: 'Can I cancel?',
    a: 'Any time, from Plan & billing. A cancelled plan keeps working until the end of the period you paid for.',
  },
];

// Same shape as the Short description in server/src/services/metadata.js (without the user's own footer and tags).
export function buildDescription(style) {
  const tag = (t) => '#' + t.toLowerCase().replace(/[^a-z0-9]/g, '');
  const hashtags = [...new Set(['#shorts', tag(style.hashtags[0] || style.name), '#python', '#satisfying'])];
  return `${style.description} Every line in this ${style.name.toLowerCase()} was drawn by code using Python's turtle graphics library.\n\nFollow for a new geometric animation every day.\n\n${hashtags.join(' ')}`;
}
