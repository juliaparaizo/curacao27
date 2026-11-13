// The cards that open for a place, a story or a day.
export function createCards({
  placeById,
  T,
  $,
  esc,
  card,
  bindGo,
  closeCard,
  modules,
  typeName,
  typeColor,
  tagBackground,
  dayByNumber,
  mapById,
}) {
  const tag = type => `<span class="tag" style="background:${tagBackground(type)}">${esc(typeName(type))}</span>`;
  // Official TikTok player (the video stays on TikTok, credited to its creator). Accepts one link or a list.
  const tiktokEmbed = links =>
    (Array.isArray(links) ? links : links ? [links] : [])
      .map(link => {
        const match = String(link).match(/tiktok\.com\/@([\w.]+)\/video\/(\d+)/);
        if (!match) return '';
        return `<figure class="tiktok"><iframe src="https://www.tiktok.com/player/v1/${match[2]}?description=1&music_info=0&rel=0" allow="fullscreen; encrypted-media" loading="lazy" title="Vídeo de @${esc(match[1])} no TikTok"></iframe><figcaption><a href="${esc(link)}" target="_blank" rel="noopener">@${esc(match[1])} no TikTok ↗</a></figcaption></figure>`;
      })
      .join('');
  function openCard(content, photo, focus) {
    card.hidden = false;
    card.style.cssText = '';
    card.className = 'card' + (photo ? '' : ' nophoto');
    card.innerHTML =
      (photo
        ? `<div class="ph"><img src="img/${photo}.jpg" alt="" style="object-position:${esc(focus || 'center')}"></div>`
        : '') +
      `<div class="body">${content}</div><button type="button" class="close" id="closeCard" aria-label="${esc(t('close'))}">✕</button>`;
    document.body.classList.add('card-open');
    $('#closeCard').onclick = closeCard;
    bindGo(card);
  }
  function cardPlace(place) {
    const items = place.items.slice().sort((a, b) => a.day - b.day);
    const tags = [
      tag(place.type),
      ...[...new Set(items.map(i => i.day))].map(
        n => `<span class="tag" style="background:var(--soft)">${esc(t('day', { n }))}</span>`,
      ),
    ];
    const when = items.length
      ? `<ul class="when">${items.map(i => `<li><button type="button" data-go="dia-${i.day}" style="background:${dayByNumber(i.day).color}">${esc(t('day', { n: i.day }))}${i.time ? ' · ' + esc(i.time) : ''}</button><span>${esc(i.text)}</span></li>`).join('')}</ul>`
      : '';
    openCard(
      `<p class="kicker">${esc(typeName(place.type))}</p><h2 id="cardTitle">${esc(place.name)}</h2>${place.desc ? `<p>${esc(place.desc)}</p>` : ''}
    <div id="cpl">${modules().surf?.placeHTML(place) ?? ''}</div>
    ${place.tip ? `<p style="color:var(--ink)"><b>${esc(t('tip'))}</b> ${esc(place.tip)}</p>` : ''}
    ${tiktokEmbed(place.tiktok)}
    ${placeById.home && place.id !== 'home' ? `<p class="kmline">${esc(t('fromBase', { d: fmtKm(kmBetween(placeById.home, place)), t: placeById.home.name }))}</p>` : ''}
    <div class="tags">${tags.join('')}</div>${when}
    <div class="actions"><a class="btn primary" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.maps)}" target="_blank" rel="noopener">${esc(t('openMaps'))}</a><a class="btn" href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}&travelmode=driving" target="_blank" rel="noopener">${esc(t('routeHere'))}</a></div>`,
      place.photo ? place.id : null,
      place.photo_focus,
    );
  }
  function cardStory(story) {
    openCard(
      `<p class="kicker">${esc(t('storyOf'))}</p><h2 id="cardTitle">${esc(story.title)}</h2>${story.story.map(s => `<p>${esc(s)}</p>`).join('')}
    <div class="tags">${(story.places || [])
      .filter(id => placeById[id])
      .map(
        id =>
          `<button type="button" class="tag" style="background:var(--soft-accent);cursor:pointer" data-go="lugar-${id}">${esc(placeById[id].name)}</button>`,
      )
      .join('')}</div>`,
      null,
    );
  }
  function cardDay(n) {
    const day = dayByNumber(n);
    const hops = dayHops(day);
    const base = placeById.home;
    const items = day.items
      .map(
        (i, k) =>
          `<li><span class="t">${esc(i.time)}</span><span><span class="chip" style="background:${typeColor(i.type)}">${esc(typeName(i.type))}</span>${i.place ? `<button type="button" data-go="lugar-${i.place}">${esc(i.text)}</button>` : esc(i.text)}${hops.byItem[k] ? `<span class="km">↳ ${esc(fmtKm(hops.byItem[k]))}</span>` : ''}</span></li>`,
      )
      .join('');
    const kmLine = hops.total >= 0.1
      ? `<p class="kmline">${hops.back && base ? `${esc(t('backTo', { t: base.name }))}: ${esc(fmtKm(hops.back))} · ` : ''}<b>${esc(t('dayTotal'))}: ${esc(fmtKm(hops.total))}</b></p>`
      : '';
    const legs = day.crosses
      ? `<p>${esc(t('crossing'))}</p><div class="tags">${day.legs.map(leg => `<button type="button" class="tag" style="background:var(--soft-accent);cursor:pointer" data-go="dia-${n}-${leg.map}">${esc(mapById[leg.map].title)}</button>`).join('')}</div>`
      : '';
    const title = `<span style="color:${day.color}">${esc(t('day', { n }))}</span>${day.title ? ' · ' + esc(day.title) : ''}`;
    openCard(
      `<p class="kicker">${esc(fmtDate(day.date))} · ${esc(day.area)}</p><h2 id="cardTitle">${title}</h2><div id="chj">${modules().live.dayHTML(n)}</div><div id="cdy">${modules().weather.dayHTML(n)}</div>${legs}
    <ul class="list">${items}</ul>${kmLine}
    <div class="actions">${n > 1 ? `<button type="button" class="btn" data-go="dia-${n - 1}">← ${esc(t('day', { n: n - 1 }))}</button>` : ''}${n < T.days.length ? `<button type="button" class="btn" data-go="dia-${n + 1}">${esc(t('day', { n: n + 1 }))} →</button>` : ''}<a class="btn primary" href="roteiro.html#dia-${n}">${esc(t('viewItinerary'))}</a></div>`,
      null,
    );
    card.classList.add('is-day');
    modules().live.decorateDayList(n);
  }

  return { cardPlace, cardStory, cardDay };
}
