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
      ? `<h3 class="sub-h">Dias com motorista</h3><ul class="daylist">${list
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
          .map(
            r =>
              `<li>${r.day ? dayChip(r.day) : ''}<div class="rest-name"><b>${esc(r.name)}</b><span>${esc(r.where)}</span></div>${
                r.maps
                  ? `<a class="mapsbtn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.maps)}" target="_blank" rel="noopener">Abrir no Maps ↗</a>`
                  : '<span class="mapsbtn off">endereço a confirmar</span>'
              }</li>`,
          )
          .join('')}</ul>`
      : '';

  const tips = list =>
    list && list.length
      ? `<div class="tips">${list
          .map(
            tip => `<article class="tipcard"><h3>${esc(tip.title)}</h3><ul>${(tip.items || []).map(i => `<li>${esc(i)}</li>`).join('')}</ul>${(
              tip.links || []
            )
              .map(l => `<a class="tiplink" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.text)} ↗</a>`)
              .join('')}</article>`,
          )
          .join('')}</div>`
      : '';

  const sections = P.sections || [];
  document.getElementById('sections').innerHTML = sections
    .map(
      s => `<section class="plan-card" id="${esc(s.id)}">
        <p class="kicker">${esc(s.kicker)}</p>
        <h2>${esc(s.title)}</h2>
        <p class="lead">${esc(s.lead)}</p>
        ${facts(s.facts)}${why(s.why)}${days(s.days)}${tours(s.tours)}${restaurants(s.list)}${tips(s.tips)}${buttons(s.buttons)}
      </section>`,
    )
    .join('');

  /* ---------- budget ---------- */
  const B = P.budget;
  if (B && B.groups) {
    const fx = Number(B.fx) || 1;
    const people = Number(B.people) || 1;
    const lang = document.documentElement.lang || 'pt-BR';
    const brl = v => `R$ ${Math.round(v).toLocaleString(lang)}`;
    const usd = v => `US$ ${v.toLocaleString(lang, { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
    const range = (lo, hi, f) => (Math.round(lo) === Math.round(hi) ? f(lo) : `${f(lo)} – ${f(hi)}`);
    const pair = v => (Array.isArray(v) ? [Number(v[0]), Number(v[1])] : [Number(v), Number(v)]);
    // every item becomes a low/high cost per person, in its own currency and in reais
    const cost = item => {
      if (item.usd_total != null) {
        const [lo, hi] = pair(item.usd_total).map(v => v / people);
        return { lo: lo * fx, hi: hi * fx, own: range(lo, hi, usd) };
      }
      if (item.usd_pp != null) {
        const [lo, hi] = pair(item.usd_pp);
        return { lo: lo * fx, hi: hi * fx, own: range(lo, hi, usd) };
      }
      const [lo, hi] = pair(item.brl_pp ?? 0);
      return { lo, hi, own: null };
    };
    const statusName = { cotado: 'Cotado', estimativa: 'Estimativa', 'a cotar': 'A cotar' };
    const rows = B.groups.map(g => ({ ...g, items: g.items.map(item => ({ ...item, ...cost(item) })) }));
    const items = rows.flatMap(g => g.items);
    const sum = (list, key) => list.reduce((total, item) => total + item[key], 0);
    const lo = sum(items, 'lo'),
      hi = sum(items, 'hi');
    const quoted = items.filter(i => i.status === 'cotado');
    const target = Number(B.target_brl) || 0;
    // the target marker sits on a scale from 0 to whichever is larger: the high estimate or the target
    const top = Math.max(hi, target) * 1.05;
    const pct = v => `${Math.min(100, (v / top) * 100).toFixed(1)}%`;
    const verdict = !target
      ? ''
      : hi <= target
        ? 'Cabe na meta mesmo no cenário mais caro.'
        : lo <= target
          ? 'A meta fica dentro da faixa: dá pra fechar, escolhendo bem restaurantes e passeios.'
          : 'Acima da meta mesmo no cenário mais barato.';
    const box = document.getElementById('orcamento');
    box.hidden = false;
    box.innerHTML = `
      <p class="kicker">Quanto custa · por pessoa</p>
      <h2>${esc(B.title || 'Orçamento')}</h2>
      <p class="lead">${esc(B.lead || '')}</p>
      <div class="totals">
        <div class="total main"><span>Total estimado por pessoa</span><b>${esc(range(lo, hi, brl))}</b></div>
        <div class="total"><span>Já cotado, por pessoa</span><b>${esc(brl(sum(quoted, 'lo')))}</b><small>${quoted.length} de ${items.length} itens</small></div>
      </div>
      ${
        target
          ? `<div class="meter" role="img" aria-label="Faixa de ${esc(range(lo, hi, brl))} contra a meta de ${esc(brl(target))}">
              <div class="track"><i class="band" style="left:${pct(lo)};width:calc(${pct(hi)} - ${pct(lo)})"></i><i class="goal" style="left:${pct(target)}"></i></div>
              <div class="meter-labels"><span style="left:${pct(target)}">${esc(B.target_label || 'Meta')}: ${esc(brl(target))}</span></div>
              <p>${esc(verdict)}</p>
            </div>`
          : ''
      }
      ${rows
        .map(
          g => `<div class="budget-group"><h3>${esc(g.name)}<span>${esc(range(sum(g.items, 'lo'), sum(g.items, 'hi'), brl))}</span></h3>
            <ul>${g.items
              .map(
                i => `<li>
                  <div class="b-main"><b>${esc(i.name)}</b>${i.note ? `<small>${esc(i.note)}</small>` : ''}</div>
                  <span class="st st-${esc(String(i.status).replace(/\s+/g, '-'))}">${esc(statusName[i.status] || i.status)}</span>
                  <div class="b-val"><b>${esc(range(i.lo, i.hi, brl))}</b>${i.own ? `<small>${esc(i.own)}</small>` : ''}</div>
                </li>`,
              )
              .join('')}</ul></div>`,
        )
        .join('')}
      <p class="muted note">Valores por pessoa, dividindo o quarto. Câmbio usado: R$ ${esc(fx.toLocaleString(lang))} por dólar (${esc(B.fx_note || '')}). Os itens em estimativa e a cotar mudam conforme as cotações chegam.</p>`;
  }

  const navItems = [
    ...sections.map(s => ({ id: s.id, label: s.kicker.split('·')[0].trim() })),
    ...(B && B.groups ? [{ id: 'orcamento', label: 'Orçamento' }] : []),
    { id: 'checklist', label: 'Checklist' },
  ];
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
