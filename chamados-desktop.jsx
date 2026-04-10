import { useState, useRef } from "react";

// ── DATA ─────────────────────────────────────────────────────────────────────
const TICKET_TYPES = [
  { id:1, name:"Suporte de TI",        icon:"💻", color:"#6366f1", category:"Tecnologia" },
  { id:2, name:"Manutenção Predial",    icon:"🔧", color:"#f59e0b", category:"Infraestrutura" },
  { id:3, name:"Solicitação de RH",     icon:"👥", color:"#10b981", category:"RH" },
  { id:4, name:"Acesso a Sistemas",     icon:"🔑", color:"#ec4899", category:"Tecnologia" },
  { id:5, name:"Compras e Suprimentos", icon:"📦", color:"#f97316", category:"Administrativo" },
];
const PRIORITIES = [
  { id:1, name:"Baixa",   color:"#6b7280", sla:72 },
  { id:2, name:"Média",   color:"#f59e0b", sla:24 },
  { id:3, name:"Alta",    color:"#ef4444", sla:4  },
  { id:4, name:"Crítica", color:"#7c3aed", sla:1  },
];
const STATUSES = [
  { id:1, name:"Aberto",              color:"#3b82f6" },
  { id:2, name:"Em Atendimento",      color:"#f59e0b" },
  { id:3, name:"Aguard. Confirmação", color:"#8b5cf6" },
  { id:4, name:"Fechado",             color:"#10b981" },
  { id:5, name:"Cancelado",           color:"#6b7280" },
];
const MOCK_TICKETS = [
  { id:"CHM-001", title:"Notebook não liga após atualização",    type:1, priority:3, status:2, user:"Ana Lima",        dept:"DTEC", date:"08/04/2025", sla:"2h restantes",    assigned:"Carlos Dev",  desc:"O equipamento parou de ligar após uma atualização automática do Windows. A tela fica preta após o POST da BIOS." },
  { id:"CHM-002", title:"Vazamento no banheiro do 3º andar",     type:2, priority:2, status:1, user:"Roberto Souza",   dept:"DADM", date:"08/04/2025", sla:"18h restantes",   assigned:"—",           desc:"Há um vazamento constante no encanamento do banheiro masculino do 3º andar, próximo à janela." },
  { id:"CHM-003", title:"Solicitação de férias — Julho 2025",    type:3, priority:1, status:3, user:"Juliana Matos",   dept:"DRHU", date:"07/04/2025", sla:"60h restantes",   assigned:"Bruna RH",    desc:"Solicitação de férias para o período de 01/07 a 30/07/2025 conforme saldo disponível." },
  { id:"CHM-004", title:"Acesso bloqueado ao SIAG",              type:4, priority:4, status:2, user:"Marcos Ferreira", dept:"DFIN", date:"08/04/2025", sla:"30min restantes", assigned:"Carlos Dev",  desc:"Usuário não consegue acessar o SIAG desde as 08h. Mensagem: 'Usuário bloqueado por excesso de tentativas'." },
  { id:"CHM-005", title:"Requisição de papel A4 para impressão", type:5, priority:1, status:4, user:"Carla Nunes",    dept:"DADM", date:"05/04/2025", sla:"Concluído",       assigned:"Pedro Adm",   desc:"Necessidade de 10 resmas de papel A4 para o setor administrativo. Estoque zerado." },
  { id:"CHM-006", title:"Monitor com tela piscando",             type:1, priority:2, status:1, user:"Diego Alves",    dept:"DTEC", date:"08/04/2025", sla:"22h restantes",   assigned:"—",           desc:"Monitor Dell de 24\" piscando intermitentemente. O problema ocorre com qualquer aplicação." },
  { id:"CHM-007", title:"Atualização de dados bancários",        type:3, priority:2, status:1, user:"Paula Rezende",  dept:"DRHU", date:"07/04/2025", sla:"20h restantes",   assigned:"—",           desc:"Alteração de conta bancária para depósito de salário. Nova conta Nubank." },
  { id:"CHM-008", title:"Licença de software AutoCAD",           type:4, priority:3, status:2, user:"Thiago Mendes",  dept:"DENG", date:"06/04/2025", sla:"3h restantes",    assigned:"Carlos Dev",  desc:"Licença do AutoCAD expirou. Necessário para projetos em andamento com prazo esta semana." },
];

const TIMELINE_BY_STATUS = {
  1: [
    { icon:"📬", title:"Chamado aberto",     time:"08/04 às 09:14", bg:"#3b82f6" },
    { icon:"🔍", title:"Aguardando triagem", time:"08/04 às 09:15", bg:"#6b7280", text:"Chamado na fila de atendimento." },
  ],
  2: [
    { icon:"📬", title:"Chamado aberto",       time:"08/04 às 09:14", bg:"#3b82f6" },
    { icon:"👤", title:"Atribuído para técnico",time:"08/04 às 09:45", bg:"#f59e0b", text:"Análise iniciada." },
    { icon:"⚡", title:"Em atendimento",        time:"08/04 às 10:00", bg:"#8b5cf6", text:"Técnico verificando remotamente." },
  ],
  3: [
    { icon:"📬", title:"Chamado aberto",           time:"07/04 às 14:30", bg:"#3b82f6" },
    { icon:"👤", title:"Atribuído",                time:"07/04 às 14:50", bg:"#f59e0b" },
    { icon:"⚡", title:"Em atendimento",            time:"07/04 às 15:10", bg:"#8b5cf6", text:"Solução aplicada." },
    { icon:"✅", title:"Aguardando confirmação",    time:"07/04 às 16:30", bg:"#10b981", text:"Problema resolvido. Confirme se está ok." },
  ],
  4: [
    { icon:"📬", title:"Chamado aberto",   time:"05/04 às 11:00", bg:"#3b82f6" },
    { icon:"⚡", title:"Em atendimento",    time:"05/04 às 13:00", bg:"#8b5cf6" },
    { icon:"🏁", title:"Chamado fechado",  time:"05/04 às 15:30", bg:"#10b981", text:"Resolvido com sucesso." },
  ],
};

const getType     = id => TICKET_TYPES.find(t => t.id === id);
const getPriority = id => PRIORITIES.find(p => p.id === id);
const getStatus   = id => STATUSES.find(s => s.id === id);

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #0b0b1a;
    --bg2:     #11112a;
    --bg3:     #181832;
    --surface: #20203c;
    --border:  #282848;
    --text:    #eeeef8;
    --muted:   #7070a0;
    --a1:      #7c3aed;
    --a2:      #06b6d4;
    --a3:      #f59e0b;
    --a4:      #ec4899;
    --ok:      #10b981;
    --err:     #ef4444;
    --r:       12px;
    --rsm:     8px;
    --sidebar: 224px;
    --topbar:  56px;
  }

  html, body, #root { height: 100%; overflow: hidden; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--text); }

  /* ── LAYOUT ── */
  .app   { display: flex; height: 100vh; overflow: hidden; }
  .main  { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .body  { flex: 1; display: flex; overflow: hidden; min-height: 0; }

  /* ── SIDEBAR ── */
  .sidebar {
    width: var(--sidebar); min-width: var(--sidebar);
    background: var(--bg2); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; overflow: hidden;
  }
  .sidebar-logo {
    height: var(--topbar); display: flex; align-items: center;
    padding: 0 18px; border-bottom: 1px solid var(--border); flex-shrink: 0;
    gap: 10px;
  }
  .logo-mark {
    width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
    background: linear-gradient(135deg, var(--a1), var(--a2));
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  .logo-text { font-size: 14px; font-weight: 800; letter-spacing: -0.3px; }
  .logo-sub  { font-size: 10px; color: var(--muted); font-weight: 600; }

  .sidebar-scroll { flex: 1; overflow-y: auto; padding: 12px 10px; }
  .sidebar-scroll::-webkit-scrollbar { display: none; }

  .nav-section { margin-bottom: 20px; }
  .nav-section-label {
    font-size: 9px; font-weight: 800; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1.2px;
    padding: 0 8px 6px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 9px;
    padding: 8px 10px; border-radius: var(--rsm);
    cursor: pointer; font-size: 13px; font-weight: 500; color: var(--muted);
    border: none; background: none; width: 100%; text-align: left;
    transition: all 0.12s; font-family: inherit; position: relative;
  }
  .nav-item:hover  { background: var(--surface); color: var(--text); }
  .nav-item.active {
    background: linear-gradient(135deg, rgba(124,58,237,0.22), rgba(6,182,212,0.1));
    color: var(--text); border: 1px solid rgba(124,58,237,0.28);
  }
  .nav-item.active .ni-icon { filter: none; }
  .ni-icon { font-size: 15px; width: 18px; text-align: center; flex-shrink: 0; }
  .ni-badge {
    margin-left: auto; background: var(--a1); color: white;
    font-size: 9px; font-weight: 800; padding: 2px 6px;
    border-radius: 10px; min-width: 18px; text-align: center;
  }
  .ni-badge.warn { background: var(--err); }

  .sidebar-footer {
    padding: 12px 14px; border-top: 1px solid var(--border); flex-shrink: 0;
    display: flex; align-items: center; gap: 10px;
  }
  .avatar {
    width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800;
  }
  .avatar-info { flex: 1; min-width: 0; }
  .avatar-name { font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .avatar-role { font-size: 10px; color: var(--muted); }

  /* ── TOPBAR ── */
  .topbar {
    height: var(--topbar); display: flex; align-items: center;
    padding: 0 24px; border-bottom: 1px solid var(--border);
    background: var(--bg2); gap: 14px; flex-shrink: 0;
  }
  .topbar-title { font-size: 16px; font-weight: 700; flex: 1; }
  .topbar-search {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: var(--rsm); padding: 6px 12px;
    transition: border-color 0.15s;
  }
  .topbar-search:focus-within { border-color: var(--a1); }
  .topbar-search input {
    background: none; border: none; outline: none;
    color: var(--text); font-family: inherit; font-size: 13px; width: 200px;
  }
  .topbar-search input::placeholder { color: var(--muted); }
  .module-tabs {
    display: flex; gap: 3px;
    background: var(--bg3); padding: 3px; border-radius: var(--rsm);
    border: 1px solid var(--border);
  }
  .mtab {
    padding: 5px 14px; border-radius: 6px; font-size: 12px; font-weight: 700;
    cursor: pointer; border: none; background: transparent; color: var(--muted);
    font-family: inherit; transition: all 0.12s;
  }
  .mtab.active { background: var(--a1); color: white; box-shadow: 0 2px 8px rgba(124,58,237,.4); }
  .icon-btn {
    width: 34px; height: 34px; border-radius: var(--rsm);
    display: flex; align-items: center; justify-content: center;
    background: var(--bg3); border: 1px solid var(--border);
    cursor: pointer; font-size: 16px; position: relative;
  }
  .icon-btn .dot {
    position: absolute; top: 6px; right: 6px;
    width: 6px; height: 6px; background: var(--a4);
    border-radius: 50%; border: 1px solid var(--bg2);
  }

  /* ── CONTENT AREA ── */
  .content { flex: 1; overflow-y: auto; padding: 24px; min-width: 0; }
  .content::-webkit-scrollbar { width: 5px; }
  .content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* ── BUTTONS ── */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--rsm);
    font-size: 13px; font-weight: 700; cursor: pointer;
    border: none; transition: all 0.13s; font-family: inherit;
  }
  .btn:active { transform: scale(0.98); }
  .btn-primary {
    background: linear-gradient(135deg, var(--a1), #5b21b6);
    color: white; box-shadow: 0 3px 12px rgba(124,58,237,.35);
  }
  .btn-primary:hover { box-shadow: 0 5px 18px rgba(124,58,237,.5); transform: translateY(-1px); }
  .btn-secondary { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
  .btn-secondary:hover { background: var(--bg3); }
  .btn-ghost { background: transparent; color: var(--muted); }
  .btn-ghost:hover { color: var(--text); background: var(--surface); }
  .btn-danger { background: rgba(239,68,68,.12); color: var(--err); border: 1px solid rgba(239,68,68,.28); }
  .btn-sm { padding: 5px 11px; font-size: 12px; }
  .btn-xs { padding: 3px 8px; font-size: 11px; }

  /* ── BADGES ── */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 700;
  }
  .bdot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

  /* ── FORMS ── */
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px; letter-spacing: .2px; }
  .form-hint  { font-size: 11px; color: var(--muted); margin-top: 4px; }
  .form-input {
    width: 100%; padding: 9px 12px;
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: var(--rsm); color: var(--text);
    font-family: inherit; font-size: 13px;
    transition: border-color .15s; outline: none;
  }
  .form-input:focus { border-color: var(--a1); box-shadow: 0 0 0 3px rgba(124,58,237,.12); }
  textarea.form-input { resize: vertical; min-height: 90px; }
  select.form-input { cursor: pointer; }

  /* ── CARD ── */
  .card {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: var(--r); padding: 20px;
  }
  .card-title { font-size: 13px; font-weight: 700; margin-bottom: 16px; color: var(--muted); text-transform: uppercase; letter-spacing: .8px; }

  /* ── KPI GRID ── */
  .kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 24px; }
  .kpi-card {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: var(--r); padding: 18px 20px;
    position: relative; overflow: hidden; cursor: default;
    transition: border-color .15s;
  }
  .kpi-card:hover { border-color: rgba(124,58,237,.4); }
  .kpi-glow {
    position: absolute; top: -24px; right: -24px;
    width: 80px; height: 80px; border-radius: 50%;
    filter: blur(32px); opacity: .28;
  }
  .kpi-label { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .8px; margin-bottom: 8px; }
  .kpi-value { font-size: 34px; font-weight: 800; font-family: 'JetBrains Mono', monospace; line-height: 1; }
  .kpi-sub   { font-size: 11px; color: var(--muted); margin-top: 5px; }
  .kpi-icon  { position: absolute; top: 16px; right: 18px; font-size: 26px; opacity: .4; }

  /* ── TABLE ── */
  .tbl-wrap { border-radius: var(--r); border: 1px solid var(--border); overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  thead { background: var(--bg3); }
  th {
    padding: 10px 14px; text-align: left;
    font-size: 10px; font-weight: 800; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1px;
    border-bottom: 1px solid var(--border); white-space: nowrap;
  }
  th.sortable { cursor: pointer; user-select: none; }
  th.sortable:hover { color: var(--text); }
  td { padding: 11px 14px; font-size: 13px; border-bottom: 1px solid rgba(40,40,72,.6); }
  tbody tr { transition: background .1s; cursor: pointer; }
  tbody tr:hover { background: var(--surface); }
  tbody tr.selected { background: rgba(124,58,237,.1); border-left: 2px solid var(--a1); }
  tbody tr:last-child td { border-bottom: none; }
  .ticket-id { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--a2); font-weight: 600; }

  /* ── DETAIL PANEL ── */
  .detail-panel {
    width: 380px; min-width: 380px;
    border-left: 1px solid var(--border);
    background: var(--bg2);
    display: flex; flex-direction: column;
    overflow: hidden;
    animation: slideIn .2s;
  }
  .detail-topbar {
    padding: 14px 18px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px; flex-shrink: 0;
  }
  .detail-scroll { flex: 1; overflow-y: auto; }
  .detail-scroll::-webkit-scrollbar { width: 4px; }
  .detail-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  .detail-hero {
    padding: 18px; border-bottom: 1px solid var(--border);
    background: linear-gradient(160deg, rgba(124,58,237,.12), rgba(6,182,212,.05));
  }
  .detail-id { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--a2); font-weight: 600; margin-bottom: 6px; }
  .detail-title { font-size: 15px; font-weight: 700; line-height: 1.35; margin-bottom: 12px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .meta-item { display: flex; flex-direction: column; gap: 2px; }
  .meta-lbl { font-size: 9px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: .8px; }
  .meta-val { font-size: 12px; font-weight: 600; }

  .detail-section { padding: 16px 18px; border-bottom: 1px solid var(--border); }
  .detail-section-title { font-size: 10px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }

  /* ── TIMELINE ── */
  .tl-item { display: flex; gap: 12px; margin-bottom: 18px; position: relative; }
  .tl-item::before {
    content:''; position:absolute; left:13px; top:28px; bottom:-18px;
    width:1px; background:var(--border);
  }
  .tl-item:last-child::before { display:none; }
  .tl-dot {
    width:26px; height:26px; border-radius:50%; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-size:12px; border:1px solid;
  }
  .tl-body { flex:1; }
  .tl-title { font-size:12px; font-weight:700; margin-bottom:2px; }
  .tl-time  { font-size:10px; color:var(--muted); margin-bottom:5px; }
  .tl-text  { background:var(--bg3); border:1px solid var(--border); border-radius:var(--rsm); padding:9px 11px; font-size:12px; color:var(--muted); line-height:1.5; }

  /* ── COMMENT BOX ── */
  .comment-box { padding: 14px 18px; border-top: 1px solid var(--border); flex-shrink: 0; }
  .comment-row { display: flex; gap: 8px; align-items: flex-end; }

  /* ── WIZARD (open ticket) ── */
  .wizard-layout { display: flex; gap: 24px; align-items: flex-start; }
  .wizard-sidebar {
    width: 200px; min-width: 200px; flex-shrink: 0;
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: var(--r); padding: 20px 16px;
    position: sticky; top: 0;
  }
  .wizard-steps { display: flex; flex-direction: column; gap: 4px; }
  .wstep {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: var(--rsm);
    font-size: 12px; font-weight: 600; color: var(--muted);
    cursor: default;
  }
  .wstep.active { color: var(--a1); background: rgba(124,58,237,.1); }
  .wstep.done   { color: var(--ok); }
  .wstep-dot {
    width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 800;
    border: 2px solid var(--border); background: var(--bg3);
  }
  .wstep.active .wstep-dot { border-color: var(--a1); background: rgba(124,58,237,.2); color: var(--a1); }
  .wstep.done   .wstep-dot { border-color: var(--ok); background: rgba(16,185,129,.2); color: var(--ok); }
  .wizard-connector { width: 1px; height: 12px; background: var(--border); margin: 2px 0 2px 18px; }
  .wizard-body { flex: 1; min-width: 0; }
  .wizard-card {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: var(--r); padding: 24px;
  }
  .wizard-card-title { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .wizard-card-sub   { font-size: 13px; color: var(--muted); margin-bottom: 22px; }
  .wizard-footer {
    display: flex; justify-content: space-between; align-items: center;
    padding-top: 20px; margin-top: 20px; border-top: 1px solid var(--border);
  }

  /* ── TYPE CARDS GRID ── */
  .type-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
  .type-card {
    background: var(--bg3); border: 2px solid var(--border);
    border-radius: var(--r); padding: 18px 14px;
    cursor: pointer; transition: all .15s; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  .type-card:hover { border-color: var(--muted); background: var(--surface); transform: translateY(-1px); }
  .type-card.selected { border-width: 2px; transform: translateY(-1px); }
  .type-card-icon { font-size: 32px; }
  .type-card-name { font-size: 13px; font-weight: 700; }
  .type-card-cat  { font-size: 11px; color: var(--muted); }

  /* ── FIELD SECTION DIVIDER ── */
  .field-section-label {
    font-size: 10px; font-weight: 800; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1px;
    display: flex; align-items: center; gap: 10px;
    margin: 20px 0 16px;
  }
  .field-section-label::before,
  .field-section-label::after {
    content:''; flex:1; height:1px; background:var(--border);
  }

  /* ── URGENCY PILLS ── */
  .urgency-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
  .urgency-pill {
    padding: 12px; border-radius: var(--rsm); text-align: center;
    cursor: pointer; border: 2px solid var(--border); background: var(--bg3);
    transition: all .15s;
  }
  .urgency-pill:hover { border-color: var(--muted); }
  .urgency-pill-label { font-size: 13px; font-weight: 800; }
  .urgency-pill-sub   { font-size: 11px; color: var(--muted); margin-top: 3px; }

  /* ── GRID HELPERS ── */
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .divider { height: 1px; background: var(--border); margin: 18px 0; }

  /* ── REVIEW BLOCK ── */
  .review-hero {
    background: linear-gradient(135deg, rgba(124,58,237,.15), rgba(6,182,212,.07));
    border: 1px solid rgba(124,58,237,.25); border-radius: var(--r);
    padding: 20px; margin-bottom: 16px;
  }
  .review-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 0; border-bottom: 1px solid rgba(40,40,72,.5);
    font-size: 13px;
  }
  .review-row:last-child { border-bottom: none; }
  .review-key { color: var(--muted); font-weight: 600; }
  .review-val { font-weight: 700; text-align: right; max-width: 55%; }

  /* ── SUCCESS ── */
  .success-wrap {
    display: flex; align-items: center; justify-content: center;
    min-height: 60vh;
  }
  .success-card {
    background: var(--bg2); border: 1px solid var(--border); border-radius: 20px;
    padding: 48px 56px; text-align: center; max-width: 480px;
    animation: scaleIn .3s;
  }
  .success-icon  { font-size: 64px; margin-bottom: 18px; display: block; }
  .success-title { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
  .success-sub   { font-size: 14px; color: var(--muted); margin-bottom: 22px; line-height: 1.6; }
  .success-id    {
    font-family: 'JetBrains Mono', monospace; font-size: 24px;
    font-weight: 700; color: var(--a2);
    background: var(--bg3); padding: 14px 28px; border-radius: var(--rsm);
    border: 1px solid var(--border); display: inline-block; margin-bottom: 6px;
  }

  /* ── ADMIN CONFIG ── */
  .config-row {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; border-bottom: 1px solid var(--border);
    transition: background .1s; cursor: pointer;
  }
  .config-row:hover { background: var(--bg3); }
  .config-row:last-child { border-bottom: none; }
  .cfg-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

  /* ── TYPE ADMIN CARDS ── */
  .atype-card {
    background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r);
    padding: 16px; display: flex; align-items: center; gap: 14px;
    transition: border-color .15s; cursor: pointer; position: relative; overflow: hidden;
  }
  .atype-card:hover { border-color: rgba(124,58,237,.4); }
  .atype-stripe { position: absolute; left:0; top:0; bottom:0; width:3px; }
  .atype-ico { width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
  .atype-name { font-size:14px; font-weight:700; }
  .atype-cat  { font-size:11px; color:var(--muted); margin-top:2px; }

  /* ── SECTION HEADER ── */
  .section-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  .section-title { font-size: 16px; font-weight: 700; }
  .section-sub   { font-size: 12px; color: var(--muted); margin-top: 2px; }

  /* ── FILTER BAR ── */
  .filter-bar { display: flex; gap: 8px; margin-bottom: 16px; align-items: center; }
  .filter-select {
    background: var(--bg3); border: 1px solid var(--border); border-radius: var(--rsm);
    padding: 7px 11px; color: var(--text); font-family: inherit; font-size: 12px;
    font-weight: 600; cursor: pointer; outline: none;
    transition: border-color .15s;
  }
  .filter-select:focus { border-color: var(--a1); }
  .chip {
    padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700;
    cursor: pointer; background: var(--bg3); border: 1px solid var(--border);
    color: var(--muted); white-space: nowrap; transition: all .12s;
  }
  .chip.active { background: rgba(124,58,237,.2); border-color: rgba(124,58,237,.4); color: #a78bfa; }
  .chip:hover { border-color: var(--muted); color: var(--text); }

  /* ── TAGS ── */
  .tag {
    display: inline-flex; align-items: center; padding: 2px 7px;
    border-radius: 5px; font-size: 10px; font-weight: 700;
    background: rgba(124,58,237,.15); color: #a78bfa;
    border: 1px solid rgba(124,58,237,.25);
  }

  /* ── SLA ── */
  .sla-ok   { color: var(--ok);  font-size:11px; font-weight:700; }
  .sla-warn { color: var(--a3);  font-size:11px; font-weight:700; }
  .sla-crit { color: var(--err); font-size:11px; font-weight:700; }

  /* ── TOGGLE CHIPS (urgency / options) ── */
  .option-chip {
    padding: 6px 12px; border-radius: var(--rsm); font-size: 11px; font-weight: 700;
    cursor: pointer; border: 1px solid var(--border); background: var(--bg3);
    color: var(--muted); transition: all .12s;
  }
  .option-chip.on { border-color: var(--a1); background: rgba(124,58,237,.18); color: #c4b5fd; }

  /* ── EMPTY ── */
  .empty { text-align: center; padding: 60px; color: var(--muted); }
  .empty-ico  { font-size: 48px; opacity: .3; margin-bottom: 12px; }
  .empty-text { font-size: 14px; }

  /* ── NOTIFS ── */
  .notif-item {
    display: flex; gap: 12px; padding: 14px 18px;
    border-bottom: 1px solid var(--border); cursor: pointer;
    transition: background .1s;
  }
  .notif-item:hover { background: var(--bg3); }
  .notif-item.unread { background: rgba(124,58,237,.04); }
  .notif-unread-dot { width:7px; height:7px; background:var(--a1); border-radius:50%; flex-shrink:0; margin-top:5px; }

  /* ── MISC ── */
  .attach-zone {
    border: 1px dashed var(--border); border-radius: var(--rsm);
    padding: 20px; text-align: center; cursor: pointer;
    background: var(--bg3); transition: border-color .15s;
  }
  .attach-zone:hover { border-color: var(--a1); }

  @keyframes slideIn  { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }
  @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
  @keyframes scaleIn  { from { opacity:0; transform:scale(.95) } to { opacity:1; transform:scale(1) } }
`;

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
function Badge({ color, children }) {
  return (
    <span className="badge" style={{ background:color+"1e", color, border:`1px solid ${color}38` }}>
      <span className="bdot" style={{ background:color }} />{children}
    </span>
  );
}

function SLAText({ text }) {
  if (text === "Concluído")    return <span className="sla-ok">✓ Concluído</span>;
  if (text.includes("min"))    return <span className="sla-crit">⚠ {text}</span>;
  if (/^[1-4]h/.test(text))   return <span className="sla-warn">⏱ {text}</span>;
  return <span className="sla-ok">{text}</span>;
}

function FieldSectionLabel({ children }) {
  return <div className="field-section-label">{children}</div>;
}

// ── CAMPOS ESPECÍFICOS POR TIPO ───────────────────────────────────────────────
function FieldsForType({ typeId, extra, setExtra }) {
  const set = (k,v) => setExtra(p => ({...p,[k]:v}));
  const OptionChips = ({ field, options }) => (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
      {options.map(op => (
        <div key={op} className={`option-chip ${extra[field]===op?"on":""}`} onClick={()=>set(field,op)}>{op}</div>
      ))}
    </div>
  );

  if (typeId === 1) return (<>
    <FieldSectionLabel>Informações do Equipamento</FieldSectionLabel>
    <div className="g2">
      <div className="form-group">
        <label className="form-label">Nº do Patrimônio</label>
        <input className="form-input" placeholder="Ex: PAT-00124" value={extra.patrimonio||""} onChange={e=>set("patrimonio",e.target.value)} />
        <div className="form-hint">Etiqueta colada no equipamento</div>
      </div>
      <div className="form-group">
        <label className="form-label">Tipo de Equipamento</label>
        <select className="form-input" value={extra.equip||""} onChange={e=>set("equip",e.target.value)}>
          <option value="">Selecione...</option>
          {["Notebook","Desktop","Monitor","Impressora","Telefone IP","Outro periférico"].map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Sistema Operacional</label>
        <select className="form-input" value={extra.so||""} onChange={e=>set("so",e.target.value)}>
          <option value="">Selecione...</option>
          {["Windows 10","Windows 11","Linux (Ubuntu)","macOS","Outro"].map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Problema ocorre desde quando?</label>
        <select className="form-input" value={extra.desde||""} onChange={e=>set("desde",e.target.value)}>
          <option value="">Selecione...</option>
          {["Hoje","Ontem","Esta semana","Há mais de uma semana"].map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
    </div>
    <div className="form-group">
      <label className="form-label">Consegue usar o equipamento?</label>
      <OptionChips field="uso" options={["Sim, normalmente","Sim, parcialmente","Não, está inutilizável"]} />
    </div>
  </>);

  if (typeId === 2) return (<>
    <FieldSectionLabel>Localização e Detalhes</FieldSectionLabel>
    <div className="g2">
      <div className="form-group">
        <label className="form-label">Andar / Pavimento *</label>
        <select className="form-input" value={extra.andar||""} onChange={e=>set("andar",e.target.value)}>
          <option value="">Selecione...</option>
          {["Térreo","1º andar","2º andar","3º andar","4º andar","5º andar","Subsolo","Área externa"].map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Sala / Área específica</label>
        <input className="form-input" placeholder="Ex: Sala 302, Banheiro Masc." value={extra.sala||""} onChange={e=>set("sala",e.target.value)} />
      </div>
      <div className="form-group" style={{gridColumn:"span 2"}}>
        <label className="form-label">Tipo do problema</label>
        <select className="form-input" value={extra.tipoPred||""} onChange={e=>set("tipoPred",e.target.value)}>
          <option value="">Selecione...</option>
          {["Vazamento / Infiltração","Elétrica (tomada, lâmpada)","Ar-condicionado","Porta / Fechadura","Vidro / Janela","Elevador","Limpeza urgente","Outro"].map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
    </div>
    <div className="form-group">
      <label className="form-label">Representa risco imediato?</label>
      <OptionChips field="risco" options={["Sim, risco de acidente","Não, mas urgente","Apenas incômodo"]} />
    </div>
  </>);

  if (typeId === 3) return (<>
    <FieldSectionLabel>Dados da Solicitação RH</FieldSectionLabel>
    <div className="g2">
      <div className="form-group">
        <label className="form-label">Tipo de solicitação</label>
        <select className="form-input" value={extra.tipoRH||""} onChange={e=>set("tipoRH",e.target.value)}>
          <option value="">Selecione...</option>
          {["Férias","Licença médica","Atestado / Declaração","Alteração de dados cadastrais","Benefícios (plano, vale)","Holerite / Comprovante","Outro"].map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Período de referência</label>
        <input type="month" className="form-input" value={extra.periodo||""} onChange={e=>set("periodo",e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Matrícula do servidor</label>
        <input className="form-input" placeholder="Ex: 123456" value={extra.matricula||""} onChange={e=>set("matricula",e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Secretaria / Órgão</label>
        <input className="form-input" placeholder="Ex: SEPLAG, SEE, SEDS..." value={extra.secretaria||""} onChange={e=>set("secretaria",e.target.value)} />
      </div>
    </div>
  </>);

  if (typeId === 4) return (<>
    <FieldSectionLabel>Dados do Acesso</FieldSectionLabel>
    <div className="g2">
      <div className="form-group">
        <label className="form-label">Sistema solicitado *</label>
        <select className="form-input" value={extra.sistema||""} onChange={e=>set("sistema",e.target.value)}>
          <option value="">Selecione...</option>
          {["SIAG","SEI","SISAP","SIAD","SigaDoc","VPN Corporativa","E-mail institucional","Outro"].map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Login / Usuário afetado</label>
        <input className="form-input" placeholder="Ex: joao.silva@prodemge.gov.br" value={extra.login||""} onChange={e=>set("login",e.target.value)} />
      </div>
    </div>
    <div className="form-group">
      <label className="form-label">Tipo de solicitação</label>
      <OptionChips field="tipoAcesso" options={["Novo acesso","Desbloqueio","Redefinição de senha","Remoção de acesso"]} />
    </div>
    <div className="form-group">
      <label className="form-label">Justificativa do acesso</label>
      <textarea className="form-input" placeholder="Por que o acesso é necessário? Qual função exerce?" value={extra.justAcesso||""} onChange={e=>set("justAcesso",e.target.value)} />
    </div>
  </>);

  if (typeId === 5) return (<>
    <FieldSectionLabel>Detalhes do Item</FieldSectionLabel>
    <div className="g3">
      <div className="form-group">
        <label className="form-label">Categoria</label>
        <select className="form-input" value={extra.catItem||""} onChange={e=>set("catItem",e.target.value)}>
          <option value="">Selecione...</option>
          {["Material de escritório","Equipamento de TI","Material de limpeza","Mobiliário","Insumos de impressão","EPI / Segurança","Outro"].map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Quantidade estimada</label>
        <input type="number" className="form-input" placeholder="Ex: 10" value={extra.qtd||""} onChange={e=>set("qtd",e.target.value)} min="1" />
      </div>
      <div className="form-group">
        <label className="form-label">Centro de custo</label>
        <input className="form-input" placeholder="Ex: CC-0234" value={extra.cc||""} onChange={e=>set("cc",e.target.value)} />
      </div>
    </div>
    <div className="form-group">
      <label className="form-label">Item(ns) solicitado(s) *</label>
      <textarea className="form-input" placeholder="Liste os itens, quantidades e especificações técnicas..." value={extra.itens||""} onChange={e=>set("itens",e.target.value)} style={{minHeight:80}} />
    </div>
    <div className="form-group">
      <label className="form-label">Data necessária</label>
      <input type="date" className="form-input" value={extra.dataNec||""} onChange={e=>set("dataNec",e.target.value)} style={{maxWidth:220}} />
    </div>
  </>);

  return null;
}

// ── TICKET DETAIL PANEL ───────────────────────────────────────────────────────
function DetailPanel({ ticket, onClose, isAdmin }) {
  const type     = getType(ticket.type);
  const priority = getPriority(ticket.priority);
  const status   = getStatus(ticket.status);
  const timeline = TIMELINE_BY_STATUS[ticket.status] || [];
  const [comment, setComment] = useState("");

  return (
    <div className="detail-panel">
      {/* topbar */}
      <div className="detail-topbar">
        <span style={{fontSize:20}}>{type?.icon}</span>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"var(--a2)",fontWeight:600}}>{ticket.id}</span>
        <div style={{flex:1}} />
        {isAdmin && (
          <button className="btn btn-primary btn-sm">Salvar</button>
        )}
        <button className="btn btn-ghost btn-sm" style={{padding:"5px 8px",fontSize:16}} onClick={onClose}>✕</button>
      </div>

      <div className="detail-scroll">
        {/* hero */}
        <div className="detail-hero">
          <div className="detail-id">{ticket.id} · {type?.name}</div>
          <div className="detail-title">{ticket.title}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
            <Badge color={status?.color}>{status?.name}</Badge>
            <Badge color={priority?.color}>{priority?.name}</Badge>
            <span style={{marginLeft:"auto"}}><SLAText text={ticket.sla} /></span>
          </div>
          <div className="meta-grid">
            <div className="meta-item"><div className="meta-lbl">Solicitante</div><div className="meta-val">{ticket.user}</div></div>
            <div className="meta-item"><div className="meta-lbl">Departamento</div><div className="meta-val">{ticket.dept}</div></div>
            <div className="meta-item"><div className="meta-lbl">Data</div><div className="meta-val">{ticket.date}</div></div>
            <div className="meta-item"><div className="meta-lbl">Atendente</div><div className="meta-val" style={{color:ticket.assigned==="—"?"var(--muted)":undefined}}>{ticket.assigned}</div></div>
          </div>
        </div>

        {/* descrição */}
        <div className="detail-section">
          <div className="detail-section-title">Descrição</div>
          <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.65}}>{ticket.desc}</div>
        </div>

        {/* admin controls */}
        {isAdmin && (
          <div className="detail-section">
            <div className="detail-section-title">Gerenciar</div>
            <div className="g2" style={{gap:10}}>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Atendente</label>
                <select className="form-input">
                  <option>— Não atribuído —</option>
                  {["Carlos Dev","Bruna RH","Pedro Adm"].map(a=><option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">Status</label>
                <select className="form-input" defaultValue={ticket.status}>
                  {STATUSES.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* timeline */}
        <div className="detail-section">
          <div className="detail-section-title">Histórico</div>
          <div>
            {timeline.map((item,i) => (
              <div key={i} className="tl-item">
                <div className="tl-dot" style={{background:item.bg+"20",borderColor:item.bg+"40"}}>{item.icon}</div>
                <div className="tl-body">
                  <div className="tl-title">{item.title}</div>
                  <div className="tl-time">{item.time}</div>
                  {item.text && <div className="tl-text">{item.text}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ações usuário */}
        {!isAdmin && ticket.status === 3 && (
          <div className="detail-section">
            <button className="btn btn-primary" style={{width:"100%"}}>✅ Confirmar que foi resolvido</button>
          </div>
        )}
      </div>

      {/* comment */}
      <div className="comment-box">
        <div style={{fontSize:10,fontWeight:800,color:"var(--muted)",textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>Adicionar comentário</div>
        <div className="comment-row">
          <textarea className="form-input" placeholder="Escreva um comentário ou atualização..." value={comment} onChange={e=>setComment(e.target.value)} style={{minHeight:60,flex:1}} />
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:8,gap:8}}>
          {isAdmin && <button className="btn btn-danger btn-sm">Cancelar chamado</button>}
          <button className="btn btn-primary btn-sm">Enviar comentário</button>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [search, setSearch] = useState("");

  const open       = MOCK_TICKETS.filter(t=>t.status===1).length;
  const inProgress = MOCK_TICKETS.filter(t=>t.status===2).length;
  const waiting    = MOCK_TICKETS.filter(t=>t.status===3).length;
  const closed     = MOCK_TICKETS.filter(t=>t.status===4).length;

  const filtered = MOCK_TICKETS
    .filter(t => statusFilter === "todos" || t.status === Number(statusFilter))
    .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()) || t.user.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>
      <div className="content" style={{flex:1}}>
        {/* KPIs */}
        <div className="kpi-grid">
          {[
            {label:"Abertos",      value:open,       color:"#3b82f6", icon:"📬", sub:"aguardando atendimento"},
            {label:"Em Atendimento",value:inProgress, color:"#f59e0b", icon:"⚡", sub:"em progresso"},
            {label:"Ag. Confirmação",value:waiting,   color:"#8b5cf6", icon:"🕐", sub:"aguardando usuário"},
            {label:"Fechados hoje", value:closed,     color:"#10b981", icon:"✅", sub:"resolvidos"},
          ].map(k=>(
            <div key={k.label} className="kpi-card">
              <div className="kpi-glow" style={{background:k.color}} />
              <div className="kpi-icon">{k.icon}</div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value" style={{color:k.color}}>{k.value}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <div style={{display:"flex",alignItems:"center",gap:8,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--rsm)",padding:"6px 12px",flex:1,maxWidth:280}}>
            <span style={{color:"var(--muted)"}}>🔍</span>
            <input style={{background:"none",border:"none",outline:"none",color:"var(--text)",fontFamily:"inherit",fontSize:13,width:"100%"}}
              placeholder="Buscar chamados..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <option value="todos">Todos os status</option>
            {STATUSES.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="filter-select">
            <option>Todos os tipos</option>
            {TICKET_TYPES.map(t=><option key={t.id}>{t.name}</option>)}
          </select>
          <select className="filter-select">
            <option>Todas as prioridades</option>
            {PRIORITIES.map(p=><option key={p.id}>{p.name}</option>)}
          </select>
          <span style={{marginLeft:"auto",fontSize:12,color:"var(--muted)",fontWeight:600}}>{filtered.length} chamados</span>
        </div>

        {/* Table */}
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Tipo</th>
                <th>Solicitante</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Atendente</th>
                <th>SLA</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const type = getType(t.type);
                const priority = getPriority(t.priority);
                const status = getStatus(t.status);
                return (
                  <tr key={t.id} className={selected?.id===t.id?"selected":""} onClick={()=>setSelected(selected?.id===t.id?null:t)}>
                    <td><span className="ticket-id">{t.id}</span></td>
                    <td style={{maxWidth:220,fontWeight:500}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:220}}>{t.title}</div></td>
                    <td><span style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>{type?.icon} {type?.name}</span></td>
                    <td style={{whiteSpace:"nowrap"}}>
                      <div style={{fontSize:13,fontWeight:600}}>{t.user}</div>
                      <div style={{fontSize:11,color:"var(--muted)"}}>{t.dept}</div>
                    </td>
                    <td><Badge color={priority?.color}>{priority?.name}</Badge></td>
                    <td><Badge color={status?.color}>{status?.name}</Badge></td>
                    <td style={{fontSize:12,color:t.assigned==="—"?"var(--muted)":undefined,whiteSpace:"nowrap"}}>{t.assigned}</td>
                    <td><SLAText text={t.sla} /></td>
                    <td style={{fontSize:12,color:"var(--muted)",whiteSpace:"nowrap"}}>{t.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <DetailPanel ticket={selected} onClose={()=>setSelected(null)} isAdmin />
      )}
    </div>
  );
}

// ── ADMIN TYPES ───────────────────────────────────────────────────────────────
function AdminTypes() {
  const [types, setTypes] = useState(TICKET_TYPES);
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState({name:"",icon:"📋",color:"#6366f1",category:""});

  const save = () => {
    if (!form.name) return;
    setTypes(p=>[...p,{...form,id:Date.now()}]);
    setModal(false);
    setForm({name:"",icon:"📋",color:"#6366f1",category:""});
  };

  return (
    <div className="content">
      <div className="section-hd">
        <div>
          <div className="section-title">Tipos de Chamado</div>
          <div className="section-sub">{types.length} tipos cadastrados</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setModal(true)}>+ Novo Tipo</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {types.map(t=>(
          <div key={t.id} className="atype-card">
            <div className="atype-stripe" style={{background:t.color}} />
            <div className="atype-ico" style={{background:t.color+"22",border:`1px solid ${t.color}33`,marginLeft:6}}>{t.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div className="atype-name">{t.name}</div>
              <div className="atype-cat"><span className="tag">{t.category}</span></div>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <button className="btn btn-ghost btn-xs">✏️</button>
              <button className="btn btn-danger btn-xs">🗑</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(4px)",animation:"fadeIn .15s"}}
          onClick={()=>setModal(false)}>
          <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:16,width:520,boxShadow:"0 24px 80px rgba(0,0,0,.6)",animation:"scaleIn .2s"}}
            onClick={e=>e.stopPropagation()}>
            <div style={{padding:"20px 24px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:26}}>{form.icon}</span>
              <div style={{flex:1,fontSize:16,fontWeight:700}}>Novo Tipo de Chamado</div>
              <button className="btn btn-ghost btn-sm" style={{padding:"4px 8px",fontSize:16}} onClick={()=>setModal(false)}>✕</button>
            </div>
            <div style={{padding:24}}>
              <div className="g2">
                <div className="form-group">
                  <label className="form-label">Nome *</label>
                  <input className="form-input" placeholder="Ex: Suporte de TI" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ícone (emoji)</label>
                  <input className="form-input" value={form.icon} onChange={e=>setForm(f=>({...f,icon:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <input className="form-input" placeholder="Ex: Tecnologia" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cor</label>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <input type="color" value={form.color} onChange={e=>setForm(f=>({...f,color:e.target.value}))} style={{width:38,height:38,border:"none",background:"none",cursor:"pointer"}} />
                    <input className="form-input" value={form.color} onChange={e=>setForm(f=>({...f,color:e.target.value}))} style={{flex:1}} />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea className="form-input" placeholder="Quando usar este tipo..." style={{minHeight:70}} />
              </div>
            </div>
            <div style={{padding:"14px 24px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:10}}>
              <button className="btn btn-secondary" onClick={()=>setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={save}>Salvar Tipo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ADMIN CONFIG ──────────────────────────────────────────────────────────────
function AdminConfig() {
  return (
    <div className="content">
      <div className="section-hd"><div><div className="section-title">Configurações</div><div className="section-sub">Prioridades, status e campos customizados</div></div></div>
      <div className="g2" style={{gap:24,alignItems:"start"}}>
        {/* Prioridades */}
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:.8}}>Prioridades & SLA</div>
            <button className="btn btn-secondary btn-sm">+ Adicionar</button>
          </div>
          <div className="card" style={{padding:0}}>
            {PRIORITIES.map((p,i)=>(
              <div key={p.id} className="config-row" style={{borderBottom:i<PRIORITIES.length-1?"1px solid var(--border)":"none"}}>
                <div className="cfg-dot" style={{background:p.color}} />
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13}}>{p.name}</div>
                  <div style={{fontSize:11,color:"var(--muted)"}}>SLA: {p.sla}h</div>
                </div>
                <button className="btn btn-ghost btn-xs">✏️</button>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:.8}}>Fluxo de Status</div>
            <button className="btn btn-secondary btn-sm">+ Adicionar</button>
          </div>
          <div className="card" style={{padding:0}}>
            {STATUSES.map((s,i)=>(
              <div key={s.id} className="config-row" style={{borderBottom:i<STATUSES.length-1?"1px solid var(--border)":"none"}}>
                <div className="cfg-dot" style={{background:s.color}} />
                <div style={{flex:1,fontWeight:600,fontSize:13}}>{s.name}</div>
                <button className="btn btn-ghost btn-xs">✏️</button>
              </div>
            ))}
          </div>
        </div>

        {/* Campos customizados */}
        <div style={{gridColumn:"span 2"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:.8}}>Campos Customizados por Tipo</div>
            <button className="btn btn-primary btn-sm">+ Novo Campo</button>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Tipo de Chamado</th><th>Nome do Campo</th><th>Tipo</th><th>Obrigatório</th><th></th></tr></thead>
              <tbody>
                {[
                  {type:"Suporte de TI",    field:"Nº do Patrimônio",    kind:"Texto",   req:true},
                  {type:"Suporte de TI",    field:"Sistema Operacional",  kind:"Select",  req:false},
                  {type:"Manut. Predial",   field:"Andar / Sala",         kind:"Texto",   req:true},
                  {type:"RH",               field:"Período de Referência",kind:"Data",    req:false},
                  {type:"Acesso a Sistemas",field:"Sistema Solicitado",   kind:"Select",  req:true},
                  {type:"Compras",          field:"Centro de Custo",      kind:"Texto",   req:false},
                ].map((c,i)=>(
                  <tr key={i}>
                    <td><span className="tag">{c.type}</span></td>
                    <td style={{fontWeight:600}}>{c.field}</td>
                    <td style={{color:"var(--muted)",fontSize:12}}>{c.kind}</td>
                    <td><span style={{fontSize:12,fontWeight:700,color:c.req?"var(--ok)":"var(--muted)"}}>{c.req?"Sim":"Não"}</span></td>
                    <td style={{display:"flex",gap:6}}><button className="btn btn-ghost btn-xs">✏️</button><button className="btn btn-danger btn-xs">🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── USER — ABRIR CHAMADO ──────────────────────────────────────────────────────
function UserOpenTicket({ onSuccess }) {
  const [step, setStep]           = useState(1);
  const [selectedType, setSelType]= useState(null);
  const [form, setForm]           = useState({ nome:"", email:"", ramal:"", setor:"", title:"", description:"", urgencia:"normal" });
  const [extra, setExtra]         = useState({});
  const [submitted, setSub]       = useState(false);
  const newId = useRef("CHM-00" + Math.floor(Math.random() * 9 + 7));
  const setF = (k,v) => setForm(p=>({...p,[k]:v}));

  const STEPS = [
    {id:1, label:"Tipo de chamado",  sub:"Selecione a categoria"},
    {id:2, label:"Seus dados",       sub:"Identificação do solicitante"},
    {id:3, label:"Detalhes",         sub:"Descrição e campos específicos"},
    {id:4, label:"Revisão",          sub:"Confirme antes de enviar"},
  ];

  const submit = () => { setSub(true); setTimeout(()=>onSuccess&&onSuccess(), 3000); };

  if (submitted) return (
    <div className="content">
      <div className="success-wrap">
        <div className="success-card">
          <span className="success-icon">🎉</span>
          <div className="success-title">Chamado Aberto!</div>
          <div className="success-sub">Seu chamado foi registrado e será atendido dentro do prazo de SLA. Acompanhe em "Meus Chamados".</div>
          <div className="success-id">{newId.current}</div>
          <div style={{fontSize:12,color:"var(--muted)",marginBottom:24}}>Guarde este número para acompanhar</div>
          <button className="btn btn-primary" style={{width:"100%"}} onClick={onSuccess}>Ver meus chamados →</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="content">
      <div className="wizard-layout">
        {/* Sidebar de steps */}
        <div className="wizard-sidebar">
          <div style={{fontSize:12,fontWeight:800,color:"var(--muted)",textTransform:"uppercase",letterSpacing:.8,marginBottom:16}}>Progresso</div>
          <div className="wizard-steps">
            {STEPS.map((s,i) => (
              <>
                <div key={s.id} className={`wstep ${step===s.id?"active":step>s.id?"done":""}`}>
                  <div className="wstep-dot">{step>s.id?"✓":s.id}</div>
                  <div>
                    <div style={{fontSize:12,fontWeight:700}}>{s.label}</div>
                    <div style={{fontSize:10,color:"var(--muted)",marginTop:1}}>{s.sub}</div>
                  </div>
                </div>
                {i < STEPS.length-1 && <div className="wizard-connector" key={"c"+i} />}
              </>
            ))}
          </div>

          {selectedType && (
            <div style={{marginTop:20,padding:"12px",background:"var(--bg3)",borderRadius:"var(--rsm)",border:"1px solid var(--border)"}}>
              <div style={{fontSize:9,fontWeight:800,color:"var(--muted)",textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>Tipo selecionado</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:20}}>{selectedType.icon}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:700}}>{selectedType.name}</div>
                  <span className="tag" style={{marginTop:3,display:"inline-block"}}>{selectedType.category}</span>
                </div>
              </div>
              <button style={{fontSize:10,color:"var(--a2)",background:"none",border:"none",cursor:"pointer",padding:0,marginTop:8,fontFamily:"inherit"}} onClick={()=>{setStep(1);setSelType(null);}}>← Alterar tipo</button>
            </div>
          )}
        </div>

        {/* Corpo do wizard */}
        <div className="wizard-body">

          {/* PASSO 1 */}
          {step === 1 && (
            <div className="wizard-card">
              <div className="wizard-card-title">Tipo de Chamado</div>
              <div className="wizard-card-sub">Selecione a categoria que melhor descreve sua solicitação</div>
              <div className="type-grid">
                {TICKET_TYPES.map(t => (
                  <div key={t.id}
                    className="type-card"
                    style={{borderColor: t.color, boxShadow: `inset 0 0 0 0 ${t.color}`}}
                    onClick={()=>{ setSelType(t); setStep(2); }}
                  >
                    <div style={{width:48,height:48,borderRadius:14,background:t.color+"22",border:`1px solid ${t.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{t.icon}</div>
                    <div className="type-card-name">{t.name}</div>
                    <div className="type-card-cat">{t.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PASSO 2 */}
          {step === 2 && (
            <div className="wizard-card">
              <div className="wizard-card-title">Seus Dados</div>
              <div className="wizard-card-sub">Informe seus dados para que possamos entrar em contato</div>
              <div className="g2">
                <div className="form-group">
                  <label className="form-label">Nome completo *</label>
                  <input className="form-input" placeholder="Como consta no sistema" value={form.nome} onChange={e=>setF("nome",e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">E-mail institucional *</label>
                  <input className="form-input" type="email" placeholder="nome@prodemge.gov.br" value={form.email} onChange={e=>setF("email",e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ramal</label>
                  <input className="form-input" placeholder="Ex: 3456" value={form.ramal} onChange={e=>setF("ramal",e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unidade / Setor</label>
                  <input className="form-input" placeholder="Ex: DTEC, DRHU..." value={form.setor} onChange={e=>setF("setor",e.target.value)} />
                </div>
              </div>
              <div className="wizard-footer">
                <button className="btn btn-secondary" onClick={()=>setStep(1)}>← Voltar</button>
                <button className="btn btn-primary" disabled={!form.nome||!form.email} style={{opacity:form.nome&&form.email?1:.4}} onClick={()=>setStep(3)}>Próximo →</button>
              </div>
            </div>
          )}

          {/* PASSO 3 */}
          {step === 3 && (
            <div className="wizard-card">
              <div className="wizard-card-title">Detalhes da Solicitação</div>
              <div className="wizard-card-sub">Descreva o problema e preencha os campos específicos</div>

              <div className="form-group">
                <label className="form-label">Título do chamado *</label>
                <input className="form-input" placeholder="Resuma o problema em uma frase" value={form.title} onChange={e=>setF("title",e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Descrição detalhada *</label>
                <textarea className="form-input" placeholder="O que aconteceu? Quando começou? Qual o impacto no seu trabalho?" value={form.description} onChange={e=>setF("description",e.target.value)} style={{minHeight:110}} />
              </div>

              <div className="form-group">
                <label className="form-label">Nível de urgência</label>
                <div className="urgency-grid">
                  {[
                    {v:"baixa",  label:"🟢 Baixa",   sub:"Pode aguardar",       color:"#6b7280"},
                    {v:"normal", label:"🟡 Normal",   sub:"Necessário hoje",     color:"#f59e0b"},
                    {v:"critica",label:"🔴 Crítica",  sub:"Paralisa trabalho",   color:"#ef4444"},
                  ].map(u=>(
                    <div key={u.v} className="urgency-pill"
                      style={form.urgencia===u.v?{borderColor:u.color,background:u.color+"18"}:{}}
                      onClick={()=>setF("urgencia",u.v)}>
                      <div className="urgency-pill-label" style={{color:form.urgencia===u.v?u.color:"var(--text)"}}>{u.label}</div>
                      <div className="urgency-pill-sub">{u.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              <FieldsForType typeId={selectedType?.id} extra={extra} setExtra={setExtra} />

              <div className="form-group">
                <label className="form-label">Anexar arquivo (opcional)</label>
                <div className="attach-zone">
                  <div style={{fontSize:28,marginBottom:6}}>📎</div>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--muted)"}}>Clique ou arraste um arquivo aqui</div>
                  <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>JPG, PNG, PDF — até 10MB</div>
                </div>
              </div>

              <div className="wizard-footer">
                <button className="btn btn-secondary" onClick={()=>setStep(2)}>← Voltar</button>
                <button className="btn btn-primary" disabled={!form.title||!form.description} style={{opacity:form.title&&form.description?1:.4}} onClick={()=>setStep(4)}>Revisar →</button>
              </div>
            </div>
          )}

          {/* PASSO 4 — REVISÃO */}
          {step === 4 && (
            <div className="wizard-card">
              <div className="wizard-card-title">Revisão Final</div>
              <div className="wizard-card-sub">Verifique todas as informações antes de enviar</div>

              <div className="review-hero">
                <div style={{fontSize:11,color:"var(--a2)",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,marginBottom:6}}>NOVO CHAMADO</div>
                <div style={{fontSize:18,fontWeight:700,marginBottom:12,lineHeight:1.3}}>{form.title}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                  <Badge color={selectedType?.color}>{selectedType?.icon} {selectedType?.name}</Badge>
                  <Badge color={form.urgencia==="critica"?"#ef4444":form.urgencia==="normal"?"#f59e0b":"#6b7280"}>
                    {form.urgencia==="critica"?"🔴 Crítica":form.urgencia==="normal"?"🟡 Normal":"🟢 Baixa"}
                  </Badge>
                </div>
                <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.65}}>{form.description}</div>
              </div>

              <div className="g2" style={{gap:16}}>
                <div className="card">
                  <div className="card-title">Solicitante</div>
                  {[["Nome",form.nome],["E-mail",form.email],["Ramal",form.ramal||"—"],["Setor",form.setor||"—"]].map(([k,v])=>(
                    <div key={k} className="review-row"><span className="review-key">{k}</span><span className="review-val">{v}</span></div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-title">SLA estimado</div>
                  <div style={{textAlign:"center",padding:"16px 0"}}>
                    <div style={{fontSize:36,fontFamily:"'JetBrains Mono',monospace",fontWeight:800,color:form.urgencia==="critica"?"#ef4444":form.urgencia==="normal"?"#f59e0b":"#6b7280"}}>
                      {form.urgencia==="critica"?"1h":form.urgencia==="normal"?"24h":"72h"}
                    </div>
                    <div style={{fontSize:12,color:"var(--muted)",marginTop:4}}>para primeiro atendimento</div>
                  </div>
                  {Object.entries(extra).filter(([,v])=>v).slice(0,3).map(([k,v])=>(
                    <div key={k} className="review-row">
                      <span className="review-key" style={{textTransform:"capitalize"}}>{k}</span>
                      <span className="review-val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="wizard-footer">
                <button className="btn btn-secondary" onClick={()=>setStep(3)}>← Editar</button>
                <button className="btn btn-primary" onClick={submit}>🚀 Abrir Chamado</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── USER — MEUS CHAMADOS ──────────────────────────────────────────────────────
function UserMyTickets() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState("todos");
  const [search, setSearch]     = useState("");

  const myTickets = MOCK_TICKETS.slice(0,6);
  const filtered = myTickets
    .filter(t => filter==="todos" || t.status===Number(filter))
    .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>
      <div className="content" style={{flex:1}}>
        <div className="section-hd">
          <div>
            <div className="section-title">Meus Chamados</div>
            <div className="section-sub">{myTickets.length} chamados registrados</div>
          </div>
        </div>

        <div className="filter-bar">
          <div style={{display:"flex",alignItems:"center",gap:8,background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:"var(--rsm)",padding:"6px 12px",maxWidth:260}}>
            <span style={{color:"var(--muted)"}}>🔍</span>
            <input style={{background:"none",border:"none",outline:"none",color:"var(--text)",fontFamily:"inherit",fontSize:13,width:200}}
              placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="todos">Todos</option>
            {STATUSES.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Tipo</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Atendente</th>
                <th>SLA</th>
                <th>Aberto em</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t=>{
                const type=getType(t.type), priority=getPriority(t.priority), status=getStatus(t.status);
                return (
                  <tr key={t.id} className={selected?.id===t.id?"selected":""} onClick={()=>setSelected(selected?.id===t.id?null:t)}>
                    <td><span className="ticket-id">{t.id}</span></td>
                    <td style={{fontWeight:500,maxWidth:240}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:240}}>{t.title}</div></td>
                    <td><span style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>{type?.icon} {type?.name}</span></td>
                    <td><Badge color={priority?.color}>{priority?.name}</Badge></td>
                    <td><Badge color={status?.color}>{status?.name}</Badge></td>
                    <td style={{fontSize:12,color:t.assigned==="—"?"var(--muted)":undefined}}>{t.assigned}</td>
                    <td><SLAText text={t.sla} /></td>
                    <td style={{fontSize:12,color:"var(--muted)"}}>{t.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <DetailPanel ticket={selected} onClose={()=>setSelected(null)} isAdmin={false} />
      )}
    </div>
  );
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
function Notifications() {
  const items = [
    {unread:true,  icon:"⚡", title:"CHM-004 em atendimento", text:"Carlos Dev iniciou o atendimento do chamado CHM-004 (Acesso bloqueado ao SIAG).", time:"Há 5 min"},
    {unread:true,  icon:"✅", title:"CHM-003 aguardando confirmação", text:"O atendente Bruna RH resolveu o chamado. Confirme se foi resolvido.", time:"Há 30 min"},
    {unread:false, icon:"📬", title:"CHM-006 aberto", text:"Seu chamado sobre monitor piscando foi registrado com sucesso.", time:"Há 2h"},
    {unread:false, icon:"🏁", title:"CHM-005 fechado", text:"Chamado de suprimentos foi concluído por Pedro Adm.", time:"Ontem"},
  ];
  return (
    <div className="content">
      <div className="section-hd">
        <div><div className="section-title">Notificações</div><div className="section-sub">2 não lidas</div></div>
        <button className="btn btn-secondary btn-sm">Marcar todas como lidas</button>
      </div>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        {items.map((n,i)=>(
          <div key={i} className={`notif-item ${n.unread?"unread":""}`} style={{borderBottom:i<items.length-1?"1px solid var(--border)":"none"}}>
            {n.unread && <div className="notif-unread-dot" />}
            <div style={{fontSize:24,flexShrink:0}}>{n.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:3}}>{n.title}</div>
              <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.5}}>{n.text}</div>
            </div>
            <div style={{fontSize:11,color:"var(--muted)",flexShrink:0,paddingTop:2}}>{n.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── APP SHELL ─────────────────────────────────────────────────────────────────
export default function App() {
  const [module, setModule]   = useState("admin");
  const [page,   setPage]     = useState("dashboard");
  const [openKey, setOpenKey] = useState(0);

  const goTo = p => { if(p==="open") setOpenKey(k=>k+1); setPage(p); };
  const switchModule = m => { setModule(m); goTo(m==="admin"?"dashboard":"open"); };

  const adminNav = [
    { section:"Principal" },
    { id:"dashboard", icon:"📊", label:"Dashboard",        badge:3 },
    { section:"Configurações" },
    { id:"types",     icon:"🗂️", label:"Tipos de Chamado" },
    { id:"config",    icon:"⚙️", label:"Configurações" },
    { id:"team",      icon:"👥", label:"Equipe" },
    { id:"reports",   icon:"📈", label:"Relatórios" },
  ];
  const userNav = [
    { section:"Chamados" },
    { id:"open",          icon:"➕",  label:"Abrir Chamado" },
    { id:"mytickets",     icon:"📋",  label:"Meus Chamados", badge:2 },
    { section:"Outros" },
    { id:"notifications", icon:"🔔",  label:"Notificações",  badge:2 },
  ];

  const nav = module==="admin" ? adminNav : userNav;

  const renderPage = () => {
    if (module==="admin") {
      if (page==="dashboard") return <AdminDashboard />;
      if (page==="types")     return <AdminTypes />;
      if (page==="config")    return <AdminConfig />;
      return <div className="content"><div className="empty"><div className="empty-ico">🚧</div><div className="empty-text">Em desenvolvimento</div></div></div>;
    } else {
      if (page==="open")          return <UserOpenTicket key={openKey} onSuccess={()=>goTo("mytickets")} />;
      if (page==="mytickets")     return <UserMyTickets />;
      if (page==="notifications") return <Notifications />;
      return <div className="content"><div className="empty"><div className="empty-ico">🚧</div><div className="empty-text">Em desenvolvimento</div></div></div>;
    }
  };

  const pageTitle = {dashboard:"Painel de Chamados",types:"Tipos de Chamado",config:"Configurações",team:"Equipe",reports:"Relatórios",open:"Abrir Chamado",mytickets:"Meus Chamados",notifications:"Notificações"}[page]||"";

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* ── SIDEBAR ── */}
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">🎫</div>
            <div>
              <div className="logo-text">ChamadosMG</div>
              <div className="logo-sub">Prodemge · Gov MG</div>
            </div>
          </div>

          <div className="sidebar-scroll">
            {/* Module switch */}
            <div style={{padding:"4px 2px 12px"}}>
              <div style={{display:"flex",gap:3,background:"var(--bg3)",padding:3,borderRadius:"var(--rsm)",border:"1px solid var(--border)"}}>
                <button className={`mtab ${module==="admin"?"active":""}`} style={{flex:1}} onClick={()=>switchModule("admin")}>Admin</button>
                <button className={`mtab ${module==="user"?"active":""}`}  style={{flex:1}} onClick={()=>switchModule("user")}>Usuário</button>
              </div>
            </div>

            {nav.map((item,i) => {
              if (item.section) return (
                <div key={i} className="nav-section-label" style={{marginTop: i>0?12:0}}>{item.section}</div>
              );
              return (
                <button key={item.id} className={`nav-item ${page===item.id?"active":""}`} onClick={()=>goTo(item.id)}>
                  <span className="ni-icon">{item.icon}</span>
                  {item.label}
                  {item.badge && <span className="ni-badge">{item.badge}</span>}
                </button>
              );
            })}
          </div>

          <div className="sidebar-footer">
            <div className="avatar" style={{background: module==="admin"?"linear-gradient(135deg,#7c3aed,#06b6d4)":"linear-gradient(135deg,#10b981,#06b6d4)"}}>
              {module==="admin"?"MA":"MU"}
            </div>
            <div className="avatar-info">
              <div className="avatar-name">{module==="admin"?"Marcelo Admin":"Maria Usuária"}</div>
              <div className="avatar-role">{module==="admin"?"Administrador":"Colaboradora"}</div>
            </div>
            <button className="btn btn-ghost btn-xs">⚙️</button>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="main">
          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-title">{pageTitle}</div>
            <div className="topbar-search">
              <span style={{color:"var(--muted)",fontSize:14}}>🔍</span>
              <input placeholder="Busca rápida..." />
            </div>
            {module==="user" && page!=="open" && (
              <button className="btn btn-primary btn-sm" onClick={()=>goTo("open")}>+ Novo Chamado</button>
            )}
            <div className="icon-btn">🔔<span className="dot" /></div>
          </div>

          {/* Body */}
          <div className="body">
            {renderPage()}
          </div>
        </div>
      </div>
    </>
  );
}
