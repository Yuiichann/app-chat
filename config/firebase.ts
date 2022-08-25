import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCVPc-h5M7ELBW4sbRkNTK2bB235LN51cY',
  authDomain: 'app-chat-823c7.firebaseapp.com',
  projectId: 'app-chat-823c7',
  storageBucket: 'app-chat-823c7.appspot.com',
  messagingSenderId: '1084921038294',
  appId: '1:1084921038294:web:b1760874c9c04190185077',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, db, provider };
