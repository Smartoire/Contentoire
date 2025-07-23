import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { app } from "../firebase"; // this imports from your existing firebase.js

const auth = getAuth(app);

export const signUp = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logIn = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export { auth };
