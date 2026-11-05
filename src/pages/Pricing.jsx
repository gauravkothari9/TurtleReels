import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { api, loadRazorpay } from '../api';
import { rupees, useStore } from '../store';
import { FREE_PLAN, PLAN_ROWS } from '../planRows';
import { FALLBACK_PLANS, media, styles } from '../landing/data';
import { Footer, SiteNav } from '../landing/Landing';
import '../landing/landing.css';
import './pricing.css';

/** Opens Razorpay Checkout for a plan; resolves true once payment is verified by our server. */
export function useCheckout() {
  const { user, setAccount, notify } = useStore();
  const [pending, setPending] = useState(null); // "plan:interval" being bought

  const checkout = async (plan, interval) => {
    setPending(`${plan}:${interval}`);
    try {
      const [Razorpay, order] = await Promise.all([loadRazorpay(), api.subscribe(plan, interval)]);
      return await new Promise((resolve) => {
        const rzp = new Razorpay({
          key: order.keyId,
          subscription_id: order.subscriptionId,
          name: order.name,
          description: order.description,
          prefill: { name: user?.name, email: user?.email },
          theme: { color: '#2fe3a4' },
          handler: async (resp) => {
            try {
              setAccount(await api.verifyPayment(resp));
              notify('Payment successful. Your plan is active!');
              resolve(true);
            } catch (e) {
              notify(`${e.message}. If you were charged, it will activate shortly.`, 'error');
              resolve(false);
            }
          },
          modal: { ondismiss: () => resolve(false) },
        });
        rzp.on('payment.failed', (r) => notify(r.error?.description || 'Payment failed', 'error'));
        rzp.open();
      });
    } catch (e) {
      notify(e.message, 'error');
      return false;
    } finally {
      setPending(null);
    }
  };
  return { checkout, pending };
}

/** Real previews of the styles each plan adds, in the same order the server unlocks them. */
function Unlocks({ plans }) {
  let from = 0;
  const tiers = plans.map((p) => {
    const to = Math.min(p.styles || styles.length, styles.length);
    const added = styles.slice(from, to);
    const row = { plan: p, added, total: to, first: from === 0 };
    from = to;
    return row;
  }).filter((t) => t.added.length);
  return (
    <section className="pr-unlocks" aria-labelledby="pr-unlocks-h">
      <h2 id="pr-unlocks-h">What each plan unlocks</h2>
      {tiers.map(({ plan, added, total, first }) => {
        const shown = added.slice(0, 6);
        const more = added.length - shown.length;
        return (
          <div key={plan.id} className="pr-tier">
            <div className="pr-tier-text">
              <h3>{plan.name}</h3>
              <p>{first ? `${added.length} styles to start` : `${added.length} more styles, ${total} in all`}</p>
            </div>
            <ul className="pr-tier-grid">
              {shown.map((s, i) => {
                const m = media(s.id);
                return (
                  <li key={s.id} className="lp-tile">
                    {i === 0
                      ? <video src={m.video} poster={m.poster} muted loop autoPlay playsInline aria-label={`${s.name} style drawing itself`} />
                      : <img src={m.poster} alt={`${s.name} style, finished`} loading="lazy" width="360" height="640" />}
                    <span>{s.name}</span>
                  </li>
                );
              })}
              {more > 0 && <li className="lp-tile pr-more"><span>+{more} more</span></li>}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

export default function Pricing({ standalone = false }) {
  const { account, hasPlan } = useStore();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const period = 'monthly'; // plans are billed monthly only
  const { checkout, pending } = useCheckout();
  const sub = account?.user?.subscription;
  const isAdmin = account?.user?.role === 'admin';
  const usage = account?.usage;

  useEffect(() => {
    api.plans().then(setData).catch(() => setData({ plans: FALLBACK_PLANS, configured: false, offline: true }));
  }, []);
  useEffect(() => {
    const prev = document.title;
    document.title = 'Pricing · TurtleReels';
    return () => { document.title = prev; };
  }, []);

  const plans = data?.plans?.length ? data.plans : FALLBACK_PLANS;
  const cols = [FREE_PLAN, ...plans];
  const recommended = 'pro';
  const currentId = isAdmin ? null : hasPlan ? sub?.plan : account ? 'free' : null;

  const choose = async (planId) => {
    if (!account) return navigate(`/signup?next=${encodeURIComponent('/pricing')}`);
    if (await checkout(planId, period)) navigate('/profile/billing');
  };

  /** One button per plan, worded for who is looking. */
  const action = (p, dark) => {
    const cls = `lp-btn pr-btn${dark ? ' lp-btn-dark' : ''}`;
    if (p.free) {
      if (!account) return <Link to="/signup" className={cls}>Start free</Link>;
      return <span className="pr-current">{currentId === 'free' ? 'Your plan' : 'Included'}</span>;
    }
    const isCurrent = hasPlan && sub?.plan === p.id;
    if (isCurrent) return <span className="pr-current">Current plan</span>;
    if (isAdmin) return <span className="pr-current">Admin has full access</span>;
    const busy = pending === `${p.id}:${period}`;
    const blocked = Boolean(account) && data && !data.configured;
    return (
      <button type="button" className={cls} disabled={Boolean(pending) || blocked} onClick={() => choose(p.id)}>
        {busy && <Loader2 className="spin" size={16} />}
        {hasPlan ? `Switch to ${p.name}` : `Choose ${p.name}`}
      </button>
    );
  };

  const price = (p) => (p.free ? rupees(0) : rupees(p.monthly));
  const per = (p) => (p.free ? 'forever' : 'a month');

  const body = (
    <div className={`lp pr ${standalone ? '' : 'pr-embedded'}`}>
      {standalone && <SiteNav />}
      <main className="pr-main">
        <header className="pr-head">
          <div>
            <h1>Pick a TurtleReels plan</h1>
            <p>Every paid plan uploads to YouTube automatically, with no watermark and original music. Billed monthly in Indian rupees.</p>
          </div>
        </header>

        {account && usage && !isAdmin && (
          <p className="pr-status" role="status">
            {hasPlan
              ? <>You’re on <strong>{plans.find((p) => p.id === sub?.plan)?.name || 'a plan'}</strong>, billed {sub?.interval === 'yearly' ? 'yearly' : 'monthly'}. {usage.shortsLimit == null ? `${usage.shortsUsed} Shorts made this month.` : `${usage.shortsUsed} of ${usage.shortsLimit} Shorts used this month.`} <Link to="/profile/billing" className="lp-link">Manage billing</Link></>
              : <>You’re on the free account. {usage.trialLeft ? 'Your trial Short is still waiting for you.' : 'Your trial Short is used.'} Pick a plan to upload and schedule.</>}
          </p>
        )}
        {account && data && !data.configured && (
          <p className="pr-warn" role="alert">Payments aren’t switched on yet, so plans can’t be bought right now.</p>
        )}

        <div className="lp-table-wrap pr-table">
          <table className="lp-table">
            <caption className="lp-sr">Plans compared</caption>
            <thead>
              <tr>
                <th scope="col"><span className="lp-sr">Feature</span></th>
                {cols.map((p) => (
                  <th scope="col" key={p.id} className={p.id === recommended ? 'is-rec' : ''}>
                    <span className="lp-plan">{p.name}</span>
                    <span className="lp-price">{price(p)}</span>
                    <span className="lp-period">{per(p)}</span>
                    {currentId === p.id && <span className="pr-tag">Your plan</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLAN_ROWS.map(([label, fn]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {cols.map((p) => <td key={p.id} className={p.id === recommended ? 'is-rec' : ''}>{fn(p)}</td>)}
                </tr>
              ))}
              <tr className="lp-table-actions">
                <th scope="row"><span className="lp-sr">Choose</span></th>
                {cols.map((p) => <td key={p.id} className={p.id === recommended ? 'is-rec' : ''}>{action(p, p.id === recommended)}</td>)}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="lp-plan-stack pr-stack">
          {cols.map((p) => (
            <article key={p.id} className={`lp-plan-block ${p.id === recommended ? 'is-rec' : ''}`}>
              <h2>{p.name} <span>{price(p)}</span></h2>
              <p className="pr-per">{per(p)}{currentId === p.id ? ' · your plan' : ''}</p>
              <dl>
                {PLAN_ROWS.map(([label, fn]) => <div key={label}><dt>{label}</dt><dd>{fn(p)}</dd></div>)}
              </dl>
              {action(p, p.id === recommended)}
            </article>
          ))}
        </div>

        <Unlocks plans={plans} />

        <section className="pr-notes" aria-labelledby="pr-notes-h">
          <h2 id="pr-notes-h">How billing works</h2>
          <ul>
            <li>Plans renew automatically through Razorpay: UPI, cards or netbanking. Taxes as applicable.</li>
            <li>Change plan any time from Plan and billing. A cancelled plan keeps working until the paid period ends.</li>
            <li>A long video uses one Short of your allowance per minute.</li>
            <li>Basic unlocks the first 5 styles, Pro the first 30, Max the first 50, Max+ and Ultra all 52. The free trial Short can use any style.</li>
          </ul>
        </section>
      </main>
      {standalone && <Footer />}
    </div>
  );
  return body;
}
