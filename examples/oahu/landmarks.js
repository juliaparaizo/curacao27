// Models only O'ahu needs. Any trip can bring a file like this: set `landmarks: landmarks.js` in trip.yaml.
// It receives the 3D context and returns { clear, draw(), tick(seconds), focus }.

export default function oahuLandmarks({ THREE, root, W3, metersAt, add, group, std, palmField, random, isSmall }) {
  const animated = [];

  function islet(lat, lon, radius, height, widthScale = 1, depthScale = 1) {
    const g = group(lat, lon);
    g.position.y = 0;
    add(
      g,
      new THREE.ConeGeometry(radius, height, 9, 3),
      std('#6E9A4E', { flatShading: true }),
      0,
      height / 2 - 0.03,
      0,
    ).scale.set(widthScale, 1, depthScale);
    const beach = radius * 1.2 * Math.max(widthScale, depthScale);
    add(g, new THREE.CylinderGeometry(beach, beach * 1.05, 0.02, 16), std('#EADBAE'), 0, -0.02, 0);
  }

  function pearlHarbor() {
    const island = group(21.364, -157.9605, -25);
    island.position.y = -0.02;
    add(island, new THREE.CylinderGeometry(0.5, 0.52, 0.05, 40), std('#EADBAE'), 0, 0.02, 0).scale.set(1.12, 1, 0.5);
    add(island, new THREE.CylinderGeometry(0.47, 0.47, 0.052, 40), std('#BFD18A'), 0, 0.022, 0).scale.set(1.1, 1, 0.46);
    add(group(21.365, -157.9499, -25), new THREE.BoxGeometry(0.11, 0.02, 0.025), std('#FFFFFF'), 0, 0.01, 0); // USS Arizona Memorial
    const ship = group(21.3624, -157.9535, -25); // USS Missouri
    ship.position.y = -0.006;
    ship.scale.setScalar(2);
    const gray = std('#7C858C'),
      dark = std('#4B5359');
    add(ship, new THREE.BoxGeometry(0.032, 0.012, 0.24), gray, 0, 0.006, 0);
    add(ship, new THREE.BoxGeometry(0.018, 0.014, 0.06), gray, 0, 0.019, -0.005);
    add(ship, new THREE.BoxGeometry(0.01, 0.02, 0.02), dark, 0, 0.035, -0.01);
    for (const z of [0.06, 0.085, -0.06])
      add(ship, new THREE.CylinderGeometry(0.009, 0.009, 0.008, 10), dark, 0, 0.016, z);
  }

  function honolulu() {
    const tower = group(21.3069, -157.8664); // Aloha Tower
    tower.scale.setScalar(2.2);
    add(tower, new THREE.BoxGeometry(0.02, 0.07, 0.02), std('#EFE8D8'), 0, 0.035, 0);
    add(tower, new THREE.ConeGeometry(0.016, 0.022, 4), std('#4F7A6A'), 0, 0.081, 0).rotation.y = Math.PI / 4;
    const hotel = group(21.2777, -157.8292, -20); // Royal Hawaiian
    hotel.scale.setScalar(2.2);
    const pink = std('#F2A2B4');
    add(hotel, new THREE.BoxGeometry(0.08, 0.022, 0.03), pink, 0, 0.011, 0);
    add(hotel, new THREE.BoxGeometry(0.03, 0.04, 0.03), pink, 0, 0.02, 0);
    add(hotel, new THREE.ConeGeometry(0.02, 0.012, 4), std('#C9707F'), 0, 0.046, 0).rotation.y = Math.PI / 4;
  }

  function lifeguardTower() {
    const g = group(21.6645, -158.0535, 30); // Pipeline
    g.scale.setScalar(2.4);
    for (const [x, z] of [
      [-0.012, -0.012],
      [0.012, -0.012],
      [-0.012, 0.012],
      [0.012, 0.012],
    ])
      add(g, new THREE.BoxGeometry(0.003, 0.03, 0.003), std('#E9E2CF'), x, 0.015, z);
    add(g, new THREE.BoxGeometry(0.034, 0.02, 0.034), std('#F2C230'), 0, 0.04, 0);
    add(g, new THREE.BoxGeometry(0.04, 0.004, 0.04), std('#C2402E'), 0, 0.052, 0);
  }

  function seaNear(lat, lon) {
    const center = W3(lat, lon);
    for (let radius = 0.12; radius <= 0.6; radius += 0.06)
      for (let angle = 0; angle < 6.283; angle += 0.26) {
        const x = center.x + Math.cos(angle) * radius,
          z = center.z + Math.sin(angle) * radius;
        if (metersAt(x, z) === 0) return new THREE.Vector3(x, 0, z);
      }
    return null;
  }

  function surfers() {
    const board = new THREE.CapsuleGeometry(0.006, 0.034, 3, 6).rotateX(Math.PI / 2).scale(1, 0.35, 1);
    const body = new THREE.CapsuleGeometry(0.0045, 0.008, 3, 6),
      head = new THREE.SphereGeometry(0.0042, 8, 6);
    const colors = ['#F4C542', '#FFFFFF', '#E5703A', '#2E8C89', '#D9553B', '#9FD3E8'];
    for (const [lat, lon, count] of [
      [21.6005, -158.1075, 3],
      [21.624, -158.087, 2],
      [21.68, -158.0365, 2],
      [21.27, -157.8245, 3],
      [21.286, -157.848, 2],
      [21.665, -158.053, 1],
    ]) {
      const spot = seaNear(lat, lon);
      if (!spot) continue;
      for (let i = 0; i < count; i++) {
        const g = new THREE.Group();
        g.position.set(spot.x + (random() - 0.5) * 0.18, 0.003, spot.z + (random() - 0.5) * 0.18);
        g.rotation.y = random() * 6.28;
        g.scale.setScalar(2.2);
        g.add(new THREE.Mesh(board, std(colors[Math.floor(random() * colors.length)])));
        const torso = new THREE.Mesh(body, std('#1E2326'));
        torso.position.y = 0.008;
        g.add(torso);
        const face = new THREE.Mesh(head, std('#8A5A3C'));
        face.position.y = 0.016;
        g.add(face);
        g.userData = { phase: random() * 6.28 };
        root.add(g);
        animated.push(g);
      }
    }
  }

  function whale() {
    const g = new THREE.Group(),
      skin = std('#2E4756');
    const back = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), skin);
    back.scale.set(1, 0.45, 2.4);
    g.add(back);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.01, 0.05), skin);
    tail.position.set(0, 0.02, 0.22);
    g.add(tail);
    g.position.copy(W3(21.63, -157.74));
    root.add(g);
    return g;
  }

  let humpback = null;
  return {
    draw() {
      islet(21.5096, -157.8306, 0.12, 0.16); // Mokoli'i
      islet(21.3289, -157.6566, 0.24, 0.28); // Manana
      islet(21.3915, -157.6966, 0.16, 0.12); // Mokulua Nui
      islet(21.3866, -157.6979, 0.1, 0.08); // Mokulua Iki
      islet(21.4331, -157.7868, 0.14, 0.03, 1.3, 0.9); // Moku o Lo'e
      palmField(
        [
          [21.4336, -157.7874],
          [21.4326, -157.786],
          [21.4333, -157.7862],
        ],
        1.2,
      );
      pearlHarbor();
      honolulu();
      lifeguardTower();
      if (!isSmall) surfers();
      humpback = whale();
    },
    tick(seconds) {
      for (const g of animated) {
        g.position.y = 0.003 + Math.sin(seconds * 1.6 + g.userData.phase) * 0.0025;
        g.rotation.z = Math.sin(seconds * 1.1 + g.userData.phase) * 0.06;
      }
      if (humpback) {
        humpback.position.y = -0.05 + Math.max(0, Math.sin(((seconds * 0.18) % 1) * Math.PI * 2)) * 0.07;
        humpback.rotation.y = seconds * 0.05;
      }
    },
  };
}
