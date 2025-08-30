import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WasteSortingGame } from "@/components/games/waste-sorting-game";
import { WaterSaverGame } from "@/components/games/water-saver-game";
import { PlantTreeGame } from "@/components/games/plant-tree-game";
import { EnergySaverGame } from "@/components/games/energy-saver-game";
import { OceanCleanupGame } from "@/components/games/ocean-cleanup-game";
import { CarbonFootprintGame } from "@/components/games/carbon-footprint-game";
import { EcoFactModal } from "@/components/eco-fact-modal";
import { doc, updateDoc, increment, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BadgeType } from "@shared/schema";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

const ECO_FACTS = [
  {
    title: "Every minute, one million plastic bottles are purchased worldwide!",
    description: "By reducing single-use plastics, you can help save marine life and reduce ocean pollution."
  },
  {
    title: "A single tree can absorb 48 pounds of CO2 per year!",
    description: "Planting trees is one of the most effective ways to combat climate change."
  },
  {
    title: "Turning off the tap while brushing teeth saves 8 gallons of water!",
    description: "Small water-saving habits can make a huge environmental impact."
  },
  {
    title: "Recycling one aluminum can saves enough energy to run a TV for 3 hours!",
    description: "Your small actions can have a big impact on energy conservation."
  },
  {
    title: "A single reusable water bottle can save 156 plastic bottles per year!",
    description: "Making sustainable choices adds up to significant environmental benefits."
  }
];

export default function GamesDashboard() {
  const { user, loading, firebaseUser } = useAuth();
  const [, setLocation] = useLocation();
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [showEcoFact, setShowEcoFact] = useState(false);
  const [currentFact, setCurrentFact] = useState(ECO_FACTS[0]);
  const [userData, setUserData] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
      // Hide welcome message after 5 seconds
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Set a timeout for loading state
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.log("Loading timeout reached, showing timeout state");
        setLoadingTimeout(true);
      }, 8000); // 8 second timeout
      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);

  // Debug logging
  useEffect(() => {
    console.log("=== GAMES DASHBOARD AUTH STATE ===");
    console.log("User:", user ? { name: user.name, role: user.role, id: user.id } : "null");
    console.log("Loading:", loading);
    console.log("Firebase User:", firebaseUser ? firebaseUser.email : "null");
    console.log("User Role:", user?.role);
    console.log("Is Authenticated:", !!firebaseUser);
    console.log("Loading Timeout:", loadingTimeout);
    console.log("Current URL:", window.location.pathname);
  }, [user, loading, firebaseUser, loadingTimeout]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      console.log("Fetching user data for user ID:", user.id);
      const userDoc = await getDoc(doc(db, "users", user.id));
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log("User data from Firestore:", data);
        setUserData({ id: user.id, ...data });
      } else {
        console.log("No user document found in Firestore");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleGameComplete = async (gameType: string, score: number) => {
    // Show random eco fact for all users
    const randomFact = ECO_FACTS[Math.floor(Math.random() * ECO_FACTS.length)];
    setCurrentFact(randomFact);
    setShowEcoFact(true);

    // Reset game
    setCurrentGame(null);

    // Only save progress if user is authenticated
    if (!user || !isAuthenticated) {
      console.log("Guest user completed game:", gameType, "Score:", score);
      return;
    }

    try {
      const userRef = doc(db, "users", user.id);
      
      // Update user score in Firestore
      await updateDoc(userRef, {
        totalPoints: increment(score),
        lastActive: new Date()
      });

      // Also update user score in Supabase
      const { error: supabaseUserError } = await supabase
        .from('users')
        .update({ 
          total_points: user.totalPoints + score,
          last_active: new Date()
        })
        .eq('id', user.id);

      if (supabaseUserError) {
        console.error("Error updating user in Supabase:", supabaseUserError);
      } else {
        console.log("User score also updated in Supabase");
      }

      // Store game score in Supabase
      const { error: gameScoreError } = await supabase
        .from('game_scores')
        .insert({
          user_id: user.id,
          game_type: gameType,
          score: score,
          completed_at: new Date()
        });

      if (gameScoreError) {
        console.error("Error storing game score in Supabase:", gameScoreError);
      } else {
        console.log("Game score stored in Supabase");
      }

      // Award badges based on game and score
      let badgeEarned: BadgeType | null = null;
      let badgeMessage = "";

      if (gameType === "waste_sorting") {
        if (score >= 80) {
          badgeEarned = "waste_warrior";
          badgeMessage = "🏆 Waste Warrior Badge Earned! You're a recycling expert!";
        } else if (score >= 50) {
          badgeEarned = "waste_warrior";
          badgeMessage = "🏆 Waste Warrior Badge Earned! Great job sorting waste!";
        }
      } else if (gameType === "water_saver") {
        if (score >= 40) {
          badgeEarned = "water_saver";
          badgeMessage = "💧 Water Saver Badge Earned! You're a water conservation hero!";
        } else if (score >= 25) {
          badgeEarned = "water_saver";
          badgeMessage = "💧 Water Saver Badge Earned! Keep saving water!";
        }
      } else if (gameType === "plant_tree") {
        if (score >= 150) {
          badgeEarned = "green_thumb";
          badgeMessage = "🌱 Green Thumb Badge Earned! You're a tree planting master!";
        } else if (score >= 100) {
          badgeEarned = "green_thumb";
          badgeMessage = "🌱 Green Thumb Badge Earned! Your trees are thriving!";
        }
      } else if (gameType === "energy_saver") {
        if (score >= 150) {
          badgeEarned = "carbon_crusher";
          badgeMessage = "⚡ Carbon Crusher Badge Earned! You're an energy saving expert!";
        } else if (score >= 100) {
          badgeEarned = "carbon_crusher";
          badgeMessage = "⚡ Carbon Crusher Badge Earned! Great job saving energy!";
        }
      } else if (gameType === "ocean_cleanup") {
        if (score >= 120) {
          badgeEarned = "ocean_guardian";
          badgeMessage = "🌊 Ocean Guardian Badge Earned! You're protecting marine life!";
        } else if (score >= 80) {
          badgeEarned = "ocean_guardian";
          badgeMessage = "🌊 Ocean Guardian Badge Earned! Keep cleaning our oceans!";
        }
      } else if (gameType === "carbon_footprint") {
        if (score >= 200) {
          badgeEarned = "climate_champion";
          badgeMessage = "🌍 Climate Champion Badge Earned! You're fighting climate change!";
        } else if (score >= 150) {
          badgeEarned = "climate_champion";
          badgeMessage = "🌍 Climate Champion Badge Earned! Your eco-choices make a difference!";
        }
      }

      // Check if user already has this badge
      const hasBadge = badgeEarned ? (userData?.badges?.includes(badgeEarned) || user?.badges?.includes(badgeEarned)) : false;
      
      if (badgeEarned && !hasBadge) {
        await updateDoc(userRef, {
          badges: arrayUnion(badgeEarned)
        });
      
        // Also update badges in Supabase
        const currentBadges = userData?.badges || user?.badges || [];
        const updatedBadges = [...currentBadges, badgeEarned];
      
        const { error: supabaseBadgeError } = await supabase
          .from('users')
          .update({ badges: updatedBadges })
          .eq('id', user.id);

        if (supabaseBadgeError) {
          console.error("Error updating badges in Supabase:", supabaseBadgeError);
        } else {
          console.log("Badges also updated in Supabase");
        }
      
        // Store badge earned in Supabase game scores
        const { error: badgeScoreError } = await supabase
          .from('game_scores')
          .update({ badge_earned: badgeEarned })
          .eq('user_id', user.id)
          .eq('game_type', gameType)
          .order('completed_at', { ascending: false })
          .limit(1);

        if (badgeScoreError) {
          console.error("Error updating badge in game score Supabase:", badgeScoreError);
        } else {
          console.log("Badge earned stored in game score Supabase");
        }
      
        // Show badge earned notification
        setCurrentFact({
          title: badgeMessage,
          description: `Congratulations! You've earned the ${getBadgeName(badgeEarned)} badge for your excellent performance in the ${gameType.replace('_', ' ')} game!`
        });
        setShowEcoFact(true);
      }

      // Check for special badges based on total badges earned
      const currentBadges = userData?.badges || user?.badges || [];
      const newBadgeCount = badgeEarned && !hasBadge ? currentBadges.length + 1 : currentBadges.length;
    
      let specialBadgeEarned: BadgeType | null = null;
      if (newBadgeCount >= 5 && !currentBadges.includes("eco_champion")) {
        specialBadgeEarned = "eco_champion";
      } else if (newBadgeCount >= 3 && !currentBadges.includes("planet_protector")) {
        specialBadgeEarned = "planet_protector";
      }

      if (specialBadgeEarned) {
        await updateDoc(userRef, {
          badges: arrayUnion(specialBadgeEarned)
        });
      
        // Also update special badges in Supabase
        const updatedBadges = [...currentBadges, specialBadgeEarned];
      
        const { error: supabaseSpecialBadgeError } = await supabase
          .from('users')
          .update({ badges: updatedBadges })
          .eq('id', user.id);

        if (supabaseSpecialBadgeError) {
          console.error("Error updating special badges in Supabase:", supabaseSpecialBadgeError);
        } else {
          console.log("Special badges also updated in Supabase");
        }
      
        setCurrentFact({
          title: `🏆 ${getBadgeName(specialBadgeEarned)} Badge Unlocked!`,
          description: `Amazing! You've earned ${newBadgeCount} badges and unlocked the ${getBadgeName(specialBadgeEarned)} badge for your dedication to environmental protection!`
        });
        setShowEcoFact(true);
      }

      // Refresh user data
      fetchUserData();
    } catch (error) {
      console.error("Error updating game completion:", error);
    }
  };

  // Check if user is authenticated (has Firebase user)
  const isAuthenticated = !!firebaseUser;
  
  console.log("=== AUTHENTICATION CHECK ===");
  console.log("isAuthenticated:", isAuthenticated);
  console.log("firebaseUser:", firebaseUser ? "exists" : "null");
  console.log("user:", user ? "exists" : "null");
  console.log("loading:", loading);
  
  // Show loading spinner while authentication is being determined
  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading your Games Dashboard...</p>
        </div>
      </div>
    );
  }

  // Show timeout message if loading takes too long
  if (loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-clock text-white text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Loading Taking Too Long</h2>
            <p className="text-muted-foreground mb-4">
              It seems the authentication is taking longer than expected. Please try refreshing the page or signing in again.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <i className="fas fa-redo mr-2"></i>Refresh Page
              </Button>
              <Button 
                onClick={() => window.location.href = "/"}
                variant="outline"
                className="w-full"
              >
                <i className="fas fa-home mr-2"></i>Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is a teacher, redirect them
  if (user && user.role === "teacher") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-chart-line text-white text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Teacher Access</h2>
            <p className="text-muted-foreground mb-4">
              You're logged in as a teacher. Please use the Teacher Dashboard to view student progress and analytics.
            </p>
            <Button 
              onClick={() => window.location.href = "/teacher"}
              className="w-full"
            >
              Go to Teacher Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is authenticated and has data - show the games dashboard
  console.log("Showing games dashboard for user:", user?.name || "Guest");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Message */}
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-star text-white text-2xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Welcome to Games Dashboard, {user?.name || 'Planet Hero'}! 🌟
                </h2>
                <p className="text-muted-foreground mb-4">
                  Ready to save the planet through fun eco-games and challenges? Choose your adventure below!
                  {!isAuthenticated && (
                    <span className="block mt-2 text-sm text-blue-600">
                      💡 Sign in from the top navigation to save your progress and earn badges!
                    </span>
                  )}
                </p>
                <Button 
                  onClick={() => setShowWelcome(false)}
                  variant="outline"
                  size="sm"
                >
                  Let's Start Playing!
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Student Profile Header - Only show if authenticated */}
        {isAuthenticated && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                      <span className="text-lg sm:text-2xl font-bold text-white">
                        {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'H'}
                      </span>
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-lg sm:text-2xl font-bold text-foreground">{user?.name || 'Planet Hero'}</h2>
                      <p className="text-sm text-muted-foreground">Student • Planet Hero Level {userData?.level || 1}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 sm:space-x-6">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-primary">{userData?.totalPoints || 0}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Total Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-accent">{userData?.badges?.length || 0}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Badges</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-secondary">{userData?.level || 1}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Level</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Guest User Info - Show if not authenticated */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user text-white text-2xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome, Guest! 👋</h2>
                <p className="text-muted-foreground mb-4">
                  You can play all games for free! Sign in from the top navigation to save your progress, earn badges, and compete on the leaderboard.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Current Game Display */}
        {currentGame && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            {currentGame === "waste_sorting" && (
              <WasteSortingGame 
                onGameComplete={(score) => handleGameComplete("waste_sorting", score)} 
              />
            )}
            {currentGame === "water_saver" && (
              <WaterSaverGame 
                onGameComplete={(score) => handleGameComplete("water_saver", score)} 
              />
            )}
            {currentGame === "plant_tree" && (
              <PlantTreeGame 
                onGameComplete={(score) => handleGameComplete("plant_tree", score)} 
              />
            )}
            {currentGame === "energy_saver" && (
              <EnergySaverGame 
                onGameComplete={(score) => handleGameComplete("energy_saver", score)} 
              />
            )}
            {currentGame === "ocean_cleanup" && (
              <OceanCleanupGame 
                onGameComplete={(score) => handleGameComplete("ocean_cleanup", score)} 
              />
            )}
            {currentGame === "carbon_footprint" && (
              <CarbonFootprintGame 
                onGameComplete={(score) => handleGameComplete("carbon_footprint", score)} 
              />
            )}
            <div className="text-center mt-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrentGame(null)}
                data-testid="button-exit-game"
              >
                Exit Game
              </Button>
            </div>
          </motion.div>
        )}

        {/* Badges Section - Only show if authenticated */}
        {!currentGame && isAuthenticated && userData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 sm:mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <i className="fas fa-trophy text-accent mr-2"></i>
                  Your Planet Hero Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {(userData?.badges || []).map((badge: BadgeType, index: number) => (
                    <motion.div
                      key={badge}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-accent to-yellow-400 p-3 sm:p-4 rounded-xl text-center group hover:scale-110 transition-all duration-300"
                    >
                      <i className={`fas ${getBadgeIcon(badge)} text-xl sm:text-2xl text-white mb-1 sm:mb-2`}></i>
                      <p className="text-xs font-semibold text-white">{getBadgeName(badge)}</p>
                    </motion.div>
                  ))}
                  {Array.from({ length: Math.max(0, 6 - (userData?.badges?.length || 0)) }).map((_, index) => (
                    <div
                      key={`placeholder-${index}`}
                      className="bg-muted/30 border-2 border-dashed border-muted-foreground/30 p-3 sm:p-4 rounded-xl text-center opacity-60"
                    >
                      <i className="fas fa-lock text-xl sm:text-2xl text-muted-foreground mb-1 sm:mb-2"></i>
                      <p className="text-xs text-muted-foreground">Coming Soon</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Games Section */}
        {!currentGame && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 sm:mb-8"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 px-4 sm:px-0">🎮 Planet Hero Games</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Waste Sorting Game */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="overflow-hidden cursor-pointer group" onClick={() => setCurrentGame("waste_sorting")}>
                  <div className="h-64 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-recycle text-6xl text-green-600 mb-4 group-hover:scale-110 transition-transform"></i>
                      <p className="text-green-800 font-semibold">Waste Sorting Challenge</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h4 className="text-xl font-bold text-foreground mb-2">♻️ Waste Sorting Hero</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Drag and drop items into the correct recycling bins. Master waste segregation and save the planet!
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span><i className="fas fa-star text-accent mr-1"></i>Difficulty: Easy</span>
                      <span><i className="fas fa-clock text-accent mr-1"></i>2-3 min</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-primary to-green-600" data-testid="button-play-waste-sorting">
                      <i className="fas fa-play mr-2"></i>Start Game
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Water Saver Game */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="overflow-hidden cursor-pointer group" onClick={() => setCurrentGame("water_saver")}>
                  <div className="h-48 sm:h-64 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-tint text-5xl sm:text-6xl text-blue-600 mb-3 sm:mb-4 group-hover:scale-110 transition-transform"></i>
                      <p className="text-blue-800 font-semibold text-sm sm:text-base">Water Saver Challenge</p>
                    </div>
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <h4 className="text-lg sm:text-xl font-bold text-foreground mb-2">💧 Water Saver Hero</h4>
                    <p className="text-muted-foreground text-sm mb-3 sm:mb-4">
                      Click to stop dripping taps before the bucket overflows! Every drop saved counts toward saving our planet.
                    </p>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                      <span><i className="fas fa-star text-accent mr-1"></i>Difficulty: Medium</span>
                      <span><i className="fas fa-clock text-accent mr-1"></i>1-2 min</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-secondary to-blue-600 text-sm sm:text-base" data-testid="button-play-water-saver">
                      <i className="fas fa-play mr-2"></i>Start Game
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Plant Tree Game */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="overflow-hidden cursor-pointer group" onClick={() => setCurrentGame("plant_tree")}>
                  <div className="h-64 bg-gradient-to-br from-amber-100 to-green-200 flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-seedling text-6xl text-green-600 mb-4 group-hover:scale-110 transition-transform"></i>
                      <p className="text-green-800 font-semibold">Tree Planting Challenge</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h4 className="text-xl font-bold text-foreground mb-2">🌱 Tree Planting Hero</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Click to water your tree and watch it grow through 3 stages. Nurture life and become a Green Thumb hero!
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span><i className="fas fa-star text-accent mr-1"></i>Difficulty: Hard</span>
                      <span><i className="fas fa-clock text-accent mr-1"></i>3-5 min</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-accent to-green-600" data-testid="button-play-plant-tree">
                      <i className="fas fa-play mr-2"></i>Start Game
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Energy Saver Game */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="overflow-hidden cursor-pointer group" onClick={() => setCurrentGame("energy_saver")}>
                  <div className="h-64 bg-gradient-to-br from-amber-100 to-yellow-200 flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-bolt text-6xl text-yellow-600 mb-4 group-hover:scale-110 transition-transform"></i>
                      <p className="text-yellow-800 font-semibold">Energy Saver Challenge</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h4 className="text-xl font-bold text-foreground mb-2">⚡ Energy Saver Hero</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Click to turn off appliances and reduce energy consumption. Become a Carbon Crusher hero!
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span><i className="fas fa-star text-accent mr-1"></i>Difficulty: Medium</span>
                      <span><i className="fas fa-clock text-accent mr-1"></i>2-3 min</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600" data-testid="button-play-energy-saver">
                      <i className="fas fa-play mr-2"></i>Start Game
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Ocean Cleanup Game */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="overflow-hidden cursor-pointer group" onClick={() => setCurrentGame("ocean_cleanup")}>
                  <div className="h-48 sm:h-64 bg-gradient-to-br from-blue-100 to-cyan-200 flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-water text-5xl sm:text-6xl text-blue-600 mb-3 sm:mb-4 group-hover:scale-110 transition-transform"></i>
                      <p className="text-blue-800 font-semibold text-sm sm:text-base">Ocean Cleanup Challenge</p>
                    </div>
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <h4 className="text-lg sm:text-xl font-bold text-foreground mb-2">🌊 Ocean Guardian Hero</h4>
                    <p className="text-muted-foreground text-sm mb-3 sm:mb-4">
                      Click to collect trash and clean our oceans. Protect marine life and become an Ocean Guardian!
                    </p>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                      <span><i className="fas fa-star text-accent mr-1"></i>Difficulty: Medium</span>
                      <span><i className="fas fa-clock text-accent mr-1"></i>2-3 min</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-sm sm:text-base" data-testid="button-play-ocean-cleanup">
                      <i className="fas fa-play mr-2"></i>Start Game
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Carbon Footprint Game */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="overflow-hidden cursor-pointer group" onClick={() => setCurrentGame("carbon_footprint")}>
                  <div className="h-64 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-leaf text-6xl text-green-600 mb-4 group-hover:scale-110 transition-transform"></i>
                      <p className="text-green-800 font-semibold">Carbon Footprint Challenge</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h4 className="text-xl font-bold text-foreground mb-2">🌍 Climate Champion Hero</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Choose eco-friendly activities to reduce your carbon footprint. Become a Climate Champion!
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span><i className="fas fa-star text-accent mr-1"></i>Difficulty: Hard</span>
                      <span><i className="fas fa-clock text-accent mr-1"></i>3-4 min</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600" data-testid="button-play-carbon-footprint">
                      <i className="fas fa-play mr-2"></i>Start Game
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        {!currentGame && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-4 sm:px-0"
          >
            <Button
              onClick={() => setLocation("/leaderboard")}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <i className="fas fa-trophy mr-2"></i>
              View Leaderboard
            </Button>
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <i className="fas fa-home mr-2"></i>
              Back to Home
            </Button>
          </motion.div>
        )}

        {/* Eco Fact Modal */}
        <EcoFactModal
          isOpen={showEcoFact}
          onClose={() => setShowEcoFact(false)}
          fact={currentFact}
        />
      </div>
    </div>
  );
}

function getBadgeIcon(badge: BadgeType): string {
  const icons = {
    waste_warrior: "fa-recycle",
    water_saver: "fa-tint",
    green_thumb: "fa-seedling",
    eco_champion: "fa-leaf",
    planet_protector: "fa-globe",
    carbon_crusher: "fa-industry",
    ocean_guardian: "fa-water",
    climate_champion: "fa-temperature-low"
  };
  return icons[badge] || "fa-medal";
}

function getBadgeName(badge: BadgeType): string {
  const names = {
    waste_warrior: "Waste Warrior",
    water_saver: "Water Saver",
    green_thumb: "Green Thumb",
    eco_champion: "Eco Champion",
    planet_protector: "Planet Protector",
    carbon_crusher: "Carbon Crusher",
    ocean_guardian: "Ocean Guardian",
    climate_champion: "Climate Champion"
  };
  return names[badge] || badge;
}
