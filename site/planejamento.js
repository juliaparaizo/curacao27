// Planning page: a presentation of each part of the trip plus a shared to-do checklist, built from data/plan.js
(function () {
  const T = window.TRIP;
  const P = window.PLAN || {};
  const esc = text =>
    String(text ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const people = { julia: 'Julia', cliente: 'Cliente', ...(P.people || {}) };
  const whoName = who => (who === 'ambas' ? 'Ambas' : people[who] || who);
  const dayColor = n => (T.days[n - 1] || {}).color || 'var(--ink)';
  const dayDate = n => ((T.days[n - 1] || {}).date ? fmtDate(T.days[n - 1].date) : '');
  const dayChip = n => `<a class="daychip" href="roteiro.html#dia-${n}" style="--c:${dayColor(n)}">${esc(t('day', { n }))}</a>`;

  applyText(document);
  document.getElementById('heroDates').textContent = `${T.title} · ${fmtDate(T.start)} · ${fmtDate(T.end)}`;
  document.getElementById('planTitle').textContent = P.title || 'Planejamento';
  document.getElementById('planLead').textContent = P.lead || '';
  document.querySelectorAll('.julia-name').forEach(el => (el.textContent = people.julia));
  document.getElementById('toTop').onclick = event => {
    event.preventDefault();
    scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ---------- presentation ---------- */
  const buttons = list =>
    list && list.length
      ? `<div class="actions">${list
          .map(b => {
            const external = /^https?:/.test(b.url);
            return `<a class="btn${b.primary ? '' : ' outline'}" href="${esc(b.url)}"${external ? ' target="_blank" rel="noopener"' : ''}>${esc(b.text)}${external ? ' ↗' : ''}</a>`;
          })
          .join('')}</div>`
      : '';

  const why = list =>
    list && list.length
      ? `<div class="why">${list
          .map((w, i) => `<div class="why-item"><span class="num">${i + 1}</span><div><h3>${esc(w.title)}</h3><p>${esc(w.text)}</p></div></div>`)
          .join('')}</div>`
      : '';

  const facts = list =>
    list && list.length
      ? `<dl class="facts">${list.map(f => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>`
      : '';

  const days = list =>
    list && list.length
      ? `<h3 class="sub-h">Quando a van entra</h3><ul class="daylist">${list
          .map(d => `<li>${dayChip(d.day)}<span>${esc(d.text)}</span>${dayDate(d.day) ? `<time>${esc(dayDate(d.day))}</time>` : ''}</li>`)
          .join('')}</ul>`
      : '';

  const tours = list =>
    list && list.length
      ? `<div class="tours">${list
          .map(
            tour => `<article class="tour${tour.status === 'Extra' ? ' extra' : ''}">
              <div class="tour-head"><h3>${esc(tour.name)}</h3><span class="status">${esc(tour.status || '')}</span>${tour.day ? dayChip(tour.day) : ''}</div>
              <p>${esc(tour.text)}</p>
              ${
                tour.options
                  ? `<div class="options">${tour.options
                      .map(o => `<div class="option"><b>${esc(o.name)}</b><span class="when">${esc(o.when)}</span><p>${esc(o.info)}</p></div>`)
                      .join('')}</div>`
                  : ''
              }
              ${tour.tip ? `<p class="tip"><b>${esc(t('tip'))}</b> ${esc(tour.tip)}</p>` : ''}
            </article>`,
          )
          .join('')}</div>`
      : '';

  const restaurants = list =>
    list && list.length
      ? `<ul class="rest">${list
          .map(r => `<li>${r.day ? dayChip(r.day) : ''}<b>${esc(r.name)}</b><span>${esc(r.where)}</span></li>`)
          .join('')}</ul>`
      : '';

  const sections = P.sections || [];
  document.getElementById('sections').innerHTML = sections
    .map(
      s => `<section class="plan-card" id="${esc(s.id)}">
        <p class="kicker">${esc(s.kicker)}</p>
        <h2>${esc(s.title)}</h2>
        <p class="lead">${esc(s.lead)}</p>
        ${facts(s.facts)}${why(s.why)}${days(s.days)}${tours(s.tours)}${restaurants(s.list)}${buttons(s.buttons)}
      </section>`,
    )
    .join('');

  const navItems = [...sections.map(s => ({ id: s.id, label: s.kicker.split('·')[0].trim() })), { id: 'checklist', label: 'Checklist' }];
  const nav = document.getElementById('plannav');
  nav.innerHTML = navItems.map(n => `<a href="#${esc(n.id)}">${esc(n.label)}</a>`).join('');
  const links = [...nav.querySelectorAll('a')];
  const watch = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(a => a.toggleAttribute('aria-current', a.getAttribute('href') === `#${entry.target.id}`));
        const current = nav.querySelector('[aria-current]');
        if (current) nav.scrollTo({ left: current.offsetLeft - 16, behavior: 'smooth' });
      });
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );
  navItems.forEach(n => document.getElementById(n.id) && watch.observe(document.getElementById(n.id)));

  /* ---------- checklist ---------- */
  const KEY = `plan-${(T.title || 'trip').toLowerCase().replace(/\W+/g, '-')}`;
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
  } catch {
    saved = {};
  }
  const store = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(saved));
    } catch {
      /* private mode: ticks last until the page closes */
    }
  };
  const groups = (P.todos || []).map((g, gi) => ({
    ...g,
    items: (g.items || []).map((item, ii) => ({ ...item, key: `${gi}-${ii}-${item.text}` })),
  }));
  const all = groups.flatMap(g => g.items);
  const isDone = item => (item.key in saved ? saved[item.key] : !!item.done);
  let filter = 'todas';

  const filters = [
    { id: 'todas', label: 'Todas' },
    { id: 'julia', label: people.julia },
    { id: 'cliente', label: people.cliente },
    { id: 'pendentes', label: 'Pendentes' },
  ];
  const filterBox = document.getElementById('filters');
  filterBox.innerHTML = filters
    .map(f => `<button type="button" data-filter="${f.id}" aria-pressed="${f.id === filter}">${esc(f.label)}</button>`)
    .join('');
  filterBox.onclick = event => {
    const button = event.target.closest('button');
    if (!button) return;
    filter = button.dataset.filter;
    filterBox.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === button));
    render();
  };

  const shows = item =>
    filter === 'todas' ||
    (filter === 'pendentes' && !isDone(item)) ||
    ((filter === 'julia' || filter === 'cliente') && (item.who === filter || item.who === 'ambas'));

  const bar = (done, total) =>
    `<div class="bar"><i style="width:${total ? Math.round((done / total) * 100) : 0}%"></i></div>`;

  const render = () => {
    const done = all.filter(isDone).length;
    const mine = who => all.filter(i => i.who === who || i.who === 'ambas');
    const count = who => `${mine(who).filter(isDone).length}/${mine(who).length}`;
    document.getElementById('progress').innerHTML = `${bar(done, all.length)}
      <p><b>${done} de ${all.length}</b> tarefas feitas · ${esc(people.julia)} ${count('julia')} · ${esc(people.cliente)} ${count('cliente')}</p>`;
    document.getElementById('heroProgress').innerHTML = `${bar(done, all.length)}<span>${done} de ${all.length} tarefas feitas</span>`;
    document.getElementById('todoGroups').innerHTML = groups
      .map(g => {
        const items = g.items.filter(shows);
        if (!items.length) return '';
        return `<div class="todo-group"><h3>${esc(g.group)}<span>${g.items.filter(isDone).length}/${g.items.length}</span></h3><ul>${items
          .map(
            item => `<li class="${isDone(item) ? 'done' : ''}">
              <label><input type="checkbox" data-key="${esc(item.key)}"${isDone(item) ? ' checked' : ''}><span class="box" aria-hidden="true"></span>
              <span class="txt">${esc(item.text)}${item.note ? `<small>${esc(item.note)}</small>` : ''}</span></label>
              <span class="who who-${esc(item.who)}">${esc(whoName(item.who))}</span>
            </li>`,
          )
          .join('')}</ul></div>`;
      })
      .join('') || '<p class="muted">Nada pendente aqui.</p>';
  };
  document.getElementById('todoGroups').onchange = event => {
    const box = event.target.closest('input[type=checkbox]');
    if (!box) return;
    saved[box.dataset.key] = box.checked;
    store();
    render();
  };
  render();
})();
