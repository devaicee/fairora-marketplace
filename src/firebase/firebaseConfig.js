// src/firebase/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBFgPamMPqc7E_k0JQ8T1VJE8HFlvajxTE",
  authDomain: "fairora-marketplace001.firebaseapp.com",
  projectId: "fairora-marketplace001",
  storageBucket: "fairora-marketplace001.firebasestorage.app",
  messagingSenderId: "945981062341",
  appId: "1:945981062341:web:53ca6ac54356fbf5b004ac"
};

const app = initializeApp(firebaseConfig);

// ✅ Export the services so you can use them across your app
export const auth = getAuth(app);
export const db = getFirestore(app);

// Debug: Log to verify Firebase is initialized
console.log('Firebase app initialized:', app.name);
console.log('Firebase project ID:', firebaseConfig.projectId);
