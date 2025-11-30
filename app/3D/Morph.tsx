"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges, Text } from "@react-three/drei";
import * as THREE from "three";
import { Area } from ".";

export type MorphMode = "square" | "ball" | "pizza";
type PizzaSide = "top-left" | "top-right" | "bottom-right" | "bottom-left";

type MorphShapeProps = {
  mode: MorphMode;
  area: Area;
  rotation: [number, number, number]; // 👈 target rotation from view (angleX, angleY, angleZ)
};

/* ---------------------------------------------
   Make a pizza wedge whose bounding box is
   exactly 1 × 1 × 1 and centered at (0,0,0)
---------------------------------------------- */
function createUnitPizza(side: PizzaSide) {
  const baseRadius = 0.5; // initial guess, we'll normalize later
  const depth = 1;

  const start = getStartAngle(side);
  const end = start + Math.PI / 2;

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(baseRadius * Math.cos(start), baseRadius * Math.sin(start));
  shape.absarc(0, 0, baseRadius, start, end, false);
  shape.lineTo(0, 0);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
  });

  // 1) Center the geometry around origin
  geo.computeBoundingBox();
  let box = geo.boundingBox!;
  const cx = (box.max.x + box.min.x) / 2;
  const cy = (box.max.y + box.min.y) / 2;
  const cz = (box.max.z + box.min.z) / 2;

  geo.translate(-cx, -cy, -cz);

  // 2) Normalize to 1 × 1 × 1
  geo.computeBoundingBox();
  box = geo.boundingBox!;
  const dx = box.max.x - box.min.x || 1;
  const dy = box.max.y - box.min.y || 1;
  const dz = box.max.z - box.min.z || 1;

  const sx = 1 / dx;
  const sy = 1 / dy;
  const sz = 1 / dz;

  geo.scale(sx, sy, sz);

  return geo;
}

function getStartAngle(side: PizzaSide) {
  switch (side) {
    case "top-right":
      return 0;
    case "top-left":
      return Math.PI / 2;
    case "bottom-left":
      return Math.PI;
    case "bottom-right":
      return (3 * Math.PI) / 2;
  }
}

/* ---------------------------------------------
   MorphShape component
---------------------------------------------- */
export function MorphShape({ mode, area, rotation }: MorphShapeProps) {
  const position: [number, number, number] = [area.x, area.y, area.z];
  const color = area.color;
  const size = area.size;
  const pizzaSide = area.side;

  const squareRef = useRef<THREE.Mesh>(null!);
  const ballRef = useRef<THREE.Mesh>(null!);
  const pizzaRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  // keep latest mode, position, size, rotation in refs (for useFrame)
  const modeRef = useRef<MorphMode>(mode);
  const targetPosRef = useRef<[number, number, number]>(position);
  const targetSizeRef = useRef<number>(size);
  const targetRotRef = useRef<[number, number, number]>(rotation);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    targetPosRef.current = position;
  }, [position]);

  useEffect(() => {
    targetSizeRef.current = size;
  }, [size]);

  useEffect(() => {
    targetRotRef.current = rotation;
  }, [rotation]);

  const pizzaGeometry = useMemo(() => createUnitPizza(pizzaSide), [pizzaSide]);

  useFrame((_, delta) => {
    const speed = 2;
    const currentMode = modeRef.current;

    const dampScaleShape = (mesh: THREE.Mesh | null, target: number) => {
      if (!mesh) return;
      const s = mesh.scale.x;
      mesh.scale.setScalar(THREE.MathUtils.damp(s, target, speed, delta));
    };

    // morph between shapes
    dampScaleShape(squareRef.current, currentMode === "square" ? 1 : 0);
    dampScaleShape(ballRef.current, currentMode === "ball" ? 1 : 0);
    dampScaleShape(pizzaRef.current, currentMode === "pizza" ? 1 : 0);

    // animate group position, size and rotation between views
    if (groupRef.current) {
      const g = groupRef.current;
      const [tx, ty, tz] = targetPosRef.current;
      const ts = targetSizeRef.current;
      const [rx, ry, rz] = targetRotRef.current;

      const posSpeed = 5;
      const rotSpeed = 5;

      // position
      g.position.x = THREE.MathUtils.damp(g.position.x, tx, posSpeed, delta);
      g.position.y = THREE.MathUtils.damp(g.position.y, ty, posSpeed, delta);
      g.position.z = THREE.MathUtils.damp(g.position.z, tz, posSpeed, delta);

      // uniform scale
      const currentScale = g.scale.x || 1;
      const nextScale = THREE.MathUtils.damp(currentScale, ts, posSpeed, delta);
      g.scale.setScalar(nextScale);

      // rotation (so faces / numbers align with view angle)
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, rx, rotSpeed, delta);
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ry, rotSpeed, delta);
      g.rotation.z = THREE.MathUtils.damp(g.rotation.z, rz, rotSpeed, delta);
    }
  });

  return (
    <group ref={groupRef}>
      {/* UNIT CUBE (1×1×1) */}
      <mesh ref={squareRef} scale={1}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
        <Edges color="black" />
      </mesh>

      {/* UNIT SPHERE */}
      <mesh ref={ballRef} scale={0}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={color} />
        <Edges color="black" />
      </mesh>

      {/* UNIT PIZZA */}
      <mesh ref={pizzaRef} scale={0}>
        <primitive object={pizzaGeometry} />
        <meshStandardMaterial color={color} />
        <Edges color="black" />
      </mesh>

      {/* CONTENT */}
      <group position={[0, 0, 0.51]}>
        <Text fontSize={0.5} color="#FFFFFF" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="black">
          {area.number}
        </Text>
      </group>
    </group>
  );
}
