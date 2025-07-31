// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBftA7-1YrD0XP7crhhXBJKWL2pMkxSyJY",
  authDomain: "jobmorph-9a6cb.firebaseapp.com",
  projectId: "jobmorph-9a6cb",
  storageBucket: "jobmorph-9a6cb.firebasestorage.app",
  messagingSenderId: "169444213634",
  appId: "1:169444213634:web:552c0f982176411486059b",
  measurementId: "G-PVPW5SS3BR"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Initialize auth and firestore
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Export them for use in other files
export { auth, db };
