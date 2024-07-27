// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCxWJi2VAnyTkTu8eZx3RZpY0wXzrMaWtU",
  authDomain: "dating-app-97152.firebaseapp.com",
  projectId: "dating-app-97152",
  storageBucket: "dating-app-97152.appspot.com",
  messagingSenderId: "288540275927",
  appId: "1:288540275927:web:a032527071e09d24922c92",
  measurementId: "G-6DQLRFW44V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };