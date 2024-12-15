import React, { useCallback, useEffect, useState } from 'react';

type PropertiesType = {
  video: boolean;
  audio: boolean;
  audioDevice: string;
  videoDevice: string;
  shareScreen: boolean;
  selectedUserId?: string;
};

type MeetingContextProps = {
  userName: string | null;
  userProperties: PropertiesType;
  setUserName: React.Dispatch<React.SetStateAction<string | null>>;
  setUserProperties: (key: string, value: string | boolean) => void;
  onDataAppReceived: (userId: string, event: MessageEvent) => void;
};

export const MeetingContext = React.createContext<MeetingContextProps>({
  userName: '',
  userProperties: {
    video: false,
    audio: false,
    audioDevice: 'default',
    videoDevice: 'default',
    shareScreen: false,
  },
  setUserName: () => undefined,
  setUserProperties: () => undefined,
  onDataAppReceived: () => undefined,
});

type MeetingProviderProps = {
  children: React.ReactNode;
};

export const MeetingProvider = ({ children }: MeetingProviderProps) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userProperties, setUserProperties] = useState<PropertiesType>({
    video: true,
    audio: true,
    audioDevice: 'default',
    videoDevice: 'default',
    shareScreen: false,
    selectedUserId: undefined,
  });

  const changePropertiesHandler = useCallback(
    (key: string, value: string | boolean | undefined) => {
      setUserProperties((oldProperties) => ({
        ...oldProperties,
        [key]: value,
      }));
    },
    [setUserProperties]
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

  useEffect(() => {
    const localUserName = localStorage.getItem('name');

    setUserName(localUserName);
  }, []);

  return (
    <MeetingContext.Provider
      value={{
        userName,
        userProperties,
        setUserName,
        setUserProperties: changePropertiesHandler,
        onDataAppReceived,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};
