// Day-by-day itinerary page, built from data/trip.js
(function () {
  const T = window.TRIP;
  const ACTIVE_LINE_PX = 170;
  const esc = text =>
    String(text ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const byId = Object.fromEntries(T.places.map(p => [p.id, p]));
  const nav = document.getElementById('daynav'),
    box = document.getElementById('days');

  applyText(document);
  document.getElementById('heroDates').textContent = `${fmtDate(T.start)} · ${fmtDate(T.end)}`;
  document.getElementById('heroTitle').textContent = t('dayByDay', { t: T.title });
  document.getElementById('toTop').onclick = event => {
    event.preventDefault();
    scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cover = T.places.find(p => p.photo);
  if (cover) {
    const image = document.createElement('img');
    image.src = `img/${cover.id}.jpg`;
    image.alt = cover.name;
    document.getElementById('hero').prepend(image);
  } else document.getElementById('hero').classList.add('nocover');

  const downloads = document.getElementById('downloadList');
  downloads.innerHTML = T.downloads
    .map(
      name =>
        `<a class="dl" href="files/${encodeURIComponent(name)}" download><span class="ext pdf">${esc(name.split('.').pop().toUpperCase())}</span><span><b>${esc(name)}</b></span></a>`,
    )
    .join('');
  if (!T.downloads.length) document.getElementById('downloadsLink').hidden = true;

  for (const day of T.days) {
    const link = document.createElement('a');
    link.href = '#dia-' + day.n;
    link.innerHTML = `<i style="background:${day.color}"></i>${esc(t('day', { n: day.n }))}`;
    nav.appendChild(link);

    const photos = [...new Set(day.items.map(i => i.place).filter(Boolean))]
      .map(id => byId[id])
      .filter(p => p && p.photo);
    const section = document.createElement('section');
    section.className = 'day';
    section.id = 'dia-' + day.n;
    section.style.setProperty('--c', day.color);
    section.innerHTML = `
      <div class="day-head">
        <p class="kicker">${esc(fmtDate(day.date))} · ${esc(day.area)}</p>
        <h2><span>${esc(t('day', { n: day.n }))}</span> ${esc(day.title)}</h2>
        <a class="maplink" href="index.html#dia-${day.n}">${esc(t('seeRoute'))}</a>
      </div>
      ${
        photos.length
          ? `<div class="strip">${photos
              .slice(0, 4)
              .map(
                p =>
                  `<a href="index.html#lugar-${p.id}" class="ph"><img loading="lazy" src="img/${p.id}.jpg" alt="${esc(p.name)}" style="object-position:${esc(p.photo_focus || 'center')}"><span>${esc(p.name)}</span></a>`,
              )
              .join('')}</div>`
          : ''
      }
      <ol class="items">
        ${day.items
          .map(item => {
            const place = item.place && byId[item.place];
            return `<li><time>${esc(fmtTime(item.time))}</time><span class="tag">${esc(typeLabel(item.type))}</span>
            <span class="txt">${place ? `<a href="index.html#lugar-${place.id}">${esc(item.text)}</a>` : esc(item.text)}</span></li>`;
          })
          .join('')}
      </ol>`;
    box.appendChild(section);
  }

  // active day: the last one whose top already passed the fixed bar
  const links = [...nav.querySelectorAll('a')],
    sections = [...document.querySelectorAll('.day')];
  let currentId = null,
    ticking = false;
  function mark() {
    ticking = false;
    let id = sections[0]?.id;
    for (const section of sections) if (section.getBoundingClientRect().top <= ACTIVE_LINE_PX) id = section.id;
    if (id === currentId) return;
    currentId = id;
    links.forEach(link => link.removeAttribute('aria-current'));
    const link = links.find(a => a.getAttribute('href') === '#' + id);
    if (link) {
      link.setAttribute('aria-current', 'true');
      // only the day bar scrolls: scrollIntoView here would fight the page scroll
      nav.scrollTo({ left: link.offsetLeft - nav.clientWidth / 2 + link.offsetWidth / 2, behavior: 'smooth' });
    }
  }
  addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(mark);
      }
    },
    { passive: true },
  );
  mark();
  // the content is built after load, so the jump to #dia-N has to happen again
  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  }
})();
