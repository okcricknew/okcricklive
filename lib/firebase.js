import { initializeApp, getApps, getApp } from "firebase/app";
// ✅ Line 2: Sahi Imports
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB2kt8ofH5uWm5mkD2wyT3uwkEyQ7eXblc",
  authDomain: "cricket-live-f9249.firebaseapp.com",
  databaseURL: "https://cricket-live-f9249-default-rtdb.firebaseio.com",
  projectId: "cricket-live-f9249",
  storageBucket: "cricket-live-f9249.firebasestorage.app",
  messagingSenderId: "726300414619",
  appId: "1:726300414619:web:6baf6a8049569480f0ac3e",
  measurementId: "G-R3L5QE4HH8"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Line 21: Super Fast Cache Enable kiya
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

const auth = getAuth(app);

export { app, db, auth };
