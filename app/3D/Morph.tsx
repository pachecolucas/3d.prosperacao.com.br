import { useMemo } from "react";
import { Edges, Text } from "@react-three/drei";
import * as THREE from "three";
import { a, useSpring } from "@react-spring/three";
import { Area, Content } from ".";

export type MorphMode = "square" | "ball" | "pizza";
type PizzaSide = "top-left" | "top-right" | "bottom-right" | "bottom-left";

type MorphShapeProps = {
  mode: MorphMode;
  area: Area;
  content: Content;
  flatZ?: boolean;
};

function createUnitPizza(side: PizzaSide) {
  const baseRadius = 0.5;
  const depth = 1;

  const start = getStartAngle(side);
  const end = start + Math.PI / 2;

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(baseRadius * Math.cos(start), baseRadius * Math.sin(start));
  shape.absarc(0, 0, baseRadius, start, end, false);
  shape.lineTo(0, 0);

  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });

  geo.computeBoundingBox();
  let box = geo.boundingBox!;
  const cx = (box.max.x + box.min.x) / 2;
  const cy = (box.max.y + box.min.y) / 2;
  const cz = (box.max.z + box.min.z) / 2;
  geo.translate(-cx, -cy, -cz);

  geo.computeBoundingBox();
  box = geo.boundingBox!;
  const dx = box.max.x - box.min.x || 1;
  const dy = box.max.y - box.min.y || 1;
  const dz = box.max.z - box.min.z || 1;
  geo.scale(1 / dx, 1 / dy, 1 / dz);

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

export function MorphShape({ mode, area, content, flatZ }: MorphShapeProps) {
  const pizzaGeometry = useMemo(() => createUnitPizza(area.side as PizzaSide), [area.side]);
  const text = content.values[area.number - 1].text;

  // ----- transform spring (same as before) -----
  const targetPosition: [number, number, number] = [area.x, area.y, area.z];
  const targetRotation: [number, number, number] = area.rotate ?? [0, 0, 0];
  const targetScale: [number, number, number] = mode === "ball" ? [area.size, area.size, area.size] : [area.size, area.size, flatZ ? 1 : area.size];

  const { position, rotation, scale } = useSpring({
    position: targetPosition,
    rotation: targetRotation,
    scale: targetScale,
    config: { mass: 1, tension: 170, friction: 20 },
  });

  // ----- shape spring: fade shapes in/out when mode changes -----
  const { squareOpacity, ballOpacity, pizzaOpacity } = useSpring({
    squareOpacity: mode === "square" ? 1 : 0,
    ballOpacity: mode === "ball" ? 1 : 0,
    pizzaOpacity: mode === "pizza" ? 1 : 0,
    config: { tension: 170, friction: 26 },
  });

  // small helper to also shrink hidden shapes a bit
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scaleFromOpacity = (o: any) => o.to((v: number) => 0.2 + 0.8 * v);

  const color = area.color;

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <a.group position={position} rotation={rotation as any} scale={scale}>
      {/* SQUARE */}
      <a.group scale={scaleFromOpacity(squareOpacity)} onClick={() => console.log(area.number)}>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <a.meshStandardMaterial color={color} transparent opacity={squareOpacity} />
          <Edges color="#020618" />
        </mesh>
      </a.group>

      {/* BALL */}
      <a.group scale={scaleFromOpacity(ballOpacity)} onClick={() => console.log(area.number)}>
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <a.meshStandardMaterial color={color} transparent opacity={ballOpacity} />
        </mesh>
      </a.group>

      {/* PIZZA */}
      <a.group scale={scaleFromOpacity(pizzaOpacity)} onClick={() => console.log(area.number)}>
        <mesh>
          <primitive object={pizzaGeometry} />
          <a.meshStandardMaterial color={color} transparent opacity={pizzaOpacity} />
          <Edges color="#020618" />
        </mesh>
      </a.group>

      {/* label */}
      <group position={[0, 0, 0.51]}>
        <Text fontSize={0.3} color="#FFFFFF" anchorX="center" anchorY="middle" outlineWidth={content.key != "sign" ? 0.005 : 0} outlineColor="white">
          {text}
        </Text>
      </group>
    </a.group>
  );
}
