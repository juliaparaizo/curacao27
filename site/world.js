// The 3D world of one map: terrain, surroundings, sea, vegetation, buildings and landmarks.
import * as THREE from 'three';
import { mergeGeometries } from './vendor/BufferGeometryUtils.js';
import { planLandmarks } from './landmarks.js';

const OCEAN_SIZE = 1400;
const EDGE_CELLS = 24;
const MAX_RUNWAYS = 8;
const RUNWAY_MAX_SIDE_KM = 150;
const CONTEXT_DROP = 0.12;
const CONTEXT_OVERLAP = 1;
const CONTEXT_HIDDEN_DROP = 1.5;

const std = (color, options = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...options });

async function fetchChecked(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response;
}
const fetchJson = async url => (await fetchChecked(url)).json();
const fetchBytes = async url => (await fetchChecked(url)).arrayBuffer();

async function loadTexture(url, renderer) {
  const texture = await new THREE.TextureLoader().loadAsync(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

const seaFloor = cellsFromCoast => -0.03 - Math.min(cellsFromCoast, 60) * 0.012;

function seededRandom(seed = 11) {
  let state = seed;
  return () => (state = (state * 16807) % 2147483647) / 2147483647;
}

export async function buildWorld(root, renderer, isSmall, mapId, places, customLandmarks, ui = {}) {
  const dir = `data/${mapId}/`;
  const [META, heightBuffer, coastBuffer, SCENE] = await Promise.all([
    fetchJson(dir + 'dem.json'),
    fetchBytes(dir + 'heights.bin'),
    fetchBytes(dir + 'coast.bin'),
    fetchJson(dir + 'scene.json'),
  ]);
  const NX = META.NX,
    NY = META.NY;
  const HEIGHTS = new Uint16Array(heightBuffer),
    COAST = new Uint8Array(coastBuffer);
  const KX = META.km_x * META.scale,
    KY = META.km_y * META.scale;
  const STEP = META.height_step_m;
  const LIFT = (META.scale * META.exaggeration) / 1000; // meters to scene units
  // a map across the antimeridian has longitudes past 180: bring every point into its range
  const unwrap = lon => (lon + 360 <= META.lon1 ? lon + 360 : lon - 360 >= META.lon0 ? lon - 360 : lon);
  const toX = lon => ((unwrap(lon) - META.lon0) / (META.lon1 - META.lon0)) * KX - KX / 2;
  const toZ = lat => ((META.lat1 - lat) / (META.lat1 - META.lat0)) * KY - KY / 2;

  function metersAt(x, z) {
    const gx = ((x + KX / 2) / KX) * (NX - 1),
      gy = ((z + KY / 2) / KY) * (NY - 1);
    const x0 = Math.max(0, Math.min(NX - 2, Math.floor(gx))),
      y0 = Math.max(0, Math.min(NY - 2, Math.floor(gy)));
    const fx = Math.min(1, Math.max(0, gx - x0)),
      fy = Math.min(1, Math.max(0, gy - y0));
    const a = HEIGHTS[y0 * NX + x0],
      b = HEIGHTS[y0 * NX + x0 + 1],
      c = HEIGHTS[(y0 + 1) * NX + x0],
      d = HEIGHTS[(y0 + 1) * NX + x0 + 1];
    return ((a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy) * STEP;
  }
  const yAt = (x, z) => metersAt(x, z) * LIFT;
  const W3 = (lat, lon, lift = 0) => {
    const x = toX(lon),
      z = toZ(lat);
    return new THREE.Vector3(x, Math.max(0, yAt(x, z)) + lift, z);
  };

  /* terrain, with half the triangles on small screens */
  const texture = await loadTexture(dir + 'map.jpg', renderer);
  const stride = isSmall ? 2 : 1,
    SX = Math.floor((NX - 1) / stride),
    SY = Math.floor((NY - 1) / stride);
  const geometry = new THREE.PlaneGeometry((KX * SX * stride) / (NX - 1), (KY * SY * stride) / (NY - 1), SX, SY);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(-(KX - (KX * SX * stride) / (NX - 1)) / 2, 0, -(KY - (KY * SY * stride) / (NY - 1)) / 2);
  const position = geometry.attributes.position,
    uv = geometry.attributes.uv;
  for (let r = 0; r <= SY; r++)
    for (let c = 0; c <= SX; c++) {
      const i = r * (SX + 1) + c,
        cell = r * stride * NX + c * stride,
        steps = HEIGHTS[cell];
      const border = Math.min(c * stride, r * stride, NX - 1 - c * stride, NY - 1 - r * stride),
        fade = META.context ? 1 : Math.min(1, border / EDGE_CELLS);
      position.setY(
        i,
        steps > 0 ? steps * STEP * LIFT * (META.overview ? fade : 1) : seaFloor(COAST[cell]) * fade - 0.75 * (1 - fade),
      );
      uv.setXY(i, (c * stride) / (NX - 1), 1 - (r * stride) / (NY - 1));
    }
  geometry.computeVertexNormals();
  const terrain = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.93, metalness: 0 }),
  );
  terrain.receiveShadow = true;
  terrain.castShadow = !isSmall;
  root.add(terrain);

  const ocean = new THREE.Mesh(
    new THREE.PlaneGeometry(OCEAN_SIZE, OCEAN_SIZE).rotateX(-Math.PI / 2),
    std(META.ocean, { roughness: 0.9 }),
  );
  ocean.position.y = META.has_sea ? -0.77 : -1.6;
  ocean.receiveShadow = true;
  root.add(ocean);

  /* the land around the map, so inland maps have no cut edge */
  if (META.context) {
    const C = META.context;
    const [buffer, coastBytes, surroundings] = await Promise.all([
      fetchBytes(dir + 'context-heights.bin'),
      fetchBytes(dir + 'context-coast.bin'),
      loadTexture(dir + 'context.jpg', renderer),
    ]);
    const steps = new Uint16Array(buffer),
      coast = new Uint8Array(coastBytes);
    const coastScale = (C.lon1 - C.lon0) / C.NX / ((META.lon1 - META.lon0) / NX);
    const x0 = toX(C.lon0),
      x1 = toX(C.lon1),
      z0 = toZ(C.lat1),
      z1 = toZ(C.lat0);
    const ring = new THREE.PlaneGeometry(x1 - x0, z1 - z0, C.NX - 1, C.NY - 1).rotateX(-Math.PI / 2);
    ring.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
    const points = ring.attributes.position;
    for (let i = 0; i < points.count; i++) {
      const inside =
        Math.abs(points.getX(i)) < KX / 2 - CONTEXT_OVERLAP && Math.abs(points.getZ(i)) < KY / 2 - CONTEXT_OVERLAP;
      const height = steps[i] > 0 ? steps[i] * STEP * LIFT : seaFloor(coast[i] * coastScale) + CONTEXT_DROP;
      points.setY(i, height - (inside ? CONTEXT_HIDDEN_DROP : CONTEXT_DROP));
    }
    ring.computeVertexNormals();
    const surroundingsMesh = new THREE.Mesh(
      ring,
      new THREE.MeshStandardMaterial({ map: surroundings, roughness: 0.93, metalness: 0 }),
    );
    surroundingsMesh.receiveShadow = true;
    root.add(surroundingsMesh);
  }

  const random = seededRandom();
  const matrix = new THREE.Matrix4(),
    rotation = new THREE.Quaternion(),
    size = new THREE.Vector3(),
    up = new THREE.Vector3(0, 1, 0),
    color = new THREE.Color();
  const add = (parent, shape, material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(shape, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = !isSmall;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const group = (lat, lon, degrees = 0, lift = 0) => {
    const g = new THREE.Group();
    g.position.copy(W3(lat, lon, lift));
    g.rotation.y = (degrees * Math.PI) / 180;
    root.add(g);
    return g;
  };

  const palmLeaves = (() => {
    const parts = [];
    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.BoxGeometry(0.075, 0.004, 0.016);
      leaf.translate(0.037, 0, 0);
      leaf.rotateZ(-0.45);
      leaf.rotateY((i * Math.PI) / 3 + 0.2);
      leaf.translate(0, 0.13, 0);
      parts.push(leaf);
    }
    return mergeGeometries(parts);
  })();
  const palmTrunk = new THREE.CylinderGeometry(0.004, 0.007, 0.13, 5).translate(0, 0.065, 0);
  function palmField(list, scale = 1) {
    const trunks = new THREE.InstancedMesh(palmTrunk, std('#8A6A44'), list.length);
    const leaves = new THREE.InstancedMesh(palmLeaves, std('#3F8A3E', { side: THREE.DoubleSide }), list.length);
    list.forEach(([lat, lon], i) => {
      const k = (0.8 + random() * 0.5) * scale;
      size.set(k, k, k);
      rotation.setFromAxisAngle(up, random() * 6.28);
      matrix.compose(W3(lat, lon, -0.005), rotation, size);
      trunks.setMatrixAt(i, matrix);
      leaves.setMatrixAt(i, matrix);
      color.setHSL(0.29 + random() * 0.04, 0.5, 0.32 + random() * 0.08);
      leaves.setColorAt(i, color);
    });
    trunks.castShadow = leaves.castShadow = !isSmall;
    root.add(trunks, leaves);
  }

  /* landmarks first: they say where vegetation must stay clear */
  const context = {
    THREE,
    root,
    W3,
    yAt,
    metersAt,
    toX,
    toZ,
    std,
    add,
    group,
    palmField,
    palmLeaves,
    palmTrunk,
    mergeGeometries,
    random,
    isSmall,
    scale: META.scale,
  };
  const plans = await planLandmarks(context, places, customLandmarks);
  const clear = plans.flatMap(plan => plan.clear || []);
  const runways =
    META.km_x <= RUNWAY_MAX_SIDE_KM && META.km_y <= RUNWAY_MAX_SIDE_KM
      ? SCENE.runways
          .map(([a, b, width]) => ({
            ax: toX(a[1]),
            az: toZ(a[0]),
            bx: toX(b[1]),
            bz: toZ(b[0]),
            w: (width * META.scale * 3) / 1000,
          }))
          .sort((a, b) => Math.hypot(b.bx - b.ax, b.bz - b.az) - Math.hypot(a.bx - a.ax, a.bz - a.az))
          .slice(0, MAX_RUNWAYS)
      : [];
  const toSegment = (x, z, r) => {
    const vx = r.bx - r.ax,
      vz = r.bz - r.az;
    const t = Math.max(0, Math.min(1, ((x - r.ax) * vx + (z - r.az) * vz) / (vx * vx + vz * vz || 1)));
    return Math.hypot(x - r.ax - vx * t, z - r.az - vz * t);
  };
  const free = ([lat, lon]) => {
    const x = toX(lon),
      z = toZ(lat);
    return (
      !clear.some(([cx, cz, r]) => Math.hypot(x - cx, z - cz) < r) && !runways.some(r => toSegment(x, z, r) < r.w * 1.5)
    );
  };

  /* trees */
  const trees = SCENE.trees.filter(free);
  if (trees.length) {
    const cone = new THREE.ConeGeometry(0.05, 0.17, 6).translate(0, 0.085, 0),
      ball = new THREE.IcosahedronGeometry(0.065, 0).translate(0, 0.07, 0);
    const material = () => std('#ffffff', { flatShading: true, roughness: 0.9 });
    const conifers = new THREE.InstancedMesh(cone, material(), trees.length),
      broadleaf = new THREE.InstancedMesh(ball, material(), trees.length);
    let c = 0,
      b = 0;
    for (const [lat, lon, conifer] of trees) {
      const k = 0.75 + random() * 0.75;
      size.set(k, k * (0.85 + random() * 0.5), k);
      rotation.setFromAxisAngle(up, random() * 6.28);
      matrix.compose(W3(lat, lon, -0.01), rotation, size);
      if (conifer) {
        conifers.setMatrixAt(c, matrix);
        color.setHSL(0.33 + random() * 0.05, 0.42, 0.17 + random() * 0.07);
        conifers.setColorAt(c++, color);
      } else {
        broadleaf.setMatrixAt(b, matrix);
        color.setHSL(0.26 + random() * 0.07, 0.45, 0.2 + random() * 0.09);
        broadleaf.setColorAt(b++, color);
      }
    }
    conifers.count = c;
    broadleaf.count = b;
    conifers.castShadow = broadleaf.castShadow = !isSmall;
    root.add(conifers, broadleaf);
  }
  const palms = SCENE.palms.filter(free);
  if (palms.length) palmField(palms);

  /* buildings: real footprints when the data has them, at model scale so they read from above */
  const buildings = SCENE.buildings.filter(free);
  if (buildings.length) {
    const box = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
    const mesh = new THREE.InstancedMesh(box, std('#ffffff', { roughness: 0.7 }), buildings.length);
    buildings.forEach(([lat, lon, width, depth, tall, degrees], i) => {
      const known = width > 0,
        high = tall > 25;
      const w = Math.max((width * META.scale) / 1000, high ? 0.05 : 0.035) + (known ? 0 : random() * 0.035);
      const d = Math.max((depth * META.scale) / 1000, high ? 0.04 : 0.035) + (known ? 0 : random() * 0.035);
      const h = tall > 0 ? Math.max(tall * LIFT, 0.025) : 0.025 + random() * 0.03;
      size.set(w, h, d);
      rotation.setFromAxisAngle(up, (-degrees * Math.PI) / 180);
      matrix.compose(W3(lat, lon, -0.01), rotation, size);
      mesh.setMatrixAt(i, matrix);
      const pick = random();
      color.set(
        high
          ? pick < 0.35
            ? '#F2F0EA'
            : pick < 0.6
              ? '#E6E2D8'
              : pick < 0.8
                ? '#CFE0E2'
                : '#E9D9C4'
          : pick < 0.3
            ? '#E9C9A8'
            : pick < 0.6
              ? '#EDEAE2'
              : '#D9D4C8',
      );
      mesh.setColorAt(i, color);
    });
    mesh.castShadow = mesh.receiveShadow = !isSmall;
    root.add(mesh);
  }

  /* runways from real data */
  for (const r of runways) {
    const length = Math.hypot(r.bx - r.ax, r.bz - r.az);
    const strip = new THREE.Group();
    strip.position.set(
      (r.ax + r.bx) / 2,
      Math.max(0, yAt((r.ax + r.bx) / 2, (r.az + r.bz) / 2)) + 0.012,
      (r.az + r.bz) / 2,
    );
    strip.rotation.y = Math.atan2(r.bx - r.ax, r.bz - r.az);
    root.add(strip);
    add(strip, new THREE.BoxGeometry(r.w, 0.02, length), std('#3E4245', { roughness: 0.85 })).castShadow = false;
    add(
      strip,
      new THREE.BoxGeometry(r.w * 0.06, 0.002, length * 0.96),
      std('#F4F1E8', { roughness: 0.6 }),
      0,
      0.011,
      0,
    );
  }

  for (const plan of plans) if (plan.draw) plan.draw();

  /* moving sea surface */
  let waterNormal = null;
  if (META.has_sea) {
    const pixels = 256,
      canvas = document.createElement('canvas');
    canvas.width = canvas.height = pixels;
    const paper = canvas.getContext('2d'),
      image = paper.createImageData(pixels, pixels),
      waves = new Float32Array(pixels * pixels);
    for (let k = 0; k < 26; k++) {
      const fx = 1 + Math.floor(random() * 7),
        fy = 1 + Math.floor(random() * 7),
        phase = random() * 6.28,
        amplitude = 1 / (fx + fy);
      for (let j = 0; j < pixels; j++)
        for (let i = 0; i < pixels; i++)
          waves[j * pixels + i] += amplitude * Math.sin((6.2832 * (fx * i + fy * j)) / pixels + phase);
    }
    for (let j = 0; j < pixels; j++)
      for (let i = 0; i < pixels; i++) {
        const dx = waves[j * pixels + ((i + 1) % pixels)] - waves[j * pixels + ((i + pixels - 1) % pixels)];
        const dy = waves[((j + 1) % pixels) * pixels + i] - waves[((j + pixels - 1) % pixels) * pixels + i];
        const normal = new THREE.Vector3(-dx * 3, -dy * 3, 1).normalize(),
          offset = (j * pixels + i) * 4;
        image.data[offset] = (normal.x * 0.5 + 0.5) * 255;
        image.data[offset + 1] = (normal.y * 0.5 + 0.5) * 255;
        image.data[offset + 2] = (normal.z * 0.5 + 0.5) * 255;
        image.data[offset + 3] = 255;
      }
    paper.putImageData(image, 0, 0);
    waterNormal = new THREE.CanvasTexture(canvas);
    waterNormal.wrapS = waterNormal.wrapT = THREE.RepeatWrapping;
    waterNormal.repeat.set(OCEAN_SIZE / 1.6, OCEAN_SIZE / 1.6);
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(OCEAN_SIZE, OCEAN_SIZE).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({
        color: '#7FC8E2',
        transparent: true,
        opacity: 0.22,
        roughness: 0.12,
        metalness: 0.05,
        normalMap: waterNormal,
        normalScale: new THREE.Vector2(0.35, 0.35),
        depthWrite: false,
      }),
    );
    water.position.y = -0.012;
    water.renderOrder = 1;
    root.add(water);
  }

  /* sailboats near the coast */
  const boats = [];
  if (META.has_sea) {
    const spots = [];
    for (let tries = 0; tries < 4000 && spots.length < 4; tries++) {
      const r = Math.floor(random() * NY),
        c = Math.floor(random() * NX);
      if (HEIGHTS[r * NX + c] === 0 && COAST[r * NX + c] > 14 && COAST[r * NX + c] < 45)
        spots.push([(c / (NX - 1)) * KX - KX / 2, (r / (NY - 1)) * KY - KY / 2]);
    }
    for (const [x, z] of spots) {
      const boat = new THREE.Group(),
        white = std('#FBFAF6');
      add(boat, new THREE.BoxGeometry(0.035, 0.012, 0.1), white, 0, 0.006, 0);
      add(boat, new THREE.ConeGeometry(0.03, 0.11, 3), std('#FFFFFF'), 0, 0.07, 0).scale.set(0.25, 1, 1);
      boat.userData = { x, z, radius: 0.25, speed: 0.08 + random() * 0.08 };
      root.add(boat);
      boats.push(boat);
    }
  }

  /* clouds */
  const clouds = [];
  if (!META.overview && ui.clouds !== false) {
    const cloudMaterial = std('#FFFFFF', { roughness: 1, flatShading: true, transparent: true, opacity: 0.95 });
    for (let i = 0; i < 9; i++) {
      const cloud = new THREE.Group(),
        puffs = 4 + Math.floor(random() * 4);
      for (let k = 0; k < puffs; k++) {
        const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7 + random() * 0.8, 1), cloudMaterial);
        puff.position.set((k - puffs / 2) * 0.9 + random() * 0.4, random() * 0.4, random() * 0.8);
        puff.scale.y = 0.65;
        cloud.add(puff);
      }
      cloud.position.set((i % 2 ? 1 : -1) * (26 + random() * 12), 8 + random() * 3, -26 + random() * 50);
      cloud.userData = { speed: 0.15 + random() * 0.2 };
      root.add(cloud);
      clouds.push(cloud);
    }
  }

  function tick(time, cameraDistance) {
    const s = time * 0.001;
    boats.forEach((boat, i) => {
      const u = boat.userData,
        angle = s * u.speed + i * 1.7;
      boat.position.set(u.x + Math.cos(angle) * u.radius, 0, u.z + Math.sin(angle) * u.radius);
      boat.rotation.y = -angle;
    });
    if (waterNormal && ui.animated_sea !== false) waterNormal.offset.set(s * 0.012, s * 0.008);
    for (const cloud of clouds) {
      cloud.position.x += cloud.userData.speed * 0.016;
      if (cloud.position.x > 40) cloud.position.x = -40;
      cloud.visible = cameraDistance > 26;
    }
    for (const plan of plans) if (plan.tick) plan.tick(s, cameraDistance);
  }

  function dispose() {
    root.traverse(object => {
      if (object.geometry) object.geometry.dispose();
      for (const material of [object.material].flat()) {
        if (!material) continue;
        if (material.map) material.map.dispose();
        if (material.normalMap) material.normalMap.dispose();
        material.dispose();
      }
    });
    root.clear();
  }

  const focus = Object.assign({}, ...plans.map(plan => plan.focus || {}));
  return { W3, yAt, metersAt, toX, toZ, KX, KY, tick, dispose, focus, towns: SCENE.towns, hasSea: META.has_sea };
}
