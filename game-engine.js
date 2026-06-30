// ============================================================
// EXPEDIENTE 64 — MOTOR DEL JUEGO v0.2
// Integra: movimiento, sigilo, diálogo, pizarra de deducción,
// cinemáticas dirigidas. Edita game-data.js para contenido.
// ============================================================

const STATE = {
  currentLevel: 'level1',
  verifiedEvidence: new Set(),
  totalEvidenceThisLevel: 0,
  player: { x: 0, z: 3, rotY: 0, speed: 2.4 },
  moveVector: { x: 0, z: 0 },
  nearInteractable: null,
  inDevice: false,
  inVehicle: false,
  inCinematic: false,
  inDeduction: false,
  inDialogue: false,
  inStealthSection: false,
  exitReady: false,
  deductionUnlocked: false,
  stealthDestinationReached: false,
};

// ---------- THREE.JS SETUP ----------
const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.Fog(0x050505, 8, 22);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function clearLevel() {
  while (scene.children.length > 0) scene.remove(scene.children[0]);
  STATE.interactables = [];
  StealthSystem.reset();
}
function addAmbient(intensity = 0.35, color = 0x4060ff) { scene.add(new THREE.AmbientLight(color, intensity)); }
function addSpot(x, y, z, target, color = 0xd4af37, intensity = 1.2) {
  const spot = new THREE.SpotLight(color, intensity, 14, Math.PI / 5, 0.4, 1.5);
  spot.position.set(x, y, z);
  spot.castShadow = true;
  scene.add(spot);
  if (target) { spot.target.position.set(target.x, target.y, target.z); scene.add(spot.target); }
  return spot;
}

// ---------- HANDS (placeholder — see PROGRESS.md) ----------
let handsGroup;
function buildHands() {
  handsGroup = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xC79A78, roughness: 0.7 });
  const sleeveMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 });
  function makeHand(side) {
    const g = new THREE.Group();
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.16), skinMat);
    g.add(palm);
    for (let i = 0; i < 4; i++) {
      const finger = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.018, 0.08), skinMat);
      finger.position.set(-0.03 + i * 0.02, 0, -0.11);
      g.add(finger);
    }
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.18, 8), sleeveMat);
    sleeve.rotation.x = Math.PI / 2;
    sleeve.position.set(0, 0, 0.14);
    g.add(sleeve);
    const x = side === 'left' ? -0.22 : 0.22;
    g.position.set(x, -0.22, -0.45);
    g.rotation.y = side === 'left' ? 0.15 : -0.15;
    g.userData.side = side;
    return g;
  }
  handsGroup.add(makeHand('left'));
  handsGroup.add(makeHand('right'));
  camera.add(handsGroup);
  scene.add(camera);
}
buildHands();

let walkTime = 0;
function animateHands(delta, isMoving) {
  walkTime += delta * (isMoving ? 6 : 1.2);
  handsGroup.children.forEach((hand, i) => {
    const dir = i === 0 ? 1 : -1;
    const bobAmount = isMoving ? 0.018 : 0.006;
    hand.position.y = -0.22 + Math.sin(walkTime + dir) * bobAmount;
    hand.position.x = (hand.userData.side === 'left' ? -0.22 : 0.22) + Math.sin(walkTime * 0.5) * 0.01 * dir;
    hand.rotation.z = Math.sin(walkTime + dir) * 0.02;
  });
}

function addInteractable(mesh, type, radius = 1.4, extra = {}) {
  mesh.userData.interactable = true;
  mesh.userData.type = type;
  mesh.userData.radius = radius;
  Object.assign(mesh.userData, extra);
  scene.add(mesh);
  STATE.interactables.push(mesh);
  return mesh;
}

// ============================================================
// NIVEL 1 — Oficina de investigación + pizarra de deducción
// ============================================================
function buildLevel1() {
  clearLevel();
  addAmbient(0.28, 0x3a4d8f);
  scene.fog = new THREE.Fog(0x050505, 6, 18);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshStandardMaterial({ color: 0x0d0d12, roughness: 0.9 }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 1 });
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), wallMat);
  backWall.position.set(0, 3, -7);
  scene.add(backWall);
  const sideWallL = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), wallMat);
  sideWallL.position.set(-7, 3, 0);
  sideWallL.rotation.y = Math.PI / 2;
  scene.add(sideWallL);

  const desk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 1.1), new THREE.MeshStandardMaterial({ color: 0x2b2117, roughness: 0.6 }));
  desk.position.set(0, 0.9, -3);
  scene.add(desk);

  const monitor = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.45, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x0a1a2e, emissive: 0x1e3a5f, emissiveIntensity: 1.4 })
  );
  monitor.position.set(0, 1.35, -3.35);
  scene.add(monitor);
  addInteractable(monitor, 'computer', 1.6);

  const phone = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.02, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xd4af37, emissiveIntensity: 0.3 })
  );
  phone.position.set(0.7, 0.95, -2.9);
  scene.add(phone);
  addInteractable(phone, 'phone', 1.3);

  // Deduction board — a literal corkboard mesh on the side wall, interactable
  const corkboard = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.1, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x4a3528, roughness: 1 })
  );
  corkboard.position.set(-6.9, 1.6, 1.5);
  corkboard.rotation.y = Math.PI / 2;
  scene.add(corkboard);
  addInteractable(corkboard, 'deductionBoard', 1.8);

  addSpot(0, 4, -2, { x: 0, y: 1.2, z: -3.3 }, 0xd4af37, 1.4);
  addSpot(-5, 3.5, 1.5, { x: -6.9, y: 1.6, z: 1.5 }, 0xffaa55, 1.0);

  STATE.player.x = 0; STATE.player.z = 1.5; STATE.player.rotY = Math.PI;
  STATE.deductionUnlocked = false;
  STATE.totalEvidenceThisLevel = GAME_DATA.level1.computerFiles.length + GAME_DATA.level1.phoneFiles.length;
  updateEvidenceCounter();
  document.getElementById('level-name').textContent = GAME_DATA.level1.name;
  document.getElementById('objective-bar').textContent = GAME_DATA.level1.objective;
  document.getElementById('drive-btn').style.display = 'none';
}

// ============================================================
// NIVEL 2 — Auto + sigilo en el barrio
// ============================================================
function buildLevel2_Car() {
  clearLevel();
  addAmbient(0.4, 0xffaa55);
  scene.fog = new THREE.Fog(0x1a1208, 4, 16);

  const dashMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });
  const dash = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.5), dashMat);
  dash.position.set(0, 0.7, -1.2);
  scene.add(dash);

  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 12, 24), dashMat);
  wheel.position.set(-0.45, 0.85, -0.85);
  wheel.rotation.x = Math.PI / 2.4;
  scene.add(wheel);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x2a2520 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1;
  scene.add(ground);

  buildNeighborhoodHouses();
  addSpot(-3, 3, -6, { x: -3, y: 0, z: -6 }, 0xffaa55, 1.2);
  addSpot(3, 3, -8, { x: 3, y: 0, z: -8 }, 0xffaa55, 1.0);
  addAmbient(0.2, 0x442200);

  const phone = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.02, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xd4af37, emissiveIntensity: 0.3 })
  );
  phone.position.set(0.35, 0.95, -1.0);
  scene.add(phone);
  addInteractable(phone, 'phone', 2.0);

  STATE.player.x = 0; STATE.player.z = 0.3; STATE.player.rotY = Math.PI;
  STATE.inVehicle = true;
  STATE.totalEvidenceThisLevel = GAME_DATA.level2.phoneFiles.length;
  updateEvidenceCounter();
  document.getElementById('level-name').textContent = GAME_DATA.level2.name;
  document.getElementById('objective-bar').textContent = 'Verifica la información en el celular.';
  document.getElementById('drive-btn').style.display = 'none';
}

function buildNeighborhoodHouses() {
  const houseMat = new THREE.MeshStandardMaterial({ color: 0x3a2f28, roughness: 0.9 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x2a1f1a, roughness: 1 });
  const housePositions = [[-3, -6], [3, -7], [-1.5, -9], [2, -10], [-4, -10], [-5, -4], [5, -5]];
  housePositions.forEach(([x, z]) => {
    const house = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.6), houseMat);
    house.position.set(x, -0.3, z);
    scene.add(house);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.3, 0.7, 4), roofMat);
    roof.position.set(x, 0.75, z);
    roof.rotation.y = Math.PI / 4;
    scene.add(roof);
  });
  // Hiding spot props
  const propMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 });
  const container = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 1.6), propMat);
  container.position.set(-4.5, -0.4, -7.5);
  scene.add(container);
  const car = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 0.9), new THREE.MeshStandardMaterial({ color: 0x222244 }));
  car.position.set(3.5, -0.65, -7);
  scene.add(car);
  // Store entrance marker (destination)
  const storeSign = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.6, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xff4444, emissive: 0xff2222, emissiveIntensity: 0.6 })
  );
  storeSign.position.set(0, 1.2, -11.3);
  scene.add(storeSign);
}

function buildLevel2_StealthZone() {
  clearLevel();
  scene.fog = new THREE.Fog(0x1a1208, 5, 18);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x2a2520 }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  buildNeighborhoodHouses();
  addAmbient(0.25, 0x442200);
  addSpot(-3, 3, -6, { x: -3, y: 0, z: -6 }, 0xffaa55, 1.2);
  addSpot(3, 3, -8, { x: 3, y: 0, z: -8 }, 0xffaa55, 1.0);
  addSpot(0, 3, -11, { x: 0, y: 0, z: -11.3 }, 0xff4444, 0.9);

  STATE.player.x = 0; STATE.player.z = -1; STATE.player.rotY = Math.PI;
  STATE.inVehicle = false;
  STATE.inStealthSection = true;
  STATE.stealthDestinationReached = false;

  StealthSystem.init(scene, GAME_DATA.level2.stealthSection, onStealthDetected, onStealthReachDestination);

  document.getElementById('level-name').textContent = GAME_DATA.level2.name;
  document.getElementById('objective-bar').textContent = GAME_DATA.level2.stealthSection.objective;
  document.getElementById('detection-meter').style.display = 'block';
  document.getElementById('detection-label').style.display = 'block';
  document.getElementById('evidence-counter').style.display = 'none';
}

function onStealthDetected() {
  document.getElementById('detected-flash').style.display = 'block';
  document.getElementById('detected-banner').style.display = 'block';
  setTimeout(() => {
    document.getElementById('detected-flash').style.display = 'none';
    document.getElementById('detected-banner').style.display = 'none';
  }, 1300);
  // Push player back toward a hiding spot area (soft penalty, not instant fail)
  STATE.player.x = -2; STATE.player.z = -2;
}

function onStealthReachDestination() {
  document.getElementById('detection-meter').style.display = 'none';
  document.getElementById('detection-label').style.display = 'none';
  document.getElementById('objective-bar').textContent = 'Entraste sin ser visto.';
  setTimeout(() => {
    playNarrativeSequence(GAME_DATA.toLevel3, () => {
      STATE.currentLevel = 'level3';
      STATE.verifiedEvidence.clear();
      document.getElementById('evidence-counter').style.display = 'flex';
      buildLevel3();
    });
  }, 1000);
}

// ============================================================
// NIVEL 3 — Oficina lujosa + interrogatorio
// ============================================================
function buildLevel3() {
  clearLevel();
  addAmbient(0.32, 0x6b5a3a);
  scene.fog = new THREE.Fog(0x0a0805, 7, 20);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshStandardMaterial({ color: 0x1c1610, roughness: 0.3, metalness: 0.4 }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x1a140d, roughness: 0.6 });
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 7), wallMat);
  backWall.position.set(0, 3.5, -8);
  scene.add(backWall);

  const window1 = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), new THREE.MeshStandardMaterial({ color: 0xd4af37, emissive: 0xd4af37, emissiveIntensity: 0.25 }));
  window1.position.set(-4, 3, -7.9);
  scene.add(window1);
  const window2 = window1.clone();
  window2.position.set(4, 3, -7.9);
  scene.add(window2);

  const desk = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 1.3), new THREE.MeshStandardMaterial({ color: 0x14100a, roughness: 0.15, metalness: 0.6 }));
  desk.position.set(0, 0.92, -4);
  scene.add(desk);

  const wallScreen = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.9, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x0a1a2e, emissive: 0x5f3a1e, emissiveIntensity: 1.1 })
  );
  wallScreen.position.set(0, 2.4, -7.85);
  scene.add(wallScreen);
  addInteractable(wallScreen, 'computer', 2.0);

  const phone = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.02, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xd4af37, emissiveIntensity: 0.3 })
  );
  phone.position.set(-0.8, 0.97, -3.9);
  scene.add(phone);
  addInteractable(phone, 'phone', 1.3);

  // NPC suspect — stands behind desk, becomes interactable once evidence done
  const npcMat = new THREE.MeshStandardMaterial({ color: 0x2a2a35, roughness: 0.6 });
  const npc = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 1.1, 8), npcMat);
  torso.position.y = 0.95;
  npc.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 8), npcMat);
  head.position.y = 1.62;
  npc.add(head);
  npc.position.set(0, 0, -5.2);
  scene.add(npc);
  addInteractable(torso, 'npc_suspect', 2.2);

  addSpot(0, 5, -3, { x: 0, y: 1, z: -5 }, 0xd4af37, 1.6);
  addSpot(-3, 3, 0, { x: 0, y: 0, z: 0 }, 0xffe0a0, 0.7);

  STATE.player.x = 0; STATE.player.z = 1.8; STATE.player.rotY = Math.PI;
  STATE.inVehicle = false;
  STATE.totalEvidenceThisLevel = GAME_DATA.level3.computerFiles.length + GAME_DATA.level3.phoneFiles.length;
  updateEvidenceCounter();
  document.getElementById('level-name').textContent = GAME_DATA.level3.name;
  document.getElementById('objective-bar').textContent = GAME_DATA.level3.objective;
}

// ---------- EVIDENCE COUNTER ----------
function updateEvidenceCounter() {
  document.getElementById('evidence-count').textContent = `${STATE.verifiedEvidence.size} / ${STATE.totalEvidenceThisLevel}`;
}

// ---------- DEVICE OVERLAY ----------
function getFilesForCurrentDevice(deviceType) {
  const lvl = STATE.currentLevel;
  if (lvl === 'level1') return deviceType === 'computer' ? GAME_DATA.level1.computerFiles : GAME_DATA.level1.phoneFiles;
  if (lvl === 'level2') return GAME_DATA.level2.phoneFiles;
  if (lvl === 'level3') return deviceType === 'computer' ? GAME_DATA.level3.computerFiles : GAME_DATA.level3.phoneFiles;
  return [];
}

function openDevice(deviceType) {
  STATE.inDevice = true;
  const overlay = document.getElementById('device-overlay');
  const body = document.getElementById('device-body');
  const title = document.getElementById('device-title');
  title.textContent = deviceType === 'computer' ? 'TERMINAL — ARCHIVOS DEL CASO' : 'CELULAR — MENSAJES Y DATOS';
  body.innerHTML = '';

  const files = getFilesForCurrentDevice(deviceType);
  files.forEach(file => {
    const item = document.createElement('div');
    item.className = 'file-item' + (STATE.verifiedEvidence.has(file.id) ? ' verified' : '');
    item.innerHTML = `
      <div class="file-title">${file.title}</div>
      <div class="file-meta">${file.meta}</div>
      <span class="file-tag tag-${file.tag}">${file.tagLabel}</span>
      <div class="file-detail">${file.detail}
        <br><button class="verify-btn" data-id="${file.id}" ${STATE.verifiedEvidence.has(file.id) ? 'disabled' : ''}>
          ${STATE.verifiedEvidence.has(file.id) ? '✓ SELLADO' : 'SELLAR COMO EVIDENCIA'}
        </button>
      </div>`;
    item.addEventListener('click', (e) => { if (e.target.classList.contains('verify-btn')) return; item.classList.toggle('open'); });
    const btn = item.querySelector('.verify-btn');
    btn.addEventListener('click', () => {
      STATE.verifiedEvidence.add(file.id);
      item.classList.add('verified');
      btn.disabled = true;
      btn.textContent = '✓ SELLADO';
      updateEvidenceCounter();
      checkLevelComplete();
    });
    body.appendChild(item);
  });
  overlay.style.display = 'flex';
}

document.getElementById('device-close').addEventListener('click', () => {
  document.getElementById('device-overlay').style.display = 'none';
  STATE.inDevice = false;
});

// ---------- LEVEL COMPLETE LOGIC ----------
function checkLevelComplete() {
  if (STATE.verifiedEvidence.size >= STATE.totalEvidenceThisLevel) {
    if (STATE.currentLevel === 'level1') {
      STATE.deductionUnlocked = true;
      document.getElementById('objective-bar').textContent = 'Evidencia completa. Ve a la pizarra para conectarla.';
    } else if (STATE.currentLevel === 'level2') {
      document.getElementById('objective-bar').textContent = 'Verificación completa. Listo para conducir.';
      document.getElementById('drive-btn').style.display = 'block';
    } else if (STATE.currentLevel === 'level3') {
      document.getElementById('objective-bar').textContent = 'Evidencia sellada. Confronta al sospechoso.';
    }
  }
}

document.getElementById('drive-btn').addEventListener('click', () => {
  document.getElementById('drive-btn').style.display = 'none';
  fadeTransition(() => buildLevel2_StealthZone());
});

document.getElementById('deduction-continue-btn').addEventListener('click', () => {
  DeductionSystem.finish();
  playNarrativeSequence(GAME_DATA.toLevel2, () => {
    STATE.currentLevel = 'level2';
    STATE.verifiedEvidence.clear();
    buildLevel2_Car();
  });
});

// ---------- NARRATIVE SEQUENCES ----------
let narrativeQueue = [];
let narrativeCallback = null;
function playNarrativeSequence(sequence, onComplete) {
  narrativeQueue = [...sequence];
  narrativeCallback = onComplete;
  document.getElementById('narrative-screen').style.display = 'flex';
  showNextNarrativeBeat();
}
function showNextNarrativeBeat() {
  const textEl = document.getElementById('narrative-text');
  const subEl = document.getElementById('narrative-sub');
  const tapEl = document.getElementById('tap-continue');
  textEl.style.opacity = 0; subEl.style.opacity = 0; tapEl.style.opacity = 0;
  if (narrativeQueue.length === 0) {
    document.getElementById('narrative-screen').style.display = 'none';
    if (narrativeCallback) narrativeCallback();
    return;
  }
  const beat = narrativeQueue.shift();
  setTimeout(() => {
    textEl.textContent = beat.text;
    subEl.textContent = beat.sub;
    textEl.style.opacity = 1; subEl.style.opacity = 1; tapEl.style.opacity = 1;
  }, 150);
}
document.getElementById('narrative-screen').addEventListener('click', showNextNarrativeBeat);

// ---------- MOVEMENT: JOYSTICK ----------
const joystickZone = document.getElementById('joystick-zone');
const joystickKnob = document.getElementById('joystick-knob');
let joystickActive = false;
let joystickOrigin = { x: 0, y: 0 };
function joystickStart(clientX, clientY) {
  joystickActive = true;
  const rect = joystickZone.getBoundingClientRect();
  joystickOrigin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}
function joystickMove(clientX, clientY) {
  if (!joystickActive) return;
  let dx = clientX - joystickOrigin.x, dy = clientY - joystickOrigin.y;
  const maxDist = 40;
  const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist);
  const angle = Math.atan2(dy, dx);
  const kx = Math.cos(angle) * dist, ky = Math.sin(angle) * dist;
  joystickKnob.style.transform = `translate(${kx}px, ${ky}px)`;
  STATE.moveVector.x = kx / maxDist;
  STATE.moveVector.z = ky / maxDist;
}
function joystickEnd() {
  joystickActive = false;
  joystickKnob.style.transform = `translate(0px, 0px)`;
  STATE.moveVector.x = 0; STATE.moveVector.z = 0;
}
joystickZone.addEventListener('touchstart', (e) => { e.preventDefault(); const t = e.touches[0]; joystickStart(t.clientX, t.clientY); });
joystickZone.addEventListener('touchmove', (e) => { e.preventDefault(); const t = e.touches[0]; joystickMove(t.clientX, t.clientY); });
joystickZone.addEventListener('touchend', (e) => { e.preventDefault(); joystickEnd(); });
joystickZone.addEventListener('mousedown', (e) => { joystickStart(e.clientX, e.clientY); });
window.addEventListener('mousemove', (e) => { if (joystickActive) joystickMove(e.clientX, e.clientY); });
window.addEventListener('mouseup', () => joystickEnd());

// ---------- KEYBOARD ----------
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; if (e.key.toLowerCase() === 'e') tryInteract(); });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

// ---------- LOOK ----------
let lookActive = false, lookLastX = 0;
canvas.addEventListener('touchstart', (e) => { if (e.target !== canvas) return; lookActive = true; lookLastX = e.touches[0].clientX; });
canvas.addEventListener('touchmove', (e) => { if (!lookActive) return; const dx = e.touches[0].clientX - lookLastX; STATE.player.rotY -= dx * 0.004; lookLastX = e.touches[0].clientX; });
canvas.addEventListener('touchend', () => { lookActive = false; });
let mouseLookActive = false;
canvas.addEventListener('mousedown', () => mouseLookActive = true);
window.addEventListener('mouseup', () => mouseLookActive = false);
window.addEventListener('mousemove', (e) => { if (mouseLookActive) STATE.player.rotY -= e.movementX * 0.003; });

// ---------- INTERACTION ----------
function tryInteract() {
  if (!STATE.nearInteractable) return;
  const type = STATE.nearInteractable.userData.type;

  if (type === 'computer' || type === 'phone') {
    openDevice(type);
  } else if (type === 'deductionBoard') {
    if (!STATE.deductionUnlocked) return;
    DeductionSystem.start(GAME_DATA.level1.deductionBoard, () => {
      // handled by deduction-continue-btn click -> chains to level2
    });
  } else if (type === 'npc_suspect') {
    if (STATE.verifiedEvidence.size < STATE.totalEvidenceThisLevel) return;
    DialogueSystem.start(GAME_DATA.level3.interrogation, () => {
      playNarrativeSequence(GAME_DATA.ending, null);
    });
  }
}
document.getElementById('interact-prompt').addEventListener('click', tryInteract);
canvas.addEventListener('click', () => {
  const overlayOpen = STATE.inDevice || STATE.inDeduction || STATE.inDialogue;
  if (STATE.nearInteractable && !overlayOpen) tryInteract();
});

// ---------- FADE TRANSITION ----------
function fadeTransition(callback) {
  const fade = document.getElementById('fade-overlay');
  fade.style.opacity = 1;
  setTimeout(() => { callback(); setTimeout(() => { fade.style.opacity = 0; }, 100); }, 800);
}

// ---------- EXIT TRIGGER (level1 unused now, deduction board replaces it) ----------

// ---------- MAIN LOOP ----------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.1);

  STATE.inDevice = document.getElementById('device-overlay').style.display === 'flex';
  STATE.inDeduction = document.getElementById('deduction-overlay').style.display === 'flex';
  STATE.inDialogue = document.getElementById('dialogue-overlay').style.display === 'flex';
  const narrativeOpen = document.getElementById('narrative-screen').style.display === 'flex';
  STATE.inCinematic = CinematicSystem.active;

  const overlayOpen = STATE.inDevice || STATE.inDeduction || STATE.inDialogue || narrativeOpen || STATE.inCinematic;
  let isMoving = false;

  if (CinematicSystem.active) {
    CinematicSystem.update(delta);
  } else if (!overlayOpen && !STATE.inVehicle) {
    let mx = STATE.moveVector.x, mz = STATE.moveVector.z;
    if (keys['w']) mz = -1;
    if (keys['s']) mz = 1;
    if (keys['a']) mx = -1;
    if (keys['d']) mx = 1;

    if (mx !== 0 || mz !== 0) {
      isMoving = true;
      const angle = STATE.player.rotY;
      const forward = { x: Math.sin(angle), z: Math.cos(angle) };
      const right = { x: Math.cos(angle), z: -Math.sin(angle) };
      STATE.player.x += (forward.x * -mz + right.x * mx) * STATE.player.speed * delta;
      STATE.player.z += (forward.z * -mz + right.z * mx) * STATE.player.speed * delta;
      STATE.player.x = Math.max(-13, Math.min(13, STATE.player.x));
      STATE.player.z = Math.max(-13, Math.min(13, STATE.player.z));
    }

    camera.position.set(STATE.player.x, 1.6, STATE.player.z);
    camera.rotation.set(0, STATE.player.rotY, 0);
    if (isMoving) camera.position.y += Math.sin(walkTime * 2) * 0.015;
  }

  animateHands(delta, isMoving);

  // Stealth update
  if (STATE.inStealthSection && !overlayOpen) {
    StealthSystem.update(delta, STATE.player.x, STATE.player.z, scene);
    const lvl = StealthSystem.getDetectionLevel();
    document.getElementById('detection-fill').style.width = `${lvl * 100}%`;
    document.getElementById('detection-fill').style.background = lvl > 0.6 ? '#f87171' : lvl > 0.3 ? '#facc15' : '#4ade80';
  }

  // Proximity check
  let closest = null, closestDist = Infinity;
  (STATE.interactables || []).forEach(obj => {
    const dx = obj.position.x - STATE.player.x;
    const dz = obj.position.z - STATE.player.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < obj.userData.radius && dist < closestDist) { closest = obj; closestDist = dist; }
  });
  STATE.nearInteractable = closest;

  let promptText = '[ E ] Interactuar';
  if (closest && closest.userData.type === 'deductionBoard' && !STATE.deductionUnlocked) {
    promptText = 'Necesitas revisar toda la evidencia primero';
  } else if (closest && closest.userData.type === 'npc_suspect' && STATE.verifiedEvidence.size < STATE.totalEvidenceThisLevel) {
    promptText = 'Revisa la evidencia antes de confrontarlo';
  }
  const promptEl = document.getElementById('interact-prompt');
  promptEl.textContent = promptText;
  promptEl.style.display = (closest && !overlayOpen) ? 'block' : 'none';

  renderer.render(scene, camera);
}

// ---------- INIT ----------
function init() {
  buildLevel1();
  playNarrativeSequence(GAME_DATA.intro, () => {
    CinematicSystem.play(camera, GAME_DATA.level1.openingCinematic, () => {
      camera.position.set(STATE.player.x, 1.6, STATE.player.z);
      camera.rotation.set(0, STATE.player.rotY, 0);
    });
  });
  animate();
}
init();
