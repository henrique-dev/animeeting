import React, { useCallback, useEffect, useState } from 'react';

type PropertiesType = {
  video: boolean;
  audio: boolean;
  audioDevice: string;
  videoDevice: string;
  shareScreen: boolean;
  selectedUserId?: string;
  chat: boolean;
};

type MessageType = {
  userId: string;
  from: string;
  message: string;
};

type MeetingContextProps = {
  userName: string | null;
  properties: PropertiesType;
  messages: MessageType[];
  setUserName: React.Dispatch<React.SetStateAction<string | null>>;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  setProperties: (key: string, value: string | boolean) => void;
  onDataChatReceived: (userId: string, event: MessageEvent) => void;
  onDataAppReceived: (userId: string, event: MessageEvent) => void;
};

export const MeetingContext = React.createContext<MeetingContextProps>({
  userName: '',
  properties: {
    video: false,
    audio: false,
    audioDevice: 'default',
    videoDevice: 'default',
    shareScreen: false,
    chat: false,
  },
  messages: [],
  setUserName: () => undefined,
  setMessages: () => undefined,
  setProperties: () => undefined,
  onDataChatReceived: () => undefined,
  onDataAppReceived: () => undefined,
});

type MeetingProviderProps = {
  children: React.ReactNode;
};

export const MeetingProvider = ({ children }: MeetingProviderProps) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [properties, setProperties] = useState<PropertiesType>({
    video: false,
    audio: false,
    audioDevice: 'default',
    videoDevice: 'default',
    shareScreen: false,
    selectedUserId: undefined,
    chat: false,
  });
  const [messages, setMessages] = useState<MessageType[]>([]);

  const changePropertiesHandler = useCallback(
    (key: string, value: string | boolean | undefined) => {
      setProperties((oldProperties) => ({
        ...oldProperties,
        [key]: value,
      }));
    },
    [setProperties]
  );

  const onDataAppReceived = useCallback(
    (userId: string, event: MessageEvent) => {
      switch (event.data) {
        case 'start_sharing_screen':
          changePropertiesHandler('selectedUserId', userId);
          break;
        case 'stop_sharing_screen':
          changePropertiesHandler('selectedUserId', undefined);
          break;
      }
    },
    [changePropertiesHandler]
  );

  const onDataChatReceived = useCallback((userId: string, event: MessageEvent) => {
    const { from, message } = JSON.parse(event.data);

    setMessages((oldMessages) => [...oldMessages, { from, message, userId: userId }]);
  }, []);

  useEffect(() => {
    const localUserName = localStorage.getItem('name');

    setUserName(localUserName);
  }, []);

  return (
    <MeetingContext.Provider
      value={{
        userName,
        properties,
        messages,
        setUserName,
        setMessages,
        setProperties: changePropertiesHandler,
        onDataAppReceived,
        onDataChatReceived,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};
