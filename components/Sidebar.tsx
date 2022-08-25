import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import React, { useState } from 'react';
import styled from 'styled-components';
import Tooltip from '@mui/material/Tooltip';
import ChatIcon from '@mui/icons-material/Chat';
import MoreVerticalIcon from '@mui/icons-material/MoreVert';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import * as EmailValidator from 'email-validator';
import { async } from '@firebase/util';
import { addDoc, collection, query, where } from 'firebase/firestore';

const StyledContainer = styled.div`
  height: 100vh;
  min-width: 300px;
  max-width: 350px;
  overflow-y: scroll;
  border-right: 1px solid whitesmoke;
  ::-webkit-scrollbar {
    display: none;
  }
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid whitesmoke;
  position: sticky;
  top: 0;
  left: 0;
  background-color: white;
  z-index: 1;
`;

const StyledSearch = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 20px;
`;

const StyledSearchInput = styled.input`
  outline: none;
  border: none;
  flex: 1;
`;

const StyledSidebarButton = styled(Button)`
  border-top: 1px solid whitesmoke;
  border-bottom: 1px solid whitesmoke;
`;

const StyledUserAvatar = styled(Avatar)`
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
`;

const Sidebar = () => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);

  const [isOpenConversationDialog, setIsOpenConversationDialog] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const isInvitingSelf = recipientEmail === loggedInUser?.email;

  const toggleNewConversationDialog = (isOpen: boolean) => {
    setIsOpenConversationDialog(isOpen);

    if (!isOpen) {
      setRecipientEmail('');
    }
  };

  const closeNewConversationDialog = () => {
    toggleNewConversationDialog(false);
  };

  // check if conversation already exists between the current logged in uer and recipient
  const queryGetConversationForCurrentUser = query(
    collection(db, 'conversations'),
    where('users', 'array-contains', loggedInUser?.email)
  );

  const [conversationSnapshot] = useCollection(queryGetConversationForCurrentUser);

  const isConversationAlreadyExists = (recipientEmail: string) => {
    // return conversationSnapshot?.docs.find()
    // 1h40p
  };

  const createConversation = async () => {
    if (!recipientEmail) return;

    if (EmailValidator.validate(recipientEmail) && !isInvitingSelf) {
      // Add conversation user to db 'conversations' collection
      // A conversation is between the currently logged in user and user invited
      await addDoc(collection(db, 'conversations'), {
        users: [loggedInUser?.email, recipientEmail],
      });
    } else {
      console.log('ERROR: Have a error when create conversation');
    }

    closeNewConversationDialog();
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log('ERROR LOGGING OUT');
    }
  };

  return (
    <StyledContainer>
      {/* Header */}
      <StyledHeader>
        <Tooltip title={loggedInUser?.email as string} placement="right">
          <StyledUserAvatar src={loggedInUser?.photoURL || ''} />
        </Tooltip>

        <div>
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton>
            <MoreVerticalIcon />
          </IconButton>
          <IconButton onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </div>
      </StyledHeader>

      {/* Input Search */}
      <StyledSearch>
        <SearchIcon />
        <StyledSearchInput placeholder="Search in connversations" />
      </StyledSearch>

      {/* button create new chat */}
      <StyledSidebarButton fullWidth onClick={() => toggleNewConversationDialog(true)}>
        Start a new Connversation
      </StyledSidebarButton>

      {/* List chat */}

      {/* Dialog */}
      <Dialog open={isOpenConversationDialog} onClose={closeNewConversationDialog}>
        <DialogTitle>New Conversation</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Please enter a Google email address for the yser you wish to chat with
          </DialogContentText>

          <TextField
            autoFocus={true}
            margin="dense"
            id="name"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            label="Email Address"
            fullWidth
            variant="standard"
            onKeyUp={(e) => {
              if (e.which === 13 && recipientEmail) {
                createConversation();
              }
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={closeNewConversationDialog}>Cannel</Button>
          <Button disabled={!recipientEmail} onClick={createConversation}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default Sidebar;
