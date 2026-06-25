import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxtMd_atL6OMbkv43OfpQyqmcNjf2ZPTs",
  authDomain: "privyprint.firebaseapp.com",
  projectId: "privyprint",
  storageBucket: "privyprint.firebasestorage.app",
  messagingSenderId: "949098248866",
  appId: "1:949098248866:web:95cbdc6378c5cabac875fb"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);