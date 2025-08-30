import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBufE6KdkSP0JMEJDx4Vr-F0YnmxFwfAlo",
  authDomain: "emotichat-vjgeh.firebaseapp.com",
  projectId: "emotichat-vjgeh",
  storageBucket: "emotichat-vjgeh.firebasestorage.app",
  messagingSenderId: "193452764737",
  appId: "1:193452764737:web:17a9b9aef93339855ee0c0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics only in production
let analytics = null;
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;
