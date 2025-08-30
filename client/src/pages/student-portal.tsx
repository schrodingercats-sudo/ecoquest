import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/auth/login-form";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function StudentPortal() {
  const { user, loading, firebaseUser } = useAuth();
  const [, setLocation] = useLocation();

  // Auto-redirect authenticated students to games dashboard
  useEffect(() => {
    if (!loading && firebaseUser && user && user.role === "student") {
      console.log("Student authenticated, redirecting to games dashboard");
      setLocation("/games");
    }
  }, [loading, firebaseUser, user, setLocation]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is already authenticated as a student, show redirect message
  if (firebaseUser && user && user.role === "student") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">
            Welcome back, {user.name}! Redirecting to your games dashboard...
          </p>
        </div>
      </div>
    );
  }

  // If user is a teacher, redirect them
  if (firebaseUser && user && user.role === "teacher") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-chart-line text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Teacher Access</h2>
          <p className="text-muted-foreground mb-4">
            You're logged in as a teacher. Please use the Teacher Dashboard.
          </p>
          <button 
            onClick={() => setLocation("/teacher")}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Go to Teacher Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show login form for unauthenticated users
  return <LoginForm role="student" />;
}
