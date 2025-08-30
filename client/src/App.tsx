import { Switch, Route, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { UserProfileDropdown } from "@/components/ui/user-profile-dropdown";
import { HamburgerMenu } from "@/components/ui/hamburger-menu";
import Home from "@/pages/home";
import StudentPortal from "@/pages/student-portal";
import GamesDashboard from "@/pages/games-dashboard";
import TeacherDashboard from "@/pages/teacher-dashboard";
import Leaderboard from "@/pages/leaderboard";
import NotFound from "@/pages/not-found";
import { useState } from "react";

const queryClient = new QueryClient();

function NavigationHeader() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    // Navigate to home page after sign out
    setLocation("/");
    console.log("User signed out and redirected to home");
  };

  const isActive = (path: string) => location === path;

  return (
    <>
      <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 lg:py-4">
            {/* Mobile Menu Button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="p-2 md:hidden"
                onClick={() => setMobileMenuOpen(true)}
                data-testid="mobile-menu-button"
              >
                <i className="fas fa-bars text-xl"></i>
              </Button>
            )}
            
            {/* Logo */}
            <div 
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
              onClick={() => setLocation("/")}
              data-testid="logo-home-link"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-leaf text-primary-foreground text-lg sm:text-xl"></i>
              </div>
              <div className={isMobile ? "" : ""}>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Planet Heroes
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Save the Planet!</p>
              </div>
            </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setLocation("/")}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-foreground" : "text-muted-foreground"
              }`}
              data-testid="nav-home"
            >
              <i className="fas fa-home mr-2"></i>Home
            </button>
            
            {/* Games Dashboard - Always visible, prominent button */}
            <Button 
              onClick={() => setLocation("/games")}
              className={`${
                user && user.role === "student" 
                  ? "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white" 
                  : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
              }`}
              data-testid="nav-games-dashboard"
            >
              <i className="fas fa-gamepad mr-2"></i>
              {user && user.role === "student" ? "Games Dashboard" : "Play Games"}
            </Button>
            
            <button 
              onClick={() => setLocation("/teacher")}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/teacher") ? "text-foreground" : "text-muted-foreground"
              }`}
              data-testid="nav-teacher"
            >
              <i className="fas fa-chart-line mr-2"></i>Teacher Dashboard
            </button>
            <button 
              onClick={() => setLocation("/leaderboard")}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/leaderboard") ? "text-foreground" : "text-muted-foreground"
              }`}
              data-testid="nav-leaderboard"
            >
              <i className="fas fa-trophy mr-2"></i>Leaderboard
            </button>
          </nav>

          {/* Mobile Quick Action Button */}
          {isMobile && (
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => setLocation("/games")}
                className="bg-gradient-to-r from-primary to-secondary text-white px-3 py-2"
                data-testid="mobile-games-button"
              >
                <i className="fas fa-gamepad mr-1"></i>
                <span className="text-xs">Play</span>
              </Button>
            </div>
          )}
          
          {/* Desktop Right Side */}
          {!isMobile && (
            <div className="flex items-center space-x-3">
              {user ? (
                <UserProfileDropdown onSignOut={handleSignOut} />
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-muted-foreground hidden lg:block">
                    Ready to become a Planet Hero?
                  </div>
                  <Button 
                    onClick={() => setLocation("/student")}
                    size="sm"
                    className="bg-gradient-to-r from-primary to-secondary text-white"
                    data-testid="button-sign-in"
                  >
                    <i className="fas fa-sign-in-alt mr-2"></i>Sign In
                  </Button>
                </div>
              )}
            </div>
          )}
          
        </div>
      </div>
    </header>
    
    {/* Mobile Hamburger Menu */}
    <HamburgerMenu 
      isOpen={mobileMenuOpen} 
      onClose={() => setMobileMenuOpen(false)} 
    />
    </>
  );
}

function Router() {
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen">
      <NavigationHeader />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/student" component={StudentPortal} />
        <Route path="/games" component={GamesDashboard} />
        <Route path="/teacher" component={TeacherDashboard} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route component={NotFound} />
      </Switch>
      
      {/* Floating Games Button - Desktop only */}
      {!isMobile && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setLocation("/games")}
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full w-16 h-16"
            data-testid="floating-games-button"
          >
            <i className="fas fa-gamepad text-xl"></i>
          </Button>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
