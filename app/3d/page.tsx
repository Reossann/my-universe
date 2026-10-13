"use client";

import { Grid, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Mesh } from "three";

// 回転する立方体
function Cube() {
  const meshRef = useRef<Mesh>(null);
  const [color, setColor] = useState("royalblue");

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[-2, 1, 0]}
      onClick={() => setColor(color === "royalblue" ? "orange" : "royalblue")}
    >
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// 球体
function Sphere() {
  const [color, setColor] = useState("hotpink");

  return (
    <mesh
      position={[2, 1, 0]}
      onClick={() => setColor(color === "hotpink" ? "lime" : "hotpink")}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// 3D空間
function Scene() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={2} />

      <Cube />
      <Sphere />

      {/* 地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#232b40" />
      </mesh>

      {/* 座標を把握するためのグリッド */}
      <Grid
        position={[0, 0.01, 0]}
        args={[20, 20]}
        cellSize={1}
        sectionSize={5}
        cellColor="#555555"
        sectionColor="#888888"
        fadeDistance={30}
        infiniteGrid
      />

      <OrbitControls />
    </>
  );
}

// ページ
export default function ThreeDPage() {
  return (
    <main style={{ width: "100%", height: "100vh" }}>
      <Canvas camera={{ position: [5, 10, 8], fov: 90 }}>
        <color attach="background" args={["#101525"]} />
        <Scene />
      </Canvas>
    </main>
  );
}
