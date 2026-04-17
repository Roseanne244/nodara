import { ArrowRight, ArrowUpRight, ExternalLink, Zap, Shield, Lock, Code } from 'lucide-react'
import { Logo } from '../components/Logo'
import { ThemeToggle } from '../components/ThemeToggle'

const FEATURES = [
  {
    icon: <Zap size={22} color="#6C5CE7" />,
    bg: 'rgba(108,92,231,.12)',
    title: 'Blazing Fast Uploads',
    desc: "High-throughput uploads via Shelby's dedicated fiber network. No bottlenecks, no waiting.",
  },
  {
    icon: <Shield size={22} color="#00D1FF" />,
    bg: 'rgba(0,209,255,.12)',
    title: 'Verifiable Storage',
    desc: 'Every file is cryptographically committed to Aptos. Tamper-proof by design and auditable by anyone.',
  },
  {
    icon: <Lock size={22} color="#00C853" />,
    bg: 'rgba(0,200,83,.12)',
    title: 'Truly Decentralized',
    desc: 'No central server. Your data lives across 1,000+ independent Shelby storage providers.',
  },
  {
    icon: <Code size={22} color="#F59E0B" />,
    bg: 'rgba(245,158,11,.12)',
    title: 'Developer Friendly',
    desc: 'TypeScript SDK, React hooks, and clean documentation. Integrate decentralized storage in minutes.',
  },
]

const STEPS = [
  { n: 1, title: 'Connect Wallet', desc: 'Link your Aptos-compatible wallet in one click.' },
  { n: 2, title: 'Upload a File', desc: 'Drop a file into Nodara and sign the storage transaction.' },
  { n: 3, title: 'Store with Proof', desc: 'Your blob is committed on Aptos and served by Shelby storage nodes.' },
]

const STATS = [
  { val: '1,000+', label: 'Independent nodes' },
  { val: 'Aptos', label: 'Settlement layer' },
  { val: 'Blob', label: 'Storage primitive' },
  { val: 'Dual', label: 'Test environments' },
]

const COMPARE = [
  {
    label: 'BEFORE',
    eyebrow: 'Traditional storage',
    bad: true,
    title: 'Centralized systems stay convenient until policy, downtime, or lock-in shows up.',
    pts: [
      'Single points of failure and downtime',
      'Corporate control and censorship risk',
      'Data deleted without your consent',
      'No real ownership or verifiability',
    ],
  },
  {
    label: 'AFTER',
    eyebrow: 'Nodara on Shelby',
    bad: false,
    title: 'A storage flow designed around cryptographic proof and distributed custody.',
    pts: [
      'Distributed across 1,000+ independent nodes',
      'You own your data, always and provably',
      'Cryptographically committed on Aptos',
      'Permanent and censorship-resistant storage',
    ],
  },
]

const FOOTER_LINKS = [
  { label: 'Docs', href: 'https://docs.shelby.xyz' },
  { label: 'GitHub', href: 'https://github.com/Roseanne244/nodara' },
  { label: 'Discord', href: 'https://discord.com/invite/shelbyserves' },
  { label: 'X', href: 'https://x.com/itschelseeaa_' },
]

export function Landing({ onLaunch, theme, toggleTheme }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav className="lp-nav">
        <Logo size={28} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {['Features', 'How it Works'].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
              style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)', textDecoration: 'none', transition: 'color .15s' }}
              onMouseEnter={(event) => { event.target.style.color = 'var(--text)' }}
              onMouseLeave={(event) => { event.target.style.color = 'var(--muted)' }}
            >
              {label}
            </a>
          ))}
          <ThemeToggle theme={theme} toggle={toggleTheme} />
          <button className="btn btn-primary" onClick={onLaunch} style={{ padding: '9px 18px', fontSize: 13.5 }}>
            Launch App <ArrowUpRight size={14} />
          </button>
        </div>
      </nav>

      <div className="hero">
        <div className="orb" style={{ width: 520, height: 520, top: '-8%', left: '4%', background: 'rgba(108,92,231,.13)' }} />
        <div className="orb" style={{ width: 380, height: 380, top: '6%', right: '6%', background: 'rgba(0,209,255,.09)' }} />
        <div className="orb" style={{ width: 240, height: 240, bottom: '-2%', left: '42%', background: 'rgba(0,200,83,.06)' }} />

        <div className="fade-in" style={{ animationDelay: '.05s' }}>
          <div className="badge" style={{ display: 'inline-flex', marginBottom: 28 }}>
            <span className="dot pulse" style={{ background: 'var(--ok)' }} />
            Powered by Shelby Protocol + Aptos
          </div>
        </div>

        <h1
          className="fade-in"
          style={{
            fontSize: 'clamp(42px,7vw,84px)',
            fontWeight: 800,
            letterSpacing: '-.05em',
            lineHeight: 1.04,
            maxWidth: 860,
            margin: '0 auto 26px',
            animationDelay: '.12s',
          }}
        >
          Store data on-chain.
          <br />
          <span className="grad-text">Without storage drama.</span>
        </h1>

        <p
          className="fade-in"
          style={{
            fontSize: 'clamp(16px,1.8vw,20px)',
            color: 'var(--muted)',
            maxWidth: 560,
            margin: '0 auto 44px',
            lineHeight: 1.7,
            animationDelay: '.22s',
          }}
        >
          Nodara turns Shelby into a clean operating surface for uploads, proofs, and blob management across Aptos-native environments.
        </p>

        <div className="fade-in lp-hero-strip" style={{ animationDelay: '.27s' }}>
          <div className="lp-hero-chip">Wallet-aware uploads</div>
          <div className="lp-hero-chip">Blob explorer links</div>
          <div className="lp-hero-chip">Shelbynet + Testnet</div>
        </div>

        <div className="fade-in" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '.32s' }}>
          <button
            className="btn btn-primary glow-pulse"
            onClick={onLaunch}
            style={{ padding: '14px 36px', fontSize: 16, borderRadius: 13 }}
          >
            Get Started <ArrowRight size={17} />
          </button>
          <a
            href="https://docs.shelby.xyz"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
            style={{ padding: '14px 28px', fontSize: 16, borderRadius: 13, textDecoration: 'none' }}
          >
            View Docs <ExternalLink size={15} />
          </a>
        </div>

        <div className="float fade-in" style={{ marginTop: 72, animationDelay: '.45s', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: 'min(620px,90vw)',
              padding: 2,
              borderRadius: 22,
              background: 'linear-gradient(135deg,rgba(108,92,231,.4),rgba(0,209,255,.28))',
              boxShadow: '0 32px 80px rgba(108,92,231,.18)',
            }}
          >
            <div style={{ background: 'var(--surf)', borderRadius: 20, padding: 24, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                {['#FF5252', '#F59E0B', '#00C853'].map((color) => (
                  <div key={color} style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                ))}
                <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8, fontFamily: "'JetBrains Mono',monospace" }}>
                  nodara.xyz/app
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  ['--', 'Uploads'],
                  ['-- MB', 'Stored'],
                  ['100%', 'Verified'],
                ].map(([value, label]) => (
                  <div key={label} style={{ background: 'var(--surf2)', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: '-.04em' }}>
                      {value}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, height: 6, borderRadius: 99, background: 'var(--surf2)', overflow: 'hidden' }}>
                <div style={{ width: '72%', height: '100%', background: 'var(--grad)', borderRadius: 99 }} />
              </div>
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>Storage used</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>72%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="lp-section" id="features">
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, letterSpacing: '-.04em', marginBottom: 14 }}>
            Storage should feel owned, not borrowed
          </h2>
          <p style={{ color: 'var(--muted)', maxWidth: 560, margin: '0 auto', fontSize: 16, lineHeight: 1.65 }}>
            Centralized infrastructure optimizes for operator control. Nodara shifts that toward resilience, verifiability, and user-controlled data.
          </p>
        </div>
        <div className="lp-compare-grid">
          {COMPARE.map(({ label, eyebrow, bad, title, pts }) => (
            <div key={label} className={`lp-compare-card${bad ? ' is-before' : ' is-after'}`}>
              <div className="lp-compare-topline">
                <span className={`lp-compare-kicker${bad ? ' is-before' : ' is-after'}`}>{label}</span>
                <span className="lp-compare-eyebrow">{eyebrow}</span>
              </div>
              <h3 className="lp-compare-title">{title}</h3>
              <ul className="lp-compare-list">
                {pts.map((point) => (
                  <li key={point} className="lp-compare-item">
                    <span className={`lp-compare-mark${bad ? ' is-before' : ' is-after'}`}>{bad ? 'x' : 'ok'}</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section" style={{ paddingTop: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, letterSpacing: '-.04em', marginBottom: 14 }}>
            Built for the modern Web3 stack
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 560, margin: '0 auto', lineHeight: 1.65 }}>
            Nodara is not another glossy wallet demo. It is a focused control surface for Shelby-native storage actions.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 18 }}>
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card card-lift" style={{ padding: 28 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 13,
                  background: feature.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 18,
                }}
              >
                {feature.icon}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 9, letterSpacing: '-.02em' }}>{feature.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.65 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        style={{
          padding: '72px 64px',
          background: 'var(--surf)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, letterSpacing: '-.04em', marginBottom: 56 }}>
            Up and running in 3 steps
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 40 }}>
            {STEPS.map((step, index) => (
              <div key={step.n} style={{ textAlign: 'center', position: 'relative' }}>
                {index < STEPS.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 19,
                      left: '62%',
                      width: '76%',
                      height: 2,
                      background: 'linear-gradient(90deg,rgba(108,92,231,.4),transparent)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: 'var(--grad)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 18px',
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#fff',
                    fontFamily: "'Bricolage Grotesque',sans-serif",
                  }}
                >
                  {step.n}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, letterSpacing: '-.02em' }}>{step.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '52px 64px', maxWidth: 1160, margin: '0 auto' }}>
        <div className="lp-stat-grid">
          {STATS.map((stat) => (
            <div key={stat.label} className="lp-stat-card">
              <div
                className="grad-text"
                style={{
                  fontFamily: "'Bricolage Grotesque',sans-serif",
                  fontSize: 36,
                  fontWeight: 800,
                  letterSpacing: '-.04em',
                  marginBottom: 6,
                }}
              >
                {stat.val}
              </div>
              <div className="lp-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-cta-shell">
        <div
          className="orb"
          style={{
            width: 600,
            height: 600,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            background: 'rgba(108,92,231,.08)',
          }}
        />
        <div className="lp-cta-card">
          <div className="lp-cta-kicker">Start with a real storage workflow</div>
          <h2 className="lp-cta-title">
            Own your data.
            <br />
            <span className="grad-text">Store it with proof.</span>
          </h2>
          <p className="lp-cta-copy">
            Switch between Shelbynet and Testnet, upload blobs, inspect history, and verify what was actually written.
          </p>
          <div className="lp-cta-actions">
            <button
              className="btn btn-primary glow-pulse"
              onClick={onLaunch}
              style={{ padding: '16px 44px', fontSize: 18, borderRadius: 14, position: 'relative' }}
            >
              Launch App <ArrowRight size={19} />
            </button>
            <a
              href="https://docs.shelby.xyz/tools/explorer"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{ padding: '16px 24px', fontSize: 16, borderRadius: 14, textDecoration: 'none' }}
            >
              Explore Docs <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <Logo size={22} />
          <span className="lp-footer-copy">© 2025 Nodara. Built on Shelby Protocol + Aptos.</span>
        </div>
        <div className="lp-footer-links">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', transition: 'color .15s' }}
              onMouseEnter={(event) => { event.target.style.color = 'var(--text)' }}
              onMouseLeave={(event) => { event.target.style.color = 'var(--muted)' }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
