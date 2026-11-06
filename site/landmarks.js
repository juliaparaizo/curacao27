// Kit of 3D landmarks. A place picks one with `model:` in trip.yaml.
// Every builder returns { clear: [[x, z, radius]], draw(), focus: {placeId: Vector3}, tick(seconds, cameraDistance) }.
// Trips can add their own with a landmarks.js next to trip.yaml (see examples/oahu).

const CLEAR_RADIUS = 0.45;

// height of each model in scene units, so a pin floats above it
export const MODEL_HEIGHT = {
  house: 0.5,
  bridge: 0.3,
  lighthouse: 0.38,
  temple: 0.25,
  tower: 0.42,
  waterfall: 0.32,
  pier: 0.05,
  airport: 0.15,
  islet: 0.15,
  ridge_stairs: 0.1,
};

function house(ctx, place) {
  const { THREE, group, add, std } = ctx;
  return () => {
    const g = group(place.lat, place.lon, 20);
    g.scale.setScalar(3.4);
    add(g, new THREE.CylinderGeometry(0.16, 0.17, 0.006, 28), std('#7DAA55'), 0, 0.003, 0);
    add(g, new THREE.BoxGeometry(0.12, 0.06, 0.1), std('#F3EEE2'), 0, 0.036, 0);
    const roof = add(g, new THREE.ConeGeometry(0.095, 0.05, 4), std('#B8452F'), 0, 0.09, 0);
    roof.rotation.y = Math.PI / 4;
    add(g, new THREE.BoxGeometry(0.024, 0.036, 0.004), std('#8E5B3A'), 0, 0.024, 0.052);
  };
}

function bridge(ctx, place) {
  const { THREE, group, add, std } = ctx;
  return () => {
    const g = group(place.lat, place.lon, place.camera?.rotate ?? -45, 0.02);
    g.scale.setScalar(1.6);
    add(g, new THREE.BoxGeometry(0.06, 0.008, 0.34), std('#EDE7D8'), 0, 0.026, 0);
    add(g, new THREE.BoxGeometry(0.04, 0.0012, 0.34), std('#5A5F63'), 0, 0.0306, 0);
    const arch = std('#F6F2E8', { roughness: 0.6 });
    for (const side of [-1, 1])
      for (const center of [-0.085, 0.085]) {
        add(g, new THREE.TorusGeometry(0.08, 0.0055, 6, 28, Math.PI), arch, side * 0.032, 0.018, center).rotation.y =
          Math.PI / 2;
      }
    for (const z of [-0.17, 0, 0.17]) add(g, new THREE.BoxGeometry(0.07, 0.03, 0.014), std('#DCD4C2'), 0, 0.008, z);
  };
}

function lighthouse(ctx, place) {
  const { THREE, group, add, std } = ctx;
  return () => {
    const g = group(place.lat, place.lon);
    g.scale.setScalar(2.6);
    add(g, new THREE.CylinderGeometry(0.014, 0.018, 0.09, 10), std('#FBFAF6'), 0, 0.045, 0);
    add(
      g,
      new THREE.CylinderGeometry(0.016, 0.016, 0.022, 10),
      std('#9AD7E6', { emissive: '#FFE9A0', emissiveIntensity: 0.6 }),
      0,
      0.1,
      0,
    );
    add(g, new THREE.ConeGeometry(0.019, 0.02, 10), std('#C23B2E'), 0, 0.12, 0);
  };
}

function temple(ctx, place) {
  const { THREE, group, add, std } = ctx;
  return () => {
    const g = group(place.lat, place.lon, 15);
    g.scale.setScalar(3.4);
    const red = std('#C8452F'),
      roof = std('#8E8379', { roughness: 0.65 });
    add(g, new THREE.BoxGeometry(0.2, 0.008, 0.07), std('#D8D2C4'), 0, 0.004, 0);
    add(g, new THREE.BoxGeometry(0.075, 0.032, 0.05), red, 0, 0.026, 0);
    const hip = (width, depth, height, y) => {
      const top = add(g, new THREE.ConeGeometry(0.5, 1, 4), roof, 0, y, 0);
      top.rotation.y = Math.PI / 4;
      top.scale.set(width * 1.42, height, depth * 1.42);
    };
    hip(0.1, 0.07, 0.035, 0.058);
    hip(0.06, 0.04, 0.02, 0.082);
  };
}

function tower(ctx, place) {
  const { THREE, group, add, std } = ctx;
  return () => {
    const g = group(place.lat, place.lon);
    g.scale.setScalar(2.2);
    add(g, new THREE.BoxGeometry(0.03, 0.14, 0.03), std('#EFE8D8'), 0, 0.07, 0);
    add(g, new THREE.ConeGeometry(0.024, 0.04, 4), std('#4F7A6A'), 0, 0.16, 0).rotation.y = Math.PI / 4;
  };
}

function waterfall(ctx, place) {
  const { THREE, W3, root, add, std } = ctx;
  return () => {
    const g = new THREE.Group();
    g.position.copy(W3(place.lat, place.lon));
    g.scale.setScalar(4);
    root.add(g);
    add(
      g,
      new THREE.CircleGeometry(0.045, 20).rotateX(-Math.PI / 2),
      std('#3E9DB8', { roughness: 0.2 }),
      0,
      0.004,
      0.03,
    );
    add(g, new THREE.BoxGeometry(0.09, 0.07, 0.03), std('#5A5550', { flatShading: true }), 0, 0.035, -0.025);
    const fall = new THREE.Mesh(
      new THREE.PlaneGeometry(0.028, 0.07),
      new THREE.MeshBasicMaterial({ color: '#EAF6FB', transparent: true, opacity: 0.85 }),
    );
    fall.position.set(0, 0.035, -0.009);
    g.add(fall);
  };
}

function pier(ctx, place) {
  const { THREE, group, add, std } = ctx;
  return () => {
    const g = group(place.lat, place.lon);
    for (let i = 0; i < 3; i++)
      add(g, new THREE.BoxGeometry(0.012, 0.006, 0.14), std('#CFC6B2'), -0.05 + i * 0.03, 0.004, 0);
  };
}

function islet(ctx, place) {
  const { THREE, group, add, std } = ctx;
  return () => {
    const g = group(place.lat, place.lon);
    g.position.y = 0;
    add(g, new THREE.ConeGeometry(0.14, 0.16, 9, 3), std('#6E9A4E', { flatShading: true }), 0, 0.05, 0);
    add(g, new THREE.CylinderGeometry(0.16, 0.18, 0.02, 16), std('#EADBAE'), 0, -0.02, 0);
  };
}

function makePlane(ctx) {
  const { THREE, std } = ctx;
  const plane = new THREE.Group(),
    white = std('#FBFAF6', { roughness: 0.4 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.016, 0.16, 4, 10), white);
  body.rotation.x = Math.PI / 2;
  plane.add(body);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.006, 0.045), white);
  wing.position.set(0, -0.004, 0.005);
  plane.add(wing);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.05, 0.035), std('#2F6FB0', { roughness: 0.5 }));
  tail.position.set(0, 0.03, 0.085);
  plane.add(tail);
  return plane;
}

function airport(ctx, place) {
  const { THREE, group, add, std, W3, root } = ctx;
  const flying = makePlane(ctx);
  return {
    draw() {
      const g = group(place.lat, place.lon, -30);
      g.scale.setScalar(1.4);
      add(g, new THREE.BoxGeometry(0.5, 0.04, 0.09), std('#E8E4DA'), 0, 0.02, 0);
      add(g, new THREE.BoxGeometry(0.5, 0.008, 0.1), std('#6F7A80'), 0, 0.044, 0);
      const parked = makePlane(ctx);
      parked.position.copy(W3(place.lat - 0.002, place.lon, 0.03));
      root.add(parked);
      flying.scale.setScalar(1.6);
      root.add(flying);
    },
    tick(seconds) {
      const angle = seconds * 0.05,
        rx = 26,
        rz = 18;
      flying.position.set(Math.cos(angle) * rx, 6.2 + Math.sin(angle * 2) * 0.4, Math.sin(angle) * rz);
      flying.rotation.set(0, Math.atan2(-Math.sin(angle) * rx, Math.cos(angle) * rz) + Math.PI, -0.25);
    },
  };
}

/* A stair along a ridge: from the place, climb to the nearest high ground, following the crest. */
function ridgeStairs(ctx, place) {
  const { THREE, W3, yAt, metersAt, add, std, root } = ctx;
  const base = W3(place.lat, place.lon),
    reach = 26,
    cell = 0.08;
  const baseMeters = metersAt(base.x, base.z);
  let peak = baseMeters,
    top = null;
  for (let dy = -reach; dy <= reach; dy++)
    for (let dx = -reach; dx <= reach; dx++) {
      const x = base.x + dx * cell,
        z = base.z + dy * cell,
        meters = metersAt(x, z);
      if (meters > peak) {
        peak = meters;
        top = new THREE.Vector3(x, 0, z);
      }
    }
  if (!top) return {};
  const samples = 140,
    points = [];
  const dx = top.x - base.x,
    dz = top.z - base.z,
    length = Math.hypot(dx, dz),
    px = -dz / length,
    pz = dx / length;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples,
      x = base.x + dx * t,
      z = base.z + dz * t;
    let bx = x,
      bz = z,
      best = -1;
    for (let offset = -0.12; offset <= 0.12; offset += 0.02) {
      const height = yAt(x + px * offset, z + pz * offset);
      if (height > best) {
        best = height;
        bx = x + px * offset;
        bz = z + pz * offset;
      }
    }
    points.push(new THREE.Vector3(bx, 0, bz));
  }
  for (let round = 0; round < 3; round++)
    for (let i = 1; i < samples; i++) {
      points[i].x = (points[i - 1].x + points[i].x * 2 + points[i + 1].x) / 4;
      points[i].z = (points[i - 1].z + points[i].z * 2 + points[i + 1].z) / 4;
    }
  points.forEach(p => {
    p.y = yAt(p.x, p.z) + 0.035;
  });
  return {
    clear: points.filter((_, i) => i % 2 === 0).map(p => [p.x, p.z, 0.14]),
    focus: { [place.id]: points[Math.floor(points.length * 0.55)].clone() },
    draw() {
      const curve = new THREE.CatmullRomCurve3(points),
        steps = 240;
      const treads = new THREE.InstancedMesh(
        new THREE.BoxGeometry(0.06, 0.007, 0.014),
        std('#B5BBBC', { roughness: 0.6, metalness: 0.2 }),
        steps,
      );
      const matrix = new THREE.Matrix4(),
        rotation = new THREE.Quaternion(),
        one = new THREE.Vector3(1, 1, 1),
        forward = new THREE.Vector3(0, 0, 1);
      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1),
          tangent = curve.getTangentAt(t);
        rotation.setFromUnitVectors(forward, new THREE.Vector3(tangent.x, 0, tangent.z).normalize());
        matrix.compose(curve.getPointAt(t), rotation, one);
        treads.setMatrixAt(i, matrix);
      }
      treads.castShadow = true;
      root.add(treads);
      add(root, new THREE.TubeGeometry(curve, 300, 0.0055, 4), std('#2D3134', { roughness: 0.5, metalness: 0.3 }));
    },
  };
}

const KIT = { house, bridge, lighthouse, temple, tower, waterfall, pier, islet, airport, ridge_stairs: ridgeStairs };

const modelOf = place => place.model || (place.type === 'home' ? 'house' : null);

export async function planLandmarks(ctx, places, customLandmarks) {
  const plans = [];
  for (const place of places) {
    const builder = KIT[modelOf(place)];
    if (!builder) continue;
    const built = builder(ctx, place);
    const plan = typeof built === 'function' ? { draw: built } : built;
    const spot = ctx.W3(place.lat, place.lon);
    plans.push({ clear: [[spot.x, spot.z, CLEAR_RADIUS]], ...plan });
  }
  if (customLandmarks) {
    const module = await import(new URL('data/landmarks.js', location.href));
    plans.push(module.default(ctx) || {});
  }
  return plans;
}
