import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CarbonFootprintGameProps {
  onGameComplete: (score: number) => void;
}

export const CarbonFootprintGame = ({ onGameComplete }: CarbonFootprintGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [gameState, setGameState] = useState<"waiting" | "playing" | "completed">("waiting");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activities, setActivities] = useState<Array<{ 
    x: number; 
    y: number; 
    type: string; 
    isEcoFriendly: boolean; 
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
      // Initialize activities
      const initialActivities = [
        { x: 100, y: 100, type: "car", isEcoFriendly: false, id: 1 },
        { x: 300, y: 100, type: "bike", isEcoFriendly: true, id: 2 },
        { x: 500, y: 100, type: "plane", isEcoFriendly: false, id: 3 },
        { x: 200, y: 250, type: "bus", isEcoFriendly: true, id: 4 },
        { x: 400, y: 250, type: "walk", isEcoFriendly: true, id: 5 },
        { x: 150, y: 400, type: "ac", isEcoFriendly: false, id: 6 },
        { x: 350, y: 400, type: "fan", isEcoFriendly: true, id: 7 }
      ];
      setActivities(initialActivities);
      console.log("Activities initialized:", initialActivities);
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
      ctx.fillStyle = "#ECFDF5";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      activities.forEach(activity => {
        // Draw activity
        ctx.fillStyle = activity.isEcoFriendly ? "#10B981" : "#EF4444";
        ctx.fillRect(activity.x, activity.y, 80, 60);
        
        // Draw activity icon
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        let icon = "";
        switch (activity.type) {
          case "car": icon = "🚗"; break;
          case "bike": icon = "🚲"; break;
          case "plane": icon = "✈️"; break;
          case "bus": icon = "🚌"; break;
          case "walk": icon = "🚶"; break;
          case "ac": icon = "❄️"; break;
          case "fan": icon = "🌀"; break;
          default: icon = "🌍";
        }
        ctx.fillText(icon, activity.x + 25, activity.y + 40);
        
        // Draw label
        ctx.fillStyle = "black";
        ctx.font = "10px Arial";
        ctx.fillText(activity.type, activity.x + 10, activity.y + 75);
      });
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setActivities(prevActivities => 
        prevActivities.map(activity => {
          if (x >= activity.x && x <= activity.x + 80 && 
              y >= activity.y && y <= activity.y + 60) {
            if (activity.isEcoFriendly) {
              setScore(prev => prev + 20);
            } else {
              setScore(prev => Math.max(0, prev - 10)); // Deduct points for non-eco-friendly choices
            }
            return activity;
          }
          return activity;
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
  }, [gameState, activities]);

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
            <i className="fas fa-leaf text-5xl sm:text-6xl text-green-500 mb-3 sm:mb-4"></i>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Carbon Footprint Challenge</h3>
            <p className="text-muted-foreground text-sm">
              Click on eco-friendly activities to reduce your carbon footprint!
            </p>
          </div>
          <Button onClick={startGame} className="w-full" data-testid="button-start-carbon-footprint">
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
            <h3 className="text-xl font-bold mb-2">Carbon Reduced!</h3>
            <p className="text-3xl font-bold text-green-500 mb-4">{score} Points</p>
            <p className="text-muted-foreground">You're making a positive environmental impact!</p>
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
          className="w-full h-64 sm:h-96 border border-border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50"
          data-testid="canvas-carbon-footprint"
        />
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center">
          Click on green activities to gain points, avoid red ones!
        </p>
      </CardContent>
    </Card>
  );
};