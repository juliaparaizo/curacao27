// Photo callouts beside the route of a day, joined to their pins by a line.
export function createCallouts({
  card,
  state,
  overlay,
  leaders,
  scr,
  dayLine,
  dayStops,
  placeById,
  isOverview,
  esc,
  go,
  mobileWidth,
}) {
  const calloutPool = [];
  function calloutEl(i) {
    if (!calloutPool[i]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'callout';
      overlay.appendChild(button);
      calloutPool[i] = button;
    }
    return calloutPool[i];
  }
  function layoutCallouts(strong) {
    let lines = '',
      used = 0;
    if (state.day && innerWidth > mobileWidth && !state.sel && !state.story && !isOverview()) {
      const W = 204,
        H = 196,
        placed = [];
      const blocked = [
        { x: innerWidth - 232, y: 60, w: 232, h: 220 },
        { x: innerWidth / 2 - 370, y: innerHeight - 80, w: 740, h: 80 },
      ];
      if (!card.hidden) {
        const box = card.getBoundingClientRect();
        blocked.push({ x: box.left - 10, y: box.top - 10, w: box.width + 20, h: box.height + 20 });
      }
      const line = [];
      const points = dayLine(state.day).map(scr);
      points.forEach((a, i) => {
        const b = points[Math.min(i + 1, points.length - 1)];
        for (let k = 0; k < 6; k++) line.push({ x: a.x + ((b.x - a.x) * k) / 6, y: a.y + ((b.y - a.y) * k) / 6 });
      });
      const hits = r =>
        placed
          .concat(blocked, strong)
          .some(box => r.x < box.x + box.w && box.x < r.x + r.w && r.y < box.y + box.h && box.y < r.y + r.h);
      for (const place of dayStops(state.day)
        .map(id => placeById[id])
        .filter(p => p.photo)
        .slice(0, 3)) {
        const s = scr(place.v);
        if (!s.ok) continue;
        let pick = null;
        for (const [ox, oy] of [
          [70, -H - 40],
          [-W - 70, -H - 40],
          [90, -H / 2],
          [-W - 90, -H / 2],
          [70, 40],
          [-W - 70, 40],
          [230, -H - 20],
          [-W - 230, -H - 20],
          [260, 20],
          [-W - 260, 20],
        ]) {
          const r = { x: s.x + ox, y: s.y + oy, w: W, h: H };
          if (r.x < 16 || r.y < 76 || r.x + W > innerWidth - 12 || r.y + H > innerHeight - 12 || hits(r)) continue;
          if (line.some(q => q.x > r.x - 8 && q.x < r.x + W + 8 && q.y > r.y - 8 && q.y < r.y + H + 8)) continue;
          pick = r;
          break;
        }
        if (!pick) continue;
        placed.push(pick);
        const callout = calloutEl(used);
        callout.style.display = '';
        callout.style.transform = `translate(${pick.x}px,${pick.y}px)`;
        const key = `${place.id}:${state.day}`;
        if (callout.dataset.id !== key) {
          callout.dataset.id = key;
          callout.innerHTML = `<b>${esc(place.name)}</b><img src="img/${place.id}.jpg" alt="" style="object-position:${esc(place.photo_focus || 'center')}"><small>${esc(
            place.items
              .filter(i => i.day === state.day)
              .map(i => i.time)
              .join(' · '),
          )}</small>`;
          callout.onclick = event => {
            event.stopPropagation();
            go('lugar-' + place.id);
          };
        }
        const ax = pick.x + (s.x > pick.x + W ? W : s.x < pick.x ? 0 : W / 2),
          ay = pick.y + (s.y > pick.y + H ? H : s.y < pick.y ? 0 : H / 2);
        lines += `<line x1="${ax}" y1="${ay}" x2="${s.x}" y2="${s.y}"/>`;
        used++;
      }
    }
    for (let i = used; i < calloutPool.length; i++) calloutPool[i].style.display = 'none';
    leaders.innerHTML = lines;
  }

  return layoutCallouts;
}
