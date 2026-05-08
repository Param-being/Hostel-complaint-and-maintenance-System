import { useState, useEffect, createContext, useContext } from "react";
import { io } from "socket.io-client";

const API = "http://localhost:5000/api";
const socket = io("http://localhost:5000");

// ─── THEME CONTEXT ────────────────────────────────────────────────────────────
const ThemeContext = createContext(null);
const useTheme = () => useContext(ThemeContext);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("hc_theme") || "dark");
  const toggleTheme = () => setTheme(t => {
    const next = t === "dark" ? "light" : "dark";
    localStorage.setItem("hc_theme", next);
    return next;
  });
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div data-theme={theme} style={{minHeight:"100vh"}}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// ─── AUTH CONTEXT ────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hc_user")); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("hc_token") || "");

  const login = (userData, tok) => {
    setUser(userData); setToken(tok);
    localStorage.setItem("hc_user", JSON.stringify(userData));
    localStorage.setItem("hc_token", tok);
  };
  const logout = () => {
    setUser(null); setToken("");
    localStorage.removeItem("hc_user");
    localStorage.removeItem("hc_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── API HELPER ──────────────────────────────────────────────────────────────
function useApi() {
  const { token } = useAuth();
  const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` });
  const get = async (path) => { const r = await fetch(API + path, { headers: headers() }); return r.json(); };
  const post = async (path, body, isForm = false) => {
    const opts = isForm
      ? { method: "POST", headers: { Authorization: `Bearer ${token}` }, body }
      : { method: "POST", headers: headers(), body: JSON.stringify(body) };
    const r = await fetch(API + path, opts); return r.json();
  };
  const put = async (path, body) => {
    const r = await fetch(API + path, { method: "PUT", headers: headers(), body: JSON.stringify(body) });
    return r.json();
  };
  return { get, post, put };
}

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const styles = `
  @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=cabinet-grotesk@400,500,700,800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --tr: 0.4s cubic-bezier(0.4,0,0.2,1); }

  /* ── THEME TOKENS (exact from Landing.html) ── */
  [data-theme="dark"] {
    --bg-l:#07090f; --bg-r:#0c0f18;
    --accent:#5b8ff9; --accent2:#a78bfa;
    --aglow:rgba(91,143,249,0.2); --a2glow:rgba(167,139,250,0.15);
    --thi:#f0f4ff; --tmd:#7d8aaa; --tlo:#3a4260;
    --ibg:rgba(255,255,255,0.04); --ibd:rgba(255,255,255,0.08);
    --ifoc:rgba(91,143,249,0.55); --icol:#eef1f8;
    --cbg:rgba(255,255,255,0.03); --cbd:rgba(255,255,255,0.07);
    --div:rgba(255,255,255,0.06);
    --pill-bg:rgba(91,143,249,0.13); --pill-col:#7fa8ff;
    --wl:rgba(255,218,70,0.92); --wd:rgba(28,38,68,0.7);
    --bld:#192038; --bld2:#111929; --roof:#0b1020;
    --sky0:#04060e; --sky1:#0c1428;
    --gnd:#090d1c; --path:#151d38; --tree:#0e3322;
    --lt-hi:rgba(255,255,255,0.88); --lt-md:rgba(255,255,255,0.36);
    --lt-lo:rgba(255,255,255,0.14); --sep:rgba(255,255,255,0.08);
  }
  [data-theme="light"] {
    --bg-l:#0f1e4a; --bg-r:#f4f6fb;
    --accent:#2d62f5; --accent2:#7c3aed;
    --aglow:rgba(45,98,245,0.18); --a2glow:rgba(124,58,237,0.12);
    --thi:#0d1a3a; --tmd:#4a5680; --tlo:#9aa4c0;
    --ibg:#fff; --ibd:#dde2f0;
    --ifoc:rgba(45,98,245,0.45); --icol:#0d1a3a;
    --cbg:#fff; --cbd:#dde2f0; --div:#c8d0e8;
    --pill-bg:rgba(45,98,245,0.1); --pill-col:#2d62f5;
    --wl:rgba(255,218,70,0.95); --wd:rgba(190,210,255,0.3);
    --bld:#253c80; --bld2:#1c2d65; --roof:#131f4a;
    --sky0:#162354; --sky1:#1e3278;
    --gnd:#101c48; --path:#1a2858; --tree:#1a5c38;
    --lt-hi:rgba(255,255,255,0.92); --lt-md:rgba(255,255,255,0.48);
    --lt-lo:rgba(255,255,255,0.22); --sep:rgba(255,255,255,0.12);
  }

  body { font-family: 'Cabinet Grotesk', sans-serif; background: var(--bg-r, #0c0f18); color: var(--thi, #f0f4ff); min-height: 100vh; }

  /* ══ AUTH PAGE ══ */
  .auth-page { display:flex; height:100vh; width:100vw; overflow:hidden; }

  .auth-left {
    flex:0 0 50%; background:var(--bg-l); position:relative;
    display:flex; flex-direction:column; overflow:hidden; transition:background var(--tr);
  }
  .auth-left::before { content:''; position:absolute; top:-100px; left:-80px; width:350px; height:350px; border-radius:50%; background:radial-gradient(circle,rgba(91,143,249,0.09) 0%,transparent 70%); pointer-events:none; z-index:0; }
  .auth-left::after  { content:''; position:absolute; bottom:-80px; right:-60px; width:280px; height:280px; border-radius:50%; background:radial-gradient(circle,rgba(167,139,250,0.07) 0%,transparent 70%); pointer-events:none; z-index:0; }

  .auth-brand { position:relative; z-index:3; padding:2rem 2.2rem 0; display:flex; align-items:center; gap:12px; }
  .auth-logo-box { width:42px; height:42px; background:linear-gradient(135deg,var(--accent),var(--accent2)); border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 22px rgba(91,143,249,0.28); position:relative; flex-shrink:0; }
  .auth-logo-box svg { width:20px; height:20px; fill:none; stroke:#fff; stroke-width:2.3; stroke-linecap:round; }
  .auth-live-dot { position:absolute; top:-3px; right:-3px; width:10px; height:10px; background:#22d37a; border-radius:50%; border:2px solid var(--bg-l); animation:ldot 2.2s ease-in-out infinite; transition:border-color var(--tr); }
  .auth-brand-text h1 { font-family:'Clash Display',sans-serif; font-size:1.5rem; font-weight:700; color:#fff; letter-spacing:-0.5px; line-height:1; }
  .auth-brand-text h1 span { background:linear-gradient(90deg,var(--accent),var(--accent2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .auth-brand-text p { font-size:0.6rem; color:rgba(255,255,255,0.28); letter-spacing:0.18em; text-transform:uppercase; margin-top:2px; }

  .auth-scene { position:relative; z-index:3; flex:1; min-height:0; display:flex; align-items:flex-end; padding:0 1.4rem; }
  .auth-scene svg { width:100%; height:auto; display:block; }

  .auth-footer { position:relative; z-index:3; padding:1rem 2.2rem 1.8rem; display:flex; flex-direction:column; gap:0.85rem; }
  .auth-tagline { font-family:'Clash Display',sans-serif; font-size:1rem; font-weight:600; color:var(--lt-hi); letter-spacing:-0.2px; line-height:1.35; }
  .auth-tagline span { background:linear-gradient(90deg,var(--accent),var(--accent2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .feat-row { display:flex; align-items:center; }
  .feat-item { display:flex; align-items:center; gap:5px; }
  .feat-item+.feat-item { margin-left:14px; padding-left:14px; border-left:1px solid var(--sep); }
  .feat-item svg { width:12px; height:12px; fill:none; stroke:var(--accent); stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round; opacity:0.75; }
  .feat-item span { font-size:0.68rem; color:var(--lt-md); }
  .auth-stats-row { display:flex; align-items:center; padding-top:0.85rem; border-top:1px solid var(--sep); }
  .auth-stat { flex:1; text-align:center; }
  .auth-stat+.auth-stat { border-left:1px solid var(--sep); }
  .auth-stat-n { font-family:'Clash Display',sans-serif; font-size:1.15rem; font-weight:700; color:#fff; line-height:1; letter-spacing:-0.5px; }
  .auth-stat-l { font-size:0.58rem; color:var(--lt-lo); text-transform:uppercase; letter-spacing:0.08em; margin-top:3px; }

  .auth-divider { flex:0 0 1px; background:var(--div); transition:background var(--tr); }

  .auth-right { flex:1; background:var(--bg-r); display:flex; align-items:center; justify-content:center; padding:2rem; position:relative; overflow:hidden; transition:background var(--tr); }
  .auth-right::before { content:''; position:absolute; top:-70px; right:-70px; width:240px; height:240px; border-radius:50%; background:var(--aglow); filter:blur(55px); pointer-events:none; }
  .auth-right::after  { content:''; position:absolute; bottom:-50px; left:-40px; width:170px; height:170px; border-radius:50%; background:var(--a2glow); filter:blur(45px); pointer-events:none; }

  .theme-toggle { position:absolute; top:1.4rem; right:1.4rem; display:flex; align-items:center; background:var(--cbg); border:1px solid var(--cbd); border-radius:100px; padding:4px; cursor:pointer; transition:border-color var(--tr); z-index:10; }
  .theme-toggle:hover { border-color:var(--accent); }
  .t-opt { width:30px; height:30px; border-radius:100px; display:flex; align-items:center; justify-content:center; transition:all 0.25s cubic-bezier(0.4,0,0.2,1); cursor:pointer; border:none; background:transparent; }
  .t-opt svg { width:14px; height:14px; fill:none; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; transition:stroke 0.25s; }
  .t-opt.active { background:linear-gradient(135deg,var(--accent),var(--accent2)); box-shadow:0 2px 10px var(--aglow); }
  .t-opt.active svg { stroke:#fff; }
  .t-opt:not(.active) svg { stroke:var(--tlo); }

  .login-card { width:100%; max-width:390px; position:relative; z-index:2; animation:fadeUp 0.7s 0.1s ease both; }
  .welcome-pill { display:inline-flex; align-items:center; gap:6px; background:var(--pill-bg); color:var(--pill-col); font-size:0.72rem; font-weight:700; padding:4px 12px; border-radius:100px; margin-bottom:0.8rem; letter-spacing:0.04em; }
  .pdot { width:6px; height:6px; background:currentColor; border-radius:50%; animation:pulse 2s infinite; }
  .login-title { font-family:'Clash Display',sans-serif; font-size:1.95rem; font-weight:700; color:var(--thi); letter-spacing:-0.5px; line-height:1.1; margin-bottom:0.25rem; transition:color var(--tr); }
  .login-sub { font-size:0.85rem; color:var(--tmd); margin-bottom:1.5rem; }

  .role-tabs { display:flex; gap:5px; background:var(--ibg); border:1px solid var(--ibd); border-radius:12px; padding:4px; margin-bottom:1.4rem; }
  .role-tab { flex:1; padding:0.48rem 0; border:none; border-radius:8px; background:transparent; color:var(--tlo); font-family:'Cabinet Grotesk',sans-serif; font-size:0.79rem; font-weight:700; cursor:pointer; transition:all 0.22s; display:flex; align-items:center; justify-content:center; gap:4px; }
  .role-tab.active { background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#fff; box-shadow:0 4px 16px var(--aglow); }
  .role-tab:not(.active):hover { color:var(--tmd); background:var(--ibd); }

  .auth-form-group { margin-bottom:0.95rem; }
  .auth-label { display:block; font-size:0.75rem; font-weight:700; color:var(--tmd); margin-bottom:5px; letter-spacing:0.05em; text-transform:uppercase; }
  .input-wrap { position:relative; }
  .iico { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--tlo); pointer-events:none; display:flex; }
  .iico svg { width:15px; height:15px; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; }
  .auth-input { width:100%; height:46px; background:var(--ibg); border:1px solid var(--ibd); border-radius:10px; padding:0 14px 0 38px; font-family:'Cabinet Grotesk',sans-serif; font-size:0.88rem; color:var(--icol); outline:none; transition:all var(--tr); }
  .auth-input:focus { border-color:var(--ifoc); box-shadow:0 0 0 3px var(--aglow); }
  .auth-input::placeholder { color:var(--tlo); }
  .ptog { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--tlo); cursor:pointer; display:flex; padding:0; }
  .ptog svg { width:15px; height:15px; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; }

  .row-flex { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.3rem; }
  .rlab { display:flex; align-items:center; gap:7px; font-size:0.8rem; color:var(--tmd); cursor:pointer; }
  .rlab input[type="checkbox"] { width:15px; height:15px; accent-color:var(--accent); cursor:pointer; }
  .flink { font-size:0.8rem; color:var(--accent); font-weight:700; cursor:pointer; background:none; border:none; font-family:'Cabinet Grotesk',sans-serif; }
  .flink:hover { opacity:0.7; }

  .btn-login { width:100%; height:48px; background:linear-gradient(135deg,var(--accent) 0%,var(--accent2) 100%); color:#fff; border:none; border-radius:11px; font-family:'Clash Display',sans-serif; font-size:1rem; font-weight:600; letter-spacing:0.03em; cursor:pointer; position:relative; overflow:hidden; transition:transform 0.15s,box-shadow 0.2s; box-shadow:0 6px 24px var(--aglow); }
  .btn-login:hover { transform:translateY(-2px); box-shadow:0 12px 32px var(--aglow); }
  .btn-login:active { transform:translateY(0); }
  .btn-login:disabled { opacity:0.7; cursor:not-allowed; transform:none; }
  .bshine { position:absolute; inset:0; background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.17) 50%,transparent 60%); transform:translateX(-100%); transition:transform 0.5s; pointer-events:none; }
  .btn-login:hover .bshine { transform:translateX(100%); }

  .auth-switch { text-align:center; margin-top:0.9rem; font-size:0.82rem; color:var(--tmd); }
  .auth-switch button { background:none; border:none; color:var(--accent); cursor:pointer; font-weight:700; font-family:'Cabinet Grotesk',sans-serif; font-size:0.82rem; }

  .auth-error { background:rgba(220,38,38,0.08); border:1px solid rgba(220,38,38,0.22); color:#ef4444; font-size:0.8rem; padding:10px 14px; border-radius:9px; margin-bottom:1rem; }

  .sos-strip { margin-top:1.1rem; display:flex; align-items:center; gap:10px; background:rgba(220,38,38,0.07); border:1px solid rgba(220,38,38,0.18); border-radius:10px; padding:10px 14px; cursor:pointer; transition:all 0.2s; }
  .sos-strip:hover { background:rgba(220,38,38,0.13); border-color:rgba(220,38,38,0.3); }
  .sos-icon { width:28px; height:28px; background:#dc2626; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; animation:sosGlow 1.8s ease-in-out infinite; }
  .sos-icon svg { width:13px; height:13px; fill:none; stroke:#fff; stroke-width:2.5; stroke-linecap:round; }
  .sos-text { flex:1; }
  .sos-title { font-size:0.78rem; font-weight:700; color:#ef4444; display:block; }
  .sos-sub { font-size:0.68rem; color:var(--tlo); }
  .sos-arr { color:#ef4444; font-size:14px; opacity:0.6; }

  /* SVG scene animations */
  .star { animation:twinkle var(--d,3s) ease-in-out infinite; animation-delay:var(--dly,0s); }
  @keyframes twinkle { 0%,100%{opacity:0.9} 50%{opacity:0.15} }
  .moon-g { animation:moonGlow 4s ease-in-out infinite; }
  @keyframes moonGlow { 0%,100%{filter:drop-shadow(0 0 5px rgba(200,215,255,0.5))} 50%{filter:drop-shadow(0 0 14px rgba(200,215,255,0.85))} }
  .win { animation:winFlick var(--d,7s) ease-in-out infinite; animation-delay:var(--dly,0s); }
  @keyframes winFlick { 0%,91%,95%,100%{opacity:1} 92%,94%{opacity:0.2} }
  .lamp-glow { animation:lampPulse 3s ease-in-out infinite; animation-delay:var(--dly,0s); }
  @keyframes lampPulse { 0%,100%{opacity:0.5} 50%{opacity:0.85} }
  .cloud { animation:cloudDrift var(--d,32s) linear infinite; animation-delay:var(--dly,0s); }
  @keyframes cloudDrift { from{transform:translateX(0)} to{transform:translateX(-420px)} }
  .scene-flag { animation:flagWave 2.4s ease-in-out infinite; transform-origin:196px 68px; }
  @keyframes flagWave { 0%,100%{transform:skewX(0deg) scaleY(1)} 35%{transform:skewX(-7deg) scaleY(0.95)} 70%{transform:skewX(5deg) scaleY(1.03)} }
  .bird { animation:birdFly 11s ease-in-out infinite; animation-delay:var(--dly,0s); }
  @keyframes birdFly { 0%,100%{transform:translate(0,0)} 50%{transform:translate(18px,-6px)} }
  .scene-tree { animation:treeSway var(--d,4s) ease-in-out infinite; animation-delay:var(--dly,0s); }
  @keyframes treeSway { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(var(--lean,1.5deg))} }
  .path-glow { animation:pathPulse 3s ease-in-out infinite; }
  @keyframes pathPulse { 0%,100%{opacity:0.15} 50%{opacity:0.4} }

  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes ldot { 0%,100%{box-shadow:0 0 0 0 rgba(34,211,122,0.5)} 60%{box-shadow:0 0 0 5px rgba(34,211,122,0)} }
  @keyframes sosGlow { 0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0.5)} 50%{box-shadow:0 0 0 6px rgba(220,38,38,0)} }

  /* ══ DASHBOARD STYLES ══ */
  .app-shell { display:flex; min-height:100vh; }
  .sidebar { width:240px; background:var(--bg-l, #07090f); border-right:1px solid var(--div, rgba(255,255,255,0.07)); display:flex; flex-direction:column; flex-shrink:0; position:fixed; height:100vh; z-index:100; }
  .sidebar-logo { padding:28px 24px 24px; border-bottom:1px solid var(--div, rgba(255,255,255,0.07)); font-family:'Clash Display',sans-serif; font-weight:800; font-size:1.3rem; display:flex; align-items:center; gap:10px; color:var(--thi, #f0f4ff); }
  .sidebar-nav { padding:16px 12px; flex:1; display:flex; flex-direction:column; gap:4px; overflow-y:auto; }
  .nav-label { font-size:0.65rem; font-weight:700; letter-spacing:0.12em; color:var(--tlo, rgba(125,138,170,0.6)); padding:12px 12px 6px; text-transform:uppercase; }
  .nav-item { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:8px; cursor:pointer; font-size:0.875rem; color:var(--tmd, #7d8aaa); transition:all 0.15s; font-weight:600; border:none; background:none; width:100%; text-align:left; font-family:'Cabinet Grotesk',sans-serif; }
  .nav-item:hover { background:rgba(91,143,249,0.07); color:var(--thi, #f0f4ff); }
  .nav-item.active { background:rgba(91,143,249,0.12); color:var(--thi, #f0f4ff); }
  .nav-item .icon { font-size:1rem; width:20px; text-align:center; }
  .sidebar-user { padding:16px; border-top:1px solid var(--div, rgba(255,255,255,0.07)); display:flex; align-items:center; gap:10px; }
  .user-avatar { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.875rem; flex-shrink:0; }
  .user-info { flex:1; min-width:0; }
  .user-name { font-size:0.875rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--thi, #f0f4ff); }
  .user-role { font-size:0.7rem; color:var(--tmd, #7d8aaa); text-transform:capitalize; }

  .main { margin-left:240px; flex:1; padding:32px; min-height:100vh; background:var(--bg-r, #0c0f18); }
  .page-header { margin-bottom:28px; }
  .page-title { font-family:'Clash Display',sans-serif; font-size:1.75rem; font-weight:700; margin-bottom:4px; color:var(--thi, #f0f4ff); }
  .page-sub { color:var(--tmd, #7d8aaa); font-size:0.875rem; }

  .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:16px; margin-bottom:28px; }
  .stat-card { background:var(--cbg, rgba(255,255,255,0.03)); border:1px solid var(--cbd, rgba(255,255,255,0.07)); border-radius:14px; padding:20px; position:relative; overflow:hidden; }
  .stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:14px 14px 0 0; }
  .stat-card.blue::before { background:#5b8ff9; }
  .stat-card.red::before { background:#ef4444; }
  .stat-card.green::before { background:#22d37a; }
  .stat-card.orange::before { background:#f59e0b; }
  .stat-icon { font-size:1.5rem; margin-bottom:12px; }
  .stat-val { font-family:'Clash Display',sans-serif; font-size:2rem; font-weight:800; margin-bottom:4px; line-height:1; color:var(--thi, #f0f4ff); }
  .stat-label { font-size:0.75rem; color:var(--tmd, #7d8aaa); font-weight:500; text-transform:uppercase; letter-spacing:0.05em; }

  .card { background:var(--cbg, rgba(255,255,255,0.03)); border:1px solid var(--cbd, rgba(255,255,255,0.07)); border-radius:14px; padding:24px; margin-bottom:20px; }
  .card-title { font-family:'Clash Display',sans-serif; font-size:1rem; font-weight:700; margin-bottom:18px; display:flex; align-items:center; gap:8px; color:var(--thi, #f0f4ff); }

  .complaint-list { display:flex; flex-direction:column; gap:12px; }
  .complaint-item { background:var(--ibg, rgba(255,255,255,0.025)); border:1px solid var(--ibd, rgba(255,255,255,0.07)); border-radius:10px; padding:16px; display:flex; align-items:flex-start; gap:14px; transition:border-color 0.15s; }
  .complaint-item:hover { border-color:rgba(91,143,249,0.4); }
  .complaint-icon { font-size:1.25rem; flex-shrink:0; margin-top:2px; }
  .complaint-body { flex:1; min-width:0; }
  .complaint-title { font-weight:700; font-size:0.9rem; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--thi, #f0f4ff); }
  .complaint-desc { font-size:0.8rem; color:var(--tmd, #7d8aaa); margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .complaint-meta { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .complaint-img { width:60px; height:60px; border-radius:8px; object-fit:cover; flex-shrink:0; }

  .badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; }
  .badge-pending { background:rgba(245,158,11,0.15); color:#f59e0b; }
  .badge-progress { background:rgba(91,143,249,0.15); color:#5b8ff9; }
  .badge-resolved { background:rgba(34,211,122,0.15); color:#22d37a; }
  .meta-date { font-size:0.7rem; color:var(--tmd, #7d8aaa); }

  .form-group { margin-bottom:18px; }
  .form-label { font-size:0.8rem; font-weight:700; margin-bottom:7px; display:block; color:var(--tmd, #7d8aaa); text-transform:uppercase; letter-spacing:0.06em; }
  .form-input,.form-select,.form-textarea { width:100%; background:var(--ibg, rgba(255,255,255,0.04)); border:1px solid var(--ibd, rgba(255,255,255,0.08)); border-radius:8px; padding:10px 14px; color:var(--icol, #f0f4ff); font-size:0.875rem; font-family:'Cabinet Grotesk',sans-serif; outline:none; transition:border-color 0.15s; }
  .form-input:focus,.form-select:focus,.form-textarea:focus { border-color:var(--ifoc, rgba(91,143,249,0.55)); }
  .form-textarea { resize:vertical; min-height:100px; }
  .form-select option { background:var(--bg-r, #0c0f18); }

  .btn { display:inline-flex; align-items:center; gap:6px; padding:10px 20px; border-radius:8px; font-size:0.875rem; font-weight:700; cursor:pointer; border:none; transition:all 0.15s; font-family:'Cabinet Grotesk',sans-serif; }
  .btn-primary { background:linear-gradient(135deg,#5b8ff9,#a78bfa); color:#fff; }
  .btn-primary:hover { opacity:0.9; }
  .btn-danger { background:rgba(239,68,68,0.12); color:#ef4444; border:1px solid rgba(239,68,68,0.25); }
  .btn-danger:hover { background:rgba(239,68,68,0.2); }
  .btn-success { background:rgba(34,211,122,0.12); color:#22d37a; border:1px solid rgba(34,211,122,0.25); }
  .btn-success:hover { background:rgba(34,211,122,0.2); }
  .btn-sm { padding:6px 12px; font-size:0.78rem; }
  .btn:disabled { opacity:0.5; cursor:not-allowed; }

  .file-upload { border:2px dashed var(--ibd, rgba(255,255,255,0.1)); border-radius:10px; padding:24px; text-align:center; cursor:pointer; transition:border-color 0.15s; }
  .file-upload:hover { border-color:rgba(91,143,249,0.4); }

  .table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:0.85rem; }
  th { padding:10px 14px; text-align:left; font-size:0.7rem; color:var(--tmd, #7d8aaa); text-transform:uppercase; letter-spacing:0.08em; border-bottom:1px solid var(--div, rgba(255,255,255,0.07)); font-weight:700; }
  td { padding:12px 14px; border-bottom:1px solid var(--div, rgba(255,255,255,0.05)); vertical-align:middle; color:var(--thi, #f0f4ff); }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:var(--ibg, rgba(255,255,255,0.02)); }

  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); z-index:200; display:flex; align-items:center; justify-content:center; padding:24px; }
  .modal { background:var(--cbg, #12141a); border:1px solid var(--cbd, rgba(255,255,255,0.08)); border-radius:16px; padding:28px; width:100%; max-width:480px; }
  .modal-title { font-family:'Clash Display',sans-serif; font-weight:700; font-size:1.1rem; margin-bottom:20px; color:var(--thi, #f0f4ff); }
  .modal-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:20px; }

  .loading { text-align:center; padding:40px; color:var(--tmd, #7d8aaa); font-size:0.875rem; }
  .spinner { display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,0.1); border-top-color:#5b8ff9; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:6px; vertical-align:middle; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .empty { text-align:center; padding:48px 24px; color:var(--tmd, #7d8aaa); }
  .empty-icon { font-size:2.5rem; margin-bottom:12px; }
  .empty-text { font-size:0.875rem; }
  /* ══ DASHBOARD THEME TOGGLE ══ */
  .dash-theme-btn {
    display: flex; align-items: center; gap: 7px;
    background: var(--cbg, rgba(255,255,255,0.05));
    border: 1.5px solid var(--cbd, rgba(255,255,255,0.1));
    border-radius: 100px; padding: 5px 13px 5px 8px;
    cursor: pointer; transition: all 0.2s; color: var(--tmd, #7d8aaa);
    font-family: 'Cabinet Grotesk', sans-serif; font-size: 0.78rem; font-weight: 700;
  }
  .dash-theme-btn:hover { border-color: var(--accent); color: var(--thi); }
  .dash-theme-btn svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; flex-shrink: 0; }

  /* ══ LOGOUT BUTTON (improved) ══ */
  .logout-btn {
    display: flex; align-items: center; gap: 6px;
    background: rgba(239,68,68,0.08); border: 1.5px solid rgba(239,68,68,0.2);
    color: #ef4444; cursor: pointer; border-radius: 8px;
    padding: 6px 10px; font-size: 0.75rem; font-weight: 700;
    font-family: 'Cabinet Grotesk', sans-serif; transition: all 0.18s;
    white-space: nowrap;
  }
  .logout-btn:hover { background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.4); transform: translateY(-1px); }
  .logout-btn svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; flex-shrink: 0; }

  /* ══ COMPLAINT DETAIL MODAL ══ */
  .complaint-item.clickable { cursor: pointer; }
  .complaint-item.clickable:hover { border-color: rgba(91,143,249,0.5); background: rgba(91,143,249,0.04); }
  .complaint-detail-modal { background: var(--cbg, #12141a); border: 1px solid var(--cbd, rgba(255,255,255,0.1)); border-radius: 18px; padding: 0; width: 100%; max-width: 560px; overflow: hidden; }
  .cdm-header { background: linear-gradient(135deg, rgba(91,143,249,0.12), rgba(167,139,250,0.08)); padding: 22px 26px 18px; border-bottom: 1px solid var(--div, rgba(255,255,255,0.07)); }
  .cdm-header-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
  .cdm-title { font-family: 'Clash Display', sans-serif; font-size: 1.15rem; font-weight: 700; color: var(--thi, #f0f4ff); line-height: 1.3; }
  .cdm-close { background: rgba(255,255,255,0.07); border: none; color: var(--tmd, #7d8aaa); width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.15s; font-size: 1rem; }
  .cdm-close:hover { background: rgba(239,68,68,0.15); color: #ef4444; }
  .cdm-body { padding: 22px 26px; display: flex; flex-direction: column; gap: 16px; }
  .cdm-field { display: flex; flex-direction: column; gap: 5px; }
  .cdm-field-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--tmd, #7d8aaa); }
  .cdm-field-val { font-size: 0.875rem; color: var(--thi, #f0f4ff); line-height: 1.55; }
  .cdm-meta-row { display: flex; gap: 16px; flex-wrap: wrap; }
  .cdm-meta-row .cdm-field { flex: 1; min-width: 120px; }
  .cdm-img { width: 100%; max-height: 220px; object-fit: cover; border-radius: 10px; border: 1px solid var(--cbd, rgba(255,255,255,0.08)); }
  .click-hint { font-size: 0.68rem; color: rgba(91,143,249,0.6); margin-left: auto; display: flex; align-items: center; gap: 3px; }
  .cdm-ids-section { background: var(--ibg, rgba(255,255,255,0.03)); border: 1px solid var(--ibd, rgba(255,255,255,0.07)); border-radius: 10px; padding: 14px; }
  .cdm-id-row { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 7px; cursor: pointer; transition: background 0.15s; }
  .cdm-id-row:hover { background: rgba(91,143,249,0.08); }
  .cdm-id-tag { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent, #5b8ff9); background: rgba(91,143,249,0.1); padding: 2px 8px; border-radius: 20px; white-space: nowrap; flex-shrink: 0; }
  .cdm-id-val { font-size: 0.72rem; font-family: monospace; color: var(--tmd, #7d8aaa); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cdm-id-copy { font-size: 0.75rem; opacity: 0.5; flex-shrink: 0; }

  /* ══ USER ID POPUP ══ */
  .user-id-popup {
    position: absolute; bottom: calc(100% + 10px); left: 12px; right: 12px;
    background: var(--cbg, #12141a); border: 1px solid var(--accent, #5b8ff9);
    border-radius: 12px; padding: 14px 14px 12px;
    box-shadow: 0 -8px 32px rgba(91,143,249,0.18), 0 4px 16px rgba(0,0,0,0.4);
    z-index: 300; animation: fadeUp 0.18s ease both;
  }
  .uid-popup-arrow {
    position: absolute; bottom: -7px; left: 28px;
    width: 12px; height: 12px; background: var(--cbg, #12141a);
    border-right: 1px solid var(--accent, #5b8ff9); border-bottom: 1px solid var(--accent, #5b8ff9);
    transform: rotate(45deg);
  }
  .uid-popup-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent, #5b8ff9); margin-bottom: 7px; }
  .uid-popup-id {
    font-family: monospace; font-size: 0.72rem; color: var(--thi, #f0f4ff);
    background: var(--ibg, rgba(255,255,255,0.04)); border: 1px solid var(--ibd, rgba(255,255,255,0.08));
    border-radius: 7px; padding: 8px 10px; word-break: break-all; line-height: 1.5;
    margin-bottom: 10px;
  }
  .uid-popup-copy {
    width: 100%; padding: 7px; border-radius: 7px; border: 1px solid rgba(91,143,249,0.3);
    background: rgba(91,143,249,0.1); color: var(--accent, #5b8ff9);
    font-size: 0.78rem; font-weight: 700; font-family: 'Cabinet Grotesk', sans-serif;
    cursor: pointer; transition: all 0.15s;
  }
  .uid-popup-copy:hover { background: rgba(91,143,249,0.2); }
  .uid-popup-close {
    position: absolute; top: 8px; right: 8px;
    background: none; border: none; color: var(--tlo, #3a4260);
    font-size: 0.75rem; cursor: pointer; padding: 2px 5px; border-radius: 4px;
    transition: color 0.15s;
  }
  .uid-popup-close:hover { color: var(--tmd, #7d8aaa); }

  /* ══ WORKER PICKER ══ */
  .worker-list { display:flex; flex-direction:column; gap:8px; max-height:320px; overflow-y:auto; margin-bottom:4px; padding-right:2px; }
  .worker-card { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:10px; border:1.5px solid var(--ibd, rgba(255,255,255,0.08)); background:var(--ibg, rgba(255,255,255,0.03)); cursor:pointer; transition:all 0.15s; }
  .worker-card:hover { border-color:rgba(91,143,249,0.4); background:rgba(91,143,249,0.05); }
  .worker-card.selected { border-color:var(--accent,#5b8ff9); background:rgba(91,143,249,0.1); }
  .worker-avatar { width:36px; height:36px; border-radius:9px; background:rgba(34,211,122,0.15); color:#22d37a; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.85rem; flex-shrink:0; }
  .worker-card.selected .worker-avatar { background:rgba(91,143,249,0.2); color:var(--accent,#5b8ff9); }
  .worker-info { flex:1; min-width:0; }
  .worker-name { font-size:0.875rem; font-weight:700; color:var(--thi,#f0f4ff); margin-bottom:2px; }
  .worker-id-text { font-size:0.65rem; font-family:monospace; color:var(--tmd,#7d8aaa); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .worker-check { font-size:1rem; flex-shrink:0; }
  ::-webkit-scrollbar { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background:rgba(255,255,255,0.02); }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:3px; }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const statusBadge = (s) => {
  const map = { pending:"badge-pending", "in-progress":"badge-progress", resolved:"badge-resolved" };
  const icon = { pending:"⏳", "in-progress":"🔧", resolved:"✅" };
  return <span className={`badge ${map[s]||"badge-pending"}`}>{icon[s]} {s}</span>;
};
const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });

// ─── COMPLAINT DETAIL MODAL ───────────────────────────────────────────────────
function ComplaintDetailModal({ complaint: c, onClose }) {
  if (!c) return null;
  const copyId = (id) => navigator.clipboard?.writeText(id);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="complaint-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="cdm-header">
          <div className="cdm-header-top">
            <div className="cdm-title">🗂️ {c.title}</div>
            <button className="cdm-close" onClick={onClose}>✕</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            {statusBadge(c.status)}
            <span style={{fontSize:"0.72rem",color:"#7d8aaa"}}>Filed on {fmt(c.createdAt)}</span>
          </div>
        </div>
        <div className="cdm-body">

          {/* Description */}
          <div className="cdm-field">
            <span className="cdm-field-label">Description</span>
            <span className="cdm-field-val">{c.description || "No description provided."}</span>
          </div>

          {/* Image if exists */}
          {c.image && (
            <div className="cdm-field">
              <span className="cdm-field-label">📷 Attached Photo</span>
              <img src={c.image} alt="Complaint" className="cdm-img"/>
            </div>
          )}

          {/* People info */}
          <div className="cdm-meta-row">
            {c.user?.name && (
              <div className="cdm-field">
                <span className="cdm-field-label">Filed By</span>
                <span className="cdm-field-val">👤 {c.user.name}</span>
              </div>
            )}
            {c.assignedTo?.name && (
              <div className="cdm-field">
                <span className="cdm-field-label">Assigned To</span>
                <span className="cdm-field-val">👷 {c.assignedTo.name}</span>
              </div>
            )}
          </div>

          {/* IDs section */}
          <div className="cdm-ids-section">
            <div className="cdm-field-label" style={{marginBottom:8}}>🔑 IDs (click to copy)</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <div className="cdm-id-row" onClick={()=>copyId(c._id)} title="Click to copy">
                <span className="cdm-id-tag">Complaint ID</span>
                <span className="cdm-id-val">{c._id}</span>
                <span className="cdm-id-copy">📋</span>
              </div>
              {c.user?._id && (
                <div className="cdm-id-row" onClick={()=>copyId(c.user._id)} title="Click to copy">
                  <span className="cdm-id-tag">Student ID</span>
                  <span className="cdm-id-val">{c.user._id}</span>
                  <span className="cdm-id-copy">📋</span>
                </div>
              )}
              {c.assignedTo?._id && (
                <div className="cdm-id-row" onClick={()=>copyId(c.assignedTo._id)} title="Click to copy">
                  <span className="cdm-id-tag">Worker ID</span>
                  <span className="cdm-id-val">{c.assignedTo._id}</span>
                  <span className="cdm-id-copy">📋</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── BUILDING SCENE SVG (pixel-perfect from Landing.html) ─────────────────────
function BuildingScene() {
  const stars = [[22,18,1,2.8,0],[58,10,1.2,3.6,0.4],[105,24,0.9,2.3,1.1],[148,9,1.1,4,0.7],
    [200,16,0.8,3.1,1.5],[248,7,1.2,2.5,0.2],[292,20,1,3.8,0.9],[345,12,0.9,2.9,1.8],
    [372,28,1.1,3.3,0.5],[42,38,0.7,4.2,1.3],[320,40,0.8,2.6,0.8]];
  return (
    <svg viewBox="0 0 390 240" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"auto",display:"block"}}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--sky0)"/><stop offset="100%" stopColor="var(--sky1)"/></linearGradient>
        <radialGradient id="moonG" cx="38%" cy="35%" r="50%"><stop offset="0%" stopColor="#e8eeff"/><stop offset="100%" stopColor="#b0c0f0"/></radialGradient>
        <radialGradient id="lamp1" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#ffd966" stopOpacity="0.55"/><stop offset="100%" stopColor="#ffd966" stopOpacity="0"/></radialGradient>
        <filter id="gf" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter>
        <clipPath id="sc"><rect width="390" height="240"/></clipPath>
      </defs>
      <g clipPath="url(#sc)">
        <rect width="390" height="240" fill="url(#sky)"/>
        {stars.map(([cx,cy,r,d,dly],i) => <circle key={i} className="star" cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.85)" style={{"--d":`${d}s`,"--dly":`${dly}s`}}/>)}
        <g className="moon-g"><circle cx="348" cy="34" r="20" fill="url(#moonG)"/><circle cx="355" cy="27" r="16" fill="var(--sky0)" opacity="0.88"/></g>
        <g className="cloud" style={{"--d":"38s","--dly":"0s"}}><ellipse cx="75" cy="60" rx="28" ry="9" fill="rgba(255,255,255,0.05)"/><ellipse cx="90" cy="55" rx="18" ry="7" fill="rgba(255,255,255,0.04)"/><ellipse cx="60" cy="58" rx="15" ry="5" fill="rgba(255,255,255,0.035)"/></g>
        <g className="cloud" style={{"--d":"50s","--dly":"-20s",transform:"translateX(-180px)"}}><ellipse cx="320" cy="44" rx="24" ry="8" fill="rgba(255,255,255,0.04)"/><ellipse cx="336" cy="39" rx="16" ry="6" fill="rgba(255,255,255,0.032)"/></g>
        <g className="bird" style={{"--dly":"0s"}}><path d="M145 52 q3-3.5 6 0" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="1.3" strokeLinecap="round"/></g>
        <g className="bird" style={{"--dly":"0.4s"}}><path d="M155 48 q3-3 6 0" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.1" strokeLinecap="round"/></g>
        <g className="bird" style={{"--dly":"0.8s"}}><path d="M167 51 q3-3 6 0" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1" strokeLinecap="round"/></g>
        <rect x="0" y="206" width="390" height="34" fill="var(--gnd)"/>
        <line x1="0" y1="206" x2="390" y2="206" stroke="rgba(91,143,249,0.15)" strokeWidth="0.8"/>
        <ellipse cx="195" cy="209" rx="55" ry="8" fill="var(--path)" opacity="0.9"/>
        <ellipse className="path-glow" cx="195" cy="209" rx="36" ry="4" fill="rgba(91,143,249,0.5)"/>
        <g className="scene-tree" style={{"--d":"4.4s","--dly":"0s","--lean":"1.8deg",transformOrigin:"29px 176px"}}><rect x="27" y="176" width="5" height="31" fill="#4a3520"/><ellipse cx="29" cy="170" rx="15" ry="19" fill="var(--tree)"/><ellipse cx="29" cy="163" rx="10" ry="12" fill="rgba(15,70,35,0.65)"/></g>
        <g className="scene-tree" style={{"--d":"3.7s","--dly":"0.7s","--lean":"-1.5deg",transformOrigin:"47px 176px"}}><rect x="45" y="184" width="4" height="23" fill="#4a3520"/><ellipse cx="47" cy="178" rx="11" ry="14" fill="var(--tree)"/></g>
        <g className="scene-tree" style={{"--d":"4.1s","--dly":"0.3s","--lean":"1.6deg",transformOrigin:"339px 176px"}}><rect x="337" y="178" width="5" height="29" fill="#4a3520"/><ellipse cx="339" cy="172" rx="14" ry="18" fill="var(--tree)"/><ellipse cx="339" cy="166" rx="9" ry="11" fill="rgba(15,70,35,0.6)"/></g>
        <g className="scene-tree" style={{"--d":"4.6s","--dly":"1s","--lean":"-1.7deg",transformOrigin:"355px 176px"}}><rect x="353" y="186" width="4" height="21" fill="#4a3520"/><ellipse cx="355" cy="180" rx="10" ry="13" fill="var(--tree)"/></g>
        <rect x="58" y="158" width="52" height="49" fill="var(--bld2)" rx="2"/>
        <polygon points="54,162 84,136 114,162" fill="var(--roof)"/>
        <line x1="54" y1="162" x2="114" y2="162" stroke="rgba(91,143,249,0.2)" strokeWidth="0.8"/>
        <rect className="win" x="66" y="167" width="11" height="10" rx="1.5" fill="var(--wl)" style={{"--d":"8.5s","--dly":"1.4s"}}/>
        <rect x="80" y="167" width="11" height="10" rx="1.5" fill="var(--wd)"/>
        <rect className="win" x="94" y="167" width="11" height="10" rx="1.5" fill="var(--wl)" style={{"--d":"6.8s","--dly":"2.8s"}}/>
        <rect className="win" x="66" y="182" width="11" height="10" rx="1.5" fill="var(--wl)" style={{"--d":"10s","--dly":"0.6s"}}/>
        <rect x="80" y="182" width="11" height="10" rx="1.5" fill="var(--wd)"/>
        <rect className="win" x="94" y="182" width="11" height="10" rx="1.5" fill="var(--wl)" style={{"--d":"7.8s","--dly":"3.5s"}}/>
        <rect x="280" y="160" width="52" height="47" fill="var(--bld2)" rx="2"/>
        <polygon points="276,164 306,138 336,164" fill="var(--roof)"/>
        <line x1="276" y1="164" x2="336" y2="164" stroke="rgba(91,143,249,0.2)" strokeWidth="0.8"/>
        <rect x="288" y="169" width="11" height="10" rx="1.5" fill="var(--wd)"/>
        <rect className="win" x="302" y="169" width="11" height="10" rx="1.5" fill="var(--wl)" style={{"--d":"9.2s","--dly":"0.2s"}}/>
        <rect className="win" x="316" y="169" width="11" height="10" rx="1.5" fill="var(--wl)" style={{"--d":"7s","--dly":"2.2s"}}/>
        <rect className="win" x="288" y="184" width="11" height="10" rx="1.5" fill="var(--wl)" style={{"--d":"11s","--dly":"1s"}}/>
        <rect x="302" y="184" width="11" height="10" rx="1.5" fill="var(--wd)"/>
        <rect className="win" x="316" y="184" width="11" height="10" rx="1.5" fill="var(--wl)" style={{"--d":"8.3s","--dly":"3.9s"}}/>
        <ellipse cx="195" cy="208" rx="85" ry="7" fill="rgba(0,0,0,0.4)"/>
        <rect x="113" y="114" width="164" height="93" fill="var(--bld)" rx="2"/>
        <line x1="113" y1="144" x2="277" y2="144" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8"/>
        <line x1="113" y1="174" x2="277" y2="174" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8"/>
        <rect x="113" y="114" width="164" height="11" fill="var(--bld2)" rx="2"/>
        <polygon points="108,118 195,80 282,118" fill="var(--roof)"/>
        <line x1="108" y1="118" x2="282" y2="118" stroke="rgba(91,143,249,0.35)" strokeWidth="1.2"/>
        <line x1="195" y1="80" x2="195" y2="62" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5"/>
        <rect className="scene-flag" x="196" y="62" width="20" height="12" rx="1.5" fill="var(--accent)"/>
        <rect x="150" y="120" width="90" height="11" rx="2" fill="rgba(91,143,249,0.12)" stroke="rgba(91,143,249,0.22)" strokeWidth="0.5"/>
        <text x="195" y="128" textAnchor="middle" fill="rgba(150,190,255,0.75)" fontSize="5.5" fontFamily="sans-serif" fontWeight="600" letterSpacing="1.2">HOSTELCARE BLOCK A</text>
        <rect className="win" x="125" y="126" width="18" height="14" rx="2" fill="var(--wl)" style={{"--d":"7s","--dly":"0.5s"}}/>
        <rect className="win" x="149" y="126" width="18" height="14" rx="2" fill="var(--wl)" style={{"--d":"9s","--dly":"1.3s"}}/>
        <rect x="173" y="126" width="18" height="14" rx="2" fill="var(--wd)"/>
        <rect className="win" x="199" y="126" width="18" height="14" rx="2" fill="var(--wl)" style={{"--d":"6.5s","--dly":"2.1s"}}/>
        <rect className="win" x="223" y="126" width="18" height="14" rx="2" fill="var(--wl)" style={{"--d":"8.2s","--dly":"0.8s"}}/>
        <rect x="247" y="126" width="18" height="14" rx="2" fill="var(--wd)"/>
        <rect x="125" y="148" width="18" height="14" rx="2" fill="var(--wd)"/>
        <rect className="win" x="149" y="148" width="18" height="14" rx="2" fill="var(--wl)" style={{"--d":"11s","--dly":"3s"}}/>
        <rect className="win" x="173" y="148" width="18" height="14" rx="2" fill="var(--wl)" style={{"--d":"7.5s","--dly":"1.8s"}}/>
        <rect x="199" y="148" width="18" height="14" rx="2" fill="var(--wd)"/>
        <rect className="win" x="223" y="148" width="18" height="14" rx="2" fill="var(--wl)" style={{"--d":"9.5s","--dly":"0.3s"}}/>
        <rect className="win" x="247" y="148" width="18" height="14" rx="2" fill="var(--wl)" style={{"--d":"6s","--dly":"2.6s"}}/>
        <rect className="win" x="125" y="177" width="18" height="14" rx="2" fill="var(--wl)" style={{"--d":"8.5s","--dly":"1s"}}/>
        <rect x="149" y="177" width="18" height="14" rx="2" fill="var(--wd)"/>
        <rect className="win" x="223" y="177" width="18" height="14" rx="2" fill="var(--wl)" style={{"--d":"10s","--dly":"1.6s"}}/>
        <rect x="247" y="177" width="18" height="14" rx="2" fill="var(--wd)"/>
        <rect x="177" y="174" width="36" height="33" rx="2" fill="#070a14"/>
        <rect x="179" y="176" width="32" height="29" rx="1.5" fill="#0a0e1e"/>
        <path d="M179 189 Q195 175 211 189" fill="rgba(91,143,249,0.12)" stroke="rgba(91,143,249,0.38)" strokeWidth="0.9"/>
        <circle cx="207" cy="193" r="2" fill="rgba(255,200,80,0.8)"/>
        <rect x="172" y="206" width="46" height="4" rx="1.5" fill="rgba(255,255,255,0.1)"/>
        <line x1="84" y1="206" x2="84" y2="168" stroke="#252e50" strokeWidth="2.5"/>
        <line x1="84" y1="168" x2="97" y2="168" stroke="#252e50" strokeWidth="2"/>
        <circle cx="97" cy="167" r="5" fill="#ffd966"/>
        <circle cx="97" cy="167" r="16" fill="url(#lamp1)" className="lamp-glow" style={{"--dly":"0s"}}/>
        <circle cx="97" cy="167" r="9" fill="#ffd966" opacity="0.2" filter="url(#gf)"/>
        <line x1="306" y1="206" x2="306" y2="168" stroke="#252e50" strokeWidth="2.5"/>
        <line x1="306" y1="168" x2="293" y2="168" stroke="#252e50" strokeWidth="2"/>
        <circle cx="293" cy="167" r="5" fill="#ffd966"/>
        <circle cx="293" cy="167" r="16" fill="url(#lamp1)" className="lamp-glow" style={{"--dly":"0.9s"}}/>
        <circle cx="293" cy="167" r="9" fill="#ffd966" opacity="0.2" filter="url(#gf)"/>
        <g opacity="0.5">
          {[62,72,82].map(x=><line key={x} x1={x} y1="206" x2={x} y2="216" stroke="rgba(150,170,220,0.3)" strokeWidth="1"/>)}
          <line x1="62" y1="206" x2="82" y2="206" stroke="rgba(150,170,220,0.3)" strokeWidth="1"/>
          {[310,320,330].map(x=><line key={x} x1={x} y1="206" x2={x} y2="216" stroke="rgba(150,170,220,0.3)" strokeWidth="1"/>)}
          <line x1="310" y1="206" x2="330" y2="206" stroke="rgba(150,170,220,0.3)" strokeWidth="1"/>
        </g>
      </g>
    </svg>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState("login");
  const [activeRole, setActiveRole] = useState("student");
  const [showPass, setShowPass] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"student" });

  const selectRole = (r) => { setActiveRole(r); setForm(f=>({...f,role:r})); };
  const emailPH = { student:"you@hostel.edu", worker:"worker@hostel.edu", admin:"admin@hostelcare.in" };

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const body = mode==="login" ? { email:form.email, password:form.password } : form;
      const res = await fetch(API+(mode==="login"?"/auth/login":"/auth/register"), {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message||"Something went wrong"); setLoading(false); return; }
      if (mode==="login") { login(data.user, data.token); }
      else { setMode("login"); alert("Account created! Please sign in."); }
    } catch { setError("Cannot reach server. Is it running?"); }
    setLoading(false);
  };

  const triggerSOS = () => {
    // Ye line popup warning dikhayegi
    const confirmSOS = window.confirm("🚨 WARNING: Are you sure? Misuse of SOS will lead to strict action.");
    
    if (confirmSOS) {
      setSosSent(true);
      // Backend ko signal bhejo (Guest/Visitor ke naam se)
      socket.emit("trigger-sos", { user: { name: "Guest/Visitor at Login Gate" } });
      setTimeout(()=>setSosSent(false), 2800);
    }
  }; 

  return (
    <div className="auth-page">

        {/* ── LEFT PANEL ── */}
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-logo-box">
              <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <div className="auth-live-dot"/>
            </div>
            <div className="auth-brand-text">
              <h1>Hostel<span>Care</span></h1>
              <p>Smart Hostel Management</p>
            </div>
          </div>

          <div className="auth-scene"><BuildingScene/></div>

          <div className="auth-footer">
            <div className="auth-tagline">Hostel maintenance,<br/><span>digitized &amp; accountable.</span></div>
            <div className="feat-row">
              {[["Maintenance","M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"],
                ["Photo Proof","M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"],
                ["Role Access","M3 11h18v11a2 2 0 01-2 2H5a2 2 0 01-2-2V11z M7 11V7a5 5 0 0110 0v4"],
                ["SOS Alert","M12 2a10 10 0 100 20A10 10 0 0012 2z M12 8v4 M12 16h.01"]
              ].map(([label,d])=>(
                <div className="feat-item" key={label}>
                  <svg viewBox="0 0 24 24"><path d={d}/></svg>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className="auth-stats-row">
              <div className="auth-stat"><div className="auth-stat-n">98%</div><div className="auth-stat-l">Resolved</div></div>
              <div className="auth-stat"><div className="auth-stat-n">&lt;2h</div><div className="auth-stat-l">Response</div></div>
              <div className="auth-stat"><div className="auth-stat-n">24/7</div><div className="auth-stat-l">Uptime</div></div>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="auth-divider"/>

        {/* ── RIGHT PANEL ── */}
        <div className="auth-right">
          {/* Theme toggle */}
          <div className="theme-toggle" onClick={toggleTheme}>
            <button className={`t-opt ${theme==="dark"?"active":""}`}>
              <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            </button>
            <button className={`t-opt ${theme==="light"?"active":""}`}>
              <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            </button>
          </div>

          <div className="login-card">
            <div className="welcome-pill"><span className="pdot"/>{mode==="login"?"Secure Portal":"Create Account"}</div>
            <h2 className="login-title">{mode==="login"?"Welcome back":"Join HostelCare"}</h2>
            <p className="login-sub">{mode==="login"?"Sign in to your HostelCare account":"Fill in your details to get started"}</p>

            {/* Role tabs */}
            <div className="role-tabs">
              {[["student","🎓 Student"],["worker","🔧 Worker"],["admin","🛡 Admin"]].map(([r,lbl])=>(
                <button key={r} className={`role-tab ${activeRole===r?"active":""}`} onClick={()=>selectRole(r)}>{lbl}</button>
              ))}
            </div>

            {error && <div className="auth-error">⚠️ {error}</div>}

            {/* Name (register only) */}
            {mode==="register" && (
              <div className="auth-form-group">
                <label className="auth-label">Full Name</label>
                <div className="input-wrap">
                  <span className="iico"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                  <input className="auth-input" type="text" placeholder="Your full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="auth-form-group">
              <label className="auth-label">Email / ID</label>
              <div className="input-wrap">
                <span className="iico"><svg viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                <input className="auth-input" type="email" placeholder={emailPH[activeRole]} value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
              </div>
            </div>

            {/* Password */}
            <div className="auth-form-group">
              <label className="auth-label">Password</label>
              <div className="input-wrap">
                <span className="iico"><svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
                <input className="auth-input" type={showPass?"text":"password"} placeholder="Enter your password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
                <button className="ptog" type="button" onClick={()=>setShowPass(p=>!p)}>
                  <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            {/* Remember me / Forgot (login only) */}
            {mode==="login" && (
              <div className="row-flex">
                <label className="rlab"><input type="checkbox"/> Remember me</label>
                <button className="flink">Forgot password?</button>
              </div>
            )}

            {/* Submit */}
            <button className="btn-login" onClick={submit} disabled={loading}>
              <span className="bshine"/>
              {loading ? "Please wait…" : mode==="login" ? "Sign In" : "Create Account"}
            </button>

            {/* Switch mode */}
            <div className="auth-switch">
              {mode==="login"
                ? <>Don't have an account? <button onClick={()=>{setMode("register");setError("");}}>Register</button></>
                : <>Already have an account? <button onClick={()=>{setMode("login");setError("");}}>Sign In</button></>}
            </div>

            {/* SOS Strip */}
            <div className="sos-strip" onClick={triggerSOS}>
              <div className="sos-icon">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div className="sos-text">
                <span className="sos-title">{sosSent?"SOS Sent! Help is on the way…":"Emergency SOS"}</span>
                <span className="sos-sub">Bypass queue · Alert security &amp; admins instantly</span>
              </div>
              <span className="sos-arr">→</span>
            </div>
          </div>
        </div>
      </div>
  );
}

// ══════════════════════════════════════════════════════════
// SHELL LAYOUT
// ══════════════════════════════════════════════════════════
function Shell({ page, setPage, navItems, accentColor, role, children }) {
  const { user, logout } = useAuth();
  const handleDashSOS = () => {
    const confirmSOS = window.confirm("EMERGENCY SOS: Press OK to send alert to Admin. Misuse is punishable.");
    if (confirmSOS) {
      // Backend ko signal bhejo (Asli user ke naam ke saath)
      socket.emit("trigger-sos", { user: { name: user?.name || "Student" } });
      alert("SOS Alert Sent to Admin!");
    }
  };
  const { theme, toggleTheme } = useTheme();
  const initials = user?.name?.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)||"?";
  const [showIdPopup, setShowIdPopup] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    if (user?._id) {
      navigator.clipboard?.writeText(user._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="app-shell">
      {/* Theme toggle — top right corner fixed */}
      <button
        onClick={toggleTheme}
        style={{position:"fixed",top:16,right:16,zIndex:999,background:"var(--cbg,rgba(255,255,255,0.03))",border:"1px solid var(--cbd,rgba(255,255,255,0.07))",borderRadius:"100px",padding:"6px 14px",color:"var(--tmd,#7d8aaa)",fontSize:"0.78rem",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all 0.2s"}}
      >
        {theme==="dark"
          ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Light</>
          : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg> Dark</>
        }
      </button>

      <aside className="sidebar">
        <div className="sidebar-logo">
          <span style={{background:"linear-gradient(135deg,#5b8ff9,#a78bfa)",width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.85rem"}}>🏠</span>
          HostelCare
        </div>
        <nav className="sidebar-nav">
          <div className="nav-label">Navigation</div>
          {navItems.map(item=>(
            <button key={item.id} className={`nav-item ${page===item.id?"active":""}`} onClick={()=>setPage(item.id)}>
              <span className="icon">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>

        {/* User section with ID popup */}
        <div className="sidebar-user" style={{position:"relative"}}>
          <div className="user-avatar" style={{background:accentColor+"22",color:accentColor}}>{initials}</div>
          <div className="user-info" style={{cursor:"pointer"}} onClick={()=>setShowIdPopup(p=>!p)} title="Click to see your ID">
            <div className="user-name" style={{display:"flex",alignItems:"center",gap:5}}>
              {user?.name}
              <span style={{fontSize:"0.6rem",opacity:0.45,fontWeight:400}}>🪪</span>
            </div>
            <div className="user-role">{role}</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">
            <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Out
          </button>

          {/* ID Popup — wapas normal, upar ki taraf khulega */}
          {showIdPopup && (
            <div className="user-id-popup" onClick={e=>e.stopPropagation()} style={{zIndex:9999,bottom:"110%",top:"auto",left:0,right:0}}>
              <div className="uid-popup-arrow"/>
              <div className="uid-popup-label">Your {role} ID</div>
              <div className="uid-popup-id">{user?._id || "ID not available"}</div>
              <button className="uid-popup-copy" onClick={copyId}>
                {copied ? "✅ Copied!" : "📋 Copy ID"}
              </button>
              <button className="uid-popup-close" onClick={()=>setShowIdPopup(false)}>✕</button>
            </div>
          )}
        </div>

        {/* SOS Button */}
        <div style={{padding:"0 12px 16px"}}>
          <button
            onClick={handleDashSOS}
            style={{width:"100%",background:"rgba(220,38,38,0.1)",border:"1px dashed #ef4444",color:"#ef4444",padding:"10px",borderRadius:"8px",fontWeight:"bold",cursor:"pointer",display:"flex",justifyContent:"center",alignItems:"center",gap:"8px",transition:"all 0.3s"}}
          >
            <span style={{fontSize:"1.2rem",animation:"pulse 2s infinite"}}></span> Quick SOS
          </button>
        </div>
      </aside>
      <main className="main" onClick={()=>showIdPopup&&setShowIdPopup(false)}>{children}</main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// STUDENT DASHBOARD
// ══════════════════════════════════════════════════════════
function StudentDashboard() {
  const [page, setPage] = useState("complaints");
  const { get, post } = useApi();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title:"", description:"", category:"Other" });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const navItems = [{ id:"complaints", icon:"📋", label:"My Complaints" },{ id:"new", icon:"➕", label:"File Complaint" }];
  useEffect(()=>{ if(page==="complaints") fetchComplaints(); },[page]);
  const fetchComplaints = async () => { setLoading(true); const data = await get("/complaints/my"); setComplaints(data.complaints||[]); setLoading(false); };

  const submitComplaint = async () => {
    if(!form.title||!form.description){ setMsg("error:Please fill title and description."); return; }
    setSubmitting(true); setMsg("");
    const fd = new FormData();
    fd.append("title",form.title); fd.append("description",form.description); fd.append("category",form.category);
    if(file) fd.append("image",file);
    const data = await post("/complaints",fd,true);
    if(data.complaint){ setMsg("success:Complaint filed successfully!"); setForm({title:"",description:""}); setFile(null); }
    else { setMsg("error:"+(data.message||"Failed")); }
    setSubmitting(false);
  };
  const [msgType,msgText] = msg.split(":");

  return (
    <Shell page={page} setPage={setPage} navItems={navItems} accentColor="#5b8ff9" role="Student">
      {page==="complaints" && (<>
        <div className="page-header"><div className="page-title">My Complaints</div><div className="page-sub">Track all your filed complaints</div></div>
        <div className="stats-grid">
          <div className="stat-card blue"><div className="stat-icon">📋</div><div className="stat-val">{complaints.length}</div><div className="stat-label">Total</div></div>
          <div className="stat-card orange"><div className="stat-icon">⏳</div><div className="stat-val">{complaints.filter(c=>c.status==="pending").length}</div><div className="stat-label">Pending</div></div>
          <div className="stat-card blue"><div className="stat-icon">🔧</div><div className="stat-val">{complaints.filter(c=>c.status==="in-progress").length}</div><div className="stat-label">In Progress</div></div>
          <div className="stat-card green"><div className="stat-icon">✅</div><div className="stat-val">{complaints.filter(c=>c.status==="resolved").length}</div><div className="stat-label">Resolved</div></div>
        </div>
        <div className="card">
          <div className="card-title">📋 Complaint History</div>
          {loading ? <div className="loading"><span className="spinner"/>Loading...</div> :
            complaints.length===0 ? <div className="empty"><div className="empty-icon">📭</div><div className="empty-text">No complaints yet.</div></div> :
            <div className="complaint-list">{complaints.map(c=>(<div className="complaint-item clickable" key={c._id} onClick={()=>setSelectedComplaint(c)}><div className="complaint-icon">🗂️</div><div className="complaint-body"><div className="complaint-title">{c.title}</div><div className="complaint-desc">{c.description}</div><div className="complaint-meta">{statusBadge(c.status)}<span className="meta-date">{fmt(c.createdAt)}</span><span className="click-hint">👁 Details</span></div></div>{c.image&&<img src={c.image} alt="" className="complaint-img"/>}</div>))}</div>}
        </div>
      </>)}
      {page==="new" && (<>
        <div className="page-header"><div className="page-title">File a Complaint</div><div className="page-sub">Describe your issue</div></div>
        <div className="card" style={{maxWidth:560}}>
          {msgText && <div className="auth-error" style={msgType==="success"?{background:"rgba(34,211,122,0.08)",borderColor:"rgba(34,211,122,0.3)",color:"#22d37a"}:{}}>{msgType==="success"?"✅":"⚠️"} {msgText}</div>}
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" placeholder="Brief issue title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" placeholder="Describe the issue..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
              <option value="Plumbing">🔧 Plumbing</option>
              <option value="Electrical">⚡ Electrical</option>
              <option value="Cleaning">🧹 Cleaning</option>
              <option value="Carpentry">🪚 Carpentry</option>
              <option value="Other">📦 Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Photo (optional)</label>
            <div className="file-upload" onClick={()=>document.getElementById("fileInput").click()}>
              {file ? <span style={{color:"#22d37a",fontSize:"0.85rem"}}>📎 {file.name}</span> : <div style={{color:"#7d8aaa",fontSize:"0.8rem"}}>📷 Click to upload image</div>}
            </div>
            <input id="fileInput" type="file" accept="image/*" style={{display:"none"}} onChange={e=>setFile(e.target.files[0])}/>
          </div>
          <button className="btn-login" onClick={submitComplaint} disabled={submitting} style={{marginTop:4}}>
            <span className="bshine"/>{submitting&&<span className="spinner"/>} Submit Complaint
          </button>
        </div>
      </>)}
      <ComplaintDetailModal complaint={selectedComplaint} onClose={()=>setSelectedComplaint(null)}/>
    </Shell>
  );
}

// ══════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════
function AdminDashboard() {
  const [page, setPage] = useState("overview");
  const { get, put } = useApi();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [workerId, setWorkerId] = useState("");
  const [workers, setWorkers] = useState([]);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState("pending");
  // SOS Alert store karne ke liye state
  const [sosAlert, setSosAlert] = useState(null);

  // Background mein SOS signal ka wait karna
  useEffect(() => {
    socket.on("sos-alert", (data) => {
      setSosAlert(data); // Jaise hi signal aayega, yeh alert chalu kar dega
    });
    return () => socket.off("sos-alert");
  }, []);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const navItems = [{ id:"overview", icon:"📊", label:"Overview" },{ id:"complaints", icon:"📋", label:"All Complaints" },{ id:"assign", icon:"👷", label:"Assign Workers" }];
  useEffect(()=>{ fetchAll(); },[page]);
  const fetchAll = async () => { setLoading(true); const [cData,sData] = await Promise.all([get("/complaints"),get("/complaints/stats")]); setComplaints(cData.complaints||[]); setStats(sData); setLoading(false); };

  const openAssign = async (complaintId) => {
    setAssignModal(complaintId); setWorkerId(""); setWorkers([]);
    setWorkersLoading(true);
    try {
      const data = await get("/auth/workers");
      setWorkers(data.workers || data || []);
    } catch { setWorkers([]); }
    setWorkersLoading(false);
  };

  const doAssign = async () => { if(!workerId) return; await put(`/complaints/assign/${assignModal}`,{workerId}); setAssignModal(null); setWorkerId(""); fetchAll(); };
  const doStatus = async () => { await put(`/complaints/${statusModal}`,{status:newStatus}); setStatusModal(null); fetchAll(); };

  return (
    <Shell page={page} setPage={setPage} navItems={navItems} accentColor="#ef4444" role="Admin">
      {page==="overview" && (<>
        <div className="page-header"><div className="page-title">Admin Overview</div><div className="page-sub">Complaint management at a glance</div></div>
        <div className="stats-grid">
          <div className="stat-card blue"><div className="stat-icon">📋</div><div className="stat-val">{stats.total??"—"}</div><div className="stat-label">Total</div></div>
          <div className="stat-card orange"><div className="stat-icon">⏳</div><div className="stat-val">{stats.pending??"—"}</div><div className="stat-label">Pending</div></div>
          <div className="stat-card blue"><div className="stat-icon">🔧</div><div className="stat-val">{stats.inProgress??"—"}</div><div className="stat-label">In Progress</div></div>
          <div className="stat-card green"><div className="stat-icon">✅</div><div className="stat-val">{stats.resolved??"—"}</div><div className="stat-label">Resolved</div></div>
        </div>
        <div className="card"><div className="card-title">🕐 Recent Complaints</div>
          {loading ? <div className="loading"><span className="spinner"/>Loading...</div> :
            <div className="complaint-list">{complaints.slice(0,5).map(c=>(<div className="complaint-item clickable" key={c._id} onClick={()=>setSelectedComplaint(c)}><div className="complaint-icon">🗂️</div><div className="complaint-body"><div className="complaint-title">{c.title}</div><div className="complaint-desc">{c.description}</div><div className="complaint-meta">{statusBadge(c.status)}<span className="meta-date">{c.user?.name||"Unknown"} · {fmt(c.createdAt)}</span><span className="click-hint">👁 Details</span></div></div></div>))}</div>}
        </div>
      </>)}
      {(page==="complaints"||page==="assign") && (<>
        <div className="page-header"><div className="page-title">{page==="assign"?"Assign Workers":"All Complaints"}</div><div className="page-sub">{page==="assign"?"Assign workers to pending complaints":"Manage all hostel complaints"}</div></div>
        <div className="card">
          {loading ? <div className="loading"><span className="spinner"/>Loading...</div> :
            complaints.length===0 ? <div className="empty"><div className="empty-icon">📭</div><div className="empty-text">No complaints found.</div></div> :
            <div className="table-wrap"><table><thead><tr><th>Title</th><th>Student</th><th>Student ID</th><th>Status</th><th>Assigned Worker</th><th>Worker ID</th><th>Date</th><th>Actions</th></tr></thead><tbody>
              {complaints.map(c=>(<tr key={c._id}>
                <td style={{fontWeight:700,cursor:"pointer",color:"var(--accent,#5b8ff9)"}} onClick={()=>setSelectedComplaint(c)}>{c.title} <span style={{fontSize:"0.65rem",opacity:0.6}}>👁</span></td>
                <td style={{color:"var(--tmd,#7d8aaa)"}}>{c.user?.name||"—"}</td>
                <td><span className="cdm-id-val" style={{fontSize:"0.68rem",fontFamily:"monospace",cursor:"pointer"}} title="Click to copy" onClick={()=>navigator.clipboard?.writeText(c.user?._id||"")}>{c.user?._id ? c.user._id.slice(-8)+"…" : "—"}</span></td>
                <td>{statusBadge(c.status)}</td>
                <td style={{color:"var(--tmd,#7d8aaa)"}}>{c.assignedTo?.name||"—"}</td>
                <td><span className="cdm-id-val" style={{fontSize:"0.68rem",fontFamily:"monospace",cursor:"pointer"}} title="Click to copy" onClick={()=>navigator.clipboard?.writeText(c.assignedTo?._id||"")}>{c.assignedTo?._id ? c.assignedTo._id.slice(-8)+"…" : "—"}</span></td>
                <td style={{color:"var(--tmd,#7d8aaa)",fontSize:"0.78rem"}}>{fmt(c.createdAt)}</td>
                <td><div style={{display:"flex",gap:6}}><button className="btn btn-sm btn-primary" onClick={()=>{setStatusModal(c._id);setNewStatus(c.status);}}>Status</button>{page==="assign"&&<button className="btn btn-sm btn-success" onClick={()=>openAssign(c._id)}>Assign</button>}</div></td>
              </tr>))}
            </tbody></table></div>}
        </div>
      </>)}
      {assignModal&&(
        <div className="modal-overlay" onClick={()=>setAssignModal(null)}>
          <div className="modal" style={{maxWidth:520}} onClick={e=>e.stopPropagation()}>
            <div className="modal-title">👷 Assign Worker</div>
            {workersLoading ? (
              <div className="loading"><span className="spinner"/>Fetching workers...</div>
            ) : workers.length===0 ? (
              <>
                <p style={{color:"var(--tmd,#7d8aaa)",fontSize:"0.82rem",marginBottom:14}}>Could not load workers list. Paste the worker ID manually:</p>
                <div className="form-group"><label className="form-label">Worker ID</label><input className="form-input" placeholder="Paste worker MongoDB _id" value={workerId} onChange={e=>setWorkerId(e.target.value)}/></div>
              </>
            ) : (
              <>
                <p style={{color:"var(--tmd,#7d8aaa)",fontSize:"0.82rem",marginBottom:14}}>Select a worker to assign this complaint:</p>
                <div className="worker-list">
                  {workers.map(w=>(
                    <div key={w._id} className={`worker-card ${workerId===w._id?"selected":""}`} onClick={()=>setWorkerId(w._id)}>
                      <div className="worker-avatar">{w.name?.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)||"W"}</div>
                      <div className="worker-info">
                        <div className="worker-name">{w.name}</div>
                        <div className="worker-id-text">{w._id}</div>
                      </div>
                      {workerId===w._id && <span className="worker-check">✅</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="modal-actions">
              <button className="btn btn-danger btn-sm" onClick={()=>setAssignModal(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={doAssign} disabled={!workerId}>
                {workerId ? "Assign Worker" : "Select a worker"}
              </button>
            </div>
          </div>
        </div>
      )}
      {statusModal&&<div className="modal-overlay" onClick={()=>setStatusModal(null)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-title">🔄 Update Status</div><div className="form-group"><label className="form-label">New Status</label><select className="form-select" value={newStatus} onChange={e=>setNewStatus(e.target.value)}><option value="pending">Pending</option><option value="in-progress">In Progress</option><option value="resolved">Resolved</option></select></div><div className="modal-actions"><button className="btn btn-danger btn-sm" onClick={()=>setStatusModal(null)}>Cancel</button><button className="btn btn-primary btn-sm" onClick={doStatus}>Update</button></div></div></div>}
      <ComplaintDetailModal complaint={selectedComplaint} onClose={()=>setSelectedComplaint(null)}/>
    {/* YEH HAI SOS KA RED POPUP */}
      {sosAlert && (
        <div className="modal-overlay" style={{ background: "rgba(220, 38, 38, 0.9)", zIndex: 9999 }}>
          <div className="modal" style={{ background: "#12141a", border: "4px solid #ef4444", textAlign: "center" }}>
            <h1 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: "2.5rem", color: "#ef4444", marginBottom: "10px" }}>
               EMERGENCY SOS 
            </h1>
            <p style={{ color: "#f0f4ff", fontSize: "1.2rem", marginBottom: "5px" }}>{sosAlert.message}</p>
            <p style={{ color: "#7d8aaa", marginBottom: "20px" }}>Triggered by: <strong>{sosAlert.user?.name || "Unknown"}</strong></p>
            
            <button 
              className="btn btn-danger" 
              style={{ width: "100%", height: "50px", fontSize: "1.1rem" }}
              onClick={() => setSosAlert(null)}
            >
              Acknowledge Alert (Close)
            </button>
          </div>
        </div>
      )}    
    </Shell>
  );
}

// ══════════════════════════════════════════════════════════
// WORKER DASHBOARD
// ══════════════════════════════════════════════════════════
function WorkerDashboard() {
  const [page, setPage] = useState("tasks");
  const { get, put } = useApi();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");       // 👈 filter states
  const [filterCategory, setFilterCategory] = useState("");

  const navItems = [{ id:"tasks", icon:"🔧", label:"Assigned Tasks" }];
  useEffect(()=>{ fetchTasks(); },[filterStatus, filterCategory]);
  const fetchTasks = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if(filterStatus) params.append("status", filterStatus);
    if(filterCategory) params.append("category", filterCategory);
    const data = await get(`/complaints/worker?${params.toString()}`);
    setComplaints(data.complaints||[]);
    setLoading(false);
  };
  const updateStatus = async (id, status) => { setUpdating(id); await put(`/complaints/worker/${id}`,{status}); await fetchTasks(); setUpdating(null); };
  const pending = complaints.filter(c=>c.status!=="resolved");
  const resolved = complaints.filter(c=>c.status==="resolved");

  return (
    <Shell page={page} setPage={setPage} navItems={navItems} accentColor="#22d37a" role="Worker">
      <div className="page-header"><div className="page-title">My Tasks</div><div className="page-sub">Complaints assigned to you</div></div>

      {/* 🔍 FILTER BAR */}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <select className="form-select" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{flex:1,minWidth:140}}>
          <option value="">All Status</option>
          <option value="pending">⏳ Pending</option>
          <option value="in-progress">🔧 In Progress</option>
          <option value="resolved">✅ Resolved</option>
        </select>
        <select className="form-select" value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} style={{flex:1,minWidth:140}}>
          <option value="">All Categories</option>
          <option value="Plumbing">🔧 Plumbing</option>
          <option value="Electrical">⚡ Electrical</option>
          <option value="Cleaning">🧹 Cleaning</option>
          <option value="Carpentry">🪚 Carpentry</option>
          <option value="Other">📦 Other</option>
        </select>
        {(filterStatus||filterCategory) && (
          <button className="btn btn-sm btn-danger" onClick={()=>{setFilterStatus("");setFilterCategory("");}}>✕ Reset</button>
        )}
      </div>
      <div className="stats-grid">
        <div className="stat-card blue"><div className="stat-icon">📋</div><div className="stat-val">{complaints.length}</div><div className="stat-label">Total</div></div>
        <div className="stat-card orange"><div className="stat-icon">🔧</div><div className="stat-val">{pending.length}</div><div className="stat-label">Pending</div></div>
        <div className="stat-card green"><div className="stat-icon">✅</div><div className="stat-val">{resolved.length}</div><div className="stat-label">Resolved</div></div>
      </div>
      <div className="card"><div className="card-title">🔧 Active Tasks</div>
        {loading ? <div className="loading"><span className="spinner"/>Loading...</div> :
          pending.length===0 ? <div className="empty"><div className="empty-icon">🎉</div><div className="empty-text">No pending tasks! All clear.</div></div> :
          <div className="complaint-list">{pending.map(c=>(<div className="complaint-item" key={c._id}><div className="complaint-icon">🗂️</div><div className="complaint-body"><div className="complaint-title" style={{cursor:"pointer"}} onClick={()=>setSelectedComplaint(c)}>{c.title} <span className="click-hint" style={{display:"inline-flex"}}>👁</span></div><div className="complaint-desc">{c.description}</div><div className="complaint-meta" style={{marginBottom:10}}>{statusBadge(c.status)}<span className="meta-date">{fmt(c.createdAt)}</span></div><div style={{display:"flex",gap:8}}>{c.status==="pending"&&<button className="btn btn-sm btn-primary" disabled={updating===c._id} onClick={()=>updateStatus(c._id,"in-progress")}>{updating===c._id&&<span className="spinner"/>}Start Work</button>}{c.status==="in-progress"&&<button className="btn btn-sm btn-success" disabled={updating===c._id} onClick={()=>updateStatus(c._id,"resolved")}>{updating===c._id&&<span className="spinner"/>}Mark Resolved</button>}</div></div>{c.image&&<img src={c.image} alt="" className="complaint-img" style={{cursor:"pointer"}} onClick={()=>setSelectedComplaint(c)}/>}</div>))}</div>}
      </div>
      {resolved.length>0&&<div className="card"><div className="card-title">✅ Resolved Tasks</div><div className="complaint-list">{resolved.map(c=>(<div className="complaint-item clickable" key={c._id} style={{opacity:0.7}} onClick={()=>setSelectedComplaint(c)}><div className="complaint-icon">✅</div><div className="complaint-body"><div className="complaint-title">{c.title}</div><div className="complaint-meta">{statusBadge(c.status)}<span className="meta-date">{fmt(c.createdAt)}</span><span className="click-hint">👁 Details</span></div></div>{c.image&&<img src={c.image} alt="" className="complaint-img"/>}</div>))}</div></div>}
      <ComplaintDetailModal complaint={selectedComplaint} onClose={()=>setSelectedComplaint(null)}/>
    </Shell>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
// ─── ROOT ─────────────────────────────────────────────────────────────────────
function AppInner() {
  const { user } = useAuth();
  
  // 1. Notification Receive Karne ka Logic
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    socket.on("task-notification", (data) => {
      setNotification(data);
      // 4 second baad notification screen se hat jayega
      setTimeout(() => setNotification(null), 4000); 
    });
    return () => socket.off("task-notification");
  }, []);

  // 2. Global SOS Function (Jo humne pehle banaya tha)
  const handleGlobalSOS = () => {
    const confirmSOS = window.confirm(" EMERGENCY: Are you sure? Misuse is punishable.");
    if (confirmSOS) {
      socket.emit("trigger-sos", { 
        user: { name: user ? user.name : "Stranger" } 
      });
      alert("SOS Sent to all Admins!");
    }
  };

  // 3. UI Render (Popup + Dashboards)
  return (
    <>
      {/* 🟢 YEH HAI GREEN POPUP NOTIFICATION 🟢 */}
      {notification && (
        <div style={{ position: "fixed", top: "20px", right: "20px", background: "rgba(34,211,122,0.15)", border: "1px solid #22d37a", padding: "15px 20px", borderRadius: "10px", color: "#f0f4ff", zIndex: 9999, boxShadow: "0 4px 15px rgba(34,211,122,0.2)", backdropFilter: "blur(5px)" }}>
          <div style={{ fontWeight: "bold", color: "#22d37a", fontSize: "1.1rem" }}>{notification.title}</div>
          <div style={{ fontSize: "0.9rem", marginTop: "5px" }}>{notification.message}</div>
        </div>
      )}

      {/* DASHBOARDS */}
      {!user && <AuthPage />}
      {user?.role === "admin" && <AdminDashboard onSOS={handleGlobalSOS} />}
      {user?.role === "worker" && <WorkerDashboard onSOS={handleGlobalSOS} />}
      {user?.role === "student" && <StudentDashboard onSOS={handleGlobalSOS} />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <style>{styles}</style>
        <AppInner/>
      </ThemeProvider>
    </AuthProvider>
  );
}