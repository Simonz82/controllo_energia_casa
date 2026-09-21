/*
 * Controllo Energia Casa - card per Home Assistant
 * Repository: https://github.com/Simonz82/controllo_energia_casa
 * Autore: Simonz82 - (c) 2026
 *
 * Card unica per il controllo dell'energia di tutta la casa: consumo istantaneo,
 * 4 barre configurabili (entita' e scala scelte da menu), popup Circuiti /
 * Consumi / Statistiche, costi per periodo, soglia di allarme con avviso sulla
 * card. Legge e scrive solo tramite l'oggetto `hass`: non richiede altre card.
 */

const HERO_BUILDERS = {
  energy: (id) => `<svg width="100%" height="100%" viewBox="0 0 240 240" preserveAspectRatio="xMidYMid meet" role="img" aria-hidden="true">
    <defs>
      <filter id="eceh-blur-${id}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>
      <linearGradient id="eceh-steel-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f8fb"/><stop offset=".5" stop-color="#dde4ec"/><stop offset="1" stop-color="#aab6c5"/></linearGradient>
    </defs>
    <ellipse cx="120" cy="222" rx="70" ry="9" fill="#0f172a" opacity=".14" filter="url(#eceh-blur-${id})"/>
    <rect x="40" y="18" width="160" height="204" rx="14" fill="url(#eceh-steel-${id})" stroke="#8fa0b3" stroke-opacity=".55" stroke-width="1.5"/>
    <rect x="58" y="34" width="124" height="56" rx="8" fill="#0c1930"/>
    <text class="ece-e-watt" x="120" y="70" text-anchor="middle" font-size="30" font-weight="900" fill="#38bdf8" font-family="Roboto, sans-serif">0</text>
    <text x="120" y="84" text-anchor="middle" font-size="10" font-weight="800" fill="#94a3b8" letter-spacing="1" font-family="Roboto, sans-serif">WATT ISTANTANEI</text>
    <rect x="54" y="104" width="24" height="32" rx="3" fill="url(#eceh-steel-${id})" stroke="#8fa0b3" stroke-opacity=".5" stroke-width="1"/>
    <circle cx="66" cy="112" r="2.4" fill="#22c55e" class="eceh-flicker"/>
    <rect x="81" y="104" width="24" height="32" rx="3" fill="url(#eceh-steel-${id})" stroke="#8fa0b3" stroke-opacity=".5" stroke-width="1"/>
    <circle cx="93" cy="112" r="2.4" fill="#38bdf8" class="eceh-flicker" style="animation-delay:.15s"/>
    <rect x="108" y="104" width="24" height="32" rx="3" fill="url(#eceh-steel-${id})" stroke="#8fa0b3" stroke-opacity=".5" stroke-width="1"/>
    <circle cx="120" cy="112" r="2.4" fill="#38bdf8" class="eceh-flicker" style="animation-delay:.3s"/>
    <rect x="135" y="104" width="24" height="32" rx="3" fill="url(#eceh-steel-${id})" stroke="#8fa0b3" stroke-opacity=".5" stroke-width="1"/>
    <circle cx="147" cy="112" r="2.4" fill="#38bdf8" class="eceh-flicker" style="animation-delay:.45s"/>
    <rect x="162" y="104" width="24" height="32" rx="3" fill="url(#eceh-steel-${id})" stroke="#8fa0b3" stroke-opacity=".5" stroke-width="1"/>
    <circle cx="174" cy="112" r="2.4" fill="#38bdf8" class="eceh-flicker" style="animation-delay:.6s"/>
    <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" fill="#38bdf8" opacity=".85" class="eceh-glow" transform="translate(100 150) scale(1.8)"/>
  </svg>`,
};

const CHIP_SVGS = {
  energy:
    '<svg viewBox="0 0 96 96" width="27" height="27"><rect x="14" y="10" width="68" height="76" rx="9" fill="#0f2942"/><path d="M52 22 30 54h14l-2 20 26-34H54l-2-18z" fill="#38bdf8"/></svg>',
};

const ICON_BOLT =
  '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>';
const ICON_CHART =
  '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="5" y1="20" x2="5" y2="12"/><line x1="12" y1="20" x2="12" y2="5"/><line x1="19" y1="20" x2="19" y2="9"/></svg>';
const ICON_CLOSE =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>';
const ICON_EURO =
  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 6.5a6.5 6.5 0 1 0 0 11"/><path d="M5.5 10h9"/><path d="M5.5 14h8"/></svg>';
const ICON_GEAR =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
const ICON_NOTIFCENTER =
  '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h3l4 4V6l-4 4H4a1 1 0 0 0-1 1z"/><path d="M16 8a5 5 0 0 1 0 8"/><path d="M19 5a9 9 0 0 1 0 14"/></svg>';
const ICON_TREND =
  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 6h6v6"/></svg>';
const STYLE = `
:host{display:block;--ece-blue:#0ea5e9;--ece-blue-deep:#0369a1;--ece-dim:var(--secondary-text-color,#64748b);--ece-card:var(--card-background-color,#ffffff);--ece-border:var(--divider-color,#e6ecf4);--ece-soft:rgba(148,163,184,.10);--ece-text:var(--primary-text-color,#0f172a)}
.ece-ap-card{position:relative;display:flex;flex-direction:column;border:1px solid var(--ece-border);border-radius:22px;background:var(--ece-card);box-shadow:0 12px 30px rgba(15,23,42,.06);overflow:hidden}
.ece-ap-card.is-run{border-color:rgba(34,197,94,.28)}
.ece-ap-card.has-alarm{border-color:rgba(239,68,68,.4)}
.ece-ap-top{display:flex;align-items:center;gap:7px;padding:12px 12px 9px}
.ece-ap-chip{width:34px;height:34px;flex:0 0 34px;display:grid;place-items:center;border-radius:11px;background:#eff6ff;box-shadow:inset 0 0 0 1px rgba(59,130,246,.10)}
.ece-ap-chip svg{width:27px;height:27px}
.ece-ap-headings{display:flex;flex-direction:column;min-width:0;flex:1;gap:1px}
.ece-ap-name{font-size:14.5px;font-weight:900;letter-spacing:-.2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ece-text)}
.ece-ap-room{font-size:11px;font-weight:750;color:var(--ece-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ece-ap-badge{display:inline-flex;align-items:center;gap:4px;flex:0 0 auto;padding:4px 7px;border-radius:999px;font-size:9.5px;font-weight:900;letter-spacing:.4px;text-transform:uppercase;white-space:nowrap}
.ece-ap-badge.run{background:#dcfce7;color:#15803d}
.ece-ap-badge.standby{background:#dbeafe;color:#2563eb}
.ece-ap-badge.off{background:#f1f5f9;color:#64748b}
.ece-ap-badge.unavailable{background:#fee2e2;color:#b91c1c}
[data-theme-dark] .ece-ap-badge.off,:host-context([data-theme="dark"]) .ece-ap-badge.off{background:rgba(148,163,184,.16);color:#94a3b8}
.ece-ap-dot{width:7px;height:7px;border-radius:50%;background:currentColor}
.ece-ap-tools{display:flex;gap:4px;flex:0 0 auto}
.ece-ap-tool{width:37px;height:37px;display:grid;place-items:center;border:1px solid var(--ece-border);border-radius:11px;background:var(--ece-card);color:var(--ece-dim);cursor:pointer}
.ece-ap-tool svg{width:19px;height:19px}
.ece-ap-tool:hover{border-color:#bae6fd;color:var(--ece-blue-deep)}
.ece-ap-top-row{display:flex;align-items:stretch;gap:10px;margin:0 13px}
.ece-ap-hero{position:relative;flex:1 1 50%;min-width:0;display:grid;place-items:center;height:182px;margin:0;border-radius:18px;background:radial-gradient(120% 90% at 50% 8%,rgba(224,242,254,.65),rgba(241,245,249,.35) 60%,transparent);overflow:hidden}
.ece-ap-card.is-run .ece-ap-hero{background:radial-gradient(120% 90% at 50% 8%,rgba(186,230,253,.85),rgba(224,242,254,.35) 62%,transparent)}
.ece-ap-hero svg{width:100%;height:100%;display:block}
.ece-ap-card.is-off .ece-ap-hero,.ece-ap-card.is-unavailable .ece-ap-hero{filter:grayscale(.55) opacity(.62)}
.ece-ap-card.is-standby .ece-ap-hero{filter:saturate(.85)}
@keyframes eceh-spin{to{transform:rotate(360deg)}}
@keyframes eceh-glow{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes eceh-flicker{0%,100%{opacity:.85}30%{opacity:.5}55%{opacity:1}80%{opacity:.6}}
.eceh-spin-drum,.eceh-spin-spray,.eceh-spin-spit{transform-box:view-box;transform-origin:120px 130px}
/* Layout "centrato" della card energia: foto al centro in alto, sotto il blocco OGGI su 2 colonne */
.ece-ap-card.layout-centrato .ece-ap-top-row{flex-direction:column;align-items:stretch;gap:10px}
.ece-ap-card.layout-centrato .ece-ap-hero{flex:0 0 auto;width:100%;height:200px}
.ece-ap-card.layout-centrato .ece-ap-cycle-side{flex:0 0 auto}
.ece-ap-card.layout-centrato .ece-ap-cycle-cap{margin-bottom:10px}
.ece-ap-card.layout-centrato .ece-ap-cycle-list{display:grid;grid-template-columns:1fr 1fr;gap:6px 8px;flex:0 0 auto}
.ece-ap-card.layout-centrato.ece-e-card .ece-ap-cycle-list{grid-template-columns:2fr 3fr}
.ece-ap-card.layout-centrato .ece-ap-cycle-list>.ece-ap-cycle-row:last-child:nth-child(odd){grid-column:1/-1}
.ece-ap-select{max-width:62%;padding:7px 10px;border-radius:10px;border:1px solid var(--ece-border);background:var(--ece-card);color:var(--ece-text);font-size:14px;font-weight:600;font-family:inherit}
.ece-ap-card.is-run .eceh-spin-drum{animation:eceh-spin 2.6s linear infinite}
.ece-ap-card.is-run .eceh-spin-spray{animation:eceh-spin 1.3s linear infinite}
.ece-ap-card.is-run .eceh-spin-spit{animation:eceh-spin 3.4s linear infinite}
.ece-ap-card.is-run .eceh-glow{animation:eceh-glow 1.7s ease-in-out infinite}
.ece-ap-card.is-run .eceh-flicker{animation:eceh-flicker 1.5s ease-in-out infinite}
.ece-ap-cycle-side{flex:1 1 50%;min-width:0;display:flex;flex-direction:column;padding:11px 13px;border-radius:16px;background:var(--ece-soft)}
.ece-ap-cycle-cap{display:flex;align-items:center;gap:6px;margin-top:-3px;margin-bottom:15px;font-size:11px;font-weight:900;letter-spacing:1.4px;text-transform:uppercase;color:var(--ece-dim)}
.ece-ap-cycle-list{display:flex;flex-direction:column;flex:1;justify-content:flex-start;gap:4px}
.ece-ap-cycle-row{display:flex;align-items:baseline;justify-content:space-between;gap:8px;min-width:0}
.ece-ap-cycle-row small{flex:0 0 auto;font-size:10.5px;font-weight:900;letter-spacing:.7px;text-transform:uppercase;color:var(--ece-dim)}
.ece-ap-cycle-row b{min-width:0;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13.5px;font-weight:400;letter-spacing:-.1px;color:var(--ece-text)}
.ece-ap-cycle-row b.ece-e-top{display:flex;justify-content:flex-end;overflow:hidden;text-overflow:clip}
.ece-e-top-n{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ece-e-top-w{flex:0 0 auto;white-space:nowrap}
.ece-ap-cycle-row-b{padding:4px 8px;border-radius:9px;border:1px solid var(--ece-border);background:var(--ece-card);align-items:center}
.ece-ap-cycle-label{display:flex;align-items:center;gap:5px;min-width:0;flex:0 0 auto}
.ece-ap-cycle-ic{display:flex;align-items:center;flex:0 0 auto;color:var(--ece-blue)}
.ece-ap-panel{display:flex;align-items:center;gap:14px;margin:10px 13px 13px;padding:13px 14px;border-radius:16px;background:var(--ece-soft)}
.ece-ap-meters{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}
.ece-c-meter-clickable{cursor:pointer;border-radius:8px;transition:background .12s ease}
.ece-c-meter-clickable:active{background:rgba(148,163,184,.18)}
.ece-ap-meter-row{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
.ece-ap-meter-row span{font-size:13px;font-weight:750;color:var(--ece-dim)}
.ece-ap-meter-row strong{font-size:16px;font-weight:950;letter-spacing:-.2px;color:var(--ece-text)}
.ece-ap-bar{position:relative;display:flex;align-items:center;height:8px;margin-top:7px}
.ece-ap-bar::before{content:"";position:absolute;inset:0;border-radius:999px;background:rgba(148,163,184,.22)}
.ece-ap-bar i{position:relative;z-index:1;display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#fb923c,#ef4444);min-width:0;transition:width .6s cubic-bezier(.4,0,.2,1)}
.ece-ap-bar i.ece-ap-progress-bar{background:linear-gradient(90deg,#4ade80,#16a34a)}
.ece-ap-power-open{cursor:pointer}
.ece-ap-power-open:hover{filter:brightness(1.04)}
.ece-ap-chart-svg{width:100%;height:100px;display:block}
.ece-ap-chart-svg.ece-e-chart-tall{height:200px}
.ece-ap-chart-labels{display:flex;justify-content:space-between;margin-top:4px;font-size:10px;font-weight:800;color:var(--ece-dim)}
.ece-ap-chart-labels span{flex:1;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ece-ap-chart-empty{padding:20px;text-align:center;font-size:13px;font-weight:700;color:var(--ece-dim)}
.ece-ap-chart-loading{padding:20px;text-align:center;font-size:13px;font-weight:700;color:var(--ece-dim)}
.ece-ap-warn{display:flex;align-items:center;gap:6px;margin:0 13px 12px;padding:9px 12px;border-radius:13px;background:#fee2e2;color:#b91c1c;font-size:13px;font-weight:800}
.ece-ap-warn[hidden]{display:none}
.ece-test-flag{position:absolute;top:10px;right:10px;z-index:2;font-size:11px;font-weight:900;letter-spacing:.5px;text-transform:uppercase;color:#0369a1;background:rgba(14,165,233,.14);border-radius:8px;padding:4px 8px}

.ece-ap-overlay{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:18px;backdrop-filter:blur(6px)}
.ece-ap-overlay[hidden]{display:none}
.ece-ap-dialog{width:min(440px,100%);max-height:min(84vh,720px);overflow:auto;background:var(--ece-card);color:var(--ece-text);border:1px solid var(--ece-border);border-radius:22px;box-shadow:0 24px 70px rgba(15,23,42,.3)}
.ece-ap-dialog-head{position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 16px 10px;background:var(--ece-card);border-bottom:1px solid var(--ece-border);z-index:1}
.ece-ap-dialog-head h3{margin:0;font-size:17px;font-weight:900}
.ece-ap-dialog-close{width:30px;height:30px;flex:0 0 auto;display:grid;place-items:center;border:0;border-radius:10px;background:var(--ece-soft);color:var(--ece-dim);cursor:pointer}
.ece-ap-dialog-body{padding:12px 16px 18px;display:flex;flex-direction:column;gap:16px}
.ece-ap-sec-cap{font-size:11.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:var(--ece-blue-deep);margin:0 0 8px;padding-bottom:5px;border-bottom:2px solid var(--ece-border)}
.ece-ap-sec{display:flex;flex-direction:column;gap:6px}
.ece-ap-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 11px;border-radius:13px;background:var(--ece-soft)}
.ece-ap-row-label{font-size:14.5px;font-weight:750;color:var(--ece-text)}
.ece-ap-row-val{font-size:14.5px;font-weight:500;color:var(--ece-dim)}
.ece-ap-switch{position:relative;width:38px;height:22px;flex:0 0 auto;border-radius:999px;border:0;background:#cbd5e1;cursor:pointer;transition:background .15s ease}
.ece-ap-switch::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .15s ease;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.ece-ap-switch.on{background:#22c55e}
.ece-ap-row-group{display:flex;flex-direction:column;gap:9px;padding:10px 12px;border-radius:13px;background:var(--ece-soft)}
.ece-ap-row-group-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
.ece-ap-row-group-label{display:flex;align-items:center;gap:8px;min-width:0;font-size:14.5px;font-weight:750;color:var(--ece-text)}
.ece-ap-row-group-ic{flex:0 0 auto;display:flex;align-items:center;color:var(--ece-blue)}
.ece-ap-row-chips{display:flex;flex-wrap:wrap;gap:6px}
.ece-ap-chip{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:800;letter-spacing:.2px;padding:5px 10px;border-radius:999px;background:var(--ece-card);border:1px solid var(--ece-border);color:var(--ece-dim);cursor:pointer;line-height:1}
.ece-ap-chip svg{flex:0 0 auto}
.ece-ap-chip b{color:var(--ece-text);font-weight:800}
.ece-ap-chip.on{background:#dcfce7;border-color:#86efac;color:#15803d}
.ece-ap-chip-action{background:var(--ece-blue);border-color:var(--ece-blue);color:#fff}
.ece-ap-sub-back{display:flex;align-items:center;gap:5px;font-size:12.5px;font-weight:800;color:var(--ece-blue);cursor:pointer;margin:0 0 10px}
.ece-ap-switch.on::after{transform:translateX(16px)}
.ece-ap-action-btn{flex:0 0 auto;border:0;border-radius:10px;padding:0 14px;height:26px;background:var(--ece-blue);color:#fff;font-size:13px;font-weight:850;cursor:pointer}
.ece-ap-action-btn:active{filter:brightness(.92)}
.ece-ap-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ece-ap-stat-grid.cols4{grid-template-columns:repeat(4,1fr)}
.ece-ap-stat{display:flex;flex-direction:column;gap:2px;padding:9px 10px;border-radius:13px;background:var(--ece-soft)}
.ece-ap-stat small{font-size:10px;font-weight:900;letter-spacing:.6px;text-transform:uppercase;color:var(--ece-dim)}
.ece-ap-stat b{font-size:15px;font-weight:900;color:var(--ece-text)}
.ece-ap-week-list{display:flex;flex-direction:column;gap:7px}
.ece-ap-week-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--ece-border)}
.ece-ap-week-row:last-child{border-bottom:0}
.ece-ap-week-day{flex:0 0 60px;font-size:13px;font-weight:850;color:var(--ece-text)}
.ece-ap-week-stats{flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:4px;min-width:0}
.ece-ap-week-stats.cols3{grid-template-columns:repeat(3,1fr)}
.ece-ap-week-stat{display:flex;flex-direction:column;align-items:center;gap:0;min-width:0}
.ece-ap-week-stat small{font-size:9px;font-weight:900;letter-spacing:.4px;text-transform:uppercase;color:var(--ece-dim)}
.ece-ap-week-stat b{font-size:13px;font-weight:850;color:var(--ece-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
.ece-ap-hero{cursor:pointer}
.ece-ap-reset-btn{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;padding:10px;border:0;border-radius:13px;background:var(--ece-blue);color:#fff;font-size:14px;font-weight:850;cursor:pointer}
.ece-ap-reset-note{font-size:12px;color:var(--ece-dim);text-align:center;margin-top:4px}

@media (max-width:600px){
  .ece-ap-overlay{align-items:flex-end;padding:0;backdrop-filter:blur(4px)}
  .ece-ap-dialog{width:100%;max-width:100%;height:94vh;max-height:94vh;border-radius:22px 22px 0 0;display:flex;flex-direction:column}
  .ece-ap-dialog-body{flex:1}
}
`;

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function meterSeverityColor(pct) {
  if (pct >= 85) return "#ef4444";
  if (pct >= 70) return "#f97316";
  if (pct >= 50) return "#eab308";
  if (pct >= 30) return "#22c55e";
  return "#38bdf8";
}

// Inverso di meterSeverityColor: per grandezze dove ALTO e' un bene (es.
// carica batteria) invece che un problema (es. carico/CPU/disco).
function applyLayoutChoice(root, cfg, hass) {
  const card = root && root.querySelector(".ece-ap-card");
  if (!card) return;
  let layout = cfg.layout;
  if (cfg.layout_entity) {
    const v = String(hass.states[cfg.layout_entity]?.state || "").toLowerCase();
    if (v === "classico" || v === "centrato") layout = v;
  }
  card.classList.toggle("layout-centrato", layout === "centrato");
}

class ControlloEnergiaCasaCard extends HTMLElement {
  setConfig(config) {
    if (!config.power_entity) throw new Error("power_entity \u00e8 obbligatorio");
    this._config = {
      name: "Energia Casa",
      artwork: "energy",
      max_power: 4500,
      periods: [],
      periods_prev: [],
      weekdays: {},
      circuits: [],
      switches: [],
      actions: [],
      settings_sections: [],
      layout: "classico", // "classico" (foto a sinistra) oppure "centrato" (foto in alto, blocco OGGI su 2 colonne)
      notif_center_path: "",
      ...config,
    };
    this._root = this._root || this.attachShadow({ mode: "open" });
    this._heroId = "en" + Math.random().toString(36).slice(2, 8);
    const hero = (HERO_BUILDERS[this._config.artwork] || HERO_BUILDERS.energy)(this._heroId);
    const chip = CHIP_SVGS[this._config.artwork] || CHIP_SVGS.energy;
    this._root.innerHTML = `<style>${STYLE}</style>
      <article class="ece-ap-card ece-e-card is-run${this._config.layout === "centrato" ? " layout-centrato" : ""}">
        <div class="ece-ap-top">
          <span class="ece-ap-chip">${chip}</span>
          <span class="ece-ap-headings">
            <span class="ece-ap-name"></span>
          </span>
          <span class="ece-ap-badge run"><i class="ece-ap-dot"></i><span class="ece-ap-badge-label">ONLINE</span></span>
          <span class="ece-ap-tools">
            <button type="button" class="ece-ap-tool ece-ap-notif-center" title="Centro Notifiche">${ICON_NOTIFCENTER}</button>
            <button type="button" class="ece-ap-tool ece-ap-settings" title="Impostazioni">${ICON_GEAR}</button>
            <button type="button" class="ece-ap-tool ece-ap-stats" title="Statistiche">${ICON_CHART}</button>
            <button type="button" class="ece-ap-tool ece-ap-consumi" title="Circuiti">${ICON_BOLT}</button>
          </span>
        </div>
        <div class="ece-ap-top-row">
          <div class="ece-ap-hero">${hero}</div>
          <div class="ece-ap-cycle-side">
            <span class="ece-ap-cycle-cap">Oggi</span>
            <div class="ece-ap-cycle-list">
              <div class="ece-ap-cycle-row ece-ap-cycle-row-b"><span class="ece-ap-cycle-label"><span class="ece-ap-cycle-ic">${ICON_BOLT}</span><small>Consumo</small></span><b class="ece-e-today-kwh">\u2014</b></div>
              <div class="ece-ap-cycle-row ece-ap-cycle-row-b"><span class="ece-ap-cycle-label"><span class="ece-ap-cycle-ic">${ICON_EURO}</span><small>Costo</small></span><b class="ece-e-today-cost">\u2014</b></div>
              <div class="ece-ap-cycle-row ece-ap-cycle-row-b"><span class="ece-ap-cycle-label"><span class="ece-ap-cycle-ic">${ICON_EURO}</span><small>Costo mese</small></span><b class="ece-e-month-cost">\u2014</b></div>
              <div class="ece-ap-cycle-row ece-ap-cycle-row-b"><span class="ece-ap-cycle-label"><span class="ece-ap-cycle-ic">${ICON_TREND}</span><small>Top consumo</small></span><b class="ece-e-top">\u2014</b></div>
            </div>
          </div>
        </div>
        <div class="ece-ap-warn" hidden></div>
        <div class="ece-ap-panel">
          <div class="ece-ap-meters"></div>
        </div>
      </article>`;
    this._root.querySelector(".ece-ap-name").textContent = this._config.name;

    // Le prime 4 voci di "circuits" (Generale/Prese/Luce/Cantina nel setup
    // reale) diventano le barre sul fronte, come CPU/RAM sulle altre card;
    // il resto compare solo nel popup Circuiti - stesso split usato per
    // Volume1/Volume2/USB sulla card NAS.
    const metersEl = this._root.querySelector(".ece-ap-meters");
    (this._config.circuits || []).slice(0, 4).forEach((c, i) => {
      // Barra mostrata solo se configurata davvero: serve l'entita' da misurare e una scala
      // (max_entity selezionabile, oppure max fisso). Se manca, la barra non compare.
      if (!(c.entity || c.entity_helper) || !(c.max_entity || c.max)) return;
      const div = document.createElement("div");
      div.className = "ece-ap-meter ece-c-meter-clickable";
      div.dataset.circuitIndex = i;
      div.innerHTML = `<div class="ece-ap-meter-row"><span class="ece-e-c-label">${esc(c.label || "")}</span><strong class="ece-e-c-val">0 W</strong></div>
        <div class="ece-ap-bar"><i class="ece-e-c-bar" style="width:0%"></i></div>`;
      div.addEventListener("click", (e) => {
        e.stopPropagation();
        const eid = this._barEntity(c, this._hass);
        if (eid) this._openMeterChart(eid, this._barLabel(c, this._hass, eid), "#38bdf8");
      });
      metersEl.appendChild(div);
    });

    const notifBtn = this._root.querySelector(".ece-ap-notif-center");
    // Il pulsante (megafono) compare solo se configuri notif_center_path, es. "/lovelace/notifiche"
    if (!this._config.notif_center_path) notifBtn.style.display = "none";
    notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      history.pushState(null, "", this._config.notif_center_path);
      window.dispatchEvent(new CustomEvent("location-changed", { bubbles: true, composed: true }));
    });
    this._root.querySelector(".ece-ap-settings").addEventListener("click", (e) => {
      e.stopPropagation();
      if (this._config.legacy_settings_popup) {
        const event = new Event("ll-custom", { bubbles: true, composed: true });
        event.detail = { browser_mod: this._config.legacy_settings_popup };
        this.dispatchEvent(event);
      } else {
        this._openSettings();
      }
    });
    this._root.querySelector(".ece-ap-stats").addEventListener("click", (e) => {
      e.stopPropagation();
      this._openStats();
    });
    this._root.querySelector(".ece-ap-consumi").addEventListener("click", (e) => {
      e.stopPropagation();
      this._openConsumi();
    });
    this._root.querySelector(".ece-ap-hero").addEventListener("click", (e) => {
      e.stopPropagation();
      this._openConsumi();
    });
  }

  _row(label, valueHtml) {
    return `<div class="ece-ap-row"><span class="ece-ap-row-label">${esc(label)}</span>${valueHtml}</div>`;
  }

  _openDialog(title, bodyHtml) {
    let overlay = this._root.querySelector(".ece-ap-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "ece-ap-overlay";
      overlay.hidden = true;
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.hidden = true;
      });
      // Menu a tendina delle impostazioni (righe input_select): la scelta viene applicata subito.
      overlay.addEventListener("change", (e) => {
        const t = e.target;
        if (t && t.dataset && t.dataset.selectEntity && this._hass) {
          this._hass.callService("input_select", "select_option", { entity_id: t.dataset.selectEntity, option: t.value });
        }
      });
      this._root.appendChild(overlay);
    }
    overlay.innerHTML = `<div class="ece-ap-dialog">
      <div class="ece-ap-dialog-head"><h3>${esc(title)}</h3><button type="button" class="ece-ap-dialog-close">${ICON_CLOSE}</button></div>
      <div class="ece-ap-dialog-body">${bodyHtml}</div>
    </div>`;
    overlay.querySelector(".ece-ap-dialog-close").addEventListener("click", () => {
      overlay.hidden = true;
    });
    overlay.hidden = false;
    return overlay;
  }

  _settingsRowHtml(hass, row) {
    const st = hass.states[row.entity];
    if (!st) return this._row(row.label, `<span class="ece-ap-row-val">n/d</span>`);
    const domain = row.entity.split(".")[0];
    if (["input_boolean", "automation", "switch"].includes(domain)) {
      const on = st.state === "on";
      return this._row(
        row.label,
        `<button type="button" class="ece-ap-switch${on ? " on" : ""}" data-entity="${esc(row.entity)}" aria-pressed="${on}"></button>`,
      );
    }
    if (domain === "input_select") {
      const opts = (st.attributes?.options || [])
        .map((o) => `<option value="${esc(o)}"${o === st.state ? " selected" : ""}>${esc(o)}</option>`)
        .join("");
      return this._row(row.label, `<select class="ece-ap-select" data-select-entity="${esc(row.entity)}">${opts}</select>`);
    }
    const unit = st.attributes?.unit_of_measurement || "";
    return `<div class="ece-ap-row" data-open-entity="${esc(row.entity)}" style="cursor:pointer">
      <span class="ece-ap-row-label">${esc(row.label)}</span>
      <span class="ece-ap-row-val">${esc(st.state)}${unit ? " " + esc(unit) : ""}</span>
    </div>`;
  }

  _actionRowHtml(row) {
    const target = row.service ? row.service : row.entity;
    return `<div class="ece-ap-row">
      <span class="ece-ap-row-label">${esc(row.label)}</span>
      <button type="button" class="ece-ap-action-btn" data-action-target="${esc(target)}" data-action-kind="${row.service ? "service" : "script"}" data-confirm="${esc(row.confirm || "")}">Esegui</button>
    </div>`;
  }

  _openSettings() {
    const hass = this._hass;
    const sections = (this._config.settings_sections || [])
      .map(
        (sec) => `<div class="ece-ap-sec">
          <div class="ece-ap-sec-cap">${esc(sec.title)}</div>
          ${sec.rows.map((row) => this._settingsRowHtml(hass, row)).join("")}
        </div>`,
      )
      .join("");

    const switchesHtml = (this._config.switches || [])
      .map((s) => this._settingsRowHtml(hass, s))
      .join("");

    const actions = this._config.actions || [];
    const actionsHtml = actions.length
      ? `<div class="ece-ap-sec">
           <div class="ece-ap-sec-cap">Strumenti</div>
           ${actions.map((a) => this._actionRowHtml(a)).join("")}
         </div>`
      : "";

    const overlay = this._openDialog(
      "Impostazioni",
      `${sections}${switchesHtml ? `<div class="ece-ap-sec"><div class="ece-ap-sec-cap">Interruttori</div>${switchesHtml}</div>` : ""}${actionsHtml}`,
    );

    overlay.querySelectorAll("[data-entity]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const entity = btn.dataset.entity;
        const domain = entity.split(".")[0];
        hass.callService(domain, "toggle", { entity_id: entity });
        setTimeout(() => this._openSettings(), 200);
      });
    });
    overlay.querySelectorAll("[data-open-entity]").forEach((row) => {
      row.addEventListener("click", () => {
        const e = new Event("hass-more-info", { bubbles: true, composed: true });
        e.detail = { entityId: row.dataset.openEntity };
        this.dispatchEvent(e);
      });
    });
    overlay.querySelectorAll("[data-action-target]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const confirmText = btn.dataset.confirm;
        if (confirmText && !window.confirm(confirmText)) return;
        if (btn.dataset.actionKind === "service") {
          const [domain, service] = btn.dataset.actionTarget.split(".");
          hass.callService(domain, service, {});
        } else {
          hass.callService("script", "turn_on", { entity_id: btn.dataset.actionTarget });
        }
      });
    });
  }

  _statRow(label, value) {
    return this._row(label, `<span class="ece-ap-row-val">${esc(value)}</span>`);
  }

  _statRow2(label, aVal, bVal) {
    return this._row(label, `<span class="ece-ap-row-val">${esc(aVal)}&nbsp;&nbsp;\u00b7&nbsp;&nbsp;${esc(bVal)}</span>`);
  }

  _val(hass, entityId, digits, attr) {
    const st = entityId ? hass.states[entityId] : null;
    if (!st) return "\u2014";
    const raw = attr ? st.attributes?.[attr] : st.state;
    const n = Number(raw);
    const unit = st.attributes?.unit_of_measurement || "";
    const num = Number.isFinite(n) && digits != null ? n.toFixed(digits) : raw;
    return `${num}${unit ? " " + unit : ""}`;
  }

  _fmtAxis(v) {
    if (!Number.isFinite(v)) return "0";
    const s = Math.abs(v) >= 10 ? v.toFixed(0) : v.toFixed(1);
    return s.endsWith(".0") ? s.slice(0, -2) : s;
  }

  _smoothPath(coords) {
    if (coords.length < 3) {
      return `M ${coords.map((c) => `${c[0].toFixed(1)},${c[1].toFixed(1)}`).join(" L ")}`;
    }
    let d = `M ${coords[0][0].toFixed(1)},${coords[0][1].toFixed(1)}`;
    for (let i = 1; i < coords.length - 1; i++) {
      const [x0, y0] = coords[i];
      const [x1, y1] = coords[i + 1];
      const mx = (x0 + x1) / 2;
      const my = (y0 + y1) / 2;
      d += ` Q ${x0.toFixed(1)},${y0.toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
    }
    const last = coords[coords.length - 1];
    d += ` L ${last[0].toFixed(1)},${last[1].toFixed(1)}`;
    return d;
  }

  _lineChartSvg(points, color, fixedMax) {
    if (!points.length) return `<div class="ece-ap-chart-empty">Nessun dato</div>`;
    const width = 300;
    const height = 200; // grafico alto (prima 90, risultava schiacciato)
    const plotX0 = 36; // spazio per etichette a 4 cifre (prima 24, tagliava "2623")
    const plotW = width - plotX0;
    const values = points.map((p) => p.y);
    const min = fixedMax ? 0 : Math.min(...values, 0);
    const max = fixedMax ? Math.max(fixedMax, ...values) : Math.max(...values, min + 1);
    const range = max - min || 1;
    const stepX = points.length > 1 ? plotW / (points.length - 1) : 0;
    const coords = points.map((p, i) => [plotX0 + i * stepX, height - ((p.y - min) / range) * (height - 6) - 3]);
    const lineD = this._smoothPath(coords);
    const areaD = `${lineD} L ${coords[coords.length - 1][0].toFixed(1)},${height} L ${coords[0][0].toFixed(1)},${height} Z`;
    return `<svg viewBox="0 0 ${width} ${height}" class="ece-ap-chart-svg ece-e-chart-tall" preserveAspectRatio="none">
      <line x1="${plotX0}" y1="3" x2="${plotX0}" y2="${height - 3}" stroke="#94a3b840" stroke-width="1"/>
      <text x="${plotX0 - 4}" y="8" text-anchor="end" font-size="10" font-weight="800" fill="#94a3b8">${this._fmtAxis(max)}</text>
      <text x="${plotX0 - 4}" y="${height - 3}" text-anchor="end" font-size="10" font-weight="800" fill="#94a3b8">${this._fmtAxis(min)}</text>
      <path d="${areaD}" fill="${color}" opacity="0.14"/>
      <path d="${lineD}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`;
  }

  _labelSpans(items, count, formatFn) {
    if (!items.length) return "";
    const n = Math.min(count, items.length);
    const idxs = [];
    for (let i = 0; i < n; i++) {
      idxs.push(n === 1 ? 0 : Math.round((i * (items.length - 1)) / (n - 1)));
    }
    const seen = new Set();
    const unique = idxs.filter((i) => (seen.has(i) ? false : (seen.add(i), true)));
    return `<div class="ece-ap-chart-labels">${unique.map((i) => `<span>${formatFn(items[i], i)}</span>`).join("")}</div>`;
  }

  async _fetchHistory6h(entityId) {
    const end = new Date();
    const start = new Date(end.getTime() - 6 * 3600 * 1000);
    const result = await this._hass.connection.sendMessagePromise({
      type: "history/history_during_period",
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      entity_ids: [entityId],
      minimal_response: true,
      no_attributes: true,
    });
    const rows = result?.[entityId] || [];
    return rows
      .map((r) => ({ t: new Date((r.lu || r.last_updated_ts) * 1000 || r.last_updated), y: Number(r.s ?? r.state) }))
      .filter((p) => Number.isFinite(p.y));
  }

  _openMeterChart(entityId, title, color) {
    if (!entityId) return;
    this._openDialog(
      title,
      `<div class="ece-ap-sec"><div class="ece-ap-sec-cap">Ultime 6 ore</div><div class="ece-ap-chart-loading" data-chart="6h">Caricamento...</div></div>`,
    );
    const overlay = this._root.querySelector(".ece-ap-overlay");
    const slot = overlay?.querySelector('[data-chart="6h"]');
    this._fetchHistory6h(entityId)
      .then((points) => {
        const el = overlay?.querySelector('[data-chart="6h"]');
        if (!el) return;
        const labels = this._labelSpans(points, 7, (p) => p.t.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
        el.outerHTML = `<div data-chart="6h">${this._lineChartSvg(points, color)}${labels}</div>`;
      })
      .catch(() => {
        if (slot) slot.textContent = "Errore caricamento dati";
      });
  }

  _openPowerHistory() {
    const cfg = this._config;
    this._openDialog(
      "Andamento potenza",
      `<div class="ece-ap-sec"><div class="ece-ap-sec-cap">Ultime 24 ore</div><div class="ece-ap-chart-loading" data-chart="24h">Caricamento...</div></div>`,
    );
    const overlay = this._root.querySelector(".ece-ap-overlay");
    const slot = overlay?.querySelector('[data-chart="24h"]');
    (async () => {
      const end = new Date();
      const start = new Date(end.getTime() - 24 * 3600 * 1000);
      const result = await this._hass.connection.sendMessagePromise({
        type: "history/history_during_period",
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        entity_ids: [cfg.power_entity],
        minimal_response: true,
        no_attributes: true,
      });
      const rows = result?.[cfg.power_entity] || [];
      return rows
        .map((r) => ({ t: new Date((r.lu || r.last_updated_ts) * 1000 || r.last_updated), y: Number(r.s ?? r.state) }))
        .filter((p) => Number.isFinite(p.y));
    })()
      .then((points) => {
        const el = overlay?.querySelector('[data-chart="24h"]');
        if (!el) return;
        const labels = this._labelSpans(points, 7, (p) => p.t.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
        el.outerHTML = `<div data-chart="24h">${this._lineChartSvg(points, "#0ea5e9", this._config.max_power)}${labels}</div>`;
      })
      .catch(() => {
        if (slot) slot.textContent = "Errore caricamento dati";
      });
  }

  _openStats() {
    const hass = this._hass;
    const cfg = this._config;
    const val = (id, digits, attr) => this._val(hass, id, digits, attr);

    const periodsHtml = (cfg.periods || [])
      .map((p) => this._statRow2(p.label, val(p.energy, 2), val(p.cost, 2)))
      .join("");

    const prevHtml = (cfg.periods_prev || [])
      .map((p) => this._statRow2(p.label, val(p.energy, 2, p.energy_attr), val(p.cost, 2)))
      .join("");

    const weekEntries = Object.entries(cfg.weekdays || {});
    const weekHtml = weekEntries.map(([label, entity]) => this._statRow(label, val(entity, 2))).join("");
    const mediaHtml = cfg.media_entity ? this._statRow("Media settimanale", val(cfg.media_entity, 1)) : "";

    this._openDialog("Statistiche", `
      <div class="ece-ap-sec"><div class="ece-ap-sec-cap">Consumi per periodo</div>${periodsHtml}</div>
      ${prevHtml ? `<div class="ece-ap-sec"><div class="ece-ap-sec-cap">Periodo precedente</div>${prevHtml}</div>` : ""}
      ${weekHtml ? `<div class="ece-ap-sec"><div class="ece-ap-sec-cap">Ultimi 7 giorni</div>${weekHtml}${mediaHtml}</div>` : ""}
    `);
    const overlay = this._root.querySelector(".ece-ap-overlay");
    const chartBtn = document.createElement("button");
    chartBtn.type = "button";
    chartBtn.className = "ece-ap-action-btn";
    chartBtn.style.width = "100%";
    chartBtn.style.marginTop = "2px";
    chartBtn.textContent = "Andamento potenza (24h)";
    chartBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._openPowerHistory();
    });
    overlay.querySelector(".ece-ap-dialog-body").appendChild(chartBtn);
  }

  // Entita' misurata da una barra: se il circuito ha "entity_helper" (input_text riempito dal
  // menu a tendina nelle Impostazioni) vale quella scelta, e se e' vuota la barra non compare;
  // altrimenti l'"entity" fissa della configurazione.
  _barEntity(c, hass) {
    if (c.entity_helper) {
      const v = (hass?.states[c.entity_helper]?.state || "").trim();
      return v && v !== "unknown" && v !== "unavailable" ? v : "";
    }
    return c.entity || "";
  }

  // Nome della barra: con entita' scelta dal menu segue il nome dell'entita' (senza il
  // suffisso "Potenza/Power"); con un'entita' fissa vale la "label" della configurazione.
  _barLabel(c, hass, eid) {
    if (!c.entity_helper && c.label) return c.label;
    const fn = hass?.states[eid]?.attributes?.friendly_name || eid || "";
    const nome = String(fn).replace(/\s*(potenza|power)$/i, "").trim() || String(fn);
    return nome.charAt(0).toUpperCase() + nome.slice(1);
  }

  _openConsumi() {
    const hass = this._hass;
    const cfg = this._config;
    const circuits = (cfg.circuits || [])
      .map((c) => ({ ...c, live: Number(hass.states[c.entity]?.state) || 0 }))
      .sort((a, b) => b.live - a.live);

    const rows = circuits.map((c) => this._statRow(c.label, `${c.live.toFixed(0)} W`)).join("");
    const topSt = cfg.top_entity ? hass.states[cfg.top_entity]?.state : null;

    this._openDialog("Circuiti", `
      ${topSt ? `<div class="ece-ap-sec"><div class="ece-ap-sec-cap">In evidenza</div>${this._statRow("Top consumo", topSt)}</div>` : ""}
      <div class="ece-ap-sec"><div class="ece-ap-sec-cap">Tutti i circuiti (live)</div>${rows}</div>
    `);
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    applyLayoutChoice(this._root, this._config, hass);
    const cfg = this._config;

    const watt = Number(hass.states[cfg.power_entity]?.state);
    const wattVal = Number.isFinite(watt) ? Math.max(0, watt) : 0;
    const wattText = this._root.querySelector(".ece-e-watt");
    if (wattText) wattText.textContent = wattVal.toFixed(0);

    if (cfg.periods?.[1]) {
      this._root.querySelector(".ece-e-today-kwh").textContent = this._val(hass, cfg.periods[1].energy, 2);
      this._root.querySelector(".ece-e-today-cost").textContent = this._val(hass, cfg.periods[1].cost, 2);
    }
    if (cfg.periods?.[3]) {
      this._root.querySelector(".ece-e-month-cost").textContent = this._val(hass, cfg.periods[3].cost, 2);
    }
    // "Nome: 57 W": si accorcia (con ...) solo il nome del dispositivo, i watt restano sempre visibili.
    const topEl = this._root.querySelector(".ece-e-top");
    const topTxt = cfg.top_entity ? String(hass.states[cfg.top_entity]?.state ?? "\u2014") : "\u2014";
    const cut = topTxt.lastIndexOf(":");
    if (cut > 0 && /W\s*$/.test(topTxt)) {
      const nome = topTxt.slice(0, cut);
      const watt = topTxt.slice(cut);
      if (topEl.dataset.v !== topTxt) {
        topEl.dataset.v = topTxt;
        topEl.textContent = "";
        const n = document.createElement("span");
        n.className = "ece-e-top-n";
        n.textContent = nome;
        const w = document.createElement("span");
        w.className = "ece-e-top-w";
        w.textContent = watt;
        topEl.append(n, w);
      }
    } else {
      topEl.dataset.v = topTxt;
      topEl.textContent = topTxt;
    }

    (cfg.circuits || []).slice(0, 4).forEach((c, i) => {
      const el = this._root.querySelector(`[data-circuit-index="${i}"]`);
      if (!el) return;
      const eid = this._barEntity(c, hass);
      if (!eid || !hass.states[eid]) { el.style.display = "none"; return; }
      el.querySelector(".ece-e-c-label").textContent = this._barLabel(c, hass, eid);
      const v = Number(hass.states[eid]?.state);
      const vVal = Number.isFinite(v) ? v : 0;
      el.querySelector(".ece-e-c-val").textContent = `${vVal.toFixed(0)} W`;
      // Scala della barra: se il circuito ha "max_entity" (input_number modificabile dalle
      // Impostazioni) vale quel valore, altrimenti il "max" fisso della configurazione.
      const maxLive = c.max_entity ? Number(hass.states[c.max_entity]?.state) : NaN;
      const maxUsed = Number.isFinite(maxLive) && maxLive > 0 ? maxLive : c.max;
      // Nessuna scala valida (entita' non selezionata/non disponibile e nessun max fisso): barra nascosta.
      el.style.display = maxUsed ? "" : "none";
      if (!maxUsed) return;
      const pct = maxUsed ? Math.min(100, (vVal / maxUsed) * 100) : 0;
      const bar = el.querySelector(".ece-e-c-bar");
      bar.style.width = `${pct}%`;
      bar.style.background = meterSeverityColor(pct);
    });

    const warnEl = this._root.querySelector(".ece-ap-warn");
    const soglia = cfg.soglia_entity ? Number(hass.states[cfg.soglia_entity]?.state) : null;
    const card = this._root.querySelector(".ece-ap-card");
    // Layout: se c'e' "layout_entity" (un input_select Classico/Centrato scelto dalle Impostazioni)
    // vale quella scelta, altrimenti il parametro "layout" della configurazione.
    let layoutScelto = cfg.layout;
    if (cfg.layout_entity) {
      const lv = String(hass.states[cfg.layout_entity]?.state || "").toLowerCase();
      if (lv === "classico" || lv === "centrato") layoutScelto = lv;
    }
    card.classList.toggle("layout-centrato", layoutScelto === "centrato");
    if (soglia != null && wattVal > soglia) {
      warnEl.hidden = false;
      warnEl.textContent = `\u26a0 Soglia superata: ${wattVal.toFixed(0)} W (limite ${soglia.toFixed(0)} W)`;
      card.classList.add("has-alarm");
    } else {
      warnEl.hidden = true;
      card.classList.remove("has-alarm");
    }
  }

  getCardSize() {
    return 7;
  }
}


customElements.define("controllo-energia-casa-card", ControlloEnergiaCasaCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "controllo-energia-casa-card",
  name: "Controllo Energia Casa",
  description: "Card per il controllo dell'energia di tutta la casa: consumo istantaneo, barre dei circuiti, storici, costi, soglia di allarme e impostazioni",
  preview: false,
  documentationURL: "https://github.com/Simonz82/controllo_energia_casa",
  author: "Simonz82",
});
