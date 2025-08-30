import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface WasteSortingGameProps {
  onGameComplete: (score: number) => void;
}

export const WasteSortingGame = ({ onGameComplete }: WasteSortingGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"waiting" | "playing" | "completed">("waiting");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

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
    if (!canvasRef.current || gameState !== "playing") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Simple game implementation
    const items = [
      { x: 100, y: 100, type: "plastic", color: "#3B82F6" },
      { x: 200, y: 100, type: "paper", color: "#10B981" },
      { x: 300, y: 100, type: "organic", color: "#F59E0B" }
    ];

    const bins = [
      { x: 50, y: 300, type: "plastic", color: "#3B82F6" },
      { x: 200, y: 300, type: "paper", color: "#10B981" },
      { x: 350, y: 300, type: "organic", color: "#F59E0B" }
    ];

    let draggedItem: typeof items[0] | null = null;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw bins
      bins.forEach(bin => {
        ctx.fillStyle = bin.color;
        ctx.fillRect(bin.x, bin.y, 80, 60);
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText(bin.type, bin.x + 10, bin.y + 35);
      });

      // Draw items
      items.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(item.x, item.y, 40, 40);
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      draggedItem = items.find(item => 
        x >= item.x && x <= item.x + 40 && 
        y >= item.y && y <= item.y + 40
      ) || null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggedItem) return;
      
      const rect = canvas.getBoundingClientRect();
      draggedItem.x = e.clientX - rect.left - 20;
      draggedItem.y = e.clientY - rect.top - 20;
      draw();
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!draggedItem) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const targetBin = bins.find(bin =>
        x >= bin.x && x <= bin.x + 80 &&
        y >= bin.y && y <= bin.y + 60
      );

      if (targetBin && targetBin.type === draggedItem.type) {
        setScore(prev => prev + 10);
        // Remove the item
        const index = items.findIndex(item => item === draggedItem);
        if (index > -1) items.splice(index, 1);
      }

      draggedItem = null;
      draw();
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    draw();

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [gameState, score]);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(30);
  };

  if (gameState === "waiting") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="mb-4">
            <i className="fas fa-recycle text-5xl sm:text-6xl text-primary mb-3 sm:mb-4"></i>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Waste Sorting Challenge</h3>
            <p className="text-muted-foreground text-sm">
              Drag items to the correct recycling bins!
            </p>
          </div>
          <Button onClick={startGame} className="w-full" data-testid="button-start-waste-sorting">
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
            <h3 className="text-xl font-bold mb-2">Game Complete!</h3>
            <p className="text-3xl font-bold text-primary mb-4">{score} Points</p>
            <p className="text-muted-foreground">Great job sorting waste!</p>
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
          className="w-full h-64 sm:h-96 border border-border rounded-lg bg-gradient-to-br from-green-50 to-blue-50"
          data-testid="canvas-waste-sorting"
        />
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center">
          Drag the colored items to matching bins!
        </p>
      </CardContent>
    </Card>
  );
};
