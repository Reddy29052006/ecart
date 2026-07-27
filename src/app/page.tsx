import { APP_CONSTANTS } from '@/config/constants';
import { ROUTES } from '@/config/routes';

export default function HomePage() {
  return (
    <div className="container">
      <div className="card">
        <span className="badge badge-success">Stage 1 Foundation Operational</span>
        <h1 className="title" style={{ marginTop: '1rem' }}>
          {APP_CONSTANTS.NAME}
        </h1>
        <p className="subtitle">
          Next.js App Router Modular Monolith Architecture Baseline
        </p>

        <div className="grid">
          <div className="card" style={{ padding: '1.5rem', background: '#0f172a' }}>
            <h3 style={{ color: '#818cf8', marginBottom: '0.5rem' }}>Architecture</h3>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
              Modular Monolith with strict module boundaries, contract-first design, and centralized composition root.
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem', background: '#0f172a' }}>
            <h3 style={{ color: '#2dd4bf', marginBottom: '0.5rem' }}>Database & ORM</h3>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
              PostgreSQL relational engine managed via Prisma ORM behind repository interfaces.
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem', background: '#0f172a' }}>
            <h3 style={{ color: '#f472b6', marginBottom: '0.5rem' }}>API Infrastructure</h3>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
              Standardized HTTP envelopes, AppError hierarchy, structured logging, and health endpoint.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #334155', display: 'flex', gap: '1rem' }}>
          <a
            href={ROUTES.API.HEALTH}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '0.6rem 1.2rem',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Check Health Endpoint (GET /api/v1/health)
          </a>
        </div>
      </div>
    </div>
  );
}
