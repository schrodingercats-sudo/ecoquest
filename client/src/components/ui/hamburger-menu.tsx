import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { signOut } from "@/lib/auth";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HamburgerMenu = ({ isOpen, onClose }: HamburgerMenuProps) => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [signingOut, setSigningOut] = useState(false);

  const handleNavigation = (path: string) => {
    setLocation(path);
    onClose();
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      // Ensure we navigate to home page after sign out
      setLocation("/");
      // Close the menu
      onClose();
      // Reload the page to ensure all state is cleared
      window.location.reload();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Menu */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="fixed top-0 left-0 h-full w-80 bg-background border-r border-border z-50 shadow-xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <i className="fas fa-leaf text-primary-foreground text-xl"></i>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Planet Heroes</h2>
                      <p className="text-xs text-muted-foreground">Save the Planet!</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="p-2"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </Button>
                </div>
              </div>

              {/* User Info */}
              {user && (
                <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{user.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex-1 p-6">
                <nav className="space-y-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left p-4 h-auto"
                    onClick={() => handleNavigation("/")}
                  >
                    <i className="fas fa-home text-xl mr-4 w-6"></i>
                    <div>
                      <div className="font-medium">Home</div>
                      <div className="text-sm text-muted-foreground">Back to main page</div>
                    </div>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left p-4 h-auto bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20"
                    onClick={() => handleNavigation("/games")}
                  >
                    <i className="fas fa-gamepad text-xl mr-4 w-6 text-primary"></i>
                    <div>
                      <div className="font-medium">Games Dashboard</div>
                      <div className="text-sm text-muted-foreground">Play eco-friendly games</div>
                    </div>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left p-4 h-auto"
                    onClick={() => handleNavigation("/leaderboard")}
                  >
                    <i className="fas fa-trophy text-xl mr-4 w-6 text-accent"></i>
                    <div>
                      <div className="font-medium">Leaderboard</div>
                      <div className="text-sm text-muted-foreground">View top heroes</div>
                    </div>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left p-4 h-auto"
                    onClick={() => handleNavigation("/teacher")}
                  >
                    <i className="fas fa-chart-line text-xl mr-4 w-6 text-secondary"></i>
                    <div>
                      <div className="font-medium">Teacher Dashboard</div>
                      <div className="text-sm text-muted-foreground">View analytics & reports</div>
                    </div>
                  </Button>
                </nav>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border">
                {user ? (
                  <Button
                    variant="outline"
                    className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={handleSignOut}
                    disabled={signingOut}
                  >
                    {signingOut ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Signing Out...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-out-alt mr-2"></i>
                        Sign Out
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                    onClick={() => handleNavigation("/student")}
                  >
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};