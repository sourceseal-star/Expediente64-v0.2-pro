// ============================================================
// MECHANICS: STEALTH
// Sistema simple de sigilo: un guardia patrulla waypoints,
// tiene un cono de visión, y detecta al jugador por distancia+ángulo.
// No usa raycasting de oclusión (ver nota en PROGRESS.md).
// ============================================================

const StealthSystem = {
  active: false,
  guardMesh: null,
  visionConeMesh: null,
  patrolPoints: [],
  currentPatrolIndex: 0,
  patrolHoldTimer: 0,
  guardSpeed: 1.2,
  visionRange: 5,
  visionAngle: 0.6,
  detectionLevel: 0, // 0 a 1, sube si está en el cono, baja si no
  detected: false,
  onDetectedCallback: null,
  destination: null,
  onReachDestination: null,

  init(scene, config, onDetected, onReach) {
    this.active = true;
    this.patrolPoints = config.guardPatrol;
    this.visionRange = config.guardVisionRange;
    this.visionAngle = config.guardVisionAngle;
    this.currentPatrolIndex = 0;
    this.patrolHoldTimer = 0;
    this.detectionLevel = 0;
    this.detected = false;
    this.onDetectedCallback = onDetected;
    this.destination = config.destination;
    this.onReachDestination = onReach;

    // Guard body (simple capsule-ish shape)
    const guardMat = new THREE.MeshStandardMaterial({ color: 0x4a2020, roughness: 0.8 });
    const body = new THREE.Group();
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 1.0, 8), guardMat);
    torso.position.y = 0.9;
    body.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), guardMat);
    head.position.y = 1.55;
    body.add(head);
    const startPos = this.patrolPoints[0].pos;
    body.position.set(startPos[0], 0, startPos[2]);
    scene.add(body);
    this.guardMesh = body;

    // Vision cone (visual indicator, semi-transparent)
    const coneGeo = new THREE.ConeGeometry(this.visionRange * Math.tan(this.visionAngle), this.visionRange, 16, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.rotation.x = Math.PI / 2;
    cone.position.y = 0.9;
    cone.position.z = -this.visionRange / 2;
    const coneWrapper = new THREE.Group();
    coneWrapper.add(cone);
    coneWrapper.position.copy(body.position);
    scene.add(coneWrapper);
    this.visionConeMesh = coneWrapper;
  },

  reset() {
    this.active = false;
    this.guardMesh = null;
    this.visionConeMesh = null;
    this.detected = false;
    this.detectionLevel = 0;
  },

  update(delta, playerX, playerZ, scene) {
    if (!this.active || !this.guardMesh) return;

    // --- Patrol movement ---
    const target = this.patrolPoints[this.currentPatrolIndex];
    const gx = this.guardMesh.position.x;
    const gz = this.guardMesh.position.z;
    const dx = target.pos[0] - gx;
    const dz = target.pos[2] - gz;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.15) {
      this.patrolHoldTimer += delta;
      if (this.patrolHoldTimer >= target.hold) {
        this.patrolHoldTimer = 0;
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
      }
    } else {
      const moveX = (dx / dist) * this.guardSpeed * delta;
      const moveZ = (dz / dist) * this.guardSpeed * delta;
      this.guardMesh.position.x += moveX;
      this.guardMesh.position.z += moveZ;
      const facingAngle = Math.atan2(dx, dz);
      this.guardMesh.rotation.y = facingAngle;
      this.visionConeMesh.position.copy(this.guardMesh.position);
      this.visionConeMesh.rotation.y = facingAngle;
    }

    // --- Detection check ---
    const pdx = playerX - this.guardMesh.position.x;
    const pdz = playerZ - this.guardMesh.position.z;
    const playerDist = Math.sqrt(pdx * pdx + pdz * pdz);

    let inCone = false;
    if (playerDist < this.visionRange) {
      const guardFacing = this.guardMesh.rotation.y;
      const angleToPlayer = Math.atan2(pdx, pdz);
      let angleDiff = Math.abs(guardFacing - angleToPlayer);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
      if (angleDiff < this.visionAngle) inCone = true;
    }

    if (inCone) {
      this.detectionLevel = Math.min(1, this.detectionLevel + delta * 0.7);
    } else {
      this.detectionLevel = Math.max(0, this.detectionLevel - delta * 0.4);
    }

    if (this.detectionLevel >= 1 && !this.detected) {
      this.detected = true;
      if (this.onDetectedCallback) this.onDetectedCallback();
    }
    if (this.detectionLevel < 0.3 && this.detected) {
      this.detected = false; // player escaped, can retry
    }

    // --- Destination check ---
    if (this.destination) {
      const ddx = playerX - this.destination.pos[0];
      const ddz = playerZ - this.destination.pos[2];
      const ddist = Math.sqrt(ddx * ddx + ddz * ddz);
      if (ddist < 1.2) {
        this.active = false; // stop checking once reached
        if (this.onReachDestination) this.onReachDestination();
      }
    }
  },

  getDetectionLevel() {
    return this.detectionLevel;
  },
};
