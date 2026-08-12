let applications = [];
let idCounter = 1;
let activeFilter = 'all';

const statusMeta = {
  applied:   { label: 'Applied',    class: 'applied' },
  oa:        { label: 'OA Round',   class: 'oa' },
  interview: { label: 'Interview',  class: 'interview' },
  offer:     { label: 'Offer',      class: 'offer' },
  rejected:  { label: 'Rejected',   class: 'rejected' },
};

const form = document.getElementById('entry-form');
const ledgerBody = document.getElementById('ledger-body');
const emptyMsg = document.getElementById('empty-msg');
const statsEl = document.getElementById('stats');
const filtersEl = document.getElementById('filters');
const tableTitle = document.getElementById('table-title');

form.addEventListener('submit', function(e){
  e.preventDefault();
  const company = document.getElementById('company').value.trim();
  if(!company) return;

  applications.unshift({
    id: idCounter++,
    company: company,
    role: document.getElementById('role').value.trim(),
    appliedDate: document.getElementById('applied-date').value,
    package: document.getElementById('package').value.trim(),
    status: document.getElementById('status').value,
    notes: document.getElementById('notes').value.trim(),
  });

  form.reset();
  render();
});

function deleteEntry(id){
  applications = applications.filter(a => a.id !== id);
  render();
}

function cycleStatus(id){
  const order = ['applied','oa','interview','offer','rejected'];
  const app = applications.find(a => a.id === id);
  if(!app) return;
  const next = order[(order.indexOf(app.status) + 1) % order.length];
  app.status = next;
  render();
}

function formatDate(d){
  if(!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  if(isNaN(dt)) return '—';
  return dt.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function renderStats(){
  const total = applications.length;
  const interviews = applications.filter(a => a.status === 'interview' || a.status === 'offer').length;
  const offers = applications.filter(a => a.status === 'offer').length;
  const rate = total ? Math.round((offers/total)*100) : 0;

  statsEl.innerHTML = `
    <div class="stat"><div class="num">${total}</div><div class="label">Applications</div></div>
    <div class="stat"><div class="num">${interviews}</div><div class="label">Interviews</div></div>
    <div class="stat"><div class="num">${offers}</div><div class="label">Offers</div></div>
    <div class="stat"><div class="num">${rate}%</div><div class="label">Offer Rate</div></div>
  `;
}

function renderFilters(){
  const options = [['all','All'], ['applied','Applied'], ['oa','OA'], ['interview','Interview'], ['offer','Offer'], ['rejected','Rejected']];
  filtersEl.innerHTML = options.map(([key,label]) =>
    `<button data-filter="${key}" class="${activeFilter===key ? 'active':''}">${label}</button>`
  ).join('');
  filtersEl.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => { activeFilter = btn.dataset.filter; render(); });
  });
}

function render(){
  renderStats();
  renderFilters();

  const filtered = activeFilter === 'all' ? applications : applications.filter(a => a.status === activeFilter);
  tableTitle.textContent = activeFilter === 'all' ? 'All Applications' : statusMeta[activeFilter].label + ' — ' + filtered.length;

  if(filtered.length === 0){
    ledgerBody.innerHTML = '';
    emptyMsg.style.display = 'block';
    emptyMsg.textContent = applications.length === 0
      ? 'No applications logged yet. Add your first one above.'
      : 'Nothing in this category yet.';
    return;
  }
  emptyMsg.style.display = 'none';

  ledgerBody.innerHTML = filtered.map(a => {
    const meta = statusMeta[a.status];
    return `
      <tr>
        <td data-label="Company">
          <div class="company">${escapeHtml(a.company)}</div>
          ${a.role ? `<div class="role">${escapeHtml(a.role)}</div>` : ''}
        </td>
        <td data-label="Applied"><span class="date">${formatDate(a.appliedDate)}</span></td>
        <td data-label="Package">${a.package ? escapeHtml(a.package) + ' LPA' : '—'}</td>
        <td data-label="Status">
          <span class="stamp ${meta.class}" style="cursor:pointer;" onclick="cycleStatus(${a.id})" title="Click to advance status">${meta.label}</span>
        </td>
        <td data-label="Notes" style="max-width:220px; font-size:13px; color:var(--ink-soft);">${a.notes ? escapeHtml(a.notes) : '—'}</td>
        <td class="row-actions" data-label="">
          <button class="ghost" onclick="deleteEntry(${a.id})">Remove</button>
        </td>
      </tr>
    `;
  }).join('');
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

render();
