import {
  collection,
  DocumentData,
  orderBy,
  query,
  QueryDocumentSnapshot,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { IMessage } from '../types';

export const getMessagesInConversation = (conversationId?: string) =>
  query(
    collection(db, 'messages'),
    where('conversation_id', '==', conversationId),
    orderBy('send_at', 'asc')
  );

export const transformMessage = (message: QueryDocumentSnapshot<DocumentData>) =>
  ({
    id: message.id,
    ...message.data(),
    send_at: message.data().send_at
      ? convertFirestoreTimestampToString(message.data().send_at as Timestamp)
      : null,
  } as IMessage);

export const convertFirestoreTimestampToString = (timestamp: Timestamp) => {
  return new Date(timestamp.toDate().getTime()).toLocaleString();
};
