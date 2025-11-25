"use client";

type CubeProps = {
  position?: [number, number, number];
  color?: string;
  size?: number;
};

export function Cube({ position = [0, 0, 0], color = "#22c55e", size = 1 }: CubeProps) {
  const topRight = size > 1 ? (size - 1) / 2 : 0;
  const fixedPosition: [number, number, number] = [position[0] + topRight, position[1] - topRight, position[2]];
  return (
    <mesh position={fixedPosition}>
      <boxGeometry args={[size, size, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
