// firebase.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCJve3enOMkMKFVnEua9GY3ZT1RRRI5Vbc",
  authDomain: "contentoire-ee7cb.firebaseapp.com",
  projectId: "contentoire-ee7cb",
  storageBucket: "contentoire-ee7cb.firebasestorage.app",
  messagingSenderId: "989815298094",
  appId: "1:989815298094:web:1ccb1e5ed0c897fe9a27bf",
  measurementId: "G-PBHTL85VQN",
};

const app = initializeApp(firebaseConfig);

// Initialize auth with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);
