import React, { useEffect, useRef, useState } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const TICK_RATE_MS = 120;

type Point = { x: number; y: number };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game state held in refs for the loop without continuous re-renders
  const snakeRef = useRef<Point[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const directionRef = useRef<Point>({ x: 0, y: -1 });
  const nextDirectionRef = useRef<Point>({ x: 0, y: -1 });
  const foodRef = useRef<Point>({ x: 5, y: 5 });
  const isGameOverRef = useRef(false);
  const isPausedRef = useRef(true); // default paused before user starts

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPausedUi, setIsPausedUi] = useState(true);

  // Initialize random food
  const spawnFood = () => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      isOccupied = snakeRef.current.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!isOccupied) foodRef.current = newFood;
    }
  };

  const resetGame = () => {
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    directionRef.current = { x: 0, y: -1 };
    nextDirectionRef.current = { x: 0, y: -1 };
    isGameOverRef.current = false;
    setGameOver(false);
    setScore(0);
    spawnFood();
    resumeGame();
  };

  const startGame = () => {
    setHasStarted(true);
    if (!foodRef.current || (foodRef.current.x === 5 && foodRef.current.y === 5)) {
        spawnFood();
    }
    resumeGame();
  };

  const resumeGame = () => {
    if (isGameOverRef.current) return;
    isPausedRef.current = false;
    setIsPausedUi(false);
  };

  const pauseGame = () => {
    isPausedRef.current = true;
    setIsPausedUi(true);
  };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Space') {
          if (!hasStarted) {
              startGame();
          } else if (gameOver) {
              resetGame();
          } else if (isPausedUi) {
              resumeGame();
          } else {
              pauseGame();
          }
          return;
      }

      if (isPausedRef.current || isGameOverRef.current) return;

      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) nextDirectionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, hasStarted, isPausedUi]);

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;

    const gameLoop = (timestamp: number) => {
      if (timestamp - lastTime >= TICK_RATE_MS) {
        if (!isPausedRef.current && !isGameOverRef.current) {
          updateGame();
        }
        lastTime = timestamp;
      }
      // Always re-render so glow and effects can pulsate if needed
      drawGame(ctx);
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const updateGame = () => {
    const snake = [...snakeRef.current];
    directionRef.current = nextDirectionRef.current;
    const dir = directionRef.current;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wall collision
    if (
      head.x < 0 || head.x >= GRID_SIZE ||
      head.y < 0 || head.y >= GRID_SIZE
    ) {
      triggerGameOver();
      return;
    }

    // Self collision
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      triggerGameOver();
      return;
    }

    snake.unshift(head);

    // Food collision
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore((s) => s + 10);
      spawnFood();
    } else {
      snake.pop();
    }

    snakeRef.current = snake;
  };

  const triggerGameOver = () => {
    isGameOverRef.current = true;
    setGameOver(true);
  };

  const drawGame = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw Grid (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_SIZE; i += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    // Draw Food (Neon Magenta)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(
      foodRef.current.x * CELL_SIZE + CELL_SIZE / 2,
      foodRef.current.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw Snake (Neon Green)
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#39ff14';
    ctx.fillStyle = '#39ff14';
    
    snakeRef.current.forEach((segment, index) => {
      // Head is slightly brighter
      if (index === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#39ff14';
        ctx.shadowBlur = 20;
      } else {
        ctx.fillStyle = '#39ff14';
        ctx.shadowBlur = 10;
      }
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // Reset shadow
    ctx.shadowBlur = 0;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full max-w-[400px] justify-between items-center mb-4 px-2">
        <h2 className="text-xl font-bold text-white tracking-widest text-glow-cyan uppercase">SNAKE_OS</h2>
        <div className="bg-[#050505] border border-[#00ffff] rounded-sm px-4 py-1 border-glow-cyan">
          <span className="text-[#00ffff] font-mono font-bold text-lg text-glow-cyan">
            {score.toString().padStart(4, '0')}
          </span>
        </div>
      </div>
      
      <div className="relative border-4 border-glow-cyan rounded-lg overflow-hidden bg-black shadow-lg">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block"
        />

        {!hasStarted && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center">
             <button
                onClick={startGame}
                className="px-6 py-3 border-2 border-glow-magenta text-[#ff00ff] font-bold tracking-widest uppercase hover:bg-[#ff00ff]/10 hover:text-glow-magenta transition-all"
             >
                Initialize System
             </button>
             <span className="text-white/50 text-sm mt-4 font-mono uppercase">Press Space to start</span>
          </div>
        )}

        {hasStarted && isPausedUi && !gameOver && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm">
             <span className="text-[#00ffff] text-2xl font-bold uppercase tracking-widest text-glow-cyan mb-4">Paused</span>
             <button
                onClick={resumeGame}
                className="px-6 py-2 border border-glow-cyan text-[#00ffff] font-mono hover:bg-[#00ffff]/10 transition-all"
             >
                Resume
             </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-md">
            <h3 className="text-[#ff00ff] text-4xl font-black mb-2 uppercase text-glow-magenta">System Failure</h3>
            <p className="text-white font-mono mb-6 uppercase tracking-widest">Final Score: {score}</p>
            <button
                onClick={resetGame}
                className="px-6 py-3 border-2 border-glow-cyan text-[#00ffff] font-bold tracking-widest uppercase hover:bg-[#00ffff]/10 hover:text-glow-cyan transition-all"
            >
                Restart Reboot
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-[10px] text-white/40 font-mono tracking-widest uppercase">
        Controls: [W A S D] or [Arrows] -- [SPACE] to pause
      </div>
    </div>
  );
}
