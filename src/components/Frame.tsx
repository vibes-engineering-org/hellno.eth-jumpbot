"use client";
import { useRef, useEffect, useState } from "react";

type Platform = {
  x: number;
  y: number;
  width: number;
  hazard: boolean;
};

type Player = {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
};

export default function Frame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const gravity = 0.5;
    const player: Player = {
      x: width / 2 - 15,
      y: height - 60,
      width: 30,
      height: 30,
      vx: 0,
      vy: -10,
    };

    let platforms: Platform[] = [];
    const platformCount = 7;
    for (let i = 0; i < platformCount; i++) {
      const pw = 80;
      const px = Math.random() * (width - pw);
      const py = height - i * (height / platformCount);
      platforms.push({ x: px, y: py, width: pw, hazard: Math.random() < 0.2 });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      platforms.forEach(p => {
        ctx.fillStyle = p.hazard ? "red" : "green";
        ctx.fillRect(p.x, p.y, p.width, 10);
      });
      ctx.fillStyle = "blue";
      ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    function update() {
      if (gameOver) return;
      player.vy += gravity;
      player.y += player.vy;
      player.x += player.vx;
      if (player.x < 0) player.x = 0;
      if (player.x + player.width > width) player.x = width - player.width;

      if (player.vy > 0) {
        platforms.forEach(p => {
          if (
            player.y + player.height >= p.y &&
            player.y + player.height <= p.y + player.vy &&
            player.x + player.width > p.x &&
            player.x < p.x + p.width
          ) {
            if (p.hazard) {
              setGameOver(true);
            } else {
              player.vy = -10;
            }
          }
        });
      }

      if (player.y < height * 0.4) {
        const dy = height * 0.4 - player.y;
        player.y = height * 0.4;
        platforms = platforms
          .map(p => ({ ...p, y: p.y + dy }))
          .filter(p => p.y < height);
        while (platforms.length < platformCount) {
          const pw = 80;
          const px = Math.random() * (width - pw);
          const py = platforms[0].y - height / platformCount;
          platforms.unshift({ x: px, y: py, width: pw, hazard: Math.random() < 0.2 });
        }
      }

      if (player.y > height) {
        setGameOver(true);
      }
    }

    function loop() {
      update();
      draw();
      if (!gameOver) {
        requestAnimationFrame(loop);
      } else {
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over", width / 2 - 70, height / 2);
        ctx.fillText("Tap to Restart", width / 2 - 90, height / 2 + 40);
      }
    }

    loop();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") player.vx = -5;
      if (e.key === "ArrowRight") player.vx = 5;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") player.vx = 0;
    };
    const handleMouseDown = (e: MouseEvent) => {
      player.vx = e.clientX < width / 2 ? -5 : 5;
    };
    const handleMouseUp = () => {
      player.vx = 0;
      if (gameOver) window.location.reload();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [gameOver]);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
}
