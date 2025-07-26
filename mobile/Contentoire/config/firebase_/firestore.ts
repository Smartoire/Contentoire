import { getFirestore, Firestore } from 'firebase/firestore';
import { app } from './config';

// Initialize Cloud Firestore
export const db: Firestore = getFirestore(app);
