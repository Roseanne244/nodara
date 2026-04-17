export const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=JetBrains+Mono:wght@400;500&display=swap');

/* ── CSS Variables (Themes) ── */
:root {
  --acc:  #6C5CE7;
  --acc2: #00D1FF;
  --ok:   #00C853;
  --err:  #FF5252;
  --warn: #F59E0B;
  --grad: linear-gradient(135deg, #6C5CE7 0%, #00D1FF 100%);
  --grad-subtle: linear-gradient(135deg, rgba(108,92,231,.12) 0%, rgba(0,209,255,.06) 100%);
  --radius: 14px;
  --radius-sm: 9px;
  --radius-lg: 20px;
  --transition: .2s ease;
}

[data-theme="dark"] {
  --bg:       #0B0F1A;
  --surf:     #111827;
  --surf2:    #1A2235;
  --surf3:    #212D42;
  --border:   rgba(255,255,255,0.06);
  --border2:  rgba(255,255,255,0.12);
  --text:     #F1F5F9;
  --muted:    rgba(241,245,249,0.48);
  --subtle:   rgba(241,245,249,0.22);
  --nav-bg:   rgba(11,15,26,0.88);
  --shadow:   0 4px 24px rgba(0,0,0,0.35);
  --shadow-lg:0 16px 56px rgba(0,0,0,0.45);
  color-scheme: dark;
}

[data-theme="light"] {
  --bg:       #F4F7FE;
  --surf:     #FFFFFF;
  --surf2:    #EDF1F9;
  --surf3:    #E2E8F5;
  --border:   rgba(0,0,0,0.06);
  --border2:  rgba(0,0,0,0.12);
  --text:     #0B0F1A;
  --muted:    rgba(11,15,26,0.48);
  --subtle:   rgba(11,15,26,0.22);
  --nav-bg:   rgba(244,247,254,0.88);
  --shadow:   0 4px 24px rgba(0,0,0,0.08);
  --shadow-lg:0 16px 56px rgba(0,0,0,0.12);
  color-scheme: light;
}

/* ── Base ── */
body, #root {
  background: var(--bg);
  color: var(--text);
  font-family: 'DM Sans', system-ui, sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
  transition: background var(--transition), color var(--transition);
}

h1,h2,h3,h4,h5 {
  font-family: 'Bricolage Grotesque', system-ui, sans-serif;
}

::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-thumb {
  background: var(--border2);
  border-radius: 99px;
}

/* ── Keyframes ── */
@keyframes fade-in    { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
@keyframes fade-up    { from { opacity:0; transform:translateY(8px) }  to { opacity:1; transform:translateY(0) } }
@keyframes slide-in-r { from { transform:translateX(110%) }           to { transform:translateX(0) } }
@keyframes float      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes spin       { to { transform:rotate(360deg) } }
@keyframes pulse-dot  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
@keyframes shimmer    { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
@keyframes glow-pulse { 0%,100%{box-shadow:0 0 14px rgba(108,92,231,.28)} 50%{box-shadow:0 0 38px rgba(108,92,231,.58),0 0 60px rgba(0,209,255,.22)} }
@keyframes progress-indeterminate {
  0%   { transform: translateX(-100%) }
  100% { transform: translateX(400%) }
}

/* ── Utility ── */
.fade-in  { animation: fade-in .42s ease both; }
.fade-up  { animation: fade-up .32s ease both; }
.float    { animation: float 5s ease-in-out infinite; }
.spin     { animation: spin .9s linear infinite; }

.grad-text {
  background: var(--grad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Cards ── */
.card {
  background: var(--surf);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: border-color var(--transition), box-shadow var(--transition);
}
.card-lift {
  transition: border-color var(--transition), box-shadow var(--transition), transform var(--transition);
}
.card-lift:hover {
  transform: translateY(-3px);
  border-color: rgba(108,92,231,.22);
  box-shadow: 0 18px 52px rgba(108,92,231,.09);
}

/* ── Buttons ── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s;
  border: none;
  outline: none;
  white-space: nowrap;
  font-family: 'DM Sans', sans-serif;
  letter-spacing: -.01em;
}
.btn-primary {
  background: var(--grad);
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(108,92,231,.42);
}
.btn-primary:active:not(:disabled) { transform: translateY(0); }
.btn-primary:disabled {
  opacity: .45;
  cursor: not-allowed;
}
.btn-outline {
  background: transparent;
  border: 1px solid var(--border2);
  color: var(--text);
}
.btn-outline:hover:not(:disabled) {
  background: var(--surf2);
  border-color: rgba(108,92,231,.35);
}
.btn-ghost {
  background: transparent;
  border: 1px solid transparent;
  color: var(--muted);
}
.btn-ghost:hover {
  color: var(--text);
  background: var(--surf2);
}
.btn-danger {
  background: rgba(255,82,82,.12);
  border: 1px solid rgba(255,82,82,.25);
  color: var(--err);
}
.btn-danger:hover { background: rgba(255,82,82,.2); }
.btn.glow-pulse { animation: glow-pulse 2.8s ease-in-out infinite; }

/* ── Nav Items ── */
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--muted);
  font-size: 13.5px;
  font-weight: 500;
  transition: all .15s;
  border: 1px solid transparent;
  user-select: none;
}
.nav-item:hover { background: var(--surf2); color: var(--text); }
.nav-item.active {
  background: var(--grad-subtle);
  border-color: rgba(108,92,231,.2);
  color: var(--text);
}

/* ── Badge ── */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: .01em;
  background: var(--surf2);
  border: 1px solid var(--border2);
  white-space: nowrap;
}

/* ── Dot ── */
.dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.dot.pulse { animation: pulse-dot 2s ease-in-out infinite; }

/* ── Progress ── */
.progress-track {
  height: 5px;
  background: var(--surf2);
  border-radius: 99px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--grad);
  border-radius: 99px;
  transition: width .3s ease;
}
.progress-fill.indeterminate {
  width: 40% !important;
  animation: progress-indeterminate 1.4s ease-in-out infinite;
}

/* ── Skeleton ── */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surf2) 25%,
    var(--surf3) 50%,
    var(--surf2) 75%
  );
  background-size: 600px 100%;
  animation: shimmer 1.8s infinite;
  border-radius: 8px;
}

/* ── Drop Zone ── */
.drop-zone {
  border: 2px dashed var(--border2);
  border-radius: var(--radius-lg);
  padding: 56px 32px;
  text-align: center;
  cursor: pointer;
  transition: all .2s;
  position: relative;
}
.drop-zone:hover,
.drop-zone.drag {
  border-color: var(--acc);
  background: rgba(108,92,231,.04);
  box-shadow: inset 0 0 48px rgba(108,92,231,.05);
}

/* ── Table ── */
table { border-collapse: collapse; width: 100%; }
th {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: var(--muted);
  padding: 12px 18px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
td {
  padding: 13px 18px;
  font-size: 13.5px;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  vertical-align: middle;
}
tr:last-child td { border-bottom: none; }
tr:hover td { background: var(--surf2); transition: background .12s; }

/* ── Toasts ── */
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.toast-item {
  animation: slide-in-r .26s ease;
  pointer-events: all;
}

/* ── Layout ── */
.sidebar {
  width: 232px;
  height: 100vh;
  position: fixed;
  left: 0; top: 0;
  background: var(--surf);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  z-index: 50;
  transition: background var(--transition), border-color var(--transition);
}
.main-area { margin-left: 232px; min-height: 100vh; }
.topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  background: var(--nav-bg);
  border-bottom: 1px solid var(--border);
  padding: 12px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  transition: background var(--transition), border-color var(--transition);
}
.page-content { padding: 28px; }
.dashboard-shell {
  position: relative;
  min-height: 100vh;
}
.dashboard-glow {
  position: fixed;
  width: 460px;
  height: 460px;
  border-radius: 50%;
  filter: blur(110px);
  opacity: .12;
  pointer-events: none;
  z-index: 0;
}
.dashboard-glow-a {
  top: -120px;
  right: -80px;
  background: rgba(0,209,255,.9);
}
.dashboard-glow-b {
  bottom: -140px;
  left: 140px;
  background: rgba(108,92,231,.9);
}
.dashboard-sidebar-card {
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,.03) 0%, rgba(255,255,255,.01) 100%);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.dashboard-brand-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.dashboard-brand-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.dashboard-brand-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -.03em;
  line-height: 1.08;
  max-width: 11ch;
}
.dashboard-brand-copy {
  font-size: 12.5px;
  color: var(--muted);
  line-height: 1.55;
}
.dashboard-sidebar-label {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--muted);
}
.dashboard-micro-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 13px 12px 12px;
  border-radius: 14px;
  background: rgba(255,255,255,.025);
  border: 1px solid var(--border);
  min-width: 0;
}
.dashboard-micro-card.network.prototype {
  border-color: rgba(245,158,11,.18);
  background: rgba(245,158,11,.05);
}
.dashboard-micro-card.network.stable {
  border-color: rgba(16,185,129,.16);
  background: rgba(16,185,129,.05);
}
.dashboard-micro-card.status {
  border-color: rgba(0,200,83,.14);
}
.dashboard-micro-icon {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dashboard-micro-body {
  min-width: 0;
}
.dashboard-micro-value {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
  line-height: 1.15;
  letter-spacing: -.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dashboard-micro-copy {
  font-size: 11px;
  color: var(--muted);
  line-height: 1.35;
}
.dashboard-network-banner {
  margin: 10px 0 14px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: rgba(255,255,255,.02);
}
.dashboard-network-banner.prototype {
  border-color: rgba(245,158,11,.26);
  background: rgba(245,158,11,.08);
}
.dashboard-network-banner.stable {
  border-color: rgba(16,185,129,.2);
  background: rgba(16,185,129,.07);
}
.dashboard-network-banner-title {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .08em;
  margin-bottom: 4px;
}
.dashboard-network-banner.prototype .dashboard-network-banner-title {
  color: #fbbf24;
}
.dashboard-network-banner.stable .dashboard-network-banner-title {
  color: #34d399;
}
.dashboard-network-banner-copy {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--text);
}
.dashboard-network-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.dashboard-topbar-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dashboard-topbar-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -.03em;
}
.dashboard-topbar-subtitle {
  font-size: 12.5px;
  color: var(--muted);
}
.dashboard-page {
  position: relative;
  z-index: 1;
}
.dashboard-section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 24px;
}
.dashboard-summary-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.dashboard-summary-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,.04);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 12.5px;
  font-weight: 600;
}
.dashboard-summary-chip.prototype {
  color: #fbbf24;
  border-color: rgba(245,158,11,.28);
  background: rgba(245,158,11,.1);
}
.dashboard-summary-chip.stable {
  color: #34d399;
  border-color: rgba(16,185,129,.25);
  background: rgba(16,185,129,.08);
}

/* ── Landing ── */
.lp-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 64px;
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--nav-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  transition: background var(--transition);
}
.hero { padding: 96px 64px 72px; text-align: center; position: relative; overflow: hidden; }
.lp-section { padding: 72px 64px; max-width: 1160px; margin: 0 auto; }
.lp-hero-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin: 0 auto 24px;
}
.lp-hero-chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,.03);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -.01em;
}
.lp-compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: stretch;
}
.lp-compare-card {
  padding: 30px 30px 28px;
  border-radius: 24px;
  border: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(255,255,255,.02) 0%, rgba(255,255,255,.01) 100%);
  position: relative;
  overflow: hidden;
}
.lp-compare-card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 1px;
  opacity: .9;
}
.lp-compare-card.is-before {
  border-color: rgba(255,82,82,.16);
  background: linear-gradient(180deg, rgba(255,82,82,.04) 0%, rgba(255,82,82,.015) 100%);
}
.lp-compare-card.is-before::before {
  background: linear-gradient(90deg, rgba(255,82,82,.55), rgba(255,82,82,0));
}
.lp-compare-card.is-after {
  border-color: rgba(108,92,231,.22);
  background:
    radial-gradient(circle at top right, rgba(0,209,255,.08), transparent 34%),
    linear-gradient(180deg, rgba(108,92,231,.06) 0%, rgba(108,92,231,.02) 100%);
}
.lp-compare-card.is-after::before {
  background: linear-gradient(90deg, rgba(0,209,255,.5), rgba(108,92,231,0));
}
.lp-compare-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}
.lp-compare-kicker {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid var(--border2);
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
}
.lp-compare-kicker.is-before {
  color: #ff6b6b;
  border-color: rgba(255,82,82,.28);
  background: rgba(255,82,82,.08);
}
.lp-compare-kicker.is-after {
  color: #8fb2ff;
  border-color: rgba(108,92,231,.26);
  background: rgba(108,92,231,.08);
}
.lp-compare-eyebrow {
  font-size: 11.5px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .08em;
}
.lp-compare-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: clamp(22px, 2.4vw, 30px);
  font-weight: 700;
  letter-spacing: -.04em;
  line-height: 1.08;
  margin-bottom: 24px;
  max-width: 15ch;
}
.lp-compare-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.lp-compare-item {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}
.lp-compare-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .08em;
  margin-top: 1px;
}
.lp-compare-mark.is-before {
  color: #ff6b6b;
  background: rgba(255,82,82,.1);
  border: 1px solid rgba(255,82,82,.2);
}
.lp-compare-mark.is-after {
  color: #22c55e;
  background: rgba(34,197,94,.1);
  border: 1px solid rgba(34,197,94,.2);
}
.lp-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}
.lp-stat-card {
  padding: 24px 20px;
  text-align: center;
  border-radius: 22px;
  border: 1px solid var(--border);
  background:
    linear-gradient(180deg, rgba(255,255,255,.03) 0%, rgba(255,255,255,.01) 100%);
}
.lp-stat-label {
  font-size: 12.5px;
  color: var(--muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
}
.lp-cta-shell {
  padding: 80px 64px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.lp-cta-card {
  position: relative;
  max-width: 860px;
  margin: 0 auto;
  padding: 42px 36px;
  border-radius: 28px;
  border: 1px solid rgba(108,92,231,.16);
  background:
    radial-gradient(circle at top right, rgba(0,209,255,.08), transparent 32%),
    linear-gradient(180deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.015) 100%);
  box-shadow: 0 24px 70px rgba(108,92,231,.09);
}
.lp-cta-kicker {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(108,92,231,.08);
  border: 1px solid rgba(108,92,231,.16);
  color: var(--acc);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  margin-bottom: 18px;
}
.lp-cta-title {
  font-size: clamp(28px,5vw,54px);
  font-weight: 800;
  letter-spacing: -.05em;
  margin-bottom: 18px;
  position: relative;
}
.lp-cta-copy {
  color: var(--muted);
  font-size: 17px;
  line-height: 1.7;
  max-width: 620px;
  margin: 0 auto 34px;
  position: relative;
}
.lp-cta-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
.lp-footer {
  border-top: 1px solid var(--border);
  padding: 24px 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
}
.lp-footer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.lp-footer-copy {
  font-size: 13px;
  color: var(--muted);
}
.lp-footer-links {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

/* ── Input ── */
input[type="file"] { display: none; }
button:focus-visible { outline: 2px solid var(--acc); outline-offset: 2px; }
select,
textarea,
input:not([type="file"]) {
  color: var(--text);
}
select {
  appearance: none;
  -webkit-appearance: none;
  color-scheme: inherit;
}
select option,
select optgroup {
  background: var(--surf);
  color: var(--text);
}
select:disabled,
textarea:disabled,
input:disabled {
  cursor: not-allowed;
  opacity: .72;
}

/* ── Dropdown ── */
.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--surf);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  padding: 6px;
  min-width: 200px;
  z-index: 300;
  box-shadow: var(--shadow-lg);
}
.dd-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text);
  transition: background .12s;
}
.dd-item:hover { background: var(--surf2); }

/* ── Stat card ── */
.stat-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .07em;
}
.stat-value {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -.04em;
  font-family: 'Bricolage Grotesque', sans-serif;
  line-height: 1;
}
.stat-sub {
  font-size: 12.5px;
  color: var(--muted);
  margin-top: 5px;
}

/* ── Alert banner ── */
.alert-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: var(--radius);
  font-size: 13.5px;
  font-weight: 500;
  margin-bottom: 20px;
}
.alert-warning {
  background: rgba(245,158,11,.1);
  border: 1px solid rgba(245,158,11,.25);
  color: #F59E0B;
}
.alert-error {
  background: rgba(255,82,82,.08);
  border: 1px solid rgba(255,82,82,.2);
  color: var(--err);
}
.alert-info {
  background: rgba(108,92,231,.08);
  border: 1px solid rgba(108,92,231,.2);
  color: var(--acc);
}

/* ── Code ── */
code {
  font-family: 'JetBrains Mono', monospace;
  font-size: .87em;
}

@media (max-width: 1100px) {
  .sidebar {
    position: static;
    width: auto;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  .main-area {
    margin-left: 0;
  }
  .topbar {
    padding: 14px 20px;
  }
  .page-content {
    padding: 20px;
  }
  .dashboard-section-head {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 780px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
  .dashboard-sidebar-card,
  .card {
    border-radius: 16px;
  }
  .dashboard-micro-card {
    min-width: 0;
  }
  .dashboard-summary-strip {
    width: 100%;
  }
  .lp-compare-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .lp-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .lp-compare-card {
    padding: 22px 20px 20px;
    border-radius: 20px;
  }
  .lp-compare-topline {
    flex-direction: column;
    align-items: flex-start;
  }
  .lp-compare-title {
    max-width: none;
    font-size: 24px;
    margin-bottom: 18px;
  }
  .lp-cta-shell {
    padding: 56px 20px;
  }
  .lp-cta-card {
    padding: 28px 20px;
    border-radius: 22px;
  }
  .lp-cta-copy {
    font-size: 15px;
  }
  .lp-footer {
    padding: 22px 20px 28px;
    align-items: flex-start;
  }
  .lp-footer-brand,
  .lp-footer-links {
    width: 100%;
  }
  .dashboard-brand-title {
    font-size: 16px;
    max-width: none;
  }
  .dashboard-brand-copy {
    font-size: 12px;
  }
  .dashboard-network-grid {
    grid-template-columns: 1fr;
  }
}
`
