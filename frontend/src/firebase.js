// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBeG868yVkbAe54eRa9P6wmeySv9owY_f0",
  authDomain: "jobmorph-73f19.firebaseapp.com",
  projectId: "jobmorph-73f19",
  storageBucket: "jobmorph-73f19.firebasestorage.app",
  messagingSenderId: "929580335723",
  appId: "1:929580335723:web:d9ea78a1dfdc9e72ac272e",
  measurementId: "G-DMLD3MBWNH"
};
// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Initialize auth and firestore
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Export them for use in other files
export { auth, db };
