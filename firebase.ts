import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsPvnxt7end-uYGMYoo80-jRzFVbBkARw",
  authDomain: "studio-2363461873-9c4a1.firebaseapp.com",
  projectId: "studio-2363461873-9c4a1",
  storageBucket: "studio-2363461873-9c4a1.firebasestorage.app",
  messagingSenderId: "515024797490",
  appId: "1:515024797490:web:b1ca0e1c439adaa453212b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);