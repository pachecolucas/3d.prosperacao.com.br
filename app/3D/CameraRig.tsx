import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { View } from ".";

export default function CameraRig({ view }: { view: View }) {
  const { camera } = useThree();

  const targetPosRef = useRef(new THREE.Vector3());
  const isAnimatingRef = useRef(true);

  // Convert view (zoom, angleX, angleY) to a 3D position
  function updateTargetFromView(v: View) {
    const r = v.zoom;
    const ax = v.angleX; // vertical
    const ay = v.angleY; // horizontal

    const x = r * Math.cos(ax) * Math.cos(ay);
    const y = r * Math.sin(ax);
    const z = r * Math.cos(ax) * Math.sin(ay);

    targetPosRef.current.set(x, y, z);
  }

  // When view changes, update target and restart animation
  useEffect(() => {
    updateTargetFromView(view);
    isAnimatingRef.current = true;
  }, [view]);

  useFrame((_, delta) => {
    // If user is interacting, don't fight them
    if (!isAnimatingRef.current) return;

    const target = targetPosRef.current;
    const speed = 4;

    camera.position.lerp(target, 1 - Math.exp(-speed * delta));
    camera.lookAt(0, 0, 0);

    // Stop animating when close enough
    if (camera.position.distanceToSquared(target) < 0.0001) {
      isAnimatingRef.current = false;
    }
  });

  return null;
}
