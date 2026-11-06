// Frames routes and places on screen: the route as large as possible, the card fits the space left.
import * as THREE from 'three';

const MOBILE_WIDTH = 860;

export function createFraming({ camera, card, placeById, defaultDirection, $ }) {
  // the part of the screen not covered by the card, the day bar or the top bar
  function freeRect() {
    const W = innerWidth,
      H = innerHeight,
      cardBox = card.hidden ? null : card.getBoundingClientRect();
    let rect;
    if (W > MOBILE_WIDTH) {
      const weatherOpen = document.body.classList.contains('cond-open');
      rect = { l: cardBox ? cardBox.right + 40 : 40, r: weatherOpen ? W - 430 : W - 170, t: 96, b: H - 104 };
    } else {
      rect = { l: 34, r: W - 64, t: 140, b: cardBox ? cardBox.top - 22 : H - 90 };
    }
    rect.t += 46; // room for the pin bubble above each point
    if (rect.b - rect.t < 120) rect.t = rect.b - 120;
    return rect;
  }

  const _cam = new THREE.PerspectiveCamera();
  function fitView(points, dir, rect) {
    const R = rect || freeRect();
    _cam.copy(camera);
    _cam.aspect = innerWidth / innerHeight;
    _cam.updateProjectionMatrix();
    const d0 = dir.clone().normalize(),
      t = new THREE.Vector3(),
      v = new THREE.Vector3();
    points.forEach(p => t.add(p));
    t.divideScalar(points.length);
    const bbox = (center, dist) => {
      _cam.position.copy(center).addScaledVector(d0, dist);
      _cam.lookAt(center);
      _cam.updateMatrixWorld();
      let x0 = 1e9,
        x1 = -1e9,
        y0 = 1e9,
        y1 = -1e9;
      for (const p of points) {
        v.copy(p).project(_cam);
        const x = ((v.x + 1) / 2) * innerWidth,
          y = ((1 - v.y) / 2) * innerHeight;
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
      return { x0, x1, y0, y1 };
    };
    let dist = 40;
    for (let it = 0; it < 8; it++) {
      let lo = 3,
        hi = 420;
      for (let k = 0; k < 26; k++) {
        const mid = (lo + hi) / 2,
          b = bbox(t, mid);
        if (b.x1 - b.x0 <= R.r - R.l && b.y1 - b.y0 <= R.b - R.t) hi = mid;
        else lo = mid;
      }
      dist = hi;
      const b = bbox(t, dist),
        dx = (b.x0 + b.x1) / 2 - (R.l + R.r) / 2,
        dy = (b.y0 + b.y1) / 2 - (R.t + R.b) / 2;
      const metersPerPixel = (2 * dist * Math.tan((camera.fov * Math.PI) / 360)) / innerHeight;
      const right = new THREE.Vector3(d0.z, 0, -d0.x).normalize(),
        forward = new THREE.Vector3(-d0.x, 0, -d0.z).normalize();
      t.addScaledVector(right, dx * metersPerPixel).addScaledVector(
        forward,
        (-dy * metersPerPixel) / Math.max(0.3, d0.y),
      );
    }
    return { target: t, dist: Math.max(4, dist) };
  }

  function uiObstacles() {
    return ['.brand', '.search', '.links', '#legend', '.zoom', '#days', '#cond']
      .map(q => $(q))
      .filter(Boolean)
      .map(el => el.getBoundingClientRect())
      .filter(r => r.width > 0 && r.height > 0);
  }
  function projAt(center, d0, dist, list) {
    _cam.position.copy(center).addScaledVector(d0, dist);
    _cam.lookAt(center);
    _cam.updateMatrixWorld();
    const v = new THREE.Vector3();
    return list.map(p => {
      v.copy(p).project(_cam);
      return { x: ((v.x + 1) / 2) * innerWidth, y: ((1 - v.y) / 2) * innerHeight };
    });
  }
  // share of the screen that would show the empty background
  const _ray = new THREE.Vector3();
  function voidShare() {
    let bad = 0,
      n = 0;
    const limit = 330;
    for (const nx of [-1, -0.6, -0.2, 0.2, 0.6, 1])
      for (const ny of [-1, -0.5, 0, 0.5, 0.85, 1]) {
        n++;
        _ray.set(nx, ny, 0.5).unproject(_cam).sub(_cam.position).normalize();
        if (_ray.y > -0.02) {
          bad++;
          continue;
        }
        const k = (-0.03 - _cam.position.y) / _ray.y;
        if (Math.abs(_cam.position.x + _ray.x * k) > limit || Math.abs(_cam.position.z + _ray.z * k) > limit) bad++;
      }
    return bad / n;
  }
  function layoutFor(route, pinIds) {
    const W = innerWidth,
      H = innerHeight,
      d0 = defaultDirection.clone().normalize();
    _cam.copy(camera);
    _cam.aspect = W / H;
    _cam.updateProjectionMatrix();
    const pins = pinIds.map(id => placeById[id].v),
      tops = pinIds.map(id => placeById[id].vt || placeById[id].v);
    const all = route.concat(pins, tops);
    if (W <= MOBILE_WIDTH) {
      // phone: bottom sheet up to 42% of the screen, route in the space above
      card.style.cssText = 'visibility:hidden;max-height:none';
      const natural = card.offsetHeight;
      card.style.cssText = '';
      const sheet = Math.max(190, Math.min(natural, H * 0.42)),
        topUI = $('.search').getBoundingClientRect().bottom;
      const fit = fitView(all, d0, { l: 30, r: W - 62, t: topUI + 64, b: H - sheet - 30 });
      return { target: fit.target, dist: fit.dist, card: { x: 8, y: H - sheet - 8, w: W - 16, h: sheet } };
    }
    const CELL = 12,
      cols = Math.ceil(W / CELL),
      rows = Math.ceil(H / CELL),
      obstacles = uiObstacles();
    const topUI = Math.max(...['.brand', '.search', '.links'].map(q => $(q).getBoundingClientRect().bottom), 56);
    const dayBar = obstacles.find(r => r.top > H * 0.7 && r.left < W / 2 && r.right > W / 2),
      botUI = dayBar ? dayBar.top : H;
    const R0 = { l: 20, r: W - 20, t: topUI + 52, b: botUI - 14 };
    card.style.cssText = 'visibility:hidden;left:0;top:0;right:auto;bottom:auto;max-height:none;width:460px';
    const natural = card.offsetHeight;
    card.style.cssText = '';
    const minW = 330,
      maxW = 480,
      minH = 240,
      base = fitView(all, d0, R0);
    const right = new THREE.Vector3(d0.z, 0, -d0.x).normalize(),
      forward = new THREE.Vector3(-d0.x, 0, -d0.z).normalize(),
      sinP = Math.max(0.3, d0.y);
    let best = null,
      fallback = null;
    for (const s of [1, 0.94, 0.88, 0.82, 0.76, 0.7, 0.64, 0.58, 0.52, 0.46, 0.4]) {
      const dist = base.dist / s;
      for (const ax of [0, 0.5, 1])
        for (const ay of [0, 0.5, 1]) {
          const center = base.target.clone();
          for (let it = 0; it < 3; it++) {
            const P = projAt(center, d0, dist, all);
            let x0 = 1e9,
              x1 = -1e9,
              y0 = 1e9,
              y1 = -1e9;
            P.forEach(p => {
              x0 = Math.min(x0, p.x);
              x1 = Math.max(x1, p.x);
              y0 = Math.min(y0, p.y);
              y1 = Math.max(y1, p.y);
            });
            const wx = R0.l + ax * Math.max(0, R0.r - R0.l - (x1 - x0)),
              wy = R0.t + ay * Math.max(0, R0.b - R0.t - (y1 - y0));
            const unit = (2 * dist * Math.tan((camera.fov * Math.PI) / 360)) / H;
            center.addScaledVector(right, (x0 - wx) * unit).addScaledVector(forward, (-(y0 - wy) * unit) / sinP);
          }
          const occupied = new Uint8Array(cols * rows);
          const mark = (xa, ya, xb, yb) => {
            const c0 = Math.max(0, Math.floor(xa / CELL)),
              c1 = Math.min(cols - 1, Math.floor(xb / CELL)),
              r0 = Math.max(0, Math.floor(ya / CELL)),
              r1 = Math.min(rows - 1, Math.floor(yb / CELL));
            for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) occupied[r * cols + c] = 1;
          };
          const RP = projAt(center, d0, dist, route),
            PP = projAt(center, d0, dist, pins),
            TP = projAt(center, d0, dist, tops);
          let bad = false;
          const outside = p => p.x < 34 || p.x > W - 34 || p.y < topUI + 24 || p.y > botUI - 24;
          const hitsUI = p =>
            obstacles.some(o => p.x > o.left - 10 && p.x < o.right + 10 && p.y > o.top - 10 && p.y < o.bottom + 10);
          for (let i = 0; i < RP.length; i++) {
            const a = RP[i],
              b = RP[Math.min(i + 1, RP.length - 1)],
              L = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 6));
            for (let k = 0; k <= L; k++) {
              const p = { x: a.x + ((b.x - a.x) * k) / L, y: a.y + ((b.y - a.y) * k) / L };
              if (outside(p) || hitsUI(p)) bad = true;
              mark(p.x - 14, p.y - 14, p.x + 14, p.y + 14);
            }
          }
          PP.forEach((p, i) => {
            const labelWidth = Math.min(220, 46 + placeById[pinIds[i]].name.length * 7.4);
            const box = { l: p.x - 24, t: Math.min(p.y - 66, TP[i].y - 46), r: p.x + labelWidth, b: p.y + 8 };
            if (
              box.l < 8 ||
              box.r > W - 8 ||
              box.t < topUI + 6 ||
              box.b > botUI - 6 ||
              obstacles.some(
                o => box.l < o.right + 6 && box.r > o.left - 6 && box.t < o.bottom + 6 && box.b > o.top - 6,
              )
            )
              bad = true;
            mark(box.l, box.t, box.r, box.b);
          });
          if (bad) continue;
          for (const o of obstacles) mark(o.left - 6, o.top - 6, o.right + 6, o.bottom + 6);
          mark(0, 0, W, topUI + 4);
          if (dayBar) mark(0, botUI - 4, W, H);
          mark(0, 0, 7, H);
          mark(W - 7, 0, W, H);
          mark(0, H - 7, W, H);
          // largest free rectangle, by row histogram
          const heights = new Int32Array(cols);
          let candidate = null;
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) heights[c] = occupied[r * cols + c] ? 0 : heights[c] + 1;
            const stack = [];
            for (let c = 0; c <= cols; c++) {
              const h = c < cols ? heights[c] : 0;
              let start = c;
              while (stack.length && stack[stack.length - 1][1] >= h) {
                const [col, hgt] = stack.pop(),
                  w = (c - col) * CELL,
                  tall = hgt * CELL;
                if (w >= minW && tall >= minH) {
                  const score = Math.min(w, maxW) * Math.min(tall, natural + 4);
                  if (!candidate || score > candidate.score)
                    candidate = { score, x: col * CELL, y: (r - hgt + 1) * CELL, w, h: tall };
                }
                start = col;
              }
              stack.push([start, h]);
            }
          }
          if (!candidate) continue;
          projAt(center, d0, dist, []);
          const empty = voidShare(),
            option = { s, t: center.clone(), dist, card: candidate, vf: empty };
          if (empty === 0) {
            if (!best || best.vf > 0 || candidate.score > best.card.score) best = option;
          } else if (
            !fallback ||
            empty < fallback.vf - 1e-6 ||
            (Math.abs(empty - fallback.vf) < 1e-6 && s > fallback.s)
          )
            fallback = option;
        }
      if (best && best.vf === 0) break;
    }
    if (!best) best = fallback;
    if (!best) {
      const width = Math.min(maxW, 420),
        top = topUI + 12,
        tall = Math.min(natural, botUI - topUI - 30);
      const fit = fitView(all, d0, { l: 16 + width + 40, r: W - 40, t: topUI + 70, b: botUI - 30 });
      return { target: fit.target, dist: fit.dist, card: { x: 16, y: top, w: width, h: tall } };
    }
    const E = best.card,
      w = Math.min(maxW, E.w),
      h = Math.min(natural, E.h);
    return {
      target: best.t,
      dist: best.dist,
      card: {
        x: E.x < W - (E.x + E.w) ? E.x : E.x + E.w - w,
        y: E.y - topUI < botUI - (E.y + E.h) ? E.y : E.y + E.h - h,
        w,
        h,
      },
    };
  }

  return { freeRect, fitView, layoutFor };
}
