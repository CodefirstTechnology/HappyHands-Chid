const parentAppUrl = import.meta.env.VITE_PARENT_APP_URL || '#';
const caregiverAppUrl = import.meta.env.VITE_CAREGIVER_APP_URL || '#';
const coordinatorPortalUrl = import.meta.env.VITE_COORDINATOR_PORTAL_URL || '#';
const playStoreParent = import.meta.env.VITE_PLAY_STORE_PARENT || '#';
const playStoreCaregiver = import.meta.env.VITE_PLAY_STORE_CAREGIVER || '#';
const appStoreParent = import.meta.env.VITE_APP_STORE_PARENT || '#';
const appStoreCaregiver = import.meta.env.VITE_APP_STORE_CAREGIVER || '#';

function isLink(url) {
  return url && url !== '#';
}

function AppLink({ href, label, description, accent }) {
  if (!isLink(href)) {
    return (
      <article className="card card-muted">
        <span className={`badge badge-${accent}`}>{label}</span>
        <p>{description}</p>
        <p className="soon">Coming soon on app stores</p>
      </article>
    );
  }

  return (
    <a className="card card-link" href={href} target="_blank" rel="noopener noreferrer">
      <span className={`badge badge-${accent}`}>{label}</span>
      <p>{description}</p>
      <span className="cta">Open app →</span>
    </a>
  );
}

function StoreLinks({ playStore, appStore, label }) {
  const links = [
    isLink(playStore) && { href: playStore, text: `Get ${label} on Google Play` },
    isLink(appStore) && { href: appStore, text: `Get ${label} on App Store` },
  ].filter(Boolean);

  if (links.length === 0) return null;

  return (
    <div className="store-links">
      {links.map((link) => (
        <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
          {link.text}
        </a>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <div className="page">
      <header className="hero">
        <div className="hero-inner">
          <p className="eyebrow">Premium in-home childcare</p>
          <h1>BabyCare</h1>
          <p className="lead">
            Connect with verified caregivers, manage bookings, and keep your family safe — all in one
            trusted platform.
          </p>
          <div className="hero-actions">
            {isLink(coordinatorPortalUrl) && (
              <a className="button button-secondary" href={coordinatorPortalUrl}>
                Coordinator portal
              </a>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="section">
          <h2>Get the apps</h2>
          <div className="grid">
            <AppLink
              href={parentAppUrl}
              label="BabyCare"
              accent="parent"
              description="For parents — browse caregivers, book care, track sessions, and leave reviews."
            />
            <AppLink
              href={caregiverAppUrl}
              label="BabyCare Pro"
              accent="caregiver"
              description="For professional caregivers — manage availability, accept bookings, and grow your practice."
            />
          </div>
          <StoreLinks
            playStore={playStoreParent}
            appStore={appStoreParent}
            label="BabyCare"
          />
          <StoreLinks
            playStore={playStoreCaregiver}
            appStore={appStoreCaregiver}
            label="BabyCare Pro"
          />
        </section>

        <section className="section features">
          <h2>Why BabyCare</h2>
          <ul>
            <li>Verified caregiver onboarding through local coordinators</li>
            <li>Secure booking, care-start OTP, and post-care reviews</li>
            <li>Location-aware matching for open care requests</li>
            <li>Built for families and professional caregivers in India</li>
          </ul>
        </section>
      </main>

      <footer>
        <p>© {new Date().getFullYear()} BabyCare. All rights reserved.</p>
      </footer>
    </div>
  );
}
