import styled from 'styled-components';
import { useRecipient } from '../hooks/useRecipient';
import { Conversation } from '../types';
import RecipientAvatar from './RecipientAvatar';

interface Props {
  id: string;
  conversationUsers: Conversation['users'];
}

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 15px;
  word-break: break-all; //dai qua xuong hang
  :hover {
    background-color: #e9eaeb;
  }
`;

const ConversationSelect = ({ id, conversationUsers }: Props) => {
  const { recipient, recipientEmail } = useRecipient(conversationUsers);
  return (
    <StyledContainer>
      <RecipientAvatar recipient={recipient} recipientEmail={recipientEmail} />
      <span>{recipientEmail}</span>
    </StyledContainer>
  );
};

export default ConversationSelect;
