import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Student compound microscope, built by hand to the LabBudi review spec.
//
// Units are millimetres, Y up, +Z toward the operator, +X to the operator's
// right. The model stands on y = 0 and is ~355 tall, so scale it (~0.02-0.03)
// when dropping it into a scene.
//
// Optical axis (aperture / active objective) is at x = 0, z = OPTICAL_Z.

export type MicroscopeModelOptions = {
  // 'standard': reference colours (#E8E4DF body)
  // 'labbudi': stylised deep-purple (#6A1B9A) body
  colourScheme?: 'standard' | 'labbudi';
  castShadow?: boolean;
  receiveShadow?: boolean;
};

const OPTICAL_Z = 40;
const STAGE_Y = 126;
const NOSE_Y = 221;
const NOSE_Z = 20;

// Soft studio equirect map so chrome has something to reflect without needing
// a scene environment (a metalness-1 material with no envMap renders black).
function makeStudioEnv(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const g = canvas.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#f9f6f1');
  grad.addColorStop(0.5, '#d8d4cd');
  grad.addColorStop(1, '#a4a09a');
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 256);
  // bright soft boxes + a few narrow dark strips: vertical chrome barrels pick
  // these up as longitudinal highlights and shadows instead of going flat grey
  g.fillStyle = '#ffffff';
  g.fillRect(40, 20, 90, 100);
  g.fillRect(280, 10, 140, 110);
  g.fillRect(440, 40, 40, 150);
  g.fillStyle = '#41444a';
  for (const x of [150, 235, 345, 480]) g.fillRect(x, 30, 16, 190);
  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function std(
  color: number,
  roughness: number,
  metalness: number,
  envMap: THREE.Texture,
  envMapIntensity = 0,
  extra: THREE.MeshStandardMaterialParameters = {},
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, envMap, envMapIntensity, ...extra });
}

// C-shaped arm: an oval cross-section swept along a planar (y, z) path.
// Built by hand (not ExtrudeGeometry) so the section never twists and tapers.
function buildArmGeometry(path: [number, number][]): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(path.map(([y, z]) => new THREE.Vector3(0, y, z)), false, 'catmullrom', 0.5);
  const rings = 90;
  const sides = 32;
  const pos: number[] = [];
  const centers: THREE.Vector3[] = [];
  const xAxis = new THREE.Vector3(1, 0, 0);
  for (let i = 0; i <= rings; i += 1) {
    const t = i / rings;
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t).normalize();
    const n = new THREE.Vector3(0, -tan.z, tan.y).normalize();
    const a = 27 - 5 * t; // front-to-back half thickness
    const b = 23 - 4 * t; // side-to-side half width
    centers.push(p);
    for (let j = 0; j < sides; j += 1) {
      const th = (j / sides) * Math.PI * 2;
      const v = p.clone().addScaledVector(n, a * Math.cos(th)).addScaledVector(xAxis, b * Math.sin(th));
      pos.push(v.x, v.y, v.z);
    }
  }
  const idx: number[] = [];
  for (let i = 0; i < rings; i += 1) {
    for (let j = 0; j < sides; j += 1) {
      const a = i * sides + j;
      const b = i * sides + ((j + 1) % sides);
      const c = (i + 1) * sides + j;
      const d = (i + 1) * sides + ((j + 1) % sides);
      idx.push(a, c, b, b, c, d);
    }
  }
  // Orient the triangles outward (decided once from the first quad).
  const va = new THREE.Vector3(pos[0], pos[1], pos[2]);
  const vc = new THREE.Vector3(pos[sides * 3], pos[sides * 3 + 1], pos[sides * 3 + 2]);
  const vb = new THREE.Vector3(pos[3], pos[4], pos[5]);
  const faceN = vc.clone().sub(va).cross(vb.clone().sub(va));
  if (faceN.dot(va.clone().sub(centers[0])) < 0) {
    for (let k = 0; k < idx.length; k += 3) {
      const tmp = idx[k + 1];
      idx[k + 1] = idx[k + 2];
      idx[k + 2] = tmp;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// Focus knob: disc + ridge fins + chrome hub + chrome centre cap.
// The knob axis is local +Z, so rotation.z spins it about its own axis.
function buildKnob(
  name: string,
  radius: number,
  thickness: number,
  finCount: number,
  hubR: number,
  hubLen: number,
  hubCenterZ: number,
  knobMat: THREE.Material,
  chromeMat: THREE.Material,
  shadow: { cast: boolean; receive: boolean },
): THREE.Group {
  const g = new THREE.Group();
  g.name = name;
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, n: string) => {
    const m = new THREE.Mesh(geo, mat);
    m.name = `${name}.${n}`;
    m.castShadow = shadow.cast;
    m.receiveShadow = shadow.receive;
    g.add(m);
    return m;
  };
  add(new THREE.CylinderGeometry(radius, radius, thickness, 56).rotateX(Math.PI / 2), knobMat, 'disc');
  const fins: THREE.BufferGeometry[] = [];
  for (let i = 0; i < finCount; i += 1) {
    const a = (i / finCount) * Math.PI * 2;
    const fin = new THREE.BoxGeometry(2.6, 2, thickness);
    fin.translate(radius, 0, 0);
    fin.rotateZ(a);
    fins.push(fin);
  }
  add(mergeGeometries(fins)!, knobMat, 'ridges');
  add(new THREE.CylinderGeometry(hubR, hubR, hubLen, 28).rotateX(Math.PI / 2).translate(0, 0, hubCenterZ), chromeMat, 'hub');
  add(new THREE.CylinderGeometry(radius * 0.3, radius * 0.3, 1.4, 32).rotateX(Math.PI / 2).translate(0, 0, thickness / 2 + 0.5), chromeMat, 'cap');
  return g;
}

// Objective: stacked cylinders, hanging DOWN from the mount at local y = 0.
// top -> bottom: thread mount, knurled grip, upper barrel, colour band,
// lower barrel (the variable-length part), tip glass.
function buildObjective(
  name: string,
  totalLength: number,
  bandMat: THREE.Material,
  chromeMat: THREE.Material,
  gripMat: THREE.Material,
  glassMat: THREE.Material,
  shadow: { cast: boolean; receive: boolean },
): THREE.Group {
  const g = new THREE.Group();
  g.name = name;
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, n: string) => {
    const m = new THREE.Mesh(geo, mat);
    m.name = `${name}.${n}`;
    m.castShadow = shadow.cast;
    m.receiveShadow = shadow.receive;
    g.add(m);
    return m;
  };
  const THREAD = 6;
  const GRIP = 8;
  const UPPER = 12;
  const BAND = 4;
  const TIP = 4;
  const lower = totalLength - (THREAD + GRIP + UPPER + BAND + TIP);
  let y = 0;
  const seg = (h: number) => {
    const c = y - h / 2;
    y -= h;
    return c;
  };
  add(new THREE.CylinderGeometry(5, 5, THREAD, 24).translate(0, seg(THREAD), 0), chromeMat, 'thread');
  const gripCentre = seg(GRIP);
  add(new THREE.CylinderGeometry(7.5, 7.5, GRIP, 36).translate(0, gripCentre, 0), gripMat, 'grip');
  const knurl: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 28; i += 1) {
    const a = (i / 28) * Math.PI * 2;
    const f = new THREE.BoxGeometry(0.9, GRIP, 0.9);
    f.translate(7.6, gripCentre, 0);
    f.rotateY(a);
    knurl.push(f);
  }
  add(mergeGeometries(knurl)!, gripMat, 'knurl');
  add(new THREE.CylinderGeometry(5.5, 5.5, UPPER, 24).translate(0, seg(UPPER), 0), chromeMat, 'upperBarrel');
  add(new THREE.CylinderGeometry(7, 7, BAND, 36).translate(0, seg(BAND), 0), bandMat, 'colourBand');
  add(new THREE.CylinderGeometry(6, 6, lower, 28).translate(0, seg(lower), 0), chromeMat, 'lowerBarrel');
  add(new THREE.CylinderGeometry(3, 3, TIP, 20).translate(0, seg(TIP), 0), glassMat, 'tipLens');
  return g;
}

export function createMicroscopeModel(options: MicroscopeModelOptions = {}): THREE.Group {
  const scheme = options.colourScheme ?? 'standard';
  const shadow = { cast: options.castShadow ?? true, receive: options.receiveShadow ?? true };
  const env = makeStudioEnv();

  const M = {
    body: std(scheme === 'labbudi' ? 0x6a1b9a : 0xe9e1d6, 0.6, 0.08, env, 0.4),
    stage: std(0x0a0a0a, 0.95, 0.02, env, 0.1),
    optics: std(0x141414, 0.8, 0.05, env, 0.1),
    illum: std(0x111111, 0.7, 0.1, env, 0.1),
    knob: std(0x1a1a1a, 0.75, 0.15, env, 0.2),
    chrome: std(0xc0c0c0, 0.08, 1.0, env, 1.2),
    grip: std(0x8e8e8e, 0.35, 0.9, env, 1.0),
    rubber: std(0x0c0c0c, 0.9, 0.0, env, 0),
    glass: std(0x101010, 0.05, 0.0, env, 0.6, { transparent: true, opacity: 0.88 }),
    diffuser: std(0xddeeff, 0.3, 0.0, env, 0.3, { transparent: true, opacity: 0.45, emissive: 0xfffaee, emissiveIntensity: 0 }),
    // Painted colour rings. toneMapped:false keeps these identity-critical
    // colours saturated under ACES tone mapping.
    bandRed: std(0xcc2222, 0.5, 0.0, env, 0, { toneMapped: false, emissive: 0xcc2222, emissiveIntensity: 0.35 }),
    bandAmber: std(0xcc8800, 0.5, 0.0, env, 0, { toneMapped: false, emissive: 0xcc8800, emissiveIntensity: 0.45 }),
    bandBlue: std(0x1144cc, 0.5, 0.0, env, 0, { toneMapped: false, emissive: 0x1144cc, emissiveIntensity: 0.35 }),
  };

  const root = new THREE.Group();
  root.name = 'Microscope';

  const mesh = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, name: string, pos: [number, number, number] = [0, 0, 0]) => {
    const m = new THREE.Mesh(geo, mat);
    m.name = name;
    m.position.set(...pos);
    m.castShadow = shadow.cast;
    m.receiveShadow = shadow.receive;
    parent.add(m);
    return m;
  };

  // ── BASE ────────────────────────────────────────────────────────────
  const base = new THREE.Group();
  base.name = 'base';
  mesh(base, new RoundedBoxGeometry(184, 26, 140, 4, 3), M.body, 'base.slab', [0, 16, 0]);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      mesh(base, new THREE.CylinderGeometry(4, 4, 3, 20), M.rubber, 'base.foot', [sx * 78, 1.5, sz * 58]);
    }
  }
  root.add(base);

  // ── ARM + HEAD ──────────────────────────────────────────────────────
  const arm = new THREE.Group();
  arm.name = 'arm';
  const armMesh = mesh(arm, buildArmGeometry([[24, -42], [70, -42], [120, -42], [170, -41], [210, -39], [238, -30], [258, -14]]), M.body, 'arm.sweep');
  (armMesh.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  mesh(arm, new THREE.CylinderGeometry(16, 16, 14, 32), M.body, 'head.neck', [0, 232, NOSE_Z]);
  mesh(arm, new RoundedBoxGeometry(64, 50, 66, 4, 8), M.body, 'head.housing', [0, 262, 26]);
  const prism = mesh(arm, new RoundedBoxGeometry(42, 24, 38, 4, 6), M.body, 'head.prism', [0, 286, 38]);
  prism.rotation.x = -0.2;
  // stage carrier block bridging the arm front and the stage underside
  mesh(arm, new RoundedBoxGeometry(60, 28, 30, 3, 2), M.body, 'arm.stageCarrier', [0, 108, -9]);
  root.add(arm);

  // ── FOCUS KNOBS (right side of the arm) ─────────────────────────────
  const coarseKnob = buildKnob('coarseKnob', 22, 14, 16, 6, 28, -6, M.knob, M.chrome, shadow);
  coarseKnob.position.set(38, 118, -40);
  coarseKnob.rotation.y = Math.PI / 2;
  root.add(coarseKnob);
  const fineKnob = buildKnob('fineKnob', 11, 10, 12, 5, 24, -5, M.knob, M.chrome, shadow);
  fineKnob.position.set(36, 84, -26);
  fineKnob.rotation.y = Math.PI / 2;
  root.add(fineKnob);

  // ── EYEPIECE ────────────────────────────────────────────────────────
  const eyepiece = new THREE.Group();
  eyepiece.name = 'eyepiece';
  eyepiece.position.set(0, 280, 44);
  eyepiece.rotation.x = 0.62; // ~35 degrees from vertical, leaning toward the operator
  mesh(eyepiece, new THREE.CylinderGeometry(12, 14, 90, 48).translate(0, 45, 0), M.optics, 'eyepiece.tube');
  mesh(eyepiece, new THREE.CylinderGeometry(16, 16, 10, 40).translate(0, 5, 0), M.optics, 'eyepiece.collar');
  mesh(eyepiece, new THREE.TorusGeometry(12.5, 2.5, 16, 48).rotateX(Math.PI / 2).translate(0, 90, 0), M.optics, 'eyepiece.lip');
  mesh(eyepiece, new THREE.CylinderGeometry(10, 10, 1.5, 32).translate(0, 90.4, 0), M.glass, 'eyepiece.lens');
  root.add(eyepiece);

  // ── NOSEPIECE + OBJECTIVES ──────────────────────────────────────────
  const nosepiece = new THREE.Group();
  nosepiece.name = 'nosepiece';
  nosepiece.position.set(0, NOSE_Y, NOSE_Z);
  mesh(nosepiece, new THREE.CylinderGeometry(28, 28, 14, 56), M.optics, 'nosepiece.disc');
  // rotation.y = 0 -> x4 over the aperture, 2PI/3 -> x10, 4PI/3 -> x40
  const sockets3: Array<[string, number, number, number, THREE.Material]> = [
    ['objective_x4', 48, 0, 20, M.bandRed],
    ['objective_x10', 62, -17.32, -10, M.bandAmber],
    ['objective_x40', 80, 17.32, -10, M.bandBlue],
  ];
  const objectives: Record<string, THREE.Group> = {};
  for (const [name, len, sx, sz, band] of sockets3) {
    const obj = buildObjective(name, len, band, M.chrome, M.grip, M.glass, shadow);
    obj.position.set(sx, -7, sz);
    // splay ~5 degrees outward from the nosepiece axis
    const d = new THREE.Vector2(sx, sz).normalize();
    obj.quaternion.setFromAxisAngle(new THREE.Vector3(-d.y, 0, d.x), THREE.MathUtils.degToRad(5));
    // socket collar on the disc underside
    mesh(nosepiece, new THREE.CylinderGeometry(8.5, 8.5, 3, 24), M.optics, `${name}.socket`, [sx, -8.4, sz]);
    nosepiece.add(obj);
    objectives[name] = obj;
  }
  root.add(nosepiece);

  // ── STAGE ───────────────────────────────────────────────────────────
  const stage = new THREE.Group();
  stage.name = 'stage';
  stage.position.set(0, STAGE_Y, OPTICAL_Z);
  const plate = new THREE.Shape();
  plate.moveTo(-100, -50);
  plate.lineTo(100, -50);
  plate.lineTo(100, 50);
  plate.lineTo(-100, 50);
  plate.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, 22, 0, Math.PI * 2, true);
  plate.holes.push(hole);
  const plateGeo = new THREE.ExtrudeGeometry(plate, { depth: 8, bevelEnabled: false, curveSegments: 48 });
  plateGeo.rotateX(-Math.PI / 2);
  plateGeo.translate(0, -4, 0);
  mesh(stage, plateGeo, M.stage, 'stage.plate');
  mesh(stage, new THREE.TorusGeometry(22, 1.5, 12, 56).rotateX(Math.PI / 2), M.chrome, 'stage.apertureRim', [0, 4, 0]);

  const slideSlot = new THREE.Object3D();
  slideSlot.name = 'slideSlot';
  slideSlot.position.set(0, 4, 0);
  stage.add(slideSlot);

  // Spring clips: hinge about local Z at the anchor screw. rotation.z = 0
  // clamped, +0.3 (left) / -0.3 (right) open.
  const clipPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 2, 0),
    new THREE.Vector3(9, 5, 0),
    new THREE.Vector3(19, 4.6, 0),
    new THREE.Vector3(28, 1.8, 0),
  ]);
  const clipShape = new THREE.Shape();
  clipShape.moveTo(-0.8, -2);
  clipShape.lineTo(0.8, -2);
  clipShape.lineTo(0.8, 2);
  clipShape.lineTo(-0.8, 2);
  clipShape.closePath();
  const clipGeo = new THREE.ExtrudeGeometry(clipShape, { extrudePath: clipPath, steps: 28, bevelEnabled: false });
  const makeClip = (name: string, side: 1 | -1) => {
    const pivot = new THREE.Group();
    pivot.name = name;
    pivot.position.set(side * -44, 4, 24);
    const inner = new THREE.Group();
    inner.scale.x = side; // mirror, not rotate
    pivot.add(inner);
    mesh(inner, clipGeo, M.chrome, `${name}.arm`);
    mesh(inner, new THREE.CylinderGeometry(3, 3, 3, 20), M.chrome, `${name}.screw`, [0, 1.5, 0]);
    stage.add(pivot);
    return pivot;
  };
  const stageClipLeft = makeClip('stageClipLeft', 1);
  const stageClipRight = makeClip('stageClipRight', -1);
  root.add(stage);

  // ── SUBSTAGE ILLUMINATOR ────────────────────────────────────────────
  const illuminator = new THREE.Group();
  illuminator.name = 'illuminator';
  illuminator.position.set(0, 29, OPTICAL_Z);
  illuminator.userData.on = false;
  mesh(illuminator, new THREE.CylinderGeometry(14, 18, 56, 40), M.illum, 'illuminator.housing', [0, 28, 0]);
  mesh(illuminator, new THREE.CylinderGeometry(11, 11, 30, 32), M.illum, 'illuminator.condenser', [0, 71, 0]);
  mesh(illuminator, new THREE.CylinderGeometry(10, 10, 2, 32), M.diffuser, 'illuminator.diffuser', [0, 87.5, 0]);
  const lamp = new THREE.PointLight(0xfffaee, 0, 30);
  lamp.name = 'illuminator.light';
  lamp.position.set(0, 92, 0);
  illuminator.add(lamp);

  const illuminatorSwitch = new THREE.Group();
  illuminatorSwitch.name = 'illuminatorSwitch';
  illuminatorSwitch.position.set(17, 20, 0);
  mesh(illuminatorSwitch, new THREE.BoxGeometry(6, 4, 10), M.illum, 'illuminatorSwitch.body');
  mesh(illuminatorSwitch, new THREE.CylinderGeometry(1.2, 1.2, 7, 12), M.chrome, 'illuminatorSwitch.lever', [0, 5, 0]);
  illuminator.add(illuminatorSwitch);
  root.add(illuminator);

  // ── MIRROR (socket for the non-electric variant; hidden by default) ─
  const mirror = new THREE.Group();
  mirror.name = 'mirror';
  mirror.position.set(-70, 29, 52);
  mesh(mirror, new THREE.CylinderGeometry(2, 2, 18, 12), M.chrome, 'mirror.post', [0, 9, 0]);
  const dish = new THREE.SphereGeometry(40, 40, 8, 0, Math.PI * 2, 0, 0.47);
  dish.rotateX(Math.PI);
  const dishMat = M.chrome.clone();
  dishMat.side = THREE.DoubleSide;
  mesh(mirror, dish, dishMat, 'mirror.dish', [0, 26, 0]);
  mirror.visible = false;
  root.add(mirror);

  // ── RUNTIME ─────────────────────────────────────────────────────────
  const sockets: Record<string, THREE.Object3D> = {
    eyepiece,
    nosepiece,
    objective_x4: objectives.objective_x4,
    objective_x10: objectives.objective_x10,
    objective_x40: objectives.objective_x40,
    coarseKnob,
    fineKnob,
    stage,
    stageClipLeft,
    stageClipRight,
    slideSlot,
    illuminator,
    illuminatorSwitch,
    mirror,
    arm,
    base,
  };
  root.userData.sculptRuntime = { sockets, nodes: sockets };

  let switchAngle = 0;
  root.userData.tick = (t: number) => {
    // a very gentle sway so it reads as a physical object on the bench
    root.rotation.y = Math.sin(t * 0.4) * 0.005;
    const on = illuminator.userData.on === true;
    lamp.intensity = on ? 0.8 : 0;
    M.diffuser.emissiveIntensity = on ? 1.4 : 0;
    switchAngle += ((on ? THREE.MathUtils.degToRad(30) : 0) - switchAngle) * 0.25;
    illuminatorSwitch.rotation.z = switchAngle;
  };

  return root;
}

export default createMicroscopeModel;
