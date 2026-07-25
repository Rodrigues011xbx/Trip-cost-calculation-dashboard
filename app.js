/* =====================================================
   app.js — Sistema de Reembolso · Igreja Maceió
   ===================================================== */

// ─── STATE ────────────────────────────────────────────
const STATE_KEY = 'igrejaMaceio_reembolso_v2';
let state = {
  config: { precoCombustivel:6.70, consumoKml:10, oleoCusto:350, oleoIntervalo:10000, pneusCusto:1600, pneusVida:40000, manutencao:0.10, lavagemCusto:50, lavagemIntervalo:1000 },
  condutores: ['Vinícius', 'Henrique'],
  viagens: [],
};

function loadState() { try { const r = localStorage.getItem(STATE_KEY); if (r) state = JSON.parse(r); } catch(_){} }
function saveState() { localStorage.setItem(STATE_KEY, JSON.stringify(state)); }

// ─── CUSTO/KM ─────────────────────────────────────────
function calcCustoKm(cfg = state.config) {
  const c = cfg.precoCombustivel / cfg.consumoKml;
  const o = cfg.oleoCusto / cfg.oleoIntervalo;
  const p = cfg.pneusCusto / cfg.pneusVida;
  const m = cfg.manutencao;
  const l = cfg.lavagemCusto / cfg.lavagemIntervalo;
  return { combustivel:c, oleo:o, pneus:p, manutencao:m, lavagem:l, total:c+o+p+m+l };
}
function calcReembolso(km) { return km * calcCustoKm().total; }

// ─── UTILS ────────────────────────────────────────────
const fmtBRL = v => v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const fmtKm  = v => Number(v).toLocaleString('pt-BR',{minimumFractionDigits:1}) + ' km';
const fmtDate = iso => { const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}`; };
const MESES = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

// ─── TOAST ────────────────────────────────────────────
function toast(msg, type='success') {
  const icons = {success:'fa-circle-check',error:'fa-circle-xmark',info:'fa-circle-info'};
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fa-solid ${icons[type]}"></i><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ─── MODAL ────────────────────────────────────────────
let _modalCb = null;
function openModal(desc, cb) {
  document.getElementById('modal-desc').textContent = desc;
  document.getElementById('modal-overlay').classList.add('open');
  _modalCb = cb;
}
document.getElementById('modal-cancel').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.remove('open'); _modalCb = null;
});
document.getElementById('modal-confirm').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.remove('open');
  if (_modalCb) { _modalCb(); _modalCb = null; }
});

// ─── SIDEBAR TOGGLE ───────────────────────────────────
document.getElementById('sidebar-toggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('collapsed');
  document.getElementById('main-content').classList.toggle('expanded');
});

// ─── NAVEGAÇÃO ────────────────────────────────────────
const pageTitles = { dashboard:'Dashboard', viagens:'Registrar Viagem', relatorio:'Relatório', configuracoes:'Configurações' };
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    document.getElementById('page-title').textContent = pageTitles[tab];
    if (tab === 'relatorio') renderRelatorio();
    if (tab === 'dashboard') renderDashboard();
  });
});

// ─── DATA ─────────────────────────────────────────────
function updateDate() {
  document.getElementById('topbar-date').textContent =
    new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
}

// ─── SELECTS DE CONDUTORES ────────────────────────────
function refreshCondutorSelects() {
  ['v-condutor','filtro-condutor-lista','rel-condutor'].forEach(id => {
    const el = document.getElementById(id);
    const prev = el.value;
    while (el.options.length > 1) el.remove(1);
    state.condutores.forEach(c => { const o = new Option(c,c); el.appendChild(o); });
    if (prev) el.value = prev;
  });
}

// ─── CONDUTORES ───────────────────────────────────────
function renderCondutoresList() {
  const list = document.getElementById('condutores-list');
  list.innerHTML = '';
  state.condutores.forEach((c,i) => {
    const chip = document.createElement('div');
    chip.className = 'condutor-chip';
    chip.innerHTML = `<span><i class="fa-solid fa-user" style="color:var(--accent);margin-right:8px;font-size:12px"></i>${c}</span>
      <button class="btn-icon danger" data-i="${i}"><i class="fa-solid fa-trash"></i></button>`;
    chip.querySelector('button').addEventListener('click', () =>
      openModal(`Remover "${c}"?`, () => {
        state.condutores.splice(i,1); saveState(); refreshCondutorSelects(); renderCondutoresList();
        toast(`Condutor "${c}" removido.`,'info');
      })
    );
    list.appendChild(chip);
  });
}

document.getElementById('btn-add-condutor').addEventListener('click', () => {
  const inp = document.getElementById('novo-condutor');
  const nome = inp.value.trim();
  if (!nome) return toast('Digite o nome.','error');
  if (state.condutores.includes(nome)) return toast('Condutor já existe.','error');
  state.condutores.push(nome); saveState(); refreshCondutorSelects(); renderCondutoresList();
  inp.value = ''; toast(`"${nome}" adicionado!`);
});

// ─── CONFIG ───────────────────────────────────────────
const cfgMap = {
  precoCombustivel:'cfg-preco-combustivel', consumoKml:'cfg-consumo',
  oleoCusto:'cfg-oleo-custo', oleoIntervalo:'cfg-oleo-intervalo',
  pneusCusto:'cfg-pneus-custo', pneusVida:'cfg-pneus-vida',
  manutencao:'cfg-manutencao', lavagemCusto:'cfg-lavagem-custo', lavagemIntervalo:'cfg-lavagem-intervalo',
};
function loadConfigInputs() { Object.entries(cfgMap).forEach(([k,id]) => { document.getElementById(id).value = state.config[k]; }); }
function readConfigInputs() { const c = {}; Object.entries(cfgMap).forEach(([k,id]) => { c[k] = parseFloat(document.getElementById(id).value)||0; }); return c; }
function updateConfigPreview() {
  const c = calcCustoKm(readConfigInputs());
  document.getElementById('res-combustivel').textContent = fmtBRL(c.combustivel);
  document.getElementById('res-oleo').textContent = fmtBRL(c.oleo);
  document.getElementById('res-pneus').textContent = fmtBRL(c.pneus);
  document.getElementById('res-manutencao').textContent = fmtBRL(c.manutencao);
  document.getElementById('res-lavagem').textContent = fmtBRL(c.lavagem);
  document.getElementById('cfg-total-km').textContent = fmtBRL(c.total) + ' / km';
}
Object.values(cfgMap).forEach(id => document.getElementById(id).addEventListener('input', updateConfigPreview));
document.getElementById('btn-salvar-config').addEventListener('click', () => {
  state.config = readConfigInputs(); saveState(); updateConfigPreview(); toast('Configurações salvas!');
});
document.getElementById('btn-restaurar-config').addEventListener('click', () => {
  state.config = {precoCombustivel:6.70,consumoKml:10,oleoCusto:350,oleoIntervalo:10000,pneusCusto:1600,pneusVida:40000,manutencao:0.10,lavagemCusto:50,lavagemIntervalo:1000};
  saveState(); loadConfigInputs(); updateConfigPreview(); toast('Padrões restaurados.','info');
});

// ─── CALC PREVIEW ─────────────────────────────────────
function updateCalcPreview() {
  const ki = parseFloat(document.getElementById('v-km-inicial').value)||0;
  const kf = parseFloat(document.getElementById('v-km-final').value)||0;
  const km = kf - ki;
  const cKm = calcCustoKm().total;
  if (km > 0) {
    document.getElementById('prev-km').textContent = fmtKm(km);
    document.getElementById('prev-custo-km').textContent = fmtBRL(cKm)+'/km';
    document.getElementById('prev-total').textContent = fmtBRL(km * cKm);
  } else {
    document.getElementById('prev-km').textContent = '— km';
    document.getElementById('prev-custo-km').textContent = 'R$ —';
    document.getElementById('prev-total').textContent = 'R$ —';
  }
}
['v-km-inicial','v-km-final'].forEach(id => document.getElementById(id).addEventListener('input', updateCalcPreview));

// ─── FORM VIAGEM ──────────────────────────────────────
let editingId = null;
document.getElementById('form-viagem').addEventListener('submit', e => {
  e.preventDefault();
  const condutor = document.getElementById('v-condutor').value;
  const data = document.getElementById('v-data').value;
  const origem = document.getElementById('v-origem').value.trim();
  const destino = document.getElementById('v-destino').value.trim();
  const ki = parseFloat(document.getElementById('v-km-inicial').value);
  const kf = parseFloat(document.getElementById('v-km-final').value);
  const motivo = document.getElementById('v-motivo').value.trim();
  if (!condutor||!data||!origem||!destino||isNaN(ki)||isNaN(kf)||!motivo) return toast('Preencha todos os campos.','error');
  if (kf <= ki) return toast('KM final deve ser maior que KM inicial.','error');
  const km = kf - ki; const reembolso = calcReembolso(km);
  if (editingId !== null) {
    const idx = state.viagens.findIndex(v => v.id === editingId);
    if (idx !== -1) state.viagens[idx] = {...state.viagens[idx], condutor, data, origem, destino, kmInicial:ki, kmFinal:kf, km, motivo, reembolso};
    editingId = null;
    document.getElementById('btn-salvar-viagem').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Viagem';
    document.getElementById('form-title-label').textContent = 'Nova Viagem';
    toast('Viagem atualizada!','info');
  } else {
    state.viagens.push({id:Date.now(), condutor, data, origem, destino, kmInicial:ki, kmFinal:kf, km, motivo, reembolso});
    toast('Viagem registrada!');
  }
  saveState(); limparForm(); renderViagensList(); renderDashboard(); refreshAnosFiltro();
});

function limparForm() {
  ['v-condutor','v-origem','v-destino','v-km-inicial','v-km-final','v-motivo'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('v-data').value = new Date().toISOString().split('T')[0];
  updateCalcPreview(); editingId = null;
  document.getElementById('btn-salvar-viagem').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Viagem';
  document.getElementById('form-title-label').textContent = 'Nova Viagem';
}
document.getElementById('btn-limpar-viagem').addEventListener('click', limparForm);

// ─── LISTA DE VIAGENS ─────────────────────────────────
function renderViagensList() {
  const filtro = document.getElementById('filtro-condutor-lista').value;
  const list = document.getElementById('viagens-list');
  let viagens = [...state.viagens].reverse();
  if (filtro) viagens = viagens.filter(v => v.condutor === filtro);
  if (!viagens.length) { list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-route"></i><p>Nenhuma viagem encontrada</p></div>`; return; }
  list.innerHTML = '';
  viagens.forEach(v => {
    const item = document.createElement('div'); item.className = 'viagem-item';
    item.innerHTML = `
      <div class="viagem-left">
        <div class="viagem-data">${fmtDate(v.data)}</div>
        <div class="viagem-trecho">${v.origem} → ${v.destino}</div>
        <div class="viagem-condutor"><i class="fa-solid fa-user" style="font-size:11px"></i> ${v.condutor}</div>
        <div class="viagem-motivo">${v.motivo}</div>
      </div>
      <div class="viagem-right">
        <div class="viagem-km">${fmtKm(v.km)}</div>
        <div class="viagem-valor">${fmtBRL(v.reembolso)}</div>
        <div class="viagem-actions">
          <button class="btn-icon" data-id="${v.id}" data-action="edit"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-icon danger" data-id="${v.id}" data-action="delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>`;
    list.appendChild(item);
  });
  list.querySelectorAll('[data-action="edit"]').forEach(btn => btn.addEventListener('click', () => editViagem(Number(btn.dataset.id))));
  list.querySelectorAll('[data-action="delete"]').forEach(btn => btn.addEventListener('click', () => deleteViagem(Number(btn.dataset.id))));
}

function editViagem(id) {
  const v = state.viagens.find(v => v.id === id); if (!v) return;
  document.getElementById('v-condutor').value = v.condutor;
  document.getElementById('v-data').value = v.data;
  document.getElementById('v-origem').value = v.origem;
  document.getElementById('v-destino').value = v.destino;
  document.getElementById('v-km-inicial').value = v.kmInicial;
  document.getElementById('v-km-final').value = v.kmFinal;
  document.getElementById('v-motivo').value = v.motivo;
  editingId = id;
  document.getElementById('btn-salvar-viagem').innerHTML = '<i class="fa-solid fa-pen"></i> Atualizar';
  document.getElementById('form-title-label').textContent = 'Editar Viagem';
  updateCalcPreview();
  document.querySelector('.form-card').scrollIntoView({behavior:'smooth'});
}

function deleteViagem(id) {
  const v = state.viagens.find(v => v.id === id); if (!v) return;
  openModal(`Excluir "${v.origem} → ${v.destino}" de ${v.condutor}?`, () => {
    state.viagens = state.viagens.filter(v => v.id !== id);
    saveState(); renderViagensList(); renderDashboard(); toast('Viagem excluída.','info');
  });
}
document.getElementById('filtro-condutor-lista').addEventListener('change', renderViagensList);

// ─── CHARTS ───────────────────────────────────────────
let chartCondutores = null, chartMensal = null, chartPizza = null;
const CORES = ['#4f46e5','#10b981','#f59e0b','#3b82f6','#8b5cf6','#ef4444','#06b6d4'];

function destroyCharts() {
  [chartCondutores, chartMensal, chartPizza].forEach(c => { if (c) c.destroy(); });
  chartCondutores = chartMensal = chartPizza = null;
}

function renderCharts(viagens) {
  destroyCharts();

  // por condutor
  const porCondutor = {};
  viagens.forEach(v => { if (!porCondutor[v.condutor]) porCondutor[v.condutor]={viagens:0,km:0,reembolso:0}; porCondutor[v.condutor].viagens++; porCondutor[v.condutor].km+=v.km; porCondutor[v.condutor].reembolso+=v.reembolso; });
  const condNomes = Object.keys(porCondutor);
  const condReemb = condNomes.map(n => +porCondutor[n].reembolso.toFixed(2));

  const showCond = condNomes.length > 0;
  document.getElementById('chart-condutores-empty').classList.toggle('hidden', showCond);
  if (showCond) {
    chartCondutores = new Chart(document.getElementById('chart-condutores'), {
      type: 'bar',
      data: {
        labels: condNomes,
        datasets: [{ label: 'Reembolso (R$)', data: condReemb, backgroundColor: CORES.slice(0,condNomes.length), borderRadius: 8, borderSkipped: false }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => fmtBRL(ctx.raw) } } },
        scales: { y: { ticks: { callback: v => 'R$ '+v.toLocaleString('pt-BR') }, grid: { color: '#e2e8f0' } }, x: { grid: { display: false } } }
      }
    });
  }

  // por mês (KM)
  const porMes = {};
  viagens.forEach(v => {
    const mes = v.data.substring(0,7);
    if (!porMes[mes]) porMes[mes] = 0;
    porMes[mes] += v.km;
  });
  const meses = Object.keys(porMes).sort();
  const showMes = meses.length > 0;
  document.getElementById('chart-mensal-empty').classList.toggle('hidden', showMes);
  if (showMes) {
    chartMensal = new Chart(document.getElementById('chart-mensal'), {
      type: 'line',
      data: {
        labels: meses.map(m => { const [y,mo] = m.split('-'); return MESES[+mo]+'/'+y.slice(2); }),
        datasets: [{ label: 'KM Rodado', data: meses.map(m => +porMes[m].toFixed(1)), borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,.1)', fill: true, tension: 0.4, pointBackgroundColor: '#4f46e5', pointRadius: 5 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.raw.toLocaleString('pt-BR') + ' km' } } },
        scales: { y: { ticks: { callback: v => v+' km' }, grid: { color: '#e2e8f0' } }, x: { grid: { display: false } } }
      }
    });
  }

  // pizza — viagens por condutor
  const showPizza = condNomes.length > 0;
  document.getElementById('chart-pizza-empty').classList.toggle('hidden', showPizza);
  if (showPizza) {
    chartPizza = new Chart(document.getElementById('chart-pizza'), {
      type: 'doughnut',
      data: {
        labels: condNomes,
        datasets: [{ data: condNomes.map(n => porCondutor[n].viagens), backgroundColor: CORES.slice(0,condNomes.length), borderWidth: 2, borderColor: '#fff' }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 12, family: 'Inter' }, padding: 12 } } }
      }
    });
  }
}

// ─── DASHBOARD ────────────────────────────────────────
function renderDashboard() {
  const v = state.viagens;
  const totalKm = v.reduce((s,x) => s+x.km, 0);
  const totalR = v.reduce((s,x) => s+x.reembolso, 0);
  const condAtivos = new Set(v.map(x => x.condutor)).size;
  document.getElementById('dash-total-viagens').textContent = v.length;
  document.getElementById('dash-total-km').textContent = totalKm.toLocaleString('pt-BR',{minimumFractionDigits:1});
  document.getElementById('dash-total-reembolso').textContent = fmtBRL(totalR);
  document.getElementById('dash-condutores').textContent = condAtivos;

  // ranking
  const porC = {};
  v.forEach(x => { if (!porC[x.condutor]) porC[x.condutor]={viagens:0,km:0,reembolso:0}; porC[x.condutor].viagens++; porC[x.condutor].km+=x.km; porC[x.condutor].reembolso+=x.reembolso; });
  const tbody1 = document.getElementById('dash-condutores-body');
  tbody1.innerHTML = '';
  const sorted = Object.entries(porC).sort((a,b) => b[1].reembolso - a[1].reembolso);
  if (!sorted.length) { tbody1.innerHTML = '<tr class="empty-row"><td colspan="5">Nenhuma viagem registrada.</td></tr>'; }
  else sorted.forEach(([nome,d],i) => {
    tbody1.innerHTML += `<tr><td><strong>#${i+1}</strong></td><td>${nome}</td><td>${d.viagens}</td><td>${fmtKm(d.km)}</td><td><strong style="color:var(--green)">${fmtBRL(d.reembolso)}</strong></td></tr>`;
  });

  // últimas
  const tbody2 = document.getElementById('dash-viagens-body');
  tbody2.innerHTML = '';
  const ultimas = [...v].reverse().slice(0,8);
  if (!ultimas.length) { tbody2.innerHTML = '<tr class="empty-row"><td colspan="5">Nenhuma viagem registrada.</td></tr>'; }
  else ultimas.forEach(x => {
    tbody2.innerHTML += `<tr><td>${fmtDate(x.data)}</td><td>${x.condutor}</td><td>${x.origem} → ${x.destino}</td><td>${fmtKm(x.km)}</td><td><strong style="color:var(--green)">${fmtBRL(x.reembolso)}</strong></td></tr>`;
  });

  renderCharts(v);
}

// ─── RELATÓRIO ────────────────────────────────────────
function renderRelatorio() {
  const cond = document.getElementById('rel-condutor').value;
  const mes = document.getElementById('rel-mes').value;
  const ano = document.getElementById('rel-ano').value;
  let viagens = [...state.viagens];
  if (cond) viagens = viagens.filter(v => v.condutor === cond);
  if (mes) viagens = viagens.filter(v => parseInt(v.data.split('-')[1]) === parseInt(mes));
  if (ano) viagens = viagens.filter(v => v.data.split('-')[0] === ano);
  const body = document.getElementById('relatorio-body');
  if (!viagens.length) { body.innerHTML = `<div class="empty-state"><i class="fa-solid fa-file-invoice-dollar"></i><p>Nenhuma viagem para os filtros selecionados.</p></div>`; return; }
  const porC = {};
  viagens.forEach(v => { if (!porC[v.condutor]) porC[v.condutor]=[]; porC[v.condutor].push(v); });
  body.innerHTML = '';
  Object.entries(porC).forEach(([nome, vlist]) => {
    const totalKm = vlist.reduce((s,v) => s+v.km, 0);
    const totalR = vlist.reduce((s,v) => s+v.reembolso, 0);
    const block = document.createElement('div'); block.className = 'relatorio-condutor-block';
    block.innerHTML = `
      <div class="relatorio-condutor-header">
        <div class="condutor-avatar">${nome.charAt(0)}</div>
        <div><div class="condutor-nome">${nome}</div><div class="condutor-sumario">${vlist.length} viagem(ns) · ${fmtKm(totalKm)}</div></div>
      </div>
      <table class="data-table"><thead><tr><th>#</th><th>Data</th><th>Trecho</th><th>Motivo</th><th>KM Ini.</th><th>KM Fin.</th><th>KM Perc.</th><th>Reembolso</th></tr></thead>
      <tbody>${vlist.map((v,i)=>`<tr><td>${i+1}</td><td>${fmtDate(v.data)}</td><td><strong>${v.origem} → ${v.destino}</strong></td><td style="font-size:12px;color:var(--text2);max-width:180px">${v.motivo}</td><td>${Number(v.kmInicial).toLocaleString('pt-BR')} km</td><td>${Number(v.kmFinal).toLocaleString('pt-BR')} km</td><td>${fmtKm(v.km)}</td><td><strong style="color:var(--green)">${fmtBRL(v.reembolso)}</strong></td></tr>`).join('')}</tbody></table>
      <div class="relatorio-total-bar"><span><i class="fa-solid fa-sigma"></i> Total — ${nome}</span><strong>${fmtBRL(totalR)}</strong></div>`;
    body.appendChild(block);
  });
  if (Object.keys(porC).length > 1) {
    const grand = viagens.reduce((s,v) => s+v.reembolso, 0);
    const el = document.createElement('div'); el.className = 'relatorio-total-bar';
    el.style.cssText = 'background:var(--accent-light);border-color:#c7d2fe;margin-top:8px';
    el.innerHTML = `<span style="color:var(--accent)"><i class="fa-solid fa-trophy"></i> Total Geral</span><strong style="color:var(--accent);font-size:22px">${fmtBRL(grand)}</strong>`;
    body.appendChild(el);
  }
}
['rel-condutor','rel-mes','rel-ano'].forEach(id => document.getElementById(id).addEventListener('change', renderRelatorio));
document.getElementById('btn-imprimir').addEventListener('click', () => window.print());

function refreshAnosFiltro() {
  const sel = document.getElementById('rel-ano'); const prev = sel.value;
  while (sel.options.length > 1) sel.remove(1);
  [...new Set(state.viagens.map(v => v.data.split('-')[0]))].sort().reverse().forEach(a => sel.appendChild(new Option(a,a)));
  if (prev) sel.value = prev;
}

// ─── INIT ─────────────────────────────────────────────
function init() {
  loadState(); updateDate(); loadConfigInputs(); updateConfigPreview();
  refreshCondutorSelects(); renderCondutoresList(); renderViagensList();
  renderDashboard(); refreshAnosFiltro();
  document.getElementById('v-data').value = new Date().toISOString().split('T')[0];
}
init();
