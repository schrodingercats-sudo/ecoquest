import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { signOut } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { BadgeType } from "@shared/schema";
import { useLocation } from "wouter";

interface UserProfileDropdownProps {
  onSignOut: () => void;
}

export const UserProfileDropdown = ({ onSignOut }: UserProfileDropdownProps) => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowBadges(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigate to home page after sign out
      setLocation("/");
      // Close the dropdown menu
      setIsOpen(false);
      // Call the parent onSignOut callback
      onSignOut();
      // Reload the page to ensure all state is cleared
      window.location.reload();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getBadgeIcon = (badge: BadgeType): string => {
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
  };

  const getBadgeName = (badge: BadgeType): string => {
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
  };

  const getBadgeColor = (badge: BadgeType): string => {
    const colors = {
      waste_warrior: "bg-green-500",
      water_saver: "bg-blue-500",
      green_thumb: "bg-emerald-500",
      eco_champion: "bg-purple-500",
      planet_protector: "bg-indigo-500",
      carbon_crusher: "bg-orange-500",
      ocean_guardian: "bg-cyan-500",
      climate_champion: "bg-green-600"
    };
    return colors[badge] || "bg-gray-500";
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Profile Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        className="flex items-center space-x-2 hover:bg-accent/50"
        data-testid="user-profile-button"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-white">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </span>
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-foreground">{user.name}</div>
          <div className="text-xs text-muted-foreground">
            {user.role === "student" ? "Student" : "Teacher"} • Level {user.level || 1}
          </div>
        </div>
        <i className={`fas fa-chevron-down text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {user.role === "student" ? "Student" : "Teacher"} • Level {user.level || 1}
                  </p>
                  {user.role === "student" && (
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        <i className="fas fa-trophy mr-1"></i>
                        {user.badges?.length || 0} Badges
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <i className="fas fa-star mr-1"></i>
                        {user.totalPoints || 0} Points
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Menu Items */}
              <div className="space-y-1">
                {user.role === "student" && (
                  <Button
                    onClick={() => setShowBadges(!showBadges)}
                    variant="ghost"
                    className="w-full justify-start"
                    data-testid="view-badges-button"
                  >
                    <i className="fas fa-trophy mr-2 text-accent"></i>
                    View Badges
                    <i className={`fas fa-chevron-right ml-auto text-xs transition-transform ${showBadges ? 'rotate-90' : ''}`}></i>
                  </Button>
                )}
                
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  data-testid="sign-out-button"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Sign Out
                </Button>
              </div>

              {/* Badges Section */}
              {showBadges && user.role === "student" && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-3">Your Badges</h4>
                  {user.badges && user.badges.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {user.badges.map((badge: BadgeType) => (
                        <div
                          key={badge}
                          className={`${getBadgeColor(badge)} text-white p-2 rounded-lg text-center`}
                        >
                          <i className={`fas ${getBadgeIcon(badge)} text-sm mb-1 block`}></i>
                          <p className="text-xs font-medium">{getBadgeName(badge)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <i className="fas fa-trophy text-2xl mb-2 block opacity-50"></i>
                      <p className="text-sm">No badges earned yet</p>
                      <p className="text-xs">Play games to earn badges!</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
