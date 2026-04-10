import { useState, useRef, useEffect } from "react";

// ── DATA ─────────────────────────────────────────────────────────────────────
const TICKET_TYPES = [
  { id: 1, name: "Suporte de TI",         icon: "💻", color: "#6366f1", category: "Tecnologia" },
  { id: 2, name: "Manutenção Predial",     icon: "🔧", color: "#f59e0b", category: "Infraestrutura" },
  { id: 3, name: "Solicitação de RH",      icon: "👥", color: "#10b981", category: "RH" },
  { id: 4, name: "Acesso a Sistemas",      icon: "🔑", color: "#ec4899", category: "Tecnologia" },
  { id: 5, name: "Compras e Suprimentos",  icon: "📦", color: "#f97316", category: "Administrativo" },
];
const PRIORITIES = [
  { id: 1, name: "Baixa",   color: "#6b7280", sla: 72 },
  { id: 2, name: "Média",   color: "#f59e0b", sla: 24 },
  { id: 3, name: "Alta",    color: "#ef4444", sla: 4  },
  { id: 4, name: "Crítica", color: "#7c3aed", sla: 1  },
];
const STATUSES = [
  { id: 1, name: "Aberto",                 color: "#3b82f6" },
  { id: 2, name: "Em Atendimento",         color: "#f59e0b" },
  { id: 3, name: "Aguard. Confirmação",    color: "#8b5cf6" },
  { id: 4, name: "Fechado",               color: "#10b981" },
  { id: 5, name: "Cancelado",             color: "#6b7280" },
];
const MOCK_TICKETS = [
  { id:"CHM-001", title:"Notebook não liga após atualização",    type:1, priority:3, status:2, user:"Ana Lima",       date:"07/04", sla:"2h restantes",   assigned:"Carlos Dev" },
  { id:"CHM-002", title:"Vazamento no banheiro do 3º andar",     type:2, priority:2, status:1, user:"Roberto Souza",  date:"07/04", sla:"18h restantes",  assigned:"—" },
  { id:"CHM-003", title:"Solicitação de férias - Julho 2025",    type:3, priority:1, status:3, user:"Juliana Matos",  date:"06/04", sla:"60h restantes",  assigned:"Bruna RH" },
  { id:"CHM-004", title:"Acesso bloqueado ao SIAG",              type:4, priority:4, status:2, user:"Marcos Ferreira",date:"08/04", sla:"30min restantes",assigned:"Carlos Dev" },
  { id:"CHM-005", title:"Requisição de papel A4 para impressão", type:5, priority:1, status:4, user:"Carla Nunes",   date:"05/04", sla:"Concluído",      assigned:"Pedro Adm" },
  { id:"CHM-006", title:"Monitor com tela piscando",             type:1, priority:2, status:1, user:"Diego Alves",   date:"08/04", sla:"22h restantes",  assigned:"—" },
];

const getType     = id => TICKET_TYPES.find(t => t.id === id);
const getPriority = id => PRIORITIES.find(p => p.id === id);
const getStatus   = id => STATUSES.find(s => s.id === id);

// ── STYLES ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

  :root {
    --bg:      #0c0c1d;
    --bg2:     #131326;
    --bg3:     #1a1a32;
    --surface: #22223e;
    --border:  #2a2a50;
    --text:    #eeeef8;
    --muted:   #8080a8;
    --a1:      #7c3aed;
    --a2:      #06b6d4;
    --a3:      #f59e0b;
    --a4:      #ec4899;
    --ok:      #10b981;
    --err:     #ef4444;
    --r:       14px;
    --rsm:     10px;
  }

  html, body, #root { height: 100%; }
  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: var(--bg); color: var(--text);
    overflow: hidden;
  }

  /* ── PHONE FRAME ── */
  .frame-outer {
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; background: #070712;
    padding: 20px;
  }
  .phone {
    width: 390px;
    height: 844px;
    background: var(--bg);
    border-radius: 44px;
    border: 2px solid #2a2a50;
    box-shadow: 0 0 0 8px #0a0a18, 0 40px 120px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.06);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* notch */
  .notch {
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 120px; height: 34px; background: #0a0a18;
    border-radius: 0 0 20px 20px; z-index: 200;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .notch-cam { width: 10px; height: 10px; border-radius: 50%; background: #1a1a30; border: 1px solid #222; }
  .notch-speaker { width: 40px; height: 5px; background: #1a1a30; border-radius: 3px; }

  /* status bar */
  .statusbar {
    height: 44px; display: flex; align-items: flex-end; padding: 0 24px 6px;
    font-size: 12px; font-weight: 700; color: var(--muted); flex-shrink: 0;
    justify-content: space-between;
  }
  .statusbar-right { display: flex; gap: 6px; align-items: center; font-size: 11px; }

  /* main scroll area */
  .screen {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 80px;
  }
  .screen::-webkit-scrollbar { display: none; }

  /* ── TOPBAR ── */
  .topbar {
    padding: 12px 20px 10px;
    display: flex; align-items: center; gap: 10px;
    background: var(--bg); border-bottom: 1px solid var(--border);
    flex-shrink: 0; position: sticky; top: 0; z-index: 50;
  }
  .topbar-logo {
    display: flex; align-items: center; gap: 7px;
    background: linear-gradient(135deg, var(--a1), var(--a2));
    padding: 5px 10px; border-radius: 8px;
    font-size: 12px; font-weight: 800; letter-spacing: 0.3px;
  }
  .topbar-title { flex: 1; font-size: 16px; font-weight: 700; }
  .icon-btn {
    width: 34px; height: 34px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg3); border: 1px solid var(--border);
    cursor: pointer; font-size: 16px; position: relative;
    border: none;
  }
  .icon-btn .dot {
    position: absolute; top: 5px; right: 5px;
    width: 7px; height: 7px; background: var(--a4);
    border-radius: 50%; border: 1px solid var(--bg);
  }
  .module-pills {
    display: flex; gap: 4px;
    background: var(--bg3); border-radius: 10px; padding: 3px;
    border: 1px solid var(--border);
  }
  .mpill {
    padding: 4px 12px; border-radius: 8px;
    font-size: 11px; font-weight: 700; cursor: pointer;
    border: none; background: transparent; color: var(--muted);
    font-family: inherit; transition: all 0.15s;
  }
  .mpill.active { background: var(--a1); color: white; }

  /* ── BOTTOM NAV ── */
  .bottom-nav {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 74px;
    background: var(--bg2);
    border-top: 1px solid var(--border);
    display: flex; align-items: flex-start; padding-top: 8px;
    z-index: 100;
  }
  .bnav-item {
    flex: 1; display: flex; flex-direction: column; align-items: center;
    gap: 3px; cursor: pointer; padding: 2px 0;
    border: none; background: none; font-family: inherit;
    transition: all 0.15s; position: relative;
  }
  .bnav-icon {
    width: 38px; height: 32px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; transition: all 0.2s;
  }
  .bnav-item.active .bnav-icon {
    background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.15));
  }
  .bnav-label { font-size: 9px; font-weight: 700; color: var(--muted); letter-spacing: 0.3px; }
  .bnav-item.active .bnav-label { color: var(--a2); }
  .bnav-badge {
    position: absolute; top: 0; right: 20px;
    background: var(--a4); color: white;
    font-size: 9px; font-weight: 800;
    width: 16px; height: 16px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid var(--bg);
  }

  /* FAB */
  .fab {
    position: absolute; bottom: 80px; right: 20px;
    width: 52px; height: 52px; border-radius: 16px;
    background: linear-gradient(135deg, var(--a1), #5b21b6);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; cursor: pointer; z-index: 99;
    box-shadow: 0 8px 24px rgba(124,58,237,0.5);
    border: none; color: white;
    transition: transform 0.15s;
  }
  .fab:active { transform: scale(0.93); }

  /* ── PAGE PADDING ── */
  .page { padding: 0; animation: fadeIn 0.2s; }

  /* ── SECTION ── */
  .px { padding: 0 16px; }
  .pt { padding-top: 16px; }
  .pb { padding-bottom: 16px; }
  .section-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 16px 10px;
  }
  .section-title { font-size: 14px; font-weight: 700; }
  .section-sub { font-size: 11px; color: var(--muted); margin-top: 1px; }

  /* ── KPI SCROLL ── */
  .kpi-scroll {
    display: flex; gap: 10px; padding: 4px 16px 16px;
    overflow-x: auto; -webkit-overflow-scrolling: touch;
  }
  .kpi-scroll::-webkit-scrollbar { display: none; }
  .kpi-card {
    min-width: 130px; padding: 14px 14px 12px;
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: var(--r); flex-shrink: 0;
    position: relative; overflow: hidden;
  }
  .kpi-glow {
    position: absolute; top: -20px; right: -20px;
    width: 70px; height: 70px; border-radius: 50%;
    filter: blur(28px); opacity: 0.35;
  }
  .kpi-label { font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 6px; }
  .kpi-value { font-size: 28px; font-weight: 800; font-family: 'JetBrains Mono', monospace; line-height: 1; }
  .kpi-sub { font-size: 10px; color: var(--muted); margin-top: 4px; }

  /* ── TICKET CARD ── */
  .ticket-card {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: var(--r); padding: 14px;
    cursor: pointer; transition: border-color 0.15s;
    margin: 0 16px 10px;
  }
  .ticket-card:active { border-color: var(--a1); background: var(--bg3); }
  .tc-row1 { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; }
  .tc-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .tc-id { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--a2); }
  .tc-title { font-size: 13px; font-weight: 600; line-height: 1.35; margin-bottom: 8px; }
  .tc-badges { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
  .tc-meta { font-size: 11px; color: var(--muted); margin-top: 7px; }

  /* ── BADGE ── */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 20px;
    font-size: 10px; font-weight: 700;
  }
  .bdot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

  /* SLA */
  .sla-ok   { color: #10b981; font-size: 11px; font-weight: 700; }
  .sla-warn { color: #f59e0b; font-size: 11px; font-weight: 700; }
  .sla-crit { color: #ef4444; font-size: 11px; font-weight: 700; }

  /* ── BOTTOM SHEET ── */
  .sheet-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.65); z-index: 150;
    animation: fadeIn 0.2s;
    backdrop-filter: blur(3px);
  }
  .sheet {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: var(--bg2);
    border-radius: 24px 24px 0 0;
    border-top: 1px solid var(--border);
    max-height: 88%;
    display: flex; flex-direction: column;
    animation: slideUp 0.25s cubic-bezier(.16,1,.3,1);
    overflow: hidden;
  }
  .sheet-handle {
    width: 36px; height: 4px; border-radius: 2px;
    background: var(--border); margin: 12px auto 0;
    flex-shrink: 0;
  }
  .sheet-header {
    padding: 14px 18px 12px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
    flex-shrink: 0;
  }
  .sheet-title { flex: 1; font-size: 15px; font-weight: 700; }
  .sheet-body { overflow-y: auto; padding: 16px 18px; flex: 1; }
  .sheet-body::-webkit-scrollbar { display: none; }
  .sheet-footer {
    padding: 12px 18px; border-top: 1px solid var(--border);
    display: flex; gap: 8px; flex-shrink: 0;
  }

  /* ── FORMS ── */
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px; color: var(--text); letter-spacing: 0.3px; }
  .form-input {
    width: 100%; padding: 11px 13px;
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: var(--rsm); color: var(--text);
    font-family: inherit; font-size: 14px;
    transition: border-color 0.15s; outline: none;
  }
  .form-input:focus { border-color: var(--a1); box-shadow: 0 0 0 3px rgba(124,58,237,0.15); }
  textarea.form-input { resize: none; min-height: 90px; }
  select.form-input { cursor: pointer; }

  /* ── BTNS ── */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 10px 16px; border-radius: var(--rsm);
    font-size: 13px; font-weight: 700; cursor: pointer;
    border: none; transition: all 0.15s; font-family: inherit;
  }
  .btn:active { transform: scale(0.97); }
  .btn-primary {
    background: linear-gradient(135deg, var(--a1), #5b21b6);
    color: white; flex: 1;
    box-shadow: 0 4px 14px rgba(124,58,237,0.4);
  }
  .btn-secondary { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
  .btn-ghost { background: transparent; color: var(--muted); }
  .btn-danger { background: rgba(239,68,68,0.1); color: var(--err); border: 1px solid rgba(239,68,68,0.25); }
  .btn-full { width: 100%; }
  .btn-sm { padding: 7px 12px; font-size: 12px; }

  /* ── TYPE SELECTOR ── */
  .type-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
    padding: 0 16px 16px;
  }
  .type-sel-card {
    background: var(--bg3); border: 2px solid var(--border);
    border-radius: var(--r); padding: 14px 12px;
    cursor: pointer; transition: all 0.15s; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    user-select: none; -webkit-user-select: none;
  }
  .type-sel-card:hover { border-color: var(--muted); background: var(--surface); }
  .type-sel-card:active { transform: scale(0.95); opacity: 0.85; }
  .type-sel-icon { font-size: 28px; }
  .type-sel-name { font-size: 12px; font-weight: 700; }
  .type-sel-cat { font-size: 10px; color: var(--muted); }

  /* ── STEPPER ── */
  .stepper {
    display: flex; align-items: center; padding: 14px 16px 4px;
    gap: 0;
  }
  .step { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; }
  .step::after {
    content: ''; position: absolute; top: 13px; left: 50%; right: -50%;
    height: 2px; background: var(--border); z-index: 0;
  }
  .step:last-child::after { display: none; }
  .step-dot {
    width: 26px; height: 26px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800; z-index: 1;
    border: 2px solid var(--border); background: var(--bg3);
    position: relative;
  }
  .step.done .step-dot { background: var(--ok); border-color: var(--ok); color: white; }
  .step.done::after { background: var(--ok); }
  .step.active .step-dot { background: var(--a1); border-color: var(--a1); color: white; box-shadow: 0 0 10px rgba(124,58,237,0.5); }
  .step-lbl { font-size: 9px; color: var(--muted); margin-top: 5px; font-weight: 700; }
  .step.active .step-lbl { color: var(--a1); }
  .step.done .step-lbl { color: var(--ok); }

  /* ── DETAIL ── */
  .detail-hero {
    background: linear-gradient(135deg, rgba(124,58,237,0.18), rgba(6,182,212,0.08));
    border-bottom: 1px solid rgba(124,58,237,0.2);
    padding: 16px 18px;
  }
  .detail-id { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--a2); margin-bottom: 6px; }
  .detail-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; line-height: 1.3; }
  .meta-row { display: flex; gap: 12px; flex-wrap: wrap; }
  .meta-item { display: flex; flex-direction: column; gap: 2px; }
  .meta-lbl { font-size: 9px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; }
  .meta-val { font-size: 12px; font-weight: 600; }

  /* ── TIMELINE ── */
  .timeline { display: flex; flex-direction: column; }
  .tl-item { display: flex; gap: 12px; padding-bottom: 20px; position: relative; }
  .tl-item::before {
    content: ''; position: absolute; left: 14px; top: 30px; bottom: 0;
    width: 1px; background: var(--border);
  }
  .tl-item:last-child::before { display: none; }
  .tl-dot {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; flex-shrink: 0; border: 1px solid;
  }
  .tl-body { flex: 1; }
  .tl-title { font-size: 12px; font-weight: 700; margin-bottom: 2px; }
  .tl-time { font-size: 10px; color: var(--muted); margin-bottom: 6px; }
  .tl-text {
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: var(--rsm); padding: 10px;
    font-size: 12px; color: var(--muted); line-height: 1.5;
  }

  /* ── ADMIN TYPE CARDS ── */
  .atype-card {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: var(--r); padding: 14px;
    margin: 0 16px 10px;
    display: flex; align-items: center; gap: 12px;
    cursor: pointer; transition: all 0.15s;
    position: relative; overflow: hidden;
  }
  .atype-stripe {
    position: absolute; left: 0; top: 0; bottom: 0; width: 3px; border-radius: 3px 0 0 3px;
  }
  .atype-icon-wrap {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .atype-name { font-size: 13px; font-weight: 700; }
  .atype-cat { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .atype-arrow { margin-left: auto; color: var(--muted); font-size: 14px; }

  /* ── CONFIG ROWS ── */
  .config-row {
    display: flex; align-items: center; gap: 10px;
    padding: 13px 16px; border-bottom: 1px solid var(--border);
    cursor: pointer;
  }
  .config-row:active { background: var(--bg3); }
  .config-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .config-name { flex: 1; font-size: 13px; font-weight: 600; }
  .config-sub { font-size: 11px; color: var(--muted); }
  .config-chevron { color: var(--muted); font-size: 12px; }

  /* ── SUCCESS ── */
  .success-screen {
    display: flex; flex-direction: column; align-items: center;
    padding: 32px 24px; text-align: center;
    animation: fadeIn 0.3s;
  }
  .success-icon { font-size: 64px; margin-bottom: 16px; animation: bounce 0.5s; }
  .success-title { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
  .success-sub { font-size: 13px; color: var(--muted); margin-bottom: 20px; line-height: 1.5; }
  .success-id {
    font-family: 'JetBrains Mono', monospace;
    font-size: 22px; font-weight: 700; color: var(--a2);
    background: var(--bg3); padding: 12px 24px; border-radius: var(--r);
    border: 1px solid var(--border); margin-bottom: 8px;
  }

  /* ── PROFILE HEADER ── */
  .profile-header {
    padding: 16px; display: flex; align-items: center; gap: 12px;
    background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.06));
    border-bottom: 1px solid var(--border);
  }
  .avatar {
    width: 44px; height: 44px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 800; flex-shrink: 0;
  }

  /* ── NOTIF ── */
  .notif-item {
    display: flex; gap: 10px; padding: 12px 16px;
    border-bottom: 1px solid var(--border); cursor: pointer;
  }
  .notif-item.unread { background: rgba(124,58,237,0.04); }
  .notif-dot-unread { width: 7px; height: 7px; background: var(--a1); border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
  .notif-text { font-size: 13px; line-height: 1.4; }
  .notif-time { font-size: 11px; color: var(--muted); margin-top: 3px; }

  /* ── FILTER CHIPS ── */
  .filter-chips {
    display: flex; gap: 8px; padding: 10px 16px;
    overflow-x: auto; -webkit-overflow-scrolling: touch;
  }
  .filter-chips::-webkit-scrollbar { display: none; }
  .chip {
    padding: 5px 12px; border-radius: 20px; white-space: nowrap;
    font-size: 11px; font-weight: 700; cursor: pointer;
    background: var(--bg3); border: 1px solid var(--border); color: var(--muted);
    flex-shrink: 0;
  }
  .chip.active { background: rgba(124,58,237,0.2); border-color: rgba(124,58,237,0.4); color: #a78bfa; }

  /* ── DIVIDER ── */
  .divider { height: 1px; background: var(--border); margin: 12px 0; }

  /* ── EMPTY ── */
  .empty { text-align: center; padding: 40px 20px; color: var(--muted); }
  .empty-icon { font-size: 40px; opacity: 0.35; margin-bottom: 10px; }
  .empty-text { font-size: 13px; }

  /* ── TAG ── */
  .tag {
    display: inline-flex; align-items: center;
    padding: 2px 7px; border-radius: 6px;
    font-size: 10px; font-weight: 700;
    background: rgba(124,58,237,0.15); color: #a78bfa;
    border: 1px solid rgba(124,58,237,0.25);
  }

  /* ── ADMIN DASHBOARD QUICK STATS ── */
  .stat-row {
    display: flex; gap: 8px; padding: 0 16px 12px;
  }
  .stat-pill {
    flex: 1; padding: 10px 8px; border-radius: var(--rsm);
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    border: 1px solid var(--border); background: var(--bg2);
  }
  .stat-num { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 800; }
  .stat-lbl { font-size: 9px; color: var(--muted); font-weight: 700; text-align: center; }

  @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(30px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes bounce  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
`;

// ── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function Badge({ color, children, small }) {
  return (
    <span className="badge" style={{ background: color+"1e", color, border:`1px solid ${color}38`, fontSize: small ? 9 : 10 }}>
      <span className="bdot" style={{ background: color }} />
      {children}
    </span>
  );
}

function SLAText({ text }) {
  if (text === "Concluído")       return <span className="sla-ok">✓ Concluído</span>;
  if (text.includes("min"))       return <span className="sla-crit">⚠ {text}</span>;
  if (/^[1-4]h/.test(text))      return <span className="sla-warn">⏱ {text}</span>;
  return <span className="sla-ok">{text}</span>;
}

// ── BOTTOM SHEET WRAPPER ─────────────────────────────────────────────────────
function Sheet({ onClose, title, icon, children, footer }) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          {icon && <span style={{ fontSize: 22 }}>{icon}</span>}
          <div className="sheet-title">{title}</div>
          <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px", fontSize: 16 }} onClick={onClose}>✕</button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── TICKET DETAIL SHEET ───────────────────────────────────────────────────────
function TicketDetailSheet({ ticket, onClose, isAdmin }) {
  const type     = getType(ticket.type);
  const priority = getPriority(ticket.priority);
  const status   = getStatus(ticket.status);
  const [comment, setComment] = useState("");

  const timeline = [
    { icon:"📬", title:"Chamado aberto",       time:`${ticket.date} às 09:14`, bg:"#3b82f6" },
    { icon:"👤", title:`Atribuído para ${ticket.assigned !== "—" ? ticket.assigned : "aguardando..."}`,
                                                time:`${ticket.date} às 09:45`, bg:"#f59e0b", text:"Análise iniciada." },
    ...(ticket.status >= 2 ? [{ icon:"⚡", title:"Atendimento iniciado", time:`${ticket.date} às 10:00`, bg:"#8b5cf6", text:"Técnico verificando remotamente." }] : []),
    ...(ticket.status >= 3 ? [{ icon:"✅", title:"Aguard. confirmação", time:`${ticket.date} às 14:30`, bg:"#10b981", text:"Problema corrigido. Por favor confirme." }] : []),
    ...(ticket.status === 4 ? [{ icon:"🏁", title:"Chamado fechado", time:`${ticket.date} às 15:00`, bg:"#10b981" }] : []),
  ];

  return (
    <Sheet
      onClose={onClose}
      title={`${ticket.id}`}
      icon={type?.icon}
      footer={
        isAdmin ? (
          <>
            <button className="btn btn-danger btn-sm">Cancelar</button>
            <button className="btn btn-primary">Salvar</button>
          </>
        ) : (
          <>
            <button className="btn btn-danger btn-sm">Cancelar</button>
            {ticket.status === 3 && <button className="btn btn-primary">✅ Confirmar</button>}
          </>
        )
      }
    >
      <div className="detail-hero" style={{ margin: "-16px -18px 16px", padding: "16px 18px" }}>
        <div className="detail-id">{ticket.id}</div>
        <div className="detail-title">{ticket.title}</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
          <Badge color={status?.color}>{status?.name}</Badge>
          <Badge color={priority?.color}>{priority?.name}</Badge>
          <Badge color={type?.color}>{type?.name}</Badge>
        </div>
        <div className="meta-row">
          <div className="meta-item"><div className="meta-lbl">Solicitante</div><div className="meta-val">{ticket.user}</div></div>
          <div className="meta-item"><div className="meta-lbl">Atendente</div><div className="meta-val">{ticket.assigned}</div></div>
          <div className="meta-item"><div className="meta-lbl">SLA</div><div className="meta-val"><SLAText text={ticket.sla} /></div></div>
        </div>
      </div>

      {isAdmin && (
        <>
          <div className="form-group">
            <label className="form-label">Atribuir atendente</label>
            <select className="form-input">
              <option>— Não atribuído —</option>
              <option>Carlos Dev</option>
              <option>Bruna RH</option>
              <option>Pedro Adm</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Alterar status</label>
            <select className="form-input" defaultValue={ticket.status}>
              {STATUSES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="divider" />
        </>
      )}

      <div style={{ fontSize:12, fontWeight:700, marginBottom:12 }}>Histórico</div>
      <div className="timeline">
        {timeline.map((item, i) => (
          <div key={i} className="tl-item">
            <div className="tl-dot" style={{ background:item.bg+"22", borderColor:item.bg+"44" }}>{item.icon}</div>
            <div className="tl-body">
              <div className="tl-title">{item.title}</div>
              <div className="tl-time">{item.time}</div>
              {item.text && <div className="tl-text">{item.text}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="divider" />
      <div className="form-label">Comentário</div>
      <div style={{ display:"flex", gap:8 }}>
        <input className="form-input" placeholder="Digite aqui..." value={comment} onChange={e => setComment(e.target.value)} style={{ flex:1 }} />
        <button className="btn btn-primary btn-sm" style={{ flex:"none" }}>↑</button>
      </div>
    </Sheet>
  );
}

// ── PAGES ─────────────────────────────────────────────────────────────────────

/* ADMIN — DASHBOARD */
function AdminDashboard() {
  const [selected, setSelected]   = useState(null);
  const [filter, setFilter]       = useState("todos");
  const open       = MOCK_TICKETS.filter(t => t.status === 1).length;
  const inProgress = MOCK_TICKETS.filter(t => t.status === 2).length;
  const waiting    = MOCK_TICKETS.filter(t => t.status === 3).length;
  const closed     = MOCK_TICKETS.filter(t => t.status === 4).length;

  const filtered = filter === "todos" ? MOCK_TICKETS
    : MOCK_TICKETS.filter(t => getStatus(t.status)?.name.toLowerCase().includes(filter));

  return (
    <div className="page">
      {/* Profile strip */}
      <div className="profile-header">
        <div className="avatar" style={{ background:"linear-gradient(135deg,#7c3aed,#06b6d4)" }}>MA</div>
        <div>
          <div style={{ fontWeight:700, fontSize:14 }}>Olá, Marcelo 👋</div>
          <div style={{ fontSize:11, color:"var(--muted)" }}>Administrador · Prodemge</div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ padding:"14px 16px 4px", fontSize:12, fontWeight:700, color:"var(--muted)" }}>Visão Geral</div>
      <div className="kpi-scroll">
        {[
          { label:"Abertos",       value:open,       color:"#3b82f6", icon:"📬" },
          { label:"Em Atend.",     value:inProgress, color:"#f59e0b", icon:"⚡" },
          { label:"Ag. Confirm.",  value:waiting,    color:"#8b5cf6", icon:"🕐" },
          { label:"Fechados",      value:closed,     color:"#10b981", icon:"✅" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-glow" style={{ background:k.color }} />
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ color:k.color }}>{k.value}</div>
            <div className="kpi-sub">{k.icon}</div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="filter-chips">
        {["todos","aberto","atendimento","aguard","fechado"].map(f => (
          <div key={f} className={`chip ${filter===f?"active":""}`} onClick={() => setFilter(f)}>
            {f === "todos" ? "Todos" : f === "aberto" ? "Abertos" : f === "atendimento" ? "Em atend." : f === "aguard" ? "Aguardando" : "Fechados"}
          </div>
        ))}
      </div>

      {/* Ticket list */}
      <div style={{ padding:"4px 0" }}>
        {filtered.map(t => {
          const type = getType(t.type);
          const priority = getPriority(t.priority);
          const status = getStatus(t.status);
          return (
            <div key={t.id} className="ticket-card" onClick={() => setSelected(t)}>
              <div className="tc-row1">
                <div className="tc-icon" style={{ background:type?.color+"22", border:`1px solid ${type?.color}33` }}>{type?.icon}</div>
                <div>
                  <div className="tc-id">{t.id}</div>
                  <div style={{ fontSize:11, color:"var(--muted)" }}>{t.date} · {t.user}</div>
                </div>
                <div style={{ marginLeft:"auto" }}><SLAText text={t.sla} /></div>
              </div>
              <div className="tc-title">{t.title}</div>
              <div className="tc-badges">
                <Badge color={status?.color}>{status?.name}</Badge>
                <Badge color={priority?.color}>{priority?.name}</Badge>
                <span style={{ marginLeft:"auto", fontSize:11, color:"var(--muted)" }}>
                  {t.assigned !== "—" ? `👤 ${t.assigned}` : "⚪ Não atribuído"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {selected && <TicketDetailSheet ticket={selected} onClose={() => setSelected(null)} isAdmin />}
    </div>
  );
}

/* ADMIN — TIPOS */
function AdminTypes() {
  const [types, setTypes]   = useState(TICKET_TYPES);
  const [sheet, setSheet]   = useState(false);
  const [form, setForm]     = useState({ name:"", icon:"📋", color:"#6366f1", category:"" });

  const save = () => {
    if (!form.name) return;
    setTypes(p => [...p, { ...form, id:Date.now() }]);
    setSheet(false);
    setForm({ name:"", icon:"📋", color:"#6366f1", category:"" });
  };

  return (
    <div className="page">
      <div className="section-head">
        <div>
          <div className="section-title">Tipos de Chamado</div>
          <div className="section-sub">{types.length} tipos cadastrados</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setSheet(true)}>+ Novo</button>
      </div>

      {types.map(t => (
        <div key={t.id} className="atype-card">
          <div className="atype-stripe" style={{ background:t.color }} />
          <div style={{ marginLeft:6 }}>
            <div className="atype-icon-wrap" style={{ background:t.color+"22", border:`1px solid ${t.color}33` }}>{t.icon}</div>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="atype-name">{t.name}</div>
            <div className="atype-cat"><span className="tag">{t.category}</span></div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <button className="btn btn-ghost btn-sm" style={{ padding:"4px 8px" }}>✏️</button>
            <button className="btn btn-danger btn-sm" style={{ padding:"4px 8px" }}>🗑</button>
          </div>
        </div>
      ))}

      {sheet && (
        <Sheet
          title="Novo Tipo de Chamado"
          icon={form.icon}
          onClose={() => setSheet(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setSheet(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={save}>Salvar</button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input className="form-input" placeholder="Ex: Suporte de TI" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div className="form-group">
              <label className="form-label">Ícone (emoji)</label>
              <input className="form-input" value={form.icon} onChange={e => setForm(f=>({...f,icon:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Cor</label>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <input type="color" value={form.color} onChange={e => setForm(f=>({...f,color:e.target.value}))}
                  style={{ width:38, height:38, border:"none", background:"none", cursor:"pointer" }} />
                <input className="form-input" value={form.color} onChange={e => setForm(f=>({...f,color:e.target.value}))} style={{ flex:1 }} />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Categoria</label>
            <input className="form-input" placeholder="Ex: Tecnologia" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Descrição</label>
            <textarea className="form-input" placeholder="Quando usar este tipo..." style={{ minHeight:70 }} />
          </div>
        </Sheet>
      )}
    </div>
  );
}

/* ADMIN — CONFIG */
function AdminConfig() {
  return (
    <div className="page">
      <div className="section-head">
        <div><div className="section-title">Configurações</div><div className="section-sub">Prioridades, status e campos</div></div>
      </div>

      <div style={{ padding:"0 16px 8px", fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:1 }}>Prioridades</div>
      <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--r)", margin:"0 16px 16px", overflow:"hidden" }}>
        {PRIORITIES.map((p, i) => (
          <div key={p.id} className="config-row" style={{ borderBottom: i < PRIORITIES.length-1 ? undefined : "none" }}>
            <div className="config-dot" style={{ background:p.color }} />
            <div style={{ flex:1 }}>
              <div className="config-name">{p.name}</div>
              <div className="config-sub">SLA: {p.sla}h</div>
            </div>
            <div className="config-chevron">›</div>
          </div>
        ))}
      </div>

      <div style={{ padding:"0 16px 8px", fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:1 }}>Fluxo de Status</div>
      <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--r)", margin:"0 16px 16px", overflow:"hidden" }}>
        {STATUSES.map((s, i) => (
          <div key={s.id} className="config-row" style={{ borderBottom: i < STATUSES.length-1 ? undefined : "none" }}>
            <div className="config-dot" style={{ background:s.color }} />
            <div className="config-name">{s.name}</div>
            <div className="config-chevron">›</div>
          </div>
        ))}
      </div>

      <div style={{ padding:"0 16px 8px", fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:1 }}>Campos Customizados</div>
      <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--r)", margin:"0 16px 16px", overflow:"hidden" }}>
        {[
          { type:"Suporte de TI",  field:"Nº do Patrimônio", kind:"Texto" },
          { type:"Suporte de TI",  field:"Sistema Operacional", kind:"Select" },
          { type:"Manut. Predial", field:"Andar / Sala", kind:"Texto" },
          { type:"RH",             field:"Período de Referência", kind:"Data" },
        ].map((c, i, arr) => (
          <div key={i} className="config-row" style={{ borderBottom: i < arr.length-1 ? undefined : "none" }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:2 }}>
                <span className="tag">{c.type}</span>
              </div>
              <div className="config-name">{c.field}</div>
            </div>
            <div className="config-sub">{c.kind}</div>
            <div className="config-chevron" style={{ marginLeft:8 }}>›</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── CAMPOS ESPECÍFICOS POR TIPO ─────────────────────────────────────────── */
function FieldsForType({ typeId, extra, setExtra }) {
  const set = (k, v) => setExtra(p => ({ ...p, [k]: v }));

  // Rótulo de seção reutilizável
  const SectionLabel = ({ children }) => (
    <div style={{ fontSize:10, fontWeight:800, color:"var(--muted)", textTransform:"uppercase",
      letterSpacing:1, marginBottom:12, marginTop:4, display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ flex:1, height:1, background:"var(--border)", display:"block" }} />
      {children}
      <span style={{ flex:1, height:1, background:"var(--border)", display:"block" }} />
    </div>
  );

  if (typeId === 1) return ( // Suporte de TI
    <>
      <SectionLabel>Informações do Equipamento</SectionLabel>
      <div className="form-group">
        <label className="form-label">Nº do Patrimônio</label>
        <input className="form-input" placeholder="Ex: PAT-00124"
          value={extra.patrimonio||""} onChange={e=>set("patrimonio",e.target.value)} />
        <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>Etiqueta colada no equipamento</div>
      </div>
      <div className="form-group">
        <label className="form-label">Sistema Operacional</label>
        <select className="form-input" value={extra.so||""} onChange={e=>set("so",e.target.value)}>
          <option value="">Selecione...</option>
          <option>Windows 10</option>
          <option>Windows 11</option>
          <option>Linux (Ubuntu)</option>
          <option>macOS</option>
          <option>Outro</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Tipo de Equipamento</label>
        <select className="form-input" value={extra.equip||""} onChange={e=>set("equip",e.target.value)}>
          <option value="">Selecione...</option>
          <option>Notebook</option>
          <option>Desktop</option>
          <option>Monitor</option>
          <option>Impressora</option>
          <option>Telefone IP</option>
          <option>Outro periférico</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">O problema ocorre desde quando?</label>
        <select className="form-input" value={extra.desde||""} onChange={e=>set("desde",e.target.value)}>
          <option value="">Selecione...</option>
          <option>Hoje</option>
          <option>Ontem</option>
          <option>Esta semana</option>
          <option>Há mais de uma semana</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Você consegue usar o equipamento?</label>
        <div style={{display:"flex",gap:8}}>
          {["Sim, parcialmente","Não, está inutilizável","Sim, normalmente"].map(op=>(
            <div key={op} onClick={()=>set("uso",op)}
              style={{flex:1,padding:"9px 6px",textAlign:"center",borderRadius:"var(--rsm)",
                fontSize:11,fontWeight:700,cursor:"pointer",border:"1px solid",
                borderColor: extra.uso===op ? "var(--a1)" : "var(--border)",
                background: extra.uso===op ? "rgba(124,58,237,0.18)" : "var(--bg3)",
                color: extra.uso===op ? "#c4b5fd" : "var(--muted)"}}>
              {op}
            </div>
          ))}
        </div>
      </div>
    </>
  );

  if (typeId === 2) return ( // Manutenção Predial
    <>
      <SectionLabel>Localização e Detalhes</SectionLabel>
      <div className="form-group">
        <label className="form-label">Andar / Pavimento *</label>
        <select className="form-input" value={extra.andar||""} onChange={e=>set("andar",e.target.value)}>
          <option value="">Selecione...</option>
          {["Térreo","1º andar","2º andar","3º andar","4º andar","5º andar","Subsolo","Área externa"].map(a=>(
            <option key={a}>{a}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Sala / Área específica</label>
        <input className="form-input" placeholder="Ex: Sala 302, Copa, Banheiro masculino"
          value={extra.sala||""} onChange={e=>set("sala",e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Tipo do problema</label>
        <select className="form-input" value={extra.tipoPred||""} onChange={e=>set("tipoPred",e.target.value)}>
          <option value="">Selecione...</option>
          <option>Vazamento / Infiltração</option>
          <option>Elétrica (tomada, lâmpada)</option>
          <option>Ar-condicionado</option>
          <option>Porta / Fechadura</option>
          <option>Vidro / Janela</option>
          <option>Elevador</option>
          <option>Limpeza urgente</option>
          <option>Outro</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Representa risco imediato?</label>
        <div style={{display:"flex",gap:8}}>
          {["Sim, risco de acidente","Não, mas urgente","Apenas incômodo"].map(op=>(
            <div key={op} onClick={()=>set("risco",op)}
              style={{flex:1,padding:"9px 4px",textAlign:"center",borderRadius:"var(--rsm)",
                fontSize:10,fontWeight:700,cursor:"pointer",border:"1px solid",
                borderColor: extra.risco===op ? "var(--a1)" : "var(--border)",
                background: extra.risco===op ? "rgba(124,58,237,0.18)" : "var(--bg3)",
                color: extra.risco===op ? "#c4b5fd" : "var(--muted)"}}>
              {op}
            </div>
          ))}
        </div>
      </div>
    </>
  );

  if (typeId === 3) return ( // RH
    <>
      <SectionLabel>Dados da Solicitação</SectionLabel>
      <div className="form-group">
        <label className="form-label">Tipo de solicitação RH</label>
        <select className="form-input" value={extra.tipoRH||""} onChange={e=>set("tipoRH",e.target.value)}>
          <option value="">Selecione...</option>
          <option>Férias</option>
          <option>Licença médica</option>
          <option>Atestado / Declaração</option>
          <option>Alteração de dados cadastrais</option>
          <option>Benefícios (plano, vale)</option>
          <option>Rescisão / Desligamento</option>
          <option>Holerite / Comprovante</option>
          <option>Outro</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Período de referência</label>
        <input type="month" className="form-input"
          value={extra.periodo||""} onChange={e=>set("periodo",e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Matrícula do servidor</label>
        <input className="form-input" placeholder="Ex: 123456"
          value={extra.matricula||""} onChange={e=>set("matricula",e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Secretaria / Órgão</label>
        <input className="form-input" placeholder="Ex: SEPLAG, SEE, SEDS..."
          value={extra.secretaria||""} onChange={e=>set("secretaria",e.target.value)} />
      </div>
    </>
  );

  if (typeId === 4) return ( // Acesso a Sistemas
    <>
      <SectionLabel>Dados do Acesso</SectionLabel>
      <div className="form-group">
        <label className="form-label">Sistema solicitado *</label>
        <select className="form-input" value={extra.sistema||""} onChange={e=>set("sistema",e.target.value)}>
          <option value="">Selecione...</option>
          <option>SIAG</option>
          <option>SEI</option>
          <option>SISAP</option>
          <option>SIAD</option>
          <option>SigaDoc</option>
          <option>VPN Corporativa</option>
          <option>E-mail institucional</option>
          <option>Outro</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Tipo de solicitação</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["Novo acesso","Desbloqueio","Redefinição de senha","Remoção de acesso"].map(op=>(
            <div key={op} onClick={()=>set("tipoAcesso",op)}
              style={{padding:"8px 12px",borderRadius:"var(--rsm)",fontSize:11,fontWeight:700,
                cursor:"pointer",border:"1px solid",
                borderColor: extra.tipoAcesso===op ? "var(--a1)" : "var(--border)",
                background: extra.tipoAcesso===op ? "rgba(124,58,237,0.18)" : "var(--bg3)",
                color: extra.tipoAcesso===op ? "#c4b5fd" : "var(--muted)"}}>
              {op}
            </div>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Login / Usuário afetado</label>
        <input className="form-input" placeholder="Ex: joao.silva@prodemge.gov.br"
          value={extra.login||""} onChange={e=>set("login",e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Justificativa do acesso</label>
        <textarea className="form-input" placeholder="Por que o acesso é necessário? Qual função exerce?"
          value={extra.justAcesso||""} onChange={e=>set("justAcesso",e.target.value)} style={{minHeight:70}} />
      </div>
    </>
  );

  if (typeId === 5) return ( // Compras e Suprimentos
    <>
      <SectionLabel>Detalhes do Item</SectionLabel>
      <div className="form-group">
        <label className="form-label">Categoria do item</label>
        <select className="form-input" value={extra.catItem||""} onChange={e=>set("catItem",e.target.value)}>
          <option value="">Selecione...</option>
          <option>Material de escritório</option>
          <option>Equipamento de TI</option>
          <option>Material de limpeza</option>
          <option>Mobiliário</option>
          <option>Insumos de impressão</option>
          <option>EPI / Segurança</option>
          <option>Outro</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Item(ns) solicitado(s) *</label>
        <textarea className="form-input" placeholder="Liste os itens, quantidades e especificações..."
          value={extra.itens||""} onChange={e=>set("itens",e.target.value)} style={{minHeight:80}} />
      </div>
      <div className="form-group">
        <label className="form-label">Quantidade estimada</label>
        <input type="number" className="form-input" placeholder="Ex: 10"
          value={extra.qtd||""} onChange={e=>set("qtd",e.target.value)} min="1" />
      </div>
      <div className="form-group">
        <label className="form-label">Centro de custo</label>
        <input className="form-input" placeholder="Ex: CC-0234"
          value={extra.cc||""} onChange={e=>set("cc",e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Data necessária</label>
        <input type="date" className="form-input"
          value={extra.dataNec||""} onChange={e=>set("dataNec",e.target.value)} />
      </div>
    </>
  );

  return null;
}

/* ── RESUMO DOS CAMPOS EXTRAS NA REVISÃO ──────────────────────────────────── */
function ExtraReviewFields({ typeId, extra }) {
  const labels = {
    // TI
    patrimonio:"Patrimônio", so:"Sistema Operacional", equip:"Equipamento", desde:"Desde quando", uso:"Uso do equipamento",
    // Predial
    andar:"Andar", sala:"Sala/Área", tipoPred:"Tipo do problema", risco:"Risco",
    // RH
    tipoRH:"Tipo RH", periodo:"Período", matricula:"Matrícula", secretaria:"Secretaria",
    // Acesso
    sistema:"Sistema", tipoAcesso:"Tipo de acesso", login:"Login", justAcesso:"Justificativa",
    // Compras
    catItem:"Categoria", itens:"Itens", qtd:"Quantidade", cc:"Centro de custo", dataNec:"Data necessária",
  };
  const entries = Object.entries(extra).filter(([,v]) => v);
  if (!entries.length) return null;
  return (
    <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:"14px 16px",marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:800,color:"var(--muted)",marginBottom:10,textTransform:"uppercase",letterSpacing:0.8}}>
        Dados Específicos
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {entries.map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",gap:8}}>
            <span style={{fontSize:12,color:"var(--muted)",fontWeight:600}}>{labels[k]||k}</span>
            <span style={{fontSize:12,fontWeight:700,textAlign:"right",maxWidth:"55%"}}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* USER — ABRIR CHAMADO */
function UserOpenTicket({ onSuccess }) {
  const [step, setStep]           = useState(1);
  const [selectedType, setSelType]= useState(null);
  const [form, setForm]           = useState({
    nome:"", email:"", ramal:"",
    title:"", description:"", priority:2, urgencia:"normal",
  });
  const [extra, setExtra]   = useState({});
  const [submitted, setSub] = useState(false);
  const newId = useRef("CHM-00" + Math.floor(Math.random() * 9 + 7));

  const setF = (k,v) => setForm(p=>({...p,[k]:v}));

  const canGoStep2 = selectedType;
  const canGoStep3 = form.title && form.description;

  const submit = () => {
    setSub(true);
    setTimeout(() => onSuccess && onSuccess(), 3500);
  };

  if (submitted) return (
    <div className="page">
      <div className="success-screen">
        <div className="success-icon">🎉</div>
        <div className="success-title">Chamado Aberto!</div>
        <div className="success-sub">Registrado com sucesso. Você receberá atualizações sobre o andamento.</div>
        <div className="success-id">{newId.current}</div>
        <div style={{fontSize:11,color:"var(--muted)",marginBottom:24}}>Guarde este número para acompanhar</div>
        <button className="btn btn-primary btn-full" onClick={onSuccess}>Ver meus chamados →</button>
      </div>
    </div>
  );

  // ── Indicador de progresso compacto
  const steps = ["Tipo","Dados","Detalhes","Revisão"];

  return (
    <div className="page">
      {/* Stepper */}
      <div className="stepper">
        {steps.map((lbl, i) => (
          <div key={i} className={`step ${step > i+1 ? "done" : step === i+1 ? "active" : ""}`}>
            <div className="step-dot">{step > i+1 ? "✓" : i+1}</div>
            <div className="step-lbl">{lbl}</div>
          </div>
        ))}
      </div>

      {/* ── PASSO 1 — Tipo de chamado ── */}
      {step === 1 && (
        <div style={{paddingTop:10}}>
          <div style={{padding:"0 16px 12px",fontSize:13,color:"var(--muted)"}}>
            Qual tipo de solicitação você precisa abrir?
          </div>
          <div className="type-grid">
            {TICKET_TYPES.map(t => (
              <div key={t.id}
                className={`type-sel-card ${selectedType?.id === t.id ? "selected" : ""}`}
                style={selectedType?.id === t.id ? { borderColor:t.color, background:t.color+"18" } : {}}
                onClick={() => { setSelType(t); setStep(2); }}
              >
                <span className="type-sel-icon">{t.icon}</span>
                <span className="type-sel-name">{t.name}</span>
                <span className="type-sel-cat">{t.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PASSO 2 — Dados do solicitante ── */}
      {step === 2 && (
        <div style={{padding:"12px 16px 0"}}>
          {/* tipo selecionado */}
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
            background:"var(--bg3)",borderRadius:"var(--rsm)",border:"1px solid var(--border)",marginBottom:18}}>
            <span style={{fontSize:22}}>{selectedType?.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700}}>{selectedType?.name}</div>
              <span style={{fontSize:11,color:"var(--a2)",cursor:"pointer"}} onClick={()=>setStep(1)}>← Alterar tipo</span>
            </div>
            <Badge color={selectedType?.color}>{selectedType?.category}</Badge>
          </div>

          <div style={{fontSize:11,fontWeight:800,color:"var(--muted)",textTransform:"uppercase",
            letterSpacing:0.8,marginBottom:12}}>Seus dados</div>

          <div className="form-group">
            <label className="form-label">Nome completo *</label>
            <input className="form-input" placeholder="Como consta no sistema"
              value={form.nome} onChange={e=>setF("nome",e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">E-mail institucional *</label>
            <input className="form-input" type="email" placeholder="nome@prodemge.gov.br"
              value={form.email} onChange={e=>setF("email",e.target.value)} />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div className="form-group">
              <label className="form-label">Ramal</label>
              <input className="form-input" placeholder="Ex: 3456"
                value={form.ramal} onChange={e=>setF("ramal",e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Unidade / Setor</label>
              <input className="form-input" placeholder="Ex: DTEC"
                value={form.setor||""} onChange={e=>setF("setor",e.target.value)} />
            </div>
          </div>

          <div style={{display:"flex",gap:8,paddingBottom:8,marginTop:4}}>
            <button className="btn btn-secondary" onClick={()=>setStep(1)}>← Voltar</button>
            <button className="btn btn-primary" disabled={!form.nome||!form.email}
              style={{flex:1,opacity:form.nome&&form.email?1:0.4}}
              onClick={()=>setStep(3)}>Próximo →</button>
          </div>
        </div>
      )}

      {/* ── PASSO 3 — Detalhes + campos específicos ── */}
      {step === 3 && (
        <div style={{padding:"12px 16px 0"}}>
          <div className="form-group">
            <label className="form-label">Título do chamado *</label>
            <input className="form-input" placeholder="Descreva resumidamente o problema"
              value={form.title} onChange={e=>setF("title",e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Descrição detalhada *</label>
            <textarea className="form-input"
              placeholder="O que aconteceu? Quando começou? Qual o impacto no seu trabalho?"
              value={form.description} onChange={e=>setF("description",e.target.value)} />
          </div>

          {/* Urgência visual */}
          <div className="form-group">
            <label className="form-label">Nível de urgência</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[
                {v:"baixa",  label:"🟢 Baixa",  sub:"Pode esperar",      color:"#6b7280"},
                {v:"normal", label:"🟡 Normal",  sub:"Necessário hoje",   color:"#f59e0b"},
                {v:"critica",label:"🔴 Crítica", sub:"Paralisa trabalho", color:"#ef4444"},
              ].map(u=>(
                <div key={u.v} onClick={()=>setF("urgencia",u.v)}
                  style={{padding:"10px 6px",textAlign:"center",borderRadius:"var(--rsm)",
                    cursor:"pointer",border:"2px solid",
                    borderColor: form.urgencia===u.v ? u.color : "var(--border)",
                    background: form.urgencia===u.v ? u.color+"18" : "var(--bg3)"}}>
                  <div style={{fontSize:13,fontWeight:800,color:form.urgencia===u.v?u.color:"var(--muted)"}}>{u.label}</div>
                  <div style={{fontSize:10,color:"var(--muted)",marginTop:3}}>{u.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Campos específicos por tipo */}
          <FieldsForType typeId={selectedType?.id} extra={extra} setExtra={setExtra} />

          {/* Anexo */}
          <div className="form-group">
            <label className="form-label">Anexar arquivo (opcional)</label>
            <div style={{border:"1px dashed var(--border)",borderRadius:"var(--rsm)",
              padding:"16px",textAlign:"center",background:"var(--bg3)",cursor:"pointer"}}>
              <div style={{fontSize:24,marginBottom:6}}>📎</div>
              <div style={{fontSize:12,fontWeight:600,color:"var(--muted)"}}>Toque para selecionar</div>
              <div style={{fontSize:10,color:"var(--muted)",marginTop:2}}>JPG, PNG, PDF — até 10MB</div>
            </div>
          </div>

          <div style={{display:"flex",gap:8,paddingBottom:8}}>
            <button className="btn btn-secondary" onClick={()=>setStep(2)}>← Voltar</button>
            <button className="btn btn-primary" disabled={!canGoStep3}
              style={{flex:1,opacity:canGoStep3?1:0.4}}
              onClick={()=>setStep(4)}>Revisar →</button>
          </div>
        </div>
      )}

      {/* ── PASSO 4 — Revisão final ── */}
      {step === 4 && (
        <div style={{padding:"12px 16px 0"}}>
          {/* Hero */}
          <div style={{background:"linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,182,212,0.07))",
            border:"1px solid rgba(124,58,237,0.25)",borderRadius:"var(--r)",padding:16,marginBottom:12}}>
            <div style={{fontSize:10,color:"var(--a2)",fontFamily:"'JetBrains Mono',monospace",marginBottom:6,fontWeight:700}}>
              REVISÃO FINAL
            </div>
            <div style={{fontSize:15,fontWeight:700,marginBottom:10,lineHeight:1.35}}>{form.title}</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              <Badge color={selectedType?.color}>{selectedType?.icon} {selectedType?.name}</Badge>
              <Badge color={form.urgencia==="critica"?"#ef4444":form.urgencia==="normal"?"#f59e0b":"#6b7280"}>
                {form.urgencia==="critica"?"🔴 Crítica":form.urgencia==="normal"?"🟡 Normal":"🟢 Baixa"}
              </Badge>
            </div>
            <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.55}}>{form.description}</div>
          </div>

          {/* Dados do solicitante */}
          <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"var(--r)",
            padding:"14px 16px",marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:800,color:"var(--muted)",marginBottom:10,
              textTransform:"uppercase",letterSpacing:0.8}}>Solicitante</div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {[["Nome",form.nome],["E-mail",form.email],
                ...(form.ramal?[["Ramal",form.ramal]]:[]),
                ...(form.setor?[["Setor",form.setor]]:[])
              ].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",gap:8}}>
                  <span style={{fontSize:12,color:"var(--muted)",fontWeight:600}}>{k}</span>
                  <span style={{fontSize:12,fontWeight:700,textAlign:"right",maxWidth:"60%",wordBreak:"break-all"}}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Campos extras */}
          <ExtraReviewFields typeId={selectedType?.id} extra={extra} />

          {/* Aviso SLA */}
          <div style={{background:"rgba(6,182,212,0.08)",border:"1px solid rgba(6,182,212,0.2)",
            borderRadius:"var(--rsm)",padding:"10px 14px",marginBottom:16,
            display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:18}}>⏱</span>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:"var(--a2)"}}>Prazo de atendimento</div>
              <div style={{fontSize:11,color:"var(--muted)"}}>
                Com urgência {form.urgencia === "critica" ? "Crítica: até 1h" : form.urgencia === "normal" ? "Normal: até 24h" : "Baixa: até 72h"}
              </div>
            </div>
          </div>

          <div style={{display:"flex",gap:8,paddingBottom:8}}>
            <button className="btn btn-secondary" onClick={()=>setStep(3)}>← Editar</button>
            <button className="btn btn-primary" style={{flex:1}} onClick={submit}>🚀 Abrir Chamado</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* USER — MEUS CHAMADOS */
function UserMyTickets() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("todos");
  const myTickets = MOCK_TICKETS.slice(0, 5);
  const filtered = filter === "todos" ? myTickets : myTickets.filter(t => getStatus(t.status)?.name.toLowerCase().includes(filter));

  return (
    <div className="page">
      <div className="profile-header">
        <div className="avatar" style={{ background:"linear-gradient(135deg,#10b981,#06b6d4)" }}>MU</div>
        <div>
          <div style={{ fontWeight:700, fontSize:14 }}>Maria Usuária</div>
          <div style={{ fontSize:11, color:"var(--muted)" }}>{myTickets.length} chamados registrados</div>
        </div>
      </div>

      <div className="filter-chips" style={{ paddingTop:12 }}>
        {["todos","aberto","atendimento","aguard","fechado"].map(f => (
          <div key={f} className={`chip ${filter===f?"active":""}`} onClick={() => setFilter(f)}>
            {f==="todos"?"Todos":f==="aberto"?"Abertos":f==="atendimento"?"Em atend.":f==="aguard"?"Aguardando":"Fechados"}
          </div>
        ))}
      </div>

      <div style={{ paddingTop:4 }}>
        {filtered.length === 0 ? (
          <div className="empty"><div className="empty-icon">📭</div><div className="empty-text">Nenhum chamado encontrado</div></div>
        ) : filtered.map(t => {
          const type = getType(t.type);
          const priority = getPriority(t.priority);
          const status = getStatus(t.status);
          return (
            <div key={t.id} className="ticket-card" onClick={() => setSelected(t)}>
              <div className="tc-row1">
                <div className="tc-icon" style={{ background:type?.color+"22", border:`1px solid ${type?.color}33` }}>{type?.icon}</div>
                <div>
                  <div className="tc-id">{t.id}</div>
                  <div style={{ fontSize:10, color:"var(--muted)" }}>Aberto em {t.date}</div>
                </div>
                <div style={{ marginLeft:"auto" }}><SLAText text={t.sla} /></div>
              </div>
              <div className="tc-title">{t.title}</div>
              <div className="tc-badges">
                <Badge color={status?.color}>{status?.name}</Badge>
                <Badge color={priority?.color}>{priority?.name}</Badge>
              </div>
              {t.assigned !== "—" && (
                <div className="tc-meta">Atendente: {t.assigned}</div>
              )}
            </div>
          );
        })}
      </div>

      {selected && <TicketDetailSheet ticket={selected} onClose={() => setSelected(null)} isAdmin={false} />}
    </div>
  );
}

/* NOTIFICATIONS */
function Notifications() {
  const items = [
    { unread:true,  icon:"⚡", text:"CHM-004 entrou em atendimento por Carlos Dev.", time:"Agora há pouco" },
    { unread:true,  icon:"✅", text:"CHM-003 aguardando sua confirmação de resolução.", time:"Há 30 min" },
    { unread:false, icon:"📬", text:"CHM-001 foi aberto com prioridade Alta.", time:"Há 2h" },
    { unread:false, icon:"🏁", text:"CHM-005 foi fechado com sucesso.", time:"Ontem" },
  ];
  return (
    <div className="page">
      <div className="section-head">
        <div><div className="section-title">Notificações</div><div className="section-sub">2 não lidas</div></div>
        <button className="btn btn-ghost btn-sm">Marcar lidas</button>
      </div>
      <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--r)", margin:"0 16px", overflow:"hidden" }}>
        {items.map((n, i) => (
          <div key={i} className={`notif-item ${n.unread?"unread":""}`}
            style={{ borderBottom: i < items.length-1 ? "1px solid var(--border)" : "none" }}>
            {n.unread && <div className="notif-dot-unread" />}
            <div style={{ fontSize:22, flexShrink:0 }}>{n.icon}</div>
            <div>
              <div className="notif-text">{n.text}</div>
              <div className="notif-time">{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [module, setModule] = useState("admin");
  const [page,   setPage]   = useState("dashboard");
  const [openKey, setOpenKey] = useState(0);

  const goToPage = (p) => {
    if (p === "open") setOpenKey(k => k + 1);
    setPage(p);
  };

  const adminNav = [
    { id:"dashboard", icon:"📊", label:"Dashboard", badge:2 },
    { id:"types",     icon:"🗂️", label:"Tipos" },
    { id:"config",    icon:"⚙️", label:"Config" },
  ];
  const userNav = [
    { id:"open",          icon:"➕",  label:"Abrir" },
    { id:"mytickets",     icon:"📋",  label:"Chamados", badge:2 },
    { id:"notifications", icon:"🔔",  label:"Avisos",   badge:2 },
  ];

  const nav = module === "admin" ? adminNav : userNav;

  const switchModule = m => { setModule(m); goToPage(m==="admin"?"dashboard":"open"); };

  const renderPage = () => {
    if (module === "admin") {
      if (page==="dashboard") return <AdminDashboard />;
      if (page==="types")     return <AdminTypes />;
      if (page==="config")    return <AdminConfig />;
    } else {
      if (page==="open")          return <UserOpenTicket key={openKey} onSuccess={() => goToPage("mytickets")} />;
      if (page==="mytickets")     return <UserMyTickets />;
      if (page==="notifications") return <Notifications />;
    }
    return <div className="empty page"><div className="empty-icon">🚧</div><div className="empty-text">Em desenvolvimento</div></div>;
  };

  const pageTitle = {
    dashboard:"Painel", types:"Tipos de Chamado", config:"Configurações",
    open:"Novo Chamado", mytickets:"Meus Chamados", notifications:"Notificações"
  }[page] || "";

  return (
    <>
      <style>{css}</style>
      <div className="frame-outer">
        <div className="phone">
          {/* Notch */}
          <div className="notch">
            <div className="notch-speaker" />
            <div className="notch-cam" />
          </div>

          {/* Status bar */}
          <div className="statusbar">
            <span>9:41</span>
            <div className="statusbar-right">
              <span>●●●●</span>
              <span>WiFi</span>
              <span>🔋</span>
            </div>
          </div>

          {/* Top bar */}
          <div className="topbar">
            <div className="topbar-logo">🎫 MG</div>
            <div className="topbar-title">{pageTitle}</div>
            <div className="module-pills">
              <button className={`mpill ${module==="admin"?"active":""}`} onClick={() => switchModule("admin")}>Admin</button>
              <button className={`mpill ${module==="user"?"active":""}`}  onClick={() => switchModule("user")}>Usuário</button>
            </div>
            <button className="icon-btn">🔔<span className="dot" /></button>
          </div>

          {/* Scrollable content */}
          <div className="screen">
            {renderPage()}
          </div>

          {/* FAB — só na tela de mytickets do usuário e dashboard admin */}
          {((module==="user" && page==="mytickets") || (module==="admin" && page==="dashboard")) && (
            <button className="fab" onClick={() => module==="user" ? goToPage("open") : null} title="Novo chamado">
              ＋
            </button>
          )}

          {/* Bottom Nav */}
          <div className="bottom-nav">
            {nav.map(item => (
              <button key={item.id} className={`bnav-item ${page===item.id?"active":""}`} onClick={() => goToPage(item.id)}>
                {item.badge && <span className="bnav-badge">{item.badge}</span>}
                <div className="bnav-icon">{item.icon}</div>
                <div className="bnav-label">{item.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
