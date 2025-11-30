"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useState } from "react";
import { MorphShape, MorphMode } from "./Morph";
import CameraRig from "./CameraRig";

const ELEMENTS = {
  fire: "#FFFF00",
  air: "#0000FF",
  water: "#00FF00",
  earth: "#FF0000",
};

export type Area = {
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
  side: "top-left" | "top-right" | "bottom-right" | "bottom-left";
};

type ViewKey = "infinity" | "boxes" | "vortex" | "fibonatti";

export type View = {
  key: ViewKey;
  shape: MorphMode;
  areas: Area[];
  zoom: number;
  angleX: number; // vertical tilt (up/down)
  angleY: number; // horizontal orbit (left/right)
};

const VIEWS: View[] = [
  {
    key: "infinity",
    shape: "pizza",
    areas: [
      { number: 1, x: -1.5, y: 0.5, z: 0, color: ELEMENTS.earth, size: 1, side: "top-left" },
      { number: 2, x: -0.5, y: 0.5, z: 0, color: ELEMENTS.water, size: 1, side: "top-right" },
      { number: 5, x: 0.5, y: 0.5, z: 0, color: ELEMENTS.fire, size: 1, side: "top-left" },
      { number: 6, x: 1.5, y: 0.5, z: 0, color: ELEMENTS.air, size: 1, side: "top-right" },
      { number: 8, x: -1.5, y: -0.5, z: 0, color: ELEMENTS.earth, size: 1, side: "bottom-left" },
      { number: 7, x: -0.5, y: -0.5, z: 0, color: ELEMENTS.water, size: 1, side: "bottom-right" },
      { number: 3, x: 0.5, y: -0.5, z: 0, color: ELEMENTS.fire, size: 1, side: "bottom-left" },
      { number: 4, x: 1.5, y: -0.5, z: 0, color: ELEMENTS.air, size: 1, side: "bottom-right" },
    ],
    zoom: 6,
    angleX: 0,
    angleY: Math.PI / 2,
  },
  {
    key: "boxes",
    shape: "square",
    areas: [
      { number: 1, x: -1.5, y: 0.5, z: 0, color: ELEMENTS.earth, size: 1, side: "top-left" },
      { number: 2, x: -0.5, y: 0.5, z: 0, color: ELEMENTS.water, size: 1, side: "top-right" },
      { number: 5, x: 0.5, y: 0.5, z: 0, color: ELEMENTS.fire, size: 1, side: "top-left" },
      { number: 6, x: 1.5, y: 0.5, z: 0, color: ELEMENTS.air, size: 1, side: "top-right" },
      { number: 8, x: -1.5, y: -0.5, z: 0, color: ELEMENTS.earth, size: 1, side: "bottom-left" },
      { number: 7, x: -0.5, y: -0.5, z: 0, color: ELEMENTS.water, size: 1, side: "bottom-right" },
      { number: 3, x: 0.5, y: -0.5, z: 0, color: ELEMENTS.fire, size: 1, side: "bottom-left" },
      { number: 4, x: 1.5, y: -0.5, z: 0, color: ELEMENTS.air, size: 1, side: "bottom-right" },
    ],
    zoom: 6,
    angleX: 0,
    angleY: Math.PI / 2,
  },
  {
    key: "vortex",
    shape: "ball",
    areas: [
      { number: 1, x: 0.5, y: 0.5, z: 0.5, color: ELEMENTS.earth, size: 1.5, side: "top-left" },
      { number: 2, x: -0.5, y: 0.5, z: 0.5, color: ELEMENTS.air, size: 1.5, side: "top-right" },
      { number: 5, x: 0.5, y: 0.5, z: -0.5, color: ELEMENTS.water, size: 1.5, side: "top-right" },
      { number: 6, x: -0.5, y: 0.5, z: -0.5, color: ELEMENTS.fire, size: 1.5, side: "top-right" },
      { number: 8, x: 0.5, y: -0.5, z: 0.5, color: ELEMENTS.fire, size: 1.5, side: "top-left" },
      { number: 7, x: -0.5, y: -0.5, z: 0.5, color: ELEMENTS.water, size: 1.5, side: "top-right" },
      { number: 3, x: 0.5, y: -0.5, z: -0.5, color: ELEMENTS.air, size: 1.5, side: "top-right" },
      { number: 4, x: -0.5, y: -0.5, z: -0.5, color: ELEMENTS.earth, size: 1.5, side: "top-right" },
    ],
    zoom: 7,
    angleX: Math.PI / -4,
    angleY: Math.PI / 4,
    // angleX: 0,
    // angleY: 0,
  },
  {
    key: "fibonatti",
    shape: "square",
    areas: [
      { number: 1, x: -6.5, y: 0, z: 0, color: ELEMENTS.earth, size: 21, side: "top-left" },
      { number: 2, x: 10.5, y: 4, z: 0, color: ELEMENTS.water, size: 13, side: "top-right" },
      { number: 5, x: 5.5, y: -4, z: 0, color: ELEMENTS.fire, size: 3, side: "top-left" },
      { number: 6, x: 8, y: -3.5, z: 0, color: ELEMENTS.air, size: 2, side: "top-right" },
      { number: 8, x: 7.5, y: -5, z: 0, color: ELEMENTS.earth, size: 1, side: "bottom-left" },
      { number: 7, x: 8.5, y: -5, z: 0, color: ELEMENTS.water, size: 1, side: "bottom-right" },
      { number: 3, x: 13, y: -6.5, z: 0, color: ELEMENTS.fire, size: 8, side: "bottom-right" },
      { number: 4, x: 6.5, y: -8, z: 0, color: ELEMENTS.air, size: 5, side: "bottom-left" },
    ],
    zoom: 60,
    angleX: 0,
    angleY: Math.PI / 2,
  },
];

export default function ThreeScene() {
  const [view, setView] = useState<View>(VIEWS[2]);

  function getShapeRotation(v: View): [number, number, number] {
    if (v.key != "vortex") return [0, 0, 0];
    // return [Math.PI / 8, 0, Math.PI / -8];
    return [Math.PI / 4, Math.PI / 4.5, Math.PI / -5.6];
  }

  useEffect(() => {
    const handleKeypress = (event: KeyboardEvent) => {
      const { key } = event;
      switch (key) {
        case "ArrowRight":
          return;
        case "ArrowLeft":
          return;
        case "ArrowDown":
          setView(getNextView(view.key));
          return;
        case "ArrowUp":
          setView(getNextView(view.key, true));
          return;
      }
    };
    window.addEventListener("keydown", handleKeypress);
    return () => window.removeEventListener("keydown", handleKeypress);
  }, [view]);

  return (
    <div className="w-screen h-screen">
      <div className="flex gap-2 text-white absolute">
        {VIEWS.map((v) => (
          <span key={v.key} onClick={() => setView(v)} className={`${v.key == view.key ? "font-bold" : ""} `}>
            {v.key} OI
          </span>
        ))}
      </div>
      <Canvas camera={{ position: [0, 0, 12], fov: 30 }}>
        <CameraRig view={view} />
        {view.areas.map((a) => (
          <MorphShape key={a.number} mode={view.shape} area={a} rotation={getShapeRotation(view)} />
        ))}
        {/* background */}
        {/* <color attach="background" args={["#020617"]} /> */}

        {/* lights */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        {/* 
        {view.areas.map((a) => (
          <MorphShape key={a.number} mode={view.shape} position={[a.x, a.y, a.z]} color={a.color} size={a.size} pizzaSide={a.side} />
        ))} */}

        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}

function getNextView(key: ViewKey, backward = false) {
  console.log("getNextView", key);
  const index = VIEWS.findIndex((e) => e.key === key);

  let nextIndex = VIEWS.length > index + 1 ? index + 1 : 0;
  if (backward) {
    nextIndex = index - 1 < 0 ? VIEWS.length - 1 : index - 1;
  }

  return VIEWS[nextIndex];
}
