import { useState, useEffect, createContext, useContext } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, enableNetwork, disableNetwork } from "firebase/firestore";
import { onAuthStateChange, handleRedirectResult, createOrUpdateUser } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { User } from "@shared/schema";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  user: null,
  loading: true
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Function to fetch user data from Firestore with offline support
  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
      console.log("Fetching user data for:", firebaseUser.email);
      
      // First, check if we have temporary user data in localStorage (offline scenario)
      const storedUserData = localStorage.getItem(`user_${firebaseUser.uid}`);
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData);
          console.log("Using temporary user data from localStorage:", parsedData);
          setUser({
            id: firebaseUser.uid,
            ...parsedData,
            createdAt: new Date(parsedData.createdAt),
            lastActive: new Date(parsedData.lastActive)
          });
          
          // Try to sync with Firestore if online
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data() as Omit<User, "id">;
              console.log("Found user data in Firestore, updating local state:", userData);
              setUser({ id: firebaseUser.uid, ...userData });
              // Remove temporary data since we have real data now
              localStorage.removeItem(`user_${firebaseUser.uid}`);
            }
          } catch (syncError) {
            console.warn("Could not sync with Firestore, using localStorage data:", syncError);
          }
          
          return;
        } catch (parseError) {
          console.error("Error parsing stored user data:", parseError);
          localStorage.removeItem(`user_${firebaseUser.uid}`);
        }
      }
      
      // Try to enable network in case it was disabled
      try {
        // await enableNetwork(db); // Temporarily commented out as it might not be needed
      } catch (networkError) {
        console.warn("Could not enable network:", networkError);
      }
      
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<User, "id">;
        console.log("User data found:", userData);
        setUser({ id: firebaseUser.uid, ...userData });
      } else {
        // If user doesn't exist in Firestore, create them with student role
        console.log("Creating new user with student role");
        await createOrUpdateUser(firebaseUser, "student");
        const newUserData: Omit<User, "id"> = {
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          role: "student",
          totalPoints: 0,
          badges: [],
          level: 1,
          createdAt: new Date(),
          lastActive: new Date()
        };
        console.log("Setting new user data:", newUserData);
        setUser({ id: firebaseUser.uid, ...newUserData });
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      
      // Handle offline scenario
      if (error?.code === "unavailable" || error?.code === "failed-precondition" || 
          error?.message?.includes("offline") || error?.message?.includes("network") ||
          error?.message?.includes("Failed to get document because the client is offline")) {
        console.log("Offline mode detected, creating temporary user data");
        
        // Create a temporary user object for offline use
        const tempUserData: Omit<User, "id"> = {
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "Offline User",
          role: "student",
          totalPoints: 0,
          badges: [],
          level: 1,
          createdAt: new Date(),
          lastActive: new Date()
        };
        
        setUser({ id: firebaseUser.uid, ...tempUserData });
        return;
      }
      
      // If there's an error, create a default user object
      const defaultUserData: Omit<User, "id"> = {
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || "",
        role: "student",
        totalPoints: 0,
        badges: [],
        level: 1,
        createdAt: new Date(),
        lastActive: new Date()
      };
      console.log("Setting default user data due to error");
      setUser({ id: firebaseUser.uid, ...defaultUserData });
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log("=== AUTH INITIALIZATION START ===");
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          console.log("Auth initialization timeout - setting loading to false");
          setLoading(false);
          setInitialized(true);
        }, 8000); // 8 second timeout (reduced from 15 seconds)

        // First, handle any redirect result (for Google sign-in)
        console.log("Handling redirect result...");
        const redirectResult = await handleRedirectResult();
        console.log("Redirect result:", redirectResult);

        // Then set up auth state listener
        unsubscribe = onAuthStateChange(async (firebaseUser) => {
          console.log("=== AUTH STATE CHANGED ===");
          console.log("Firebase user:", firebaseUser ? firebaseUser.email : "null");
          setFirebaseUser(firebaseUser);
          
          if (firebaseUser) {
            console.log("User authenticated, fetching data...");
            await fetchUserData(firebaseUser);
          } else {
            console.log("No user, setting user to null");
            setUser(null);
          }
          
          // Clear timeout and set loading to false
          clearTimeout(timeoutId);
          setLoading(false);
          setInitialized(true);
          console.log("=== AUTH INITIALIZATION COMPLETE ===");
        });
      } catch (error) {
        console.error("Error initializing auth:", error);
        clearTimeout(timeoutId);
        setLoading(false);
        setInitialized(true);
      }
    };

    // Always set up the auth state listener, even if already initialized
    // This ensures sign-out events are properly detected
    unsubscribe = onAuthStateChange(async (firebaseUser) => {
      console.log("=== AUTH STATE CHANGED (REALTIME) ===");
      console.log("Firebase user:", firebaseUser ? firebaseUser.email : "null");
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        console.log("User authenticated, fetching data...");
        await fetchUserData(firebaseUser);
      } else {
        console.log("No user, setting user to null");
        setUser(null);
      }
      
      setLoading(false);
      setInitialized(true);
      console.log("=== AUTH STATE UPDATE COMPLETE ===");
    });

    // Only run initialization once
    if (!initialized) {
      initializeAuth();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [initialized]);

  // Debug logging
  useEffect(() => {
    console.log("=== AUTH STATE UPDATE ===");
    console.log("Firebase User:", firebaseUser ? firebaseUser.email : "null");
    console.log("User Data:", user ? { name: user.name, role: user.role } : "null");
    console.log("Loading:", loading);
    console.log("Initialized:", initialized);
  }, [firebaseUser, user, loading, initialized]);

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
