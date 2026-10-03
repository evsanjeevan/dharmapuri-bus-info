import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Vite சூழல் மாறிகளை (.env) பயன்படுத்தி பாதுகாப்பான கான்ஃபிகரேஷன்
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// ஃபயர்பேஸ் செயலியைத் துவங்குதல் (Initialize Firebase)
const app = initializeApp(firebaseConfig);

// மற்ற பேஜ்களில் (உதாரணமாக HomePage.jsx) பயன்படுத்த ஏதுவாக எக்ஸ்போர்ட் செய்தல்
export const db = getFirestore(app);
export const auth = getAuth(app);