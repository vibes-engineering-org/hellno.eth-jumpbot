"use client";
import { useRef, useEffect, useState } from "react";

type Platform = {
  x: number;
  y: number;
  width: number;
  hazard: boolean;
  speed: number;
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
      vy: -15,
    };

    let platforms: Platform[] = [];
    const platformCount = 7;
    const spacing = height / platformCount;
    for (let i = 0; i < platformCount; i++) {
      const pw = 80;
      const px = Math.random() * (width - pw);
      const pyBase = height - i * spacing;
      const variation = (Math.random() - 0.5) * spacing * 0.6;
      const py = pyBase + variation;
      const speed = i === 0 ? 0 : (Math.random() * 2 + 1) * (Math.random() < 0.5 ? 1 : -1);
      platforms.push({ x: px, y: py, width: pw, hazard: Math.random() < 0.2, speed });
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
              player.vy = -15;
            }
          }
        });
      }

      // move platforms horizontally
      platforms.forEach(p => {
        p.x += p.speed;
        if (p.x <= 0 || p.x + p.width >= width) {
          p.speed *= -1;
        }
      });

      if (player.y < height * 0.4) {
        const dy = height * 0.4 - player.y;
        player.y = height * 0.4;
        platforms = platforms
          .map(p => ({ ...p, y: p.y + dy }))
          .filter(p => p.y < height);
        while (platforms.length < platformCount) {
          const pw = 80;
          const px = Math.random() * (width - pw);
          const pyBase = platforms[0].y - spacing;
          const variation = (Math.random() - 0.5) * spacing * 0.6;
          const py = pyBase + variation;
          const speed = (Math.random() * 2 + 1) * (Math.random() < 0.5 ? 1 : -1);
          platforms.unshift({ x: px, y: py, width: pw, hazard: Math.random() < 0.2, speed });
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

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
      {gameOver && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          color: "white",
        }}>
          <h1>Game Over</h1>
          <button style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
          }} onClick={() => setGameOver(false)}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
