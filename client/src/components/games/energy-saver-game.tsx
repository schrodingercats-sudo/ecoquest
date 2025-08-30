import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EnergySaverGameProps {
  onGameComplete: (score: number) => void;
}

export const EnergySaverGame = ({ onGameComplete }: EnergySaverGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [gameState, setGameState] = useState<"waiting" | "playing" | "completed">("waiting");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [appliances, setAppliances] = useState<Array<{ 
    x: number; 
    y: number; 
    type: string; 
    isOn: boolean; 
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
      // Initialize appliances
      const initialAppliances = [
        { x: 100, y: 100, type: "light", isOn: true, id: 1 },
        { x: 300, y: 100, type: "tv", isOn: true, id: 2 },
        { x: 500, y: 100, type: "ac", isOn: true, id: 3 },
        { x: 200, y: 250, type: "computer", isOn: true, id: 4 },
        { x: 400, y: 250, type: "fridge", isOn: true, id: 5 }
      ];
      setAppliances(initialAppliances);
      console.log("Appliances initialized:", initialAppliances);
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
      
      // Draw background
      ctx.fillStyle = "#F0F9FF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      appliances.forEach(appliance => {
        // Draw appliance
        ctx.fillStyle = appliance.isOn ? "#EF4444" : "#10B981";
        ctx.fillRect(appliance.x, appliance.y, 80, 60);
        
        // Draw appliance icon
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        let icon = "";
        switch (appliance.type) {
          case "light": icon = "💡"; break;
          case "tv": icon = "📺"; break;
          case "ac": icon = "❄️"; break;
          case "computer": icon = "💻"; break;
          case "fridge": icon = "🧊"; break;
          default: icon = "🔌";
        }
        ctx.fillText(icon, appliance.x + 25, appliance.y + 40);
        
        // Draw label
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(appliance.type, appliance.x + 10, appliance.y + 75);
      });
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setAppliances(prevAppliances => 
        prevAppliances.map(appliance => {
          if (x >= appliance.x && x <= appliance.x + 80 && 
              y >= appliance.y && y <= appliance.y + 60 && 
              appliance.isOn) {
            setScore(prev => prev + 10);
            return { ...appliance, isOn: false };
          }
          return appliance;
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
  }, [gameState, appliances]);

  const startGame = () => {
    console.log("Starting Energy Saver game");
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
            <i className="fas fa-bolt text-5xl sm:text-6xl text-yellow-500 mb-3 sm:mb-4"></i>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Energy Saver Challenge</h3>
            <p className="text-muted-foreground text-sm">
              Click on appliances to turn them off and save energy!
            </p>
          </div>
          <Button onClick={startGame} className="w-full" data-testid="button-start-energy-saver">
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
            <h3 className="text-xl font-bold mb-2">Energy Saved!</h3>
            <p className="text-3xl font-bold text-yellow-500 mb-4">{score} Points</p>
            <p className="text-muted-foreground">Great job reducing energy consumption!</p>
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
          className="w-full h-64 sm:h-96 border border-border rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50"
          data-testid="canvas-energy-saver"
        />
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center">
          Click on the red appliances to turn them off and save energy!
        </p>
      </CardContent>
    </Card>
  );
};