import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import Loading from '../components/Loading';
import { auth, db } from '../config/firebase';
import '../styles/globals.css';
import Login from './login';

function MyApp({ Component, pageProps }: AppProps) {
  // hooks
  const [loggedInUser, loading, _error] = useAuthState(auth);

  useEffect(() => {
    const setUserInDb = async () => {
      // set docs /--> set one documents
      try {
        await setDoc(
          doc(db, 'users', loggedInUser?.email as string),
          {
            email: loggedInUser?.email, // email of user
            lastSeen: serverTimestamp(), // time to login lastest
            photoURL: loggedInUser?.photoURL, // link avater url
          },
          {
            merge: true, //just update what is changed
          }
        );
      } catch (error) {
        console.log('ERROR: set User in DB', error);
      }
    };

    // only set when user login
    if (loggedInUser) {
      setUserInDb();
    }
  }, [loggedInUser]);

  // loading from hooks --> when loading true retrun components Loading
  if (loading) return <Loading />;

  // loggedInUser from hooks --> if user logged, loggedInUser will save user info, and opposite
  if (!loggedInUser) return <Login />;

  // all done, App UI will rendered
  return <Component {...pageProps} />;
}

export default MyApp;
