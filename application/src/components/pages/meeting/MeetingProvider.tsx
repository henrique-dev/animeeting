import React, { useCallback, useEffect, useState } from 'react';

type UserPropertiesType = {
  video: boolean;
  audio: boolean;
  audioDevice: string;
  videoDevice: string;
  shareScreen: boolean;
};

type MeetingPropertiesType = {
  userInFocusId?: string;
};

type MeetingContextProps = {
  userName: string | null;
  userProperties: UserPropertiesType;
  meetingProperties: MeetingPropertiesType;
  setUserName: React.Dispatch<React.SetStateAction<string | null>>;
  setUserProperties: (key: keyof UserPropertiesType, value: string | boolean) => void;
  onDataAppReceived: (userId: string, event: MessageEvent) => void;
  setMeetingProperties: (key: keyof MeetingPropertiesType, value: string | boolean | undefined) => void;
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
  meetingProperties: {
    userInFocusId: undefined,
  },
  setUserName: () => undefined,
  setUserProperties: () => undefined,
  setMeetingProperties: () => undefined,
  onDataAppReceived: () => undefined,
});

type MeetingProviderProps = {
  children: React.ReactNode;
};

export const MeetingProvider = ({ children }: MeetingProviderProps) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userProperties, setUserProperties] = useState<UserPropertiesType>({
    video: true,
    audio: true,
    audioDevice: 'default',
    videoDevice: 'default',
    shareScreen: false,
  });
  const [meetingProperties, setMeetingProperties] = useState<MeetingPropertiesType>({
    userInFocusId: undefined,
  });

  const changeUserPropertiesHandler = useCallback(
    (key: string, value: string | boolean | undefined) => {
      setUserProperties((oldProperties) => ({
        ...oldProperties,
        [key]: value,
      }));
    },
    [setUserProperties]
  );

  const changeMeetingPropertiesHandler = useCallback(
    (key: string, value: string | boolean | undefined) => {
      setMeetingProperties((oldProperties) => ({
        ...oldProperties,
        [key]: value,
      }));
    },
    [setMeetingProperties]
  );

  const onDataAppReceived = useCallback(
    (userId: string, event: MessageEvent) => {
      switch (event.data) {
        case 'start_sharing_screen':
          changeMeetingPropertiesHandler('userInFocusId', userId);
          break;
        case 'stop_sharing_screen':
          changeMeetingPropertiesHandler('userInFocusId', undefined);
          break;
      }
    },
    [changeMeetingPropertiesHandler]
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
        meetingProperties,
        setUserName,
        setUserProperties: changeUserPropertiesHandler,
        onDataAppReceived,
        setMeetingProperties: changeMeetingPropertiesHandler,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};
