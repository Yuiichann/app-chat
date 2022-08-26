import { collection, query, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { auth, db } from '../config/firebase';
import { AppUser, Conversation } from '../types';
import { getRecipientEmail } from '../utils/getRecipientEmail';

export const useRecipient = (conversationUsers: Conversation['users']) => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);

  //   get Recipient email
  const recipientEmail = getRecipientEmail(conversationUsers, loggedInUser);

  //   get Recipient Avatar

  const queryGetRecipient = query(collection(db, 'users'), where('email', '==', recipientEmail));
  const [recipientSnapshot, __loading, __error] = useCollection(queryGetRecipient);

  //    recipientSnapshot
  //   recipientSnapshot will return empty array if not found
  const recipient = recipientSnapshot?.docs[0]?.data() as AppUser | undefined;

  return {
    recipient,
    recipientEmail,
  };
};
