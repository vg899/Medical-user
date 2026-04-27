import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBb2YKyzp4cCABzMci41crDimLZIbLKM7w",
  authDomain: "rsmedihub-c425a.firebaseapp.com",
  databaseURL: "https://rsmedihub-c425a-default-rtdb.firebaseio.com",
  projectId: "rsmedihub-c425a",
  storageBucket: "rsmedihub-c425a.firebasestorage.app",
  messagingSenderId: "1037218664219",
  appId: "1:1037218664219:web:67ab0681b7dc7843cbcdbe",
  measurementId: "G-KE7GES84LK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
