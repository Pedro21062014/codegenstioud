import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBBP9oH2F7eJHxBpMoakPdAV9oGOKBB6hc",
    authDomain: "ancient-bond-470823-q0.firebaseapp.com",
    projectId: "ancient-bond-470823-q0",
    storageBucket: "ancient-bond-470823-q0.firebasestorage.app",
    messagingSenderId: "94663671471",
    appId: "1:94663671471:web:fe3c0e30def7f157525e5a",
    measurementId: "G-LFYTPXP18R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
