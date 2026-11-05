// One definition of what each plan includes, used by the landing page and the in-app Pricing page.
// It reads the structured fields from /api/billing/plans, so the table always matches what the server enforces.
export const PLAN_NAMES = { basic: 'Basic', pro: 'Pro', max: 'Max', maxplus: 'Max+', ultra: 'Ultra' };

const stylesText = (p) => (p.styles >= (p.totalStyles || 52) ? `${p.totalStyles || 52} styles` : `${p.styles} styles`);
const musicText = (p) => {
  if (p.free || !p.ownMusic) return 'Not included';
  return p.musicTracks == null ? 'Included' : `Included, upload ${p.musicTracks}`;
};

export const PLAN_ROWS = [
  ['Shorts a month', (p) => (p.free ? 'One trial Short' : `${Number(p.shortsPerPeriod).toLocaleString('en-IN')} Shorts`)],
  ['Uploads', (p) => (p.free ? 'Not included' : p.everyOtherDay ? 'Every other day' : 'Every day')],
  ['Autopilot schedules', (p) => (p.free ? 'Not included' : p.schedules == null ? 'Unlimited' : `${p.schedules}`)],
  ['Shorts per slot', (p) => (p.free ? 'Not included' : `${p.perSlot || 1}`)],
  ['Styles', (p) => (p.free ? `Browse all ${p.totalStyles || 52}` : stylesText(p))],
  ['Upload to YouTube', (p) => (p.free ? 'Not included' : 'Automatic')],
  ['Watermark', (p) => (p.free ? 'Yes' : 'None')],
  ['Your own music', musicText],
  ['Rendering', (p) => (!p.free && p.priority ? 'Priority' : 'Standard')],
];

export const FREE_PLAN = { id: 'free', name: 'Free', free: true, monthly: 0, totalStyles: 52 };
