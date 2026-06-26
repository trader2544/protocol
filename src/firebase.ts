import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, getDocs, addDoc, updateDoc, query, where, orderBy, Firestore } from 'firebase/firestore';

// Inlined configuration from firebase-applet-config.json to prevent runtime file resolution errors
const firebaseConfig = {
  apiKey: "AIzaSyCr376DF1uftzKSB7wfJu1aO3lzUAjh1gE",
  authDomain: "autonomous-smoke-cq7jp.firebaseapp.com",
  projectId: "autonomous-smoke-cq7jp",
  storageBucket: "autonomous-smoke-cq7jp.firebasestorage.app",
  messagingSenderId: "926698725675",
  appId: "1:926698725675:web:5d09df8ce93ac803c8a56e"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore using the official string databaseId argument
export const db: Firestore = getFirestore(app, "ai-studio-c9123193-e7f7-49bd-bf62-b7227428e3e8");

export { collection, doc, getDoc, setDoc, getDocs, addDoc, updateDoc, query, where, orderBy };
