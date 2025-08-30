import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, loading, firebaseUser } = useAuth();

  // Auto-redirect authenticated users to their appropriate portal
  useEffect(() => {
    if (!loading && firebaseUser && user) {
      console.log("Home: User authenticated, redirecting to portal");
      if (user.role === "student") {
        console.log("Home: Redirecting student to /games");
        setLocation("/games");
      } else if (user.role === "teacher") {
        console.log("Home: Redirecting teacher to /teacher");
        setLocation("/teacher");
      }
    }
  }, [loading, firebaseUser, user, setLocation]);

  // If user is authenticated, show a loading state while redirecting
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading Planet Heroes...</p>
        </div>
      </div>
    );
  }

  // If user is already authenticated, show a brief message before redirect
  if (firebaseUser && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Welcome back, {user.name}! Redirecting to your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-0">
        {/* Floating decorative elements */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute top-20 left-4 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 bg-primary/10 rounded-full"
        />
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ repeat: Infinity, duration: 3, delay: 1 }}
          className="absolute top-40 right-4 sm:right-20 w-10 h-10 sm:w-16 sm:h-16 bg-secondary/10 rounded-full"
        />
        <motion.div
          animate={{ y: [-5, 15, -5] }}
          transition={{ repeat: Infinity, duration: 3, delay: 2 }}
          className="absolute bottom-40 left-1/4 w-8 h-8 sm:w-12 sm:h-12 bg-accent/10 rounded-full"
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, type: "spring" }}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4 leading-tight"
            >
              Save the Planet
            </motion.h1>
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 px-4">
              Join thousands of Planet Heroes learning sustainability through epic mini-games, earning badges, and making a real difference! 🌍
            </p>
            
            {/* Hero Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto px-4">
              {/* Student Portal Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card 
                  className="p-4 sm:p-8 cursor-pointer border-2 hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-white to-green-50"
                  onClick={() => setLocation("/student")}
                  data-testid="card-student-portal"
                >
                  <CardContent className="p-0 text-center">
                    <motion.div
                      whileHover={{ rotate: 6 }}
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6"
                    >
                      <i className="fas fa-gamepad text-2xl sm:text-3xl text-white"></i>
                    </motion.div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">🎮 Play as Student</h3>
                    <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
                      Embark on eco-adventures, collect badges, compete with friends, and become a Planet Hero!
                    </p>
                    <div className="flex items-center justify-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-muted-foreground">
                      <span><i className="fas fa-trophy text-accent mr-1"></i>Earn Badges</span>
                      <span><i className="fas fa-star text-accent mr-1"></i>Gain Points</span>
                      <span><i className="fas fa-users text-accent mr-1"></i>Compete</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Teacher Portal Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card 
                  className="p-4 sm:p-8 cursor-pointer border-2 hover:border-secondary/50 transition-all duration-300 bg-gradient-to-br from-white to-blue-50"
                  onClick={() => setLocation("/teacher")}
                  data-testid="card-teacher-dashboard"
                >
                  <CardContent className="p-0 text-center">
                    <motion.div
                      whileHover={{ rotate: 6 }}
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6"
                    >
                      <i className="fas fa-chart-line text-2xl sm:text-3xl text-white"></i>
                    </motion.div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">📊 Teacher Dashboard</h3>
                    <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
                      Track student progress, view analytics, manage classrooms, and export performance data.
                    </p>
                    <div className="flex items-center justify-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-muted-foreground">
                      <span><i className="fas fa-chart-bar text-accent mr-1"></i>Analytics</span>
                      <span><i className="fas fa-download text-accent mr-1"></i>Export Data</span>
                      <span><i className="fas fa-users-cog text-accent mr-1"></i>Manage</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto mt-8 sm:mt-16 px-4"
          >
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">10K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Planet Heroes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-secondary">50+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Eco Challenges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-accent">100+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Badges Earned</div>
            </div>
          </motion.div>

          {/* View Leaderboard Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 sm:mt-12 px-4"
          >
            <Button
              onClick={() => setLocation("/leaderboard")}
              variant="outline"
              size="lg"
              className="mx-auto"
              data-testid="button-view-leaderboard"
            >
              <i className="fas fa-trophy mr-2"></i>
              <span className="hidden sm:inline">View Global Leaderboard</span>
              <span className="sm:hidden">Leaderboard</span>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
