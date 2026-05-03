/**
 * Firebase Frontend Configuration
 * 
 * ⚠️ SECURITY NOTE:
 * This file contains ONLY the public Firebase web config. These values are safe to be in frontend code.
 * They are used for Firebase Authentication and analytics.
 * 
 * ALL SECRET credentials MUST stay on the backend:
 * - Firebase service account keys
 * - Private signing keys
 * - Admin SDK credentials
 * 
 * IMPORTANT: File uploads and data storage are handled by the backend API.
 * The frontend makes requests to backend endpoints (e.g., /api/upload, /api/submissions)
 * and receives file URLs that the backend provides after storing files to Firebase Storage.
 */

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCao8_P09G7Iw5eVtHPM8p31M2iyYigHS8",
  authDomain: "tnf-vibe-coding-challenge.firebaseapp.com",
  projectId: "tnf-vibe-coding-challenge",
  storageBucket: "tnf-vibe-coding-challenge.firebasestorage.app",
  messagingSenderId: "845808658247",
  appId: "1:845808658247:web:8badd373fcd8b143640e62",
  measurementId: "G-BPQGR2Q679"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
