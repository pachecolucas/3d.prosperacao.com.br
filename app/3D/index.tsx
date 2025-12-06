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
  rotate?: [number, number, number];
};

type ViewKey = "infinity" | "boxes" | "vortex" | "fibonacci" | "fibonacci2";
type ContentKey = "number" | "favicon" | "logo" | "sign" | "planet";

export type View = {
  key: ViewKey;
  shape: MorphMode;
  areas: Area[];
  zoom: number;
  angleX: number; // vertical tilt (up/down)
  angleY: number; // horizontal orbit (left/right)
};

export type Content = {
  key: ContentKey;
  values: {
    text?: string;
    img?: string;
  }[];
};

const CONTENTS: Content[] = [
  { key: "number", values: [{ text: "1" }, { text: "2" }, { text: "3" }, { text: "4" }, { text: "5" }, { text: "6" }, { text: "7" }, { text: "8" }] },
  { key: "planet", values: [{ text: "♂" }, { text: "☾" }, { text: "☿" }, { text: "♄" }, { text: "♃" }, { text: "♆" }, { text: "☉" }, { text: "♀" }] },
  { key: "sign", values: [{ text: "♈️" }, { text: "♋️" }, { text: "♊️" }, { text: "♑️" }, { text: "♐️" }, { text: "♓️" }, { text: "♌️" }, { text: "♉️" }] },
];

const VIEWS: View[] = [
  {
    key: "infinity",
    shape: "pizza",
    areas: [
      { number: 1, x: -1.5, y: 0.5, z: 0, color: ELEMENTS.earth, size: 1, side: "top-left" },
      { number: 2, x: -0.5, y: 0.5, z: 0, color: ELEMENTS.water, size: 1, side: "top-right" },
      { number: 5, x: 1.5, y: 0.5, z: 0, color: ELEMENTS.air, size: 1, side: "top-right" },
      { number: 6, x: 0.5, y: 0.5, z: 0, color: ELEMENTS.fire, size: 1, side: "top-left" },
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
      { number: 5, x: 1.5, y: 0.5, z: 0, color: ELEMENTS.air, size: 1, side: "top-right" },
      { number: 6, x: 0.5, y: 0.5, z: 0, color: ELEMENTS.fire, size: 1, side: "top-left" },
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
    key: "fibonacci",
    shape: "square",
    areas: [
      { number: 1, x: -6.5, y: 0, z: 0, color: ELEMENTS.earth, size: 21, side: "top-left" },
      { number: 2, x: 10.5, y: 4, z: 0, color: ELEMENTS.water, size: 13, side: "top-right" },
      { number: 5, x: 5.5, y: -4, z: 0, color: ELEMENTS.air, size: 3, side: "top-left" },
      { number: 6, x: 8, y: -3.5, z: 0, color: ELEMENTS.fire, size: 2, side: "top-right" },
      { number: 8, x: 7.5, y: -5, z: 0, color: ELEMENTS.earth, size: 1, side: "bottom-left" },
      { number: 7, x: 8.5, y: -5, z: 0, color: ELEMENTS.water, size: 1, side: "bottom-right" },
      { number: 3, x: 13, y: -6.5, z: 0, color: ELEMENTS.fire, size: 8, side: "bottom-right" },
      { number: 4, x: 6.5, y: -8, z: 0, color: ELEMENTS.air, size: 5, side: "bottom-left" },
    ],
    zoom: 60,
    angleX: 0,
    angleY: Math.PI / 2,
  },
  {
    key: "fibonacci2",
    shape: "pizza",
    areas: [
      { number: 1, x: -6.5, y: 0, z: 0, color: ELEMENTS.earth, size: 21, side: "top-left" },
      { number: 2, x: 10.5, y: 4, z: 0, color: ELEMENTS.water, size: 13, side: "top-right" },
      { number: 5, x: 5.5, y: -4, z: 0, color: ELEMENTS.air, size: 3, side: "top-left" },
      { number: 6, x: 8, y: -3.5, z: 0, color: ELEMENTS.fire, size: 2, side: "top-right" },
      { number: 8, x: 7.5, y: -5, z: 0, color: ELEMENTS.earth, size: 1, side: "bottom-left" },
      { number: 7, x: 8.5, y: -5, z: 0, color: ELEMENTS.water, size: 1, side: "bottom-right" },
      { number: 3, x: 13, y: -6.5, z: 0, color: ELEMENTS.fire, size: 8, side: "bottom-right" },
      { number: 4, x: 6.5, y: -8, z: 0, color: ELEMENTS.air, size: 5, side: "bottom-left" },
    ],
    zoom: 60,
    angleX: 0,
    angleY: Math.PI / 2,
  },
  {
    key: "vortex",
    shape: "ball",
    areas: [
      { number: 1, x: 0.5, y: 0.5, z: 0.5, color: ELEMENTS.earth, size: 1.5, side: "top-left", rotate: [Math.PI / 8, Math.PI / 4, -Math.PI / 12] },
      { number: 2, x: 0.5, y: 0.5, z: -0.5, color: ELEMENTS.water, size: 1.5, side: "top-right", rotate: [Math.PI / 3, Math.PI / 2.7, -Math.PI / 4] },
      { number: 5, x: -0.5, y: 0.5, z: 0.5, color: ELEMENTS.air, size: 1.5, side: "top-right", rotate: [Math.PI / 8, Math.PI / 8, -Math.PI / 8] },
      { number: 6, x: -0.5, y: 0.5, z: -0.5, color: ELEMENTS.fire, size: 1.5, side: "top-right", rotate: [Math.PI * 1.2, -Math.PI / 4, Math.PI * 1.15] },

      { number: 3, x: 0.5, y: -0.5, z: 0.5, color: ELEMENTS.fire, size: 1.5, side: "top-right", rotate: [Math.PI / 4, Math.PI / 5, -Math.PI / 6] },
      { number: 4, x: 0.5, y: -0.5, z: -0.5, color: ELEMENTS.air, size: 1.5, side: "top-right", rotate: [Math.PI / 2.3, Math.PI / 5, -Math.PI / 3.5] },
      { number: 7, x: -0.5, y: -0.5, z: 0.5, color: ELEMENTS.water, size: 1.5, side: "top-right", rotate: [Math.PI / 3.7, Math.PI / 20, -Math.PI / 6] },
      { number: 8, x: -0.5, y: -0.5, z: -0.5, color: ELEMENTS.earth, size: 1.5, side: "top-left", rotate: [Math.PI / 2.5, Math.PI / 10, -Math.PI / 4] },
    ],
    zoom: 7,
    angleX: Math.PI / -4,
    angleY: Math.PI / 4,
  },
];

export default function ThreeScene() {
  const [view, setView] = useState<View>(VIEWS[2]);
  const [content, setContent] = useState<Content>(CONTENTS[0]);

  useEffect(() => {
    const handleKeypress = (event: KeyboardEvent) => {
      const { key } = event;
      switch (key) {
        case "ArrowRight":
          setContent(getNextContent(content.key));
          return;
        case "ArrowLeft":
          setContent(getNextContent(content.key, true));
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
  }, [view, content]);

  return (
    <div className="w-screen h-screen">
      <div className="flex gap-2 text-white absolute text-xs justify-center w-full p-1 z-10">
        {VIEWS.map((v) => (
          <div key={v.key} onClick={() => setView(v)} className={`border px-4 p-2 cursor-pointer ${v.key == view.key ? "font-bold opacity-35" : "opacity-15"} `}>
            {v.key}
          </div>
        ))}
      </div>

      <div className="flex gap-2 text-white fixed bottom-0 text-xs justify-center w-full p-1 z-10">
        {CONTENTS.map((c) => (
          <div key={c.key} onClick={() => setContent(c)} className={`border px-4 p-2 cursor-pointer ${c.key == content.key ? "font-bold opacity-35" : "opacity-15"} `}>
            {c.key}
          </div>
        ))}
      </div>
      <Canvas camera={{ position: [0, 0, 12], fov: 30 }}>
        <CameraRig view={view} />
        {view.areas.map((a) => (
          <MorphShape key={a.number} content={content} mode={view.shape} area={a} flatZ={view.key === "fibonacci" || view.key === "fibonacci2"} />
        ))}

        {/* lights */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

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

function getNextContent(key: ContentKey, backward = false) {
  console.log("getNextView", key);
  const index = CONTENTS.findIndex((e) => e.key === key);

  let nextIndex = CONTENTS.length > index + 1 ? index + 1 : 0;
  if (backward) {
    nextIndex = index - 1 < 0 ? CONTENTS.length - 1 : index - 1;
  }

  return CONTENTS[nextIndex];
}
