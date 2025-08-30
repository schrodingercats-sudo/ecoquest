import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithGoogle } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface LoginFormProps {
  role: "student" | "teacher";
}

export const LoginForm = ({ role }: LoginFormProps) => {
  const { loading, firebaseUser, user } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    if (firebaseUser && user && !loading) {
      console.log("User already authenticated, redirecting...");
      if (user.role === "student") {
        setLocation("/games");
      } else if (user.role === "teacher") {
        setLocation("/teacher");
      }
    }
  }, [firebaseUser, user, loading, setLocation]);

  const handleGoogleSignIn = async () => {
    try {
      console.log("Starting Google sign-in process...");
      setSigningIn(true);
      setError(null);
      const user = await signInWithGoogle();
      console.log("Google sign-in completed successfully:", user?.email);
      // Success handling is done by the auth state change listener
      
      // If we get here quickly, show a success message
      if (user) {
        setError("Sign-in successful! Redirecting...");
      }
    } catch (error: any) {
      console.error("Error signing in:", error);
      
      // Provide specific error messages based on error code
      let errorMessage = "Failed to sign in. Please try again.";
      
      switch (error?.code) {
        case 'auth/popup-blocked':
          errorMessage = "Popup was blocked by your browser. Please allow popups and try again.";
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = "Sign-in was cancelled. Please try again.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your internet connection and try again.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many sign-in attempts. Please wait a moment and try again.";
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled. Please contact support.";
          break;
        case 'auth/configuration-not-found':
          errorMessage = "Authentication is not properly configured. Please contact support.";
          break;
        default:
          if (error?.message) {
            // Handle the specific offline error
            if (error.message.includes("Failed to get document because the client is offline")) {
              errorMessage = "You appear to be offline. The app will work in limited mode until you reconnect.";
            } else {
              errorMessage = error.message;
            }
          }
      }
      
      setError(errorMessage);
      setSigningIn(false);
      
      // Auto-clear error after 5 seconds for better UX
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-lg text-muted-foreground mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is already authenticated, show redirect message
  if (firebaseUser && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-lg text-muted-foreground mt-4">
            Welcome back, {user.name}! Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-leaf text-primary-foreground text-2xl"></i>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Welcome to Planet Heroes
          </CardTitle>
          <CardDescription>
            Sign in as a {role} to start your eco-adventure!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
            </div>
          )}
          
          <Button
            onClick={handleGoogleSignIn}
            className="w-full bg-primary hover:bg-primary/90"
            data-testid="button-google-signin"
            disabled={signingIn}
          >
            {signingIn ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Signing in...
              </>
            ) : (
              <>
                <i className="fab fa-google mr-2"></i>
                Continue with Google
              </>
            )}
          </Button>
          
          {signingIn && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Please complete sign-in in the popup window...
              </p>
              <div className="mt-2">
                <LoadingSpinner size="sm" />
              </div>
            </div>
          )}
          
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
