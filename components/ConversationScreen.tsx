import { AttachFile, InsertEmoticon, Mic, MoreVert, Send } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { KeyboardEventHandler, MouseEventHandler, useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import styled from 'styled-components';
import { auth, db } from '../config/firebase';
import { useRecipient } from '../hooks/useRecipient';
import { Conversation, IMessage } from '../types';
import {
  convertFirestoreTimestampToString,
  getMessagesInConversation,
  transformMessage,
} from '../utils/getMessagesInConversation';
import Message from './Message';
import RecipientAvatar from './RecipientAvatar';

interface Props {
  conversation: Conversation;
  messages: IMessage[];
}

const StyledRecipientHeader = styled.div`
  position: sticky;
  background-color: white;
  z-index: 100;
  top: 0;
  display: flex;
  align-items: center;
  padding: 11px;
  height: 80px;
  border-bottom: 1px solid whitesmoke;
`;

const StyledHeaderInfo = styled.div`
  flex-grow: 1;

  > h3 {
    margin-top: 0;
    margin-bottom: 3px;
  }

  > span {
    font-size: 14px;
    color: gray;
  }
`;

const StyledH3 = styled.h3`
  word-break: break-all;
`;

const StyledHeaderIcon = styled.div`
  display: flex;
`;

const StyledMessageContainer = styled.div`
  padding: 30px;
  background-color: #e5ded8;
  min-height: 90vh;
`;

const StyledInputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 100;
`;

const StyledInput = styled.input`
  flex-grow: 1;
  outline: none;
  border: none;
  border-radius: 10px;
  background-color: whitesmoke;
  padding: 15px;
  margin-left: 15px;
  margin-right: 15px;
`;

const EndOffMessageForAutoScroll = styled.div`
  margin-bottom: 10px;
`;

const ConversationScreen = ({ conversation, messages }: Props) => {
  const [newMessage, setNewMessage] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [loggedInUser, _loading, _error] = useAuthState(auth);
  const conversationUser = conversation.users;

  const { recipientEmail, recipient } = useRecipient(conversationUser);

  const router = useRouter();
  const conversationId = router.query.id;

  const queryGetMessages = getMessagesInConversation(conversationId as string);

  const [messagesSnapshot, messagesLoading, __error] = useCollection(queryGetMessages);

  const showMessages = () => {
    if (messagesLoading) {
      return messages.map((message) => <Message key={message.id} message={message} />);
    }

    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((message) => (
        <Message key={message.id} message={transformMessage(message)} />
      ));
    }

    return null;
  };

  const addMessageToDbAndUpdateLastSeen = async () => {
    // update last seen to 'users' collection
    await setDoc(
      doc(db, 'users', loggedInUser?.email as string),
      {
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );

    // reset Input field
    setNewMessage('');

    // add new Message to 'messages' Colection
    await addDoc(collection(db, 'messages'), {
      conversation_id: conversationId,
      send_at: serverTimestamp(),
      text: newMessage,
      user: loggedInUser?.email,
    });

    // scroll to bottom
    scrollToBottom();
  };

  const sendMessageOnClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (!newMessage) return;
    addMessageToDbAndUpdateLastSeen();
  };

  const sendMessageOnEnter: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!newMessage) return;

      addMessageToDbAndUpdateLastSeen();
    }
  };

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <StyledRecipientHeader>
        <RecipientAvatar recipient={recipient} recipientEmail={recipientEmail} />

        <StyledHeaderInfo>
          <StyledH3>{recipientEmail}</StyledH3>

          {recipient && (
            <span>Last Active: {convertFirestoreTimestampToString(recipient.lastSeen)}</span>
          )}
        </StyledHeaderInfo>

        <StyledHeaderIcon>
          <IconButton>
            <AttachFile />
          </IconButton>
          <IconButton>
            <MoreVert />
          </IconButton>
        </StyledHeaderIcon>
      </StyledRecipientHeader>

      <StyledMessageContainer>
        {showMessages()}
        {/* for auto scroll to the end when new a message is sent */}
        <EndOffMessageForAutoScroll ref={endOfMessagesRef} />
      </StyledMessageContainer>

      {/* Enter Message */}
      <StyledInputContainer>
        <InsertEmoticon />
        <StyledInput
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={sendMessageOnEnter}
        />
        <IconButton onClick={sendMessageOnClick} disabled={!newMessage}>
          <Send />
        </IconButton>
        <IconButton>
          <Mic />
        </IconButton>
      </StyledInputContainer>
    </>
  );
};

export default ConversationScreen;
