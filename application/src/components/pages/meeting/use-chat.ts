import { SocketIoContext } from '@/providers/SocketIoProvider';
import { useContext, useState } from 'react';
import { ChatContext } from './ChatProvider';
import { MeetingContext } from './MeetingProvider';

export const useChat = () => {
  const { userId } = useContext(SocketIoContext);
  const { userName } = useContext(MeetingContext);
  const { sendMessage } = useContext(ChatContext);
  const [messageToSend, setMessageToSend] = useState('');

  const sendMessageHandler = () => {
    sendMessage({ from: userName, message: messageToSend, userId });
    setMessageToSend('');
  };

  const onKeyDownHandler = (event: React.KeyboardEvent) => {
    if (event.code === 'Enter' && !event.shiftKey && messageToSend.trim() !== '') {
      event.preventDefault();

      sendMessageHandler();
    }
  };

  return {
    messageToSend,
    setMessageToSend,
    sendMessage: sendMessageHandler,
    onKeyDownHandler,
  };
};
