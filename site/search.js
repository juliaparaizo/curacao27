// Search across places, stories and days, ignoring accents.
const norm = text =>
  String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export function initSearch({ T, $, esc, go, typeName, typeColor }) {
  const q = $('#q'),
    results = $('#results'),
    qclear = $('#qclear');
  const INDEX = [
    ...T.places.map(p => ({
      kind: 'lugar',
      id: p.id,
      title: p.name,
      meta:
        typeName(p.type) +
        (p.items.length ? ' · ' + t('day', { n: [...new Set(p.items.map(i => i.day))].join(', ') }) : ''),
      color: typeColor(p.type),
      text: norm([p.name, p.desc, typeName(p.type), p.items.map(i => i.text).join(' ')].join(' ')),
    })),
    ...T.stories.map(s => ({
      kind: 'regiao',
      id: s.id,
      title: s.title,
      meta: t('region'),
      color: '#1C221E',
      text: norm(s.title + ' ' + s.story.join(' ')),
    })),
    ...T.days.map(d => ({
      kind: 'dia',
      id: String(d.n),
      title: `${t('day', { n: d.n })}${d.title ? ' · ' + d.title : ''}`,
      meta: fmtDate(d.date),
      color: d.color,
      text: norm(
        `${t('day', { n: d.n })} ${d.title} ${d.area} ${fmtDate(d.date)} ${d.items.map(i => i.text).join(' ')}`,
      ),
    })),
  ];
  let hits = [],
    highlighted = 0;
  function hideResults() {
    results.hidden = true;
    q.setAttribute('aria-expanded', 'false');
  }
  function search() {
    const text = norm(q.value.trim());
    qclear.hidden = !q.value;
    if (!text) {
      hideResults();
      return;
    }
    const words = text.split(/\s+/);
    hits = INDEX.map(entry => {
      let score = 0;
      for (const word of words) {
        if (!entry.text.includes(word)) return null;
        score += norm(entry.title).includes(word) ? 3 : 1;
      }
      return { entry, score };
    })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(hit => hit.entry);
    highlighted = 0;
    results.innerHTML = hits.length
      ? hits
          .map(
            (hit, i) =>
              `<li role="option" id="r${i}" aria-selected="${i === 0}" data-i="${i}"><span class="dot" style="background:${hit.color}"></span>${esc(hit.title)}<span class="meta">${esc(hit.meta)}</span></li>`,
          )
          .join('')
      : `<li class="empty">${esc(t('nothingFound'))}</li>`;
    results.hidden = false;
    q.setAttribute('aria-expanded', 'true');
    results.querySelectorAll('li[data-i]').forEach(li => {
      li.onclick = () => pick(+li.dataset.i);
    });
  }
  function pick(i) {
    const hit = hits[i];
    if (!hit) return;
    hideResults();
    q.blur();
    go(hit.kind === 'dia' ? 'dia-' + hit.id : hit.kind + '-' + hit.id);
  }
  q.addEventListener('input', search);
  q.addEventListener('focus', () => {
    if (q.value) search();
  });
  q.addEventListener('keydown', event => {
    if (results.hidden) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      highlighted = (highlighted + (event.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length;
      results.querySelectorAll('li[data-i]').forEach((li, i) => li.setAttribute('aria-selected', i === highlighted));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      pick(highlighted);
    }
  });
  qclear.onclick = () => {
    q.value = '';
    qclear.hidden = true;
    hideResults();
    q.focus();
  };
  document.addEventListener('click', event => {
    if (!event.target.closest('.search')) hideResults();
  });

  return { isOpen: () => !results.hidden, hide: hideResults };
}
