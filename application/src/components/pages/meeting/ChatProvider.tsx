import React, { useCallback, useContext, useState } from 'react';
import { ConnectionContext } from './ConnectionProvider';

type MessageType = {
  userId: string;
  from: string | null;
  message: string;
};

type ChatContextProps = {
  isChatVisible: boolean;
  messages: MessageType[];
  setIsChatVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  onDataChatReceived: (userId: string, event: MessageEvent) => void;
  sendMessage: (message: MessageType) => void;
};

export const ChatContext = React.createContext<ChatContextProps>({
  isChatVisible: false,
  messages: [],
  setIsChatVisible: () => undefined,
  setMessages: () => undefined,
  onDataChatReceived: () => undefined,
  sendMessage: () => undefined,
});

type ChatProviderProps = {
  children: React.ReactNode;
};

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const { userConnectionsMapRef } = useContext(ConnectionContext);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);

  const sendMessage = useCallback(
    (message: MessageType) => {
      const dataToSend = JSON.stringify(message);

      userConnectionsMapRef.current.forEach((connection) => {
        connection.chatDataChannel.send(dataToSend);
      });

      setMessages((oldMessages) => [...oldMessages, message]);
    },
    [userConnectionsMapRef, setMessages]
  );

  const onDataChatReceived = useCallback(
    (userId: string, event: MessageEvent) => {
      const { from, message } = JSON.parse(event.data);

      setMessages((oldMessages) => [...oldMessages, { from, message, userId: userId }]);
    },
    [setMessages]
  );

  return (
    <ChatContext.Provider
      value={{
        isChatVisible,
        messages,
        setIsChatVisible,
        setMessages,
        onDataChatReceived,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
