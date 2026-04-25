import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoGtETl8PSeYDSNWbqNzE62PtmPkH7Ybc",
  authDomain: "supply-chain-project-001.firebaseapp.com",
  projectId: "supply-chain-project-001",
  storageBucket: "supply-chain-project-001.firebasestorage.app",
  messagingSenderId: "758882460816",
  appId: "1:758882460816:web:9664abd15668e47050e415",
  measurementId: "G-BFC33LDZZW"
};

// Initialize Firebase safely for hot-reloading
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
