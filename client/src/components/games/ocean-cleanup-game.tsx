import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface OceanCleanupGameProps {
  onGameComplete: (score: number) => void;
}

export const OceanCleanupGame = ({ onGameComplete }: OceanCleanupGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [gameState, setGameState] = useState<"waiting" | "playing" | "completed">("waiting");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [trashItems, setTrashItems] = useState<Array<{ 
    x: number; 
    y: number; 
    type: string; 
    collected: boolean; 
    id: number 
  }>>([]);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === "playing" && !gameCompleted) {
      setGameState("completed");
      setGameCompleted(true);
      onGameComplete(score);
    }
  }, [gameState, timeLeft, score, onGameComplete, gameCompleted]);

  useEffect(() => {
    if (gameState === "playing") {
      // Initialize trash items
      const initialTrash = [
        { x: 100, y: 150, type: "plastic", collected: false, id: 1 },
        { x: 250, y: 200, type: "bottle", collected: false, id: 2 },
        { x: 400, y: 100, type: "bag", collected: false, id: 3 },
        { x: 550, y: 250, type: "can", collected: false, id: 4 },
        { x: 150, y: 300, type: "straw", collected: false, id: 5 },
        { x: 350, y: 350, type: "net", collected: false, id: 6 }
      ];
      setTrashItems(initialTrash);
      console.log("Trash items initialized:", initialTrash);
    }
  }, [gameState]);

  useEffect(() => {
    if (!canvasRef.current || gameState !== "playing") return;

    const canvas = canvasRef.current;
    console.log("Canvas element:", canvas);
    
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Failed to get 2D context for canvas");
      return;
    }
    
    console.log("Canvas context obtained successfully");

    // Ensure canvas has proper dimensions
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        console.log("Canvas resized to:", canvas.width, "x", canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Draw function
    const draw = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw ocean background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0EA5E9");
      gradient.addColorStop(1, "#0284C7");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw waves
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.arc(i, 50, 10, 0, Math.PI);
        ctx.fill();
      }
      
      // Draw boat
      ctx.fillStyle = "#92400E";
      ctx.fillRect(canvas.width / 2 - 30, 30, 60, 30);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 20, 30);
      ctx.lineTo(canvas.width / 2, 10);
      ctx.lineTo(canvas.width / 2 + 20, 30);
      ctx.fill();
      
      // Draw trash items
      trashItems.forEach(item => {
        if (!item.collected) {
          let color = "#000000";
          let size = 20;
          switch (item.type) {
            case "plastic": color = "#000000"; size = 25; break;
            case "bottle": color = "#3B82F6"; size = 20; break;
            case "bag": color = "#EF4444"; size = 30; break;
            case "can": color = "#6B7280"; size = 15; break;
            case "straw": color = "#F59E0B"; size = 10; break;
            case "net": color = "#10B981"; size = 35; break;
          }
          
          ctx.fillStyle = color;
          ctx.fillRect(item.x, item.y, size, size);
          
          // Draw trash icon
          ctx.fillStyle = "white";
          ctx.font = "16px Arial";
          let icon = "";
          switch (item.type) {
            case "plastic": icon = "♺"; break;
            case "bottle": icon = "🍼"; break;
            case "bag": icon = "🛍️"; break;
            case "can": icon = "🥫"; break;
            case "straw": icon = "🥤"; break;
            case "net": icon = "🕸️"; break;
            default: icon = "🗑️";
          }
          ctx.fillText(icon, item.x + size/2 - 8, item.y + size/2 + 5);
        }
      });
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setTrashItems(prevTrash => 
        prevTrash.map(item => {
          let size = 20;
          switch (item.type) {
            case "plastic": size = 25; break;
            case "bottle": size = 20; break;
            case "bag": size = 30; break;
            case "can": size = 15; break;
            case "straw": size = 10; break;
            case "net": size = 35; break;
          }
          
          if (!item.collected && 
              x >= item.x && x <= item.x + size && 
              y >= item.y && y <= item.y + size) {
            setScore(prev => prev + 15);
            return { ...item, collected: true };
          }
          return item;
        })
      );
    };

    canvas.addEventListener("click", handleClick);

    const animationFrame = () => {
      draw();
      if (gameState === "playing") {
        animationRef.current = requestAnimationFrame(animationFrame);
      }
    };
    animationRef.current = requestAnimationFrame(animationFrame);

    return () => {
      canvas.removeEventListener("click", handleClick);
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, trashItems]);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(30);
    setGameCompleted(false);
  };

  if (gameState === "waiting") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="mb-4">
            <i className="fas fa-water text-5xl sm:text-6xl text-blue-500 mb-3 sm:mb-4"></i>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Ocean Cleanup Challenge</h3>
            <p className="text-muted-foreground text-sm">
              Click on trash items to remove them from the ocean!
            </p>
          </div>
          <Button onClick={startGame} className="w-full" data-testid="button-start-ocean-cleanup">
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
            <h3 className="text-xl font-bold mb-2">Ocean Cleaned!</h3>
            <p className="text-3xl font-bold text-blue-500 mb-4">{score} Points</p>
            <p className="text-muted-foreground">You're protecting marine life!</p>
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
          className="w-full h-64 sm:h-96 border border-border rounded-lg"
          data-testid="canvas-ocean-cleanup"
        />
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center">
          Click on the trash items to collect them and clean the ocean!
        </p>
      </CardContent>
    </Card>
  );
};