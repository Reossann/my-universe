"use client";

import { useEffect, useRef } from "react";
import { GAME_HEIGHT, GAME_WIDTH } from "../game/config/gameConfig";

export default function Game() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: import("phaser").Game | null = null;
    let cancelled = false;

    async function startGame() {
      // ブラウザ上でPhaserを読み込む
      const Phaser = (await import("phaser")).default;
      const { default: MainScene } = await import("../game/MainScene");

      if (cancelled || !containerRef.current) return;

      // ゲームの設定
      game = new Phaser.Game({
        type: Phaser.AUTO,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        parent: containerRef.current,
        backgroundColor: "#18251e",

        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },

        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },

        scene: [MainScene],
      });
    }

    startGame().catch(console.error);

    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    />
  );
}
