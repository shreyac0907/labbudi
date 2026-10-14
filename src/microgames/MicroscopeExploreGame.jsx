import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';
import { createMicroscopeModel } from '../components/equipment3D/models/createMicroscopeModel';

// "Meet the Microscope": the whole microscope as a 3D model the student can spin, zoom and poke at. Every part has a
// label; tapping a part (or its label) flies the camera to it, rings it, and Lili says what it is for. A few parts
// really work: the switch lights the lamp, the nosepiece swings the next lens in, the clips open, the knobs turn.
const SCALE = 0.02; // the model is in millimetres
const HOME = { pos: [8.6, 4.7, 12.5], target: [0, 3.4, 0.6] };

// where each label's dot sits on the model (mm), which side its name goes, and how far its name is nudged down (px)
const PARTS = [
  { id: 'eyepiece', name: 'game.mic_eyepiece', sockets: ['eyepiece'], anchor: [0, 352, 96], side: 'R', dy: 0 },
  { id: 'nosepiece', name: 'game.mic_nosepiece', sockets: ['nosepiece'], anchor: [28, 221, 20], side: 'R', dy: 0 },
  { id: 'objective', name: 'game.mic_objective', sockets: ['objective_x4', 'objective_x10', 'objective_x40'], anchor: [17, 170, 10], side: 'R', dy: 0 },
  { id: 'coarse', name: 'game.mic_coarse', sockets: ['coarseKnob'], anchor: [42, 118, -40], side: 'R', dy: 0 },
  { id: 'fine', name: 'game.mic_fine', sockets: ['fineKnob'], anchor: [40, 84, -26], side: 'R', dy: 0 },
  { id: 'switch', name: 'game.mic_switch', sockets: ['illuminatorSwitch'], anchor: [20, 49, 40], side: 'R', dy: 8 },
  { id: 'arm', name: 'game.mic_arm', sockets: ['arm'], anchor: [0, 190, -42], side: 'L', dy: 0 },
  { id: 'clips', name: 'game.mic_clips', sockets: ['stageClipLeft', 'stageClipRight'], anchor: [-44, 136, 64], side: 'L', dy: -12 },
  { id: 'stage', name: 'game.mic_stage', sockets: ['stage'], anchor: [-100, 126, 40], side: 'L', dy: 14 },
  { id: 'light', name: 'game.mx_light', sockets: ['illuminator'], anchor: [-14, 58, 56], side: 'L', dy: 0 },
  { id: 'base', name: 'game.mic_base', sockets: ['base'], anchor: [-92, 16, 20], side: 'L', dy: 0 },
];
const LENS_LABELS = ['×4', '×10', '×40'];
const LENS_TOTALS = [40, 100, 400];

// the part a clicked mesh belongs to: the nearest ancestor that is one of the model's sockets (the switch and the clips
// sit inside bigger sockets, so they are found first)
function partOfObject(obj, socketNames) {
  for (let o = obj; o; o = o.parent) {
    const part = PARTS.find((p) => p.sockets.some((s) => socketNames.get(s) === o));
    if (part) return part.id;
  }
  return null;
}

function Halo({ box }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.material.opacity = 0.28 + 0.18 * Math.sin(clock.elapsedTime * 4);
  });
  const centre = box.getCenter(new THREE.Vector3());
  const radius = Math.max(0.5, box.getSize(new THREE.Vector3()).length() * 0.42);
  return (
    <mesh ref={ref} position={centre} renderOrder={5}>
      <sphereGeometry args={[radius, 32, 24]} />
      <meshBasicMaterial color="#FFC233" transparent opacity={0.3} depthWrite={false} />
    </mesh>
  );
}

function Label({ part, name, done, active, onPick }) {
  const dx = part.side === 'R' ? 34 : -34;
  const len = Math.hypot(dx, part.dy);
  const ang = (Math.atan2(part.dy, dx) * 180) / Math.PI;
  return (
    <Html position={part.anchor.map((v) => v * SCALE)} zIndexRange={[20, 10]} style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'relative', width: 0, height: 0 }}>
        <div style={{ position: 'absolute', left: 0, top: -1, width: len, height: 2, background: '#3A3A3A', transformOrigin: '0 50%', transform: `rotate(${ang}deg)` }} />
        <div style={{ position: 'absolute', left: -6, top: -6, width: 12, height: 12, borderRadius: '50%', background: '#E8A020', border: '2px solid #3A3A3A' }} />
        <button
          type="button"
          onClick={onPick}
          style={{
            position: 'absolute',
            left: dx,
            top: part.dy,
            transform: `translate(${part.side === 'L' ? '-100%' : '0'}, -50%)`,
            pointerEvents: 'auto',
            whiteSpace: 'nowrap',
            padding: '5px 12px',
            borderRadius: 999,
            border: `2.5px solid ${active ? '#E8A020' : done ? '#1E9E5A' : '#3A3A3A'}`,
            background: active ? '#FFF1D6' : '#fff',
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 16,
            color: '#2D2D2D',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
        >
          {done ? '✓ ' : ''}
          {name}
        </button>
      </div>
    </Html>
  );
}

function Scene({ onPick, selected, explored, t, resetSignal, onMessage }) {
  const camera = useThree((s) => s.camera);
  const controls = useRef();
  const holder = useRef();
  const model = useMemo(() => createMicroscopeModel({ colourScheme: 'standard' }), []);
  const sockets = model.userData.sculptRuntime.sockets;
  const socketNames = useMemo(() => new Map(Object.entries(sockets)), [sockets]);
  const noseIdx = useRef(0);
  const [box, setBox] = useState(null);
  const lastPart = useRef(null);

  useFrame(({ clock }) => model.userData.tick(clock.elapsedTime));

  const flyTo = (target, pos) => {
    const c = controls.current;
    if (!c) return;
    const from = { tx: c.target.x, ty: c.target.y, tz: c.target.z, cx: camera.position.x, cy: camera.position.y, cz: camera.position.z };
    gsap.to(from, {
      tx: target[0], ty: target[1], tz: target[2], cx: pos[0], cy: pos[1], cz: pos[2],
      duration: 0.9,
      ease: 'power2.inOut',
      onUpdate: () => {
        c.target.set(from.tx, from.ty, from.tz);
        camera.position.set(from.cx, from.cy, from.cz);
        c.update();
      },
    });
  };

  useEffect(() => {
    // back to the first view
    if (resetSignal === 0) return;
    setBox(null);
    flyTo(HOME.target, HOME.pos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  // select a part: ring it, fly to it, and do what it does
  const choose = (id) => {
    const part = PARTS.find((p) => p.id === id);
    if (!part) return;
    const again = lastPart.current === id;
    lastPart.current = id;
    onPick(id);

    // the ring and the camera
    holder.current.updateMatrixWorld(true);
    const b = new THREE.Box3();
    part.sockets.forEach((s) => b.union(new THREE.Box3().setFromObject(sockets[s])));
    setBox(b);
    if (!again) {
      const centre = b.getCenter(new THREE.Vector3());
      const size = b.getSize(new THREE.Vector3()).length();
      const dist = Math.min(11, Math.max(5.2, size * 2.2));
      const c = controls.current;
      const dir = camera.position.clone().sub(c.target).normalize();
      const pos = centre.clone().add(dir.multiplyScalar(dist));
      flyTo([centre.x, centre.y, centre.z], [pos.x, pos.y, pos.z]);
    }

    // the parts that really work
    let own = null;
    if (id === 'switch') {
      sockets.illuminator.userData.on = !sockets.illuminator.userData.on;
    } else if (id === 'nosepiece') {
      noseIdx.current = (noseIdx.current + 1) % 3;
      const i = noseIdx.current;
      gsap.to(sockets.nosepiece.rotation, { y: (i * 2 * Math.PI) / 3, duration: 0.8, ease: 'power2.inOut' });
      if (again) own = t('game.mx_lens_in', { label: LENS_LABELS[i], total: LENS_TOTALS[i] });
    } else if (id === 'clips') {
      const open = sockets.stageClipLeft.rotation.z < 0.1;
      gsap.to(sockets.stageClipLeft.rotation, { z: open ? 0.3 : 0, duration: 0.4 });
      gsap.to(sockets.stageClipRight.rotation, { z: open ? -0.3 : 0, duration: 0.4 });
    } else if (id === 'coarse' || id === 'fine') {
      const k = sockets[id === 'coarse' ? 'coarseKnob' : 'fineKnob'];
      gsap.to(k.rotation, { z: k.rotation.z + (id === 'coarse' ? 1.6 : 4.2), duration: 0.9, ease: 'power2.out' });
    }
    onMessage(own ?? t(`game.mx_part_${id}`), id);
  };

  // clicks on the model itself work like the labels
  const onModelClick = (e) => {
    const id = partOfObject(e.object, socketNames);
    if (!id) return;
    e.stopPropagation();
    choose(id);
  };

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[8, 14, 8]} intensity={1.4} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.04} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} />
      <pointLight position={[-6, 4, 4]} intensity={0.3} color="#E8F0FF" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial opacity={0.22} />
      </mesh>

      <group ref={holder}>
        <group scale={SCALE}>
          <primitive object={model} onClick={onModelClick} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = 'auto')} />
        </group>
        {PARTS.map((p) => (
          <Label key={p.id} part={p} name={t(p.name)} done={explored.has(p.id)} active={selected === p.id} onPick={() => choose(p.id)} />
        ))}
        {box && <Halo box={box} />}
      </group>

      <OrbitControls ref={controls} makeDefault enablePan={false} minDistance={4} maxDistance={20} minPolarAngle={0.25} maxPolarAngle={Math.PI / 2.05} target={HOME.target} />
    </>
  );
}

export default function MicroscopeExploreGame({ onComplete, onFeedback }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);
  const [explored, setExplored] = useState(() => new Set());
  const [resetSignal, setResetSignal] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => () => {
    document.body.style.cursor = 'auto';
  }, []);

  const pick = (id) => {
    setSelected(id);
    setExplored((s) => new Set(s).add(id));
  };

  const complete = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete({ accuracy: 1, timing: 1, completion: 1, mistakes: 0, score: 100 });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'linear-gradient(180deg, #F7F0E1 0%, #EADFC6 100%)', overflow: 'hidden' }}>
      <Canvas shadows camera={{ position: HOME.pos, fov: 32 }} gl={{ alpha: true }} style={{ position: 'absolute', inset: 0 }}>
        <Scene onPick={pick} selected={selected} explored={explored} t={t} resetSignal={resetSignal} onMessage={(msg) => onFeedback?.(msg)} />
      </Canvas>

      <button
        type="button"
        onClick={() => {
          setSelected(null);
          setResetSignal((n) => n + 1);
        }}
        title={t('game.mx_reset_view')}
        aria-label={t('game.mx_reset_view')}
        style={{ position: 'absolute', left: 16, top: 16, width: 48, height: 48, borderRadius: '50%', border: '3px solid #D9CFAE', background: 'rgba(255,255,255,0.94)', fontSize: 26, cursor: 'pointer', boxShadow: '0 3px 8px rgba(0,0,0,0.15)' }}
      >
        ↺
      </button>

      <div style={{ position: 'absolute', left: '50%', bottom: 18, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ padding: '6px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.94)', border: '3px solid #D9CFAE', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--color-dark)' }}>
          {explored.size}/{PARTS.length}
        </div>
        <button
          type="button"
          onClick={complete}
          style={{ padding: '12px 38px', borderRadius: 999, border: '4px solid #fff', background: 'linear-gradient(135deg, #5BCB7C, #1E9E5A)', boxShadow: '0 6px 16px rgba(0,0,0,0.28)', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 26, color: '#fff', cursor: 'pointer' }}
        >
          ✓ {t('game.mx_complete')}
        </button>
      </div>
    </div>
  );
}
