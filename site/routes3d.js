// The 3D line of each day, and the arcs between maps on the overview.
import * as THREE from 'three';

const ANIMATION_MS = 1600;

export function createRoutes({ T, state, root, world, map, isOverview, mapById, placeById, dayStops }) {
  const routes = [];
  let routeAnimation = null;
  const LINE_LIFT = 0.3;
  const TUBE_NEAR = 42; // closer than this, the thick route would cover the map

  function tube(points, radius, material, drop = 0) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p.x, p.y - drop, p.z)));
    return new THREE.Mesh(new THREE.TubeGeometry(curve, points.length, radius, 10, false), material);
  }
  function addRoute(day, base, color, lifted = true) {
    const curve = new THREE.CatmullRomCurve3(base, false, 'centripetal');
    const points = curve
      .getSpacedPoints(Math.max(200, base.length * 8))
      .map(v => new THREE.Vector3(v.x, lifted ? Math.max(0, world().yAt(v.x, v.z)) + LINE_LIFT : v.y, v.z));
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.25,
      roughness: 0.5,
    });
    const outline = new THREE.MeshStandardMaterial({ color: T.palette.card, roughness: 0.6 });
    const parts = [
      tube(points, 0.17, material),
      tube(points, 0.27, outline, 0.14),
      tube(points, 0.07, material, 0.2),
      tube(points, 0.115, outline, 0.27),
    ];
    parts.forEach(part => {
      part.visible = false;
      root.add(part);
    });
    parts[0].castShadow = lifted;
    routes.push({
      day,
      parts,
      on: false,
      total: parts[0].geometry.index.count,
      pts: points.filter((_, i) => i % 12 === 0),
    });
  }
  function buildRoutes() {
    routes.length = 0;
    if (isOverview()) return buildTripArcs();
    for (const day of T.days)
      for (const leg of day.legs) {
        if (leg.map !== map().id || leg.line.length < 2) continue;
        addRoute(
          day.n,
          leg.line.map(([lat, lon]) => {
            const v = world().W3(lat, lon);
            return new THREE.Vector3(v.x, 0, v.z);
          }),
          day.color,
        );
      }
  }
  function buildTripArcs() {
    const seen = new Set();
    for (const day of T.days) {
      const previous = T.days[day.n - 2];
      const chain = [...(previous ? [previous.legs.at(-1)?.map ?? previous.map] : []), ...day.legs.map(leg => leg.map)];
      for (let i = 1; i < chain.length; i++) {
        const key = chain[i - 1] + chain[i];
        if (chain[i - 1] === chain[i] || seen.has(key)) continue;
        seen.add(key);
        const a = world().W3(...mapById[chain[i - 1]].center),
          b = world().W3(...mapById[chain[i]].center);
        const middle = a.clone().add(b).multiplyScalar(0.5);
        middle.y = Math.max(a.y, b.y) + a.distanceTo(b) * 0.25;
        addRoute(day.n, [a, middle, b], day.color, false);
      }
    }
  }
  function showRoute(n) {
    routeAnimation = null;
    for (const route of routes) {
      route.on = route.day === n;
      if (route.on) {
        route.parts.forEach(part => part.geometry.setDrawRange(0, 0));
        routeAnimation = { t0: performance.now() };
      }
    }
  }
  function routeDetail(cameraDistance) {
    const near = cameraDistance < TUBE_NEAR;
    const showAllArcs = isOverview() && !state.day;
    for (const route of routes) {
      const visible = route.on || showAllArcs;
      route.parts[0].visible = route.parts[1].visible = visible && !near;
      route.parts[2].visible = route.parts[3].visible = visible && near;
    }
  }
  const dayLine = n => {
    const line = routes.filter(route => route.day === n).flatMap(route => route.pts);
    return line.length ? line : dayStops(n).map(id => placeById[id].v);
  };

  function animate(now) {
    if (!routeAnimation) return;
    const k = Math.min(1, (now - routeAnimation.t0) / ANIMATION_MS);
    for (const route of routes)
      if (route.on) {
        const count = Math.floor((route.total * k) / 3) * 3;
        route.parts.forEach(part => part.geometry.setDrawRange(0, count));
      }
    if (k >= 1) routeAnimation = null;
  }
  return { buildRoutes, showRoute, routeDetail, dayLine, animate };
}
