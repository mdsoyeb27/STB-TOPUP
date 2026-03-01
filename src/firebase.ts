import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD5_qjErIdMVGS2lgq7rq__CAWnguEKL3E",
  authDomain: "stb-ff-guild.firebaseapp.com",
  projectId: "stb-ff-guild",
  storageBucket: "stb-ff-guild.firebasestorage.app",
  messagingSenderId: "11531827684",
  appId: "1:11531827684:web:1b1631d68113bbb84daff1",
  measurementId: "G-9EWB9QMYFK"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
