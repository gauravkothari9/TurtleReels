import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Footer, SiteNav } from '../landing/Landing';
import '../landing/landing.css';
import './legal.css';

// Edit these before publishing. Google's OAuth review checks that the contact works.
const CONTACT_EMAIL = 'gauravkothari3789@gmail.com';
const UPDATED = '4 November 2026';
const SITE = 'https://turtlereels.com';

const Mail = () => <a className="lp-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
const Ext = ({ href, children }) => <a className="lp-link" href={href} target="_blank" rel="noreferrer">{children}</a>;

function LegalShell({ title, children }) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} · TurtleReels`;
    window.scrollTo(0, 0);
    return () => { document.title = prev; };
  }, [title]);
  return (
    <div className="lp lp-legal">
      <SiteNav />
      <main className="legal-board">
        <article className="lp-tile legal-doc">
          <header>
            <h1>{title}</h1>
            <p className="legal-meta">Last updated {UPDATED} · Applies to {SITE.replace('https://', '')}</p>
          </header>
          {children}
        </article>
      </main>
      <Footer />
    </div>
  );
}

export function Privacy() {
  return (
    <LegalShell title="Privacy Policy">
      <p>
        TurtleReels (“we”, “us”) is a web app that draws geometric videos with Python turtle graphics and,
        if you connect your YouTube channel, uploads them to that channel for you. This policy explains what
        data we collect, how we use it, and the choices you have.
      </p>

      <h2>1. Data we collect</h2>
      <ul>
        <li><strong>Account data:</strong> your name, email address and a scrypt hash of your password. We never store your password itself.</li>
        <li><strong>Session data:</strong> an HttpOnly session cookie that keeps you logged in. We do not use advertising or tracking cookies.</li>
        <li><strong>Content you create:</strong> the videos we render for you, their titles, descriptions and tags, your schedules, video settings and any music files you upload.</li>
        <li><strong>Billing data:</strong> your plan, billing period and the Razorpay subscription ID. Card, UPI and bank details are entered on Razorpay’s checkout and never reach our servers.</li>
        <li><strong>YouTube data</strong> (only if you connect a channel): see section 2.</li>
      </ul>

      <h2>2. Google and YouTube data</h2>
      <p>When you click “Connect YouTube” you sign in with Google and grant TurtleReels these permissions:</p>
      <ul>
        <li><code>youtube.upload</code>: to upload the videos you create, or that your schedules create, to your channel.</li>
        <li><code>youtube.readonly</code>: to read your channel’s name and ID so we can show which channel is connected, and to check the status of videos we uploaded.</li>
      </ul>
      <p>
        We store the OAuth access and refresh tokens Google gives us, and your channel name and ID. We use them
        only to provide the upload features you asked for. We do not read, change or delete any other videos,
        comments, playlists or account data.
      </p>
      <p>
        TurtleReels’ use and transfer of information received from Google APIs to any other app will adhere to
        the <Ext href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</Ext>,
        including the Limited Use requirements. We do not sell Google user data, use it for advertising, or use
        it to train AI or machine-learning models, and no person at TurtleReels reads it except when you ask us
        to for support, for security reasons, or when the law requires it.
      </p>
      <p>
        TurtleReels uses YouTube API Services. By connecting a channel you also agree to
        the <Ext href="https://www.youtube.com/t/terms">YouTube Terms of Service</Ext>, and Google’s handling of
        your data is covered by the <Ext href="https://policies.google.com/privacy">Google Privacy Policy</Ext>.
      </p>

      <h2>3. How we use data</h2>
      <ul>
        <li>To run your account, render videos and upload them when you or your schedules ask.</li>
        <li>To manage your subscription and enforce plan limits.</li>
        <li>To send messages about your account or billing. We do not send marketing email.</li>
        <li>To keep the service secure and fix problems.</li>
      </ul>

      <h2>4. Sharing</h2>
      <p>We do not sell or rent personal data. We share data only with the services needed to run TurtleReels:</p>
      <ul>
        <li><strong>Google / YouTube</strong>, to upload your videos.</li>
        <li><strong>Razorpay</strong>, to take subscription payments.</li>
        <li><strong>Amazon Web Services</strong> (servers and storage, India region), <strong>Vercel</strong> (website hosting) and our MongoDB database host.</li>
        <li>Authorities, if the law requires it.</li>
      </ul>

      <h2>5. Storage, security and retention</h2>
      <p>
        Data is sent over HTTPS and stored on servers we control. Passwords are hashed and OAuth tokens are
        never shown in the app. We keep your data while your account is open. When you disconnect YouTube we
        delete the stored tokens at once. When you delete a video in the app we delete its file. When you ask us
        to close your account we delete your account, videos, schedules, music and tokens within 30 days,
        except billing records the law requires us to keep.
      </p>

      <h2>6. Your choices</h2>
      <ul>
        <li><strong>Disconnect YouTube</strong> any time in Profile → Account. You can also remove TurtleReels’ access in your <Ext href="https://myaccount.google.com/permissions">Google Account permissions</Ext>.</li>
        <li><strong>See, correct or delete your data</strong>: email <Mail /> from the address on your account. We reply within 30 days.</li>
        <li><strong>Cancel your plan</strong> in Profile → Plan & billing.</li>
      </ul>

      <h2>7. Children</h2>
      <p>TurtleReels is not for children under 13, or under the minimum age in your country. We do not knowingly collect their data.</p>

      <h2>8. Changes</h2>
      <p>If we change this policy we will update the date above, and for important changes we will tell you in the app or by email.</p>

      <h2>9. Contact</h2>
      <p>Questions or requests: <Mail />.</p>
    </LegalShell>
  );
}

export function Terms() {
  return (
    <LegalShell title="Terms of Service">
      <p>
        These terms are an agreement between you and TurtleReels for use of the website at {SITE.replace('https://', '')} and
        its services. By creating an account or using TurtleReels you accept these terms and
        our <Link className="lp-link" to="/privacy">Privacy Policy</Link>.
      </p>

      <h2>1. The service</h2>
      <p>
        TurtleReels generates geometric videos with music and quotes, and can upload them to a YouTube channel
        you connect, on demand or on a schedule. Features and limits depend on your plan.
      </p>

      <h2>2. Accounts</h2>
      <ul>
        <li>You must be at least 13, or the minimum age in your country, and give a real email address.</li>
        <li>Keep your password safe. You are responsible for activity on your account.</li>
        <li>One person per account. Do not share or resell access.</li>
      </ul>

      <h2>3. YouTube</h2>
      <p>
        TurtleReels uses YouTube API Services. By connecting a channel you agree to
        the <Ext href="https://www.youtube.com/t/terms">YouTube Terms of Service</Ext> and
        the <Ext href="https://policies.google.com/privacy">Google Privacy Policy</Ext>. You authorise us to
        upload videos to your channel when you or your schedules request it. You are responsible for your
        channel, for the titles, descriptions and tags you set, and for following YouTube’s policies, including
        its rules on repetitive or automated content and monetisation. We are not responsible if YouTube limits,
        demonetises or removes videos or channels. TurtleReels is not affiliated with or endorsed by Google or YouTube.
      </p>

      <h2>4. Plans, payment and refunds</h2>
      <ul>
        <li>Registration is free and includes one watermarked trial video that cannot be uploaded.</li>
        <li>Paid plans (Basic, Pro, Max, Max+, Ultra) are subscriptions billed monthly in Indian rupees through Razorpay. Prices on the <Link className="lp-link" to="/pricing">Pricing</Link> page include any stated taxes.</li>
        <li>Subscriptions renew automatically until cancelled. Cancel any time in Profile → Plan & billing; your plan keeps working until the end of the period you paid for.</li>
        <li>Monthly video allowances reset each billing period and do not carry over.</li>
        <li>Payments are non-refundable except where the law requires, or where a fault on our side stopped the service from working for most of a billing period. Email us within 7 days of a charge to ask.</li>
        <li>We may change prices with notice; a new price applies from your next renewal.</li>
      </ul>

      <h2>5. Your content</h2>
      <p>
        Subject to these terms, you may use the videos TurtleReels makes for you, including on monetised
        channels. Designs, music and quotes are generated by our engine and you receive a non-exclusive,
        worldwide, royalty-free licence to use them; others may receive similar designs. Music you upload must be
        yours or licensed to you, and you grant us permission to store and process it only to make your videos.
      </p>

      <h2>6. Acceptable use</h2>
      <p>You must not:</p>
      <ul>
        <li>use TurtleReels for spam, misleading metadata, or to break YouTube’s or any platform’s rules;</li>
        <li>upload music or text you do not have rights to;</li>
        <li>attack, overload, scrape or reverse-engineer the service, or get around plan limits;</li>
        <li>use the service for anything illegal.</li>
      </ul>
      <p>We may suspend or close accounts that break these rules.</p>

      <h2>7. Our property</h2>
      <p>The TurtleReels name, website, render engine and software belong to us. These terms do not give you rights to them beyond using the service.</p>

      <h2>8. Availability</h2>
      <p>
        We work to keep TurtleReels running, but the service is provided “as is” and may be interrupted,
        delayed or changed. Rendering and uploads depend on third parties such as Google and our hosting
        providers. We may change or remove features with reasonable notice.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the extent the law allows, TurtleReels is not liable for indirect or consequential losses, lost
        revenue, lost views or channel penalties. Our total liability for any claim is limited to the amount you
        paid us in the 3 months before the claim.
      </p>

      <h2>10. Ending the agreement</h2>
      <p>
        You can stop using TurtleReels and ask us to delete your account at any time. We may end these terms or
        suspend access if you break them. Sections 5, 7, 9 and 11 continue after the agreement ends.
      </p>

      <h2>11. Law</h2>
      <p>These terms are governed by the laws of India, and the courts of India have jurisdiction over disputes.</p>

      <h2>12. Changes</h2>
      <p>We may update these terms. We will change the date above and tell you about important changes. Using TurtleReels after a change means you accept it.</p>

      <h2>13. Contact</h2>
      <p>Questions: <Mail />.</p>
    </LegalShell>
  );
}
