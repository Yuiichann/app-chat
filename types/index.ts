import { Timestamp } from 'firebase/firestore';

export interface Conversation {
  users: string[];
}

export interface AppUser {
  email: string;
  lastseen: Timestamp;
  photoURL: string;
}
