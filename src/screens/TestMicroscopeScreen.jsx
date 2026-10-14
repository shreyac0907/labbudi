import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { createMicroscopeModel } from '../components/equipment3D/models/createMicroscopeModel';

const SCALE = 0.02;

function parseVec(value, fallback) {
  if (!value) return fallback;
  const parts = value.split(',').map(Number);
  return parts.length === 3 && parts.every(Number.isFinite) ? parts : fallback;
}

function Model({ scheme }) {
  const holder = useRef();
  const modelRef = useRef();
  const params = new URLSearchParams(window.location.search);

  useEffect(() => {
    const model = createMicroscopeModel({ colourScheme: scheme });
    modelRef.current = model;
    holder.current.add(model);
    if (params.get('illum') === '1') model.userData.sculptRuntime.sockets.illuminator.userData.on = true;
    if (params.get('nose')) model.userData.sculptRuntime.sockets.nosepiece.rotation.y = Number(params.get('nose'));
    if (params.get('clips') === 'open') {
      const s = model.userData.sculptRuntime.sockets;
      s.stageClipLeft.rotation.z = 0.3;
      s.stageClipRight.rotation.z = -0.3;
    }
    model.userData.tick(0);

    // Publish measured bounds in model units (mm) for numeric review.
    holder.current.updateMatrixWorld(true);
    const bounds = {};
    const sockets = model.userData.sculptRuntime.sockets;
    for (const [name, node] of Object.entries(sockets)) {
      const box = new THREE.Box3().setFromObject(node);
      const min = box.min.toArray().map((v) => Math.round(v / SCALE));
      const max = box.max.toArray().map((v) => Math.round(v / SCALE));
      bounds[name] = { min, max, size: max.map((v, i) => v - min[i]) };
    }
    const all = new THREE.Box3().setFromObject(model);
    bounds.__all = {
      min: all.min.toArray().map((v) => Math.round(v / SCALE)),
      max: all.max.toArray().map((v) => Math.round(v / SCALE)),
    };
    window.__bounds = bounds;
    window.__model = model;
    return () => holder.current?.remove(model);
  }, [scheme]);

  useFrame(({ clock }) => modelRef.current?.userData.tick(clock.elapsedTime));
  return <group ref={holder} scale={SCALE} />;
}

export default function TestMicroscopeScreen() {
  const params = new URLSearchParams(window.location.search);
  const cam = parseVec(params.get('cam'), [9, 5.4, 12.5]);
  const target = parseVec(params.get('tgt'), [0, 3.4, 0.6]);
  const scheme = params.get('scheme') === 'labbudi' ? 'labbudi' : 'standard';

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#e9e9ec' }}>
      <Canvas shadows camera={{ position: cam, fov: 35 }}>
        <color attach="background" args={['#e9e9ec']} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[8, 14, 8]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0004}
          shadow-normalBias={0.04}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
        />
        <pointLight position={[-6, 4, 4]} intensity={0.3} color="#E8F0FF" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color="#d9d9dd" roughness={1} />
        </mesh>
        <Model scheme={scheme} />
        <OrbitControls target={target} />
      </Canvas>
    </div>
  );
}
