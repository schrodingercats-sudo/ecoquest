import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PlantTreeGameProps {
  onGameComplete: (score: number) => void;
}

export const PlantTreeGame = ({ onGameComplete }: PlantTreeGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"waiting" | "playing" | "completed">("waiting");
  const [treeStage, setTreeStage] = useState(0); // 0: seed, 1: sprout, 2: sapling, 3: tree
  const [waterClicks, setWaterClicks] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (treeStage >= 3) {
      setGameState("completed");
      onGameComplete(score);
    }
  }, [treeStage, score, onGameComplete]);

  useEffect(() => {
    if (!canvasRef.current || gameState !== "playing") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw ground
      ctx.fillStyle = "#8B5CF6";
      ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
      
      const centerX = canvas.width / 2;
      const groundY = canvas.height - 100;
      
      // Draw tree based on stage
      if (treeStage === 0) {
        // Seed
        ctx.fillStyle = "#D97706";
        ctx.beginPath();
        ctx.arc(centerX, groundY - 10, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (treeStage === 1) {
        // Sprout
        ctx.fillStyle = "#10B981";
        ctx.fillRect(centerX - 3, groundY - 40, 6, 30);
        ctx.beginPath();
        ctx.arc(centerX, groundY - 40, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (treeStage === 2) {
        // Sapling
        ctx.fillStyle = "#92400E";
        ctx.fillRect(centerX - 5, groundY - 80, 10, 70);
        ctx.fillStyle = "#10B981";
        ctx.beginPath();
        ctx.arc(centerX, groundY - 80, 20, 0, Math.PI * 2);
        ctx.fill();
      } else if (treeStage >= 3) {
        // Full tree
        ctx.fillStyle = "#92400E";
        ctx.fillRect(centerX - 8, groundY - 120, 16, 110);
        ctx.fillStyle = "#10B981";
        ctx.beginPath();
        ctx.arc(centerX, groundY - 120, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX - 20, groundY - 100, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + 20, groundY - 100, 25, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw watering can button area
      ctx.fillStyle = "#3B82F6";
      ctx.fillRect(canvas.width - 100, canvas.height - 80, 80, 60);
      ctx.fillStyle = "white";
      ctx.font = "14px Arial";
      ctx.fillText("💧 Water", canvas.width - 95, canvas.height - 45);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if clicked on watering can
      if (x >= canvas.width - 100 && x <= canvas.width - 20 && 
          y >= canvas.height - 80 && y <= canvas.height - 20) {
        setWaterClicks(prev => {
          const newClicks = prev + 1;
          
          if (newClicks >= 5 && treeStage === 0) {
            setTreeStage(1);
            setScore(prev => prev + 25);
          } else if (newClicks >= 10 && treeStage === 1) {
            setTreeStage(2);
            setScore(prev => prev + 50);
          } else if (newClicks >= 15 && treeStage === 2) {
            setTreeStage(3);
            setScore(prev => prev + 100);
          }
          
          return newClicks;
        });
      }
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
  }, [gameState, treeStage, waterClicks, score]);

  const startGame = () => {
    setGameState("playing");
    setTreeStage(0);
    setWaterClicks(0);
    setScore(0);
  };

  if (gameState === "waiting") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="mb-4">
            <i className="fas fa-seedling text-5xl sm:text-6xl text-green-500 mb-3 sm:mb-4"></i>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Plant a Tree Challenge</h3>
            <p className="text-muted-foreground text-sm">
              Water your tree and watch it grow through 3 stages!
            </p>
          </div>
          <Button onClick={startGame} className="w-full" data-testid="button-start-plant-tree">
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
            <h3 className="text-xl font-bold mb-2">Tree Fully Grown!</h3>
            <p className="text-3xl font-bold text-green-500 mb-4">{score} Points</p>
            <p className="text-muted-foreground">You earned the Green Thumb badge!</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <div className="text-base sm:text-lg font-semibold">Stage: {treeStage + 1}/4</div>
          <div className="text-base sm:text-lg font-semibold">Waters: {waterClicks}</div>
          <div className="text-base sm:text-lg font-semibold">Score: {score}</div>
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-64 sm:h-96 border border-border rounded-lg bg-gradient-to-br from-amber-50 to-green-100"
          data-testid="canvas-plant-tree"
        />
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center">
          Click the blue watering button to help your tree grow!
        </p>
      </CardContent>
    </Card>
  );
};
