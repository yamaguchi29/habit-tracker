import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBnpE-sL52xJmprKFarbhoXGSnfS38jS0w",
  authDomain: "habittracker-85b62.firebaseapp.com",
  projectId: "habittracker-85b62",
  storageBucket: "habittracker-85b62.firebasestorage.app",
  messagingSenderId: "613344198802",
  appId: "1:613344198802:web:fc25292d1033df3121e64b",
  measurementId: "G-TZ75TFP3Q0" // keeping old or removing? let's just keep the fields needed
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);
export { getToken, onMessage };
