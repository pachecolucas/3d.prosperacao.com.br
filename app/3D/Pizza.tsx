"use client";

import { useMemo } from "react";
import * as THREE from "three";

type PizzaSide = "top-right" | "top-left" | "bottom-right" | "bottom-left";

type QuarterPizzaProps = {
  side?: PizzaSide;
  size?: number;
  thickness?: number;
  color?: string;
  position?: [number, number, number];
};

function getStartAngle(side: PizzaSide): number {
  switch (side) {
    case "top-right":
      return 0; // 0 → 90°
    case "top-left":
      return Math.PI / 2; // 90° → 180°
    case "bottom-left":
      return Math.PI; // 180° → 270°
    case "bottom-right":
      return (3 * Math.PI) / 2; // 270° → 360°
    default:
      return 0;
  }
}

export default function QuarterPizza({ side = "top-right", size = 1, thickness = 0.5, color = "#facc15", position = [0, 0, 0] }: QuarterPizzaProps) {
  const radius = size;
  const centralizedPosition = getCentralizedPosition();

  function getCentralizedPosition(): [number, number, number] {
    if (side == "top-left") return [position[0] + 0.5, position[1] - 0.5, position[2]];
    if (side == "top-right") return [position[0] - 0.5, position[1] - 0.5, position[2]];
    if (side == "bottom-right") return [position[0] - 0.5, position[1] + 0.5, position[2]];
    return [position[0] + 0.5, position[1] + 0.5, position[2]]; // bottom-left
  }

  const shape = useMemo(() => {
    const start = getStartAngle(side);
    const end = start + Math.PI / 2; // 90° span

    const s = new THREE.Shape();
    s.moveTo(0, 0);

    // first radius line
    s.lineTo(radius * Math.cos(start), radius * Math.sin(start));

    // arc along the circle
    s.absarc(0, 0, radius, start, end, false);

    // back to center
    s.lineTo(0, 0);

    return s;
  }, [radius, side]);

  const extrudeSettings = useMemo(
    () => ({
      depth: thickness, // extrude along Z
      bevelEnabled: false,
    }),
    [thickness]
  );

  return (
    <group position={centralizedPosition}>
      {/* vertical, facing camera – centered */}
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
