import { 
  signInWithRedirect, 
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc, getDoc, enableNetwork, disableNetwork } from "firebase/firestore";
import { auth, db } from "./firebase";
import { User, UserRole } from "@shared/schema";

const provider = new GoogleAuthProvider();
// Add additional scopes for better user info
provider.addScope('profile');
provider.addScope('email');
// Set custom parameters
provider.setCustomParameters({
  prompt: 'select_account'
});

// Add Supabase import
import { supabase } from "./supabase";

// Primary method: Use popup for better development experience
export const signInWithGoogle = async () => {
  try {
    console.log("Attempting Google sign-in with popup...");
    const result = await signInWithPopup(auth, provider);
    console.log("Popup sign-in successful:", result.user.email);
    await createOrUpdateUser(result.user, "student");
    return result.user;
  } catch (error: any) {
    console.error("Popup sign-in failed:", error);
    
    // If popup is blocked or fails, fall back to redirect
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      console.log("Popup blocked, falling back to redirect...");
      return signInWithRedirect(auth, provider);
    }
    
    throw error;
  }
};

export const signOut = async () => {
  console.log("Signing out user...");
  try {
    await firebaseSignOut(auth);
    console.log("User signed out successfully");
    // Clear any stored temporary user data
    const storedKeys = Object.keys(localStorage).filter(key => key.startsWith('user_'));
    storedKeys.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const handleRedirectResult = async () => {
  try {
    console.log("Checking for redirect result...");
    const result = await getRedirectResult(auth);
    console.log("Redirect result:", result);
    
    if (result?.user) {
      console.log("User found in redirect result:", result.user.email);
      await createOrUpdateUser(result.user, "student"); // Default to student role
      return result.user;
    } else {
      console.log("No redirect result found");
      return null;
    }
  } catch (error) {
    console.error("Error handling redirect result:", error);
    throw error;
  }
};

export const createOrUpdateUser = async (firebaseUser: FirebaseUser, role: UserRole = "student") => {
  console.log("Creating/updating user in Firestore:", firebaseUser.email);
  
  try {
    // Try to enable network in case it was disabled
    try {
      await enableNetwork(db);
    } catch (networkError) {
      console.warn("Could not enable network:", networkError);
    }
    
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log("Creating new user with role:", role);
      const userData: Omit<User, "id"> = {
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || "",
        role,
        totalPoints: 0,
        badges: [],
        level: 1,
        createdAt: new Date(),
        lastActive: new Date()
      };

      await setDoc(userRef, userData);
      console.log("New user created successfully in Firestore");
      
      // Also create user in Supabase
      const { error: supabaseError } = await supabase
        .from('users')
        .upsert({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          role,
          total_points: 0,
          badges: [],
          level: 1,
          created_at: new Date(),
          last_active: new Date()
        }, {
          onConflict: 'id'
        });
      
      if (supabaseError) {
        console.error("Error creating user in Supabase:", supabaseError);
      } else {
        console.log("User also created in Supabase");
      }
    } else {
      console.log("Updating existing user's last active time");
      // Update last active in Firestore
      await setDoc(userRef, { lastActive: new Date() }, { merge: true });
      
      // Also update in Supabase
      const { error: supabaseError } = await supabase
        .from('users')
        .update({ last_active: new Date() })
        .eq('id', firebaseUser.uid);
      
      if (supabaseError) {
        console.error("Error updating user in Supabase:", supabaseError);
      } else {
        console.log("User last active time also updated in Supabase");
      }
    }
  } catch (error: any) {
    console.error("Error in createOrUpdateUser:", error);
    
    // Handle offline scenario specifically
    if (error?.code === "unavailable" || error?.code === "failed-precondition" || 
        error?.message?.includes("offline") || error?.message?.includes("network") ||
        error?.message?.includes("Failed to get document because the client is offline")) {
      console.log("Offline mode: Creating temporary user data in local storage");
      
      // Store user data in localStorage as fallback
      const tempUserData = {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || "Offline User",
        role: role,
        totalPoints: 0,
        badges: [],
        level: 1,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      
      localStorage.setItem(`user_${firebaseUser.uid}`, JSON.stringify(tempUserData));
      console.log("Temporary user data saved to localStorage");
      return;
    }
    
    // Re-throw error if it's not an offline issue
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  console.log("Setting up auth state listener...");
  return onAuthStateChanged(auth, callback);
};
