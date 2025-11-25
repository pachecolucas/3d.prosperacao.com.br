"use client";

type BallProps = {
  position?: [number, number, number];
  color?: string;
  size?: number;
};

export function Ball({ position = [0, 0, 0], color = "#3b82f6", size = 1 }: BallProps) {
  const radius = size / 2;
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
