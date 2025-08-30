import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface WaterSaverGameProps {
  onGameComplete: (score: number) => void;
}

export const WaterSaverGame = ({ onGameComplete }: WaterSaverGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"waiting" | "playing" | "completed">("waiting");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [taps, setTaps] = useState<Array<{ x: number; y: number; dripping: boolean; id: number }>>([]);

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === "playing") {
      setGameState("completed");
      onGameComplete(score);
    }
  }, [gameState, timeLeft, score, onGameComplete]);

  useEffect(() => {
    if (gameState === "playing") {
      // Initialize taps
      const initialTaps = [
        { x: 100, y: 100, dripping: true, id: 1 },
        { x: 300, y: 100, dripping: true, id: 2 },
        { x: 500, y: 100, dripping: true, id: 3 }
      ];
      setTaps(initialTaps);
    }
  }, [gameState]);

  useEffect(() => {
    if (!canvasRef.current || gameState !== "playing") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      taps.forEach(tap => {
        // Draw tap
        ctx.fillStyle = tap.dripping ? "#EF4444" : "#10B981";
        ctx.fillRect(tap.x, tap.y, 60, 40);
        
        // Draw handle
        ctx.fillStyle = "#6B7280";
        ctx.fillRect(tap.x + 65, tap.y + 10, 20, 20);
        
        // Draw drips if dripping
        if (tap.dripping) {
          ctx.fillStyle = "#3B82F6";
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(tap.x + 30, tap.y + 50 + (i * 20), 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        // Draw label
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText("TAP", tap.x + 20, tap.y + 25);
      });
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setTaps(prevTaps => 
        prevTaps.map(tap => {
          if (x >= tap.x && x <= tap.x + 85 && 
              y >= tap.y && y <= tap.y + 40 && 
              tap.dripping) {
            setScore(prev => prev + 5);
            return { ...tap, dripping: false };
          }
          return tap;
        })
      );
    };

    canvas.addEventListener("click", handleClick);

    const animationFrame = () => {
      draw();
      if (gameState === "playing") {
        requestAnimationFrame(animationFrame);
      }
    };
    animationFrame();

    return () => {
      canvas.removeEventListener("click", handleClick);
    };
  }, [gameState, taps, score]);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(10);
  };

  if (gameState === "waiting") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="mb-4">
            <i className="fas fa-tint text-5xl sm:text-6xl text-blue-500 mb-3 sm:mb-4"></i>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Water Saver Challenge</h3>
            <p className="text-muted-foreground text-sm">
              Click on dripping taps to stop water waste!
            </p>
          </div>
          <Button onClick={startGame} className="w-full" data-testid="button-start-water-saver">
            Start Game
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === "completed") {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6">
            <i className="fas fa-trophy text-6xl text-accent mb-4"></i>
            <h3 className="text-xl font-bold mb-2">Water Saved!</h3>
            <p className="text-3xl font-bold text-blue-500 mb-4">{score} Points</p>
            <p className="text-muted-foreground">Every drop counts!</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <div className="text-base sm:text-lg font-semibold">Score: {score}</div>
          <div className="text-base sm:text-lg font-semibold">Time: {timeLeft}s</div>
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-64 sm:h-96 border border-border rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50"
          data-testid="canvas-water-saver"
        />
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center">
          Click on the red dripping taps to turn them off!
        </p>
      </CardContent>
    </Card>
  );
};
