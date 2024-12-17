import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ConnectionContext } from './ConnectionProvider';

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
});

type MeetingProviderProps = {
  children: React.ReactNode;
};

export const MeetingProvider = ({ children }: MeetingProviderProps) => {
  const { appSubscribe } = useContext(ConnectionContext);
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
    (data: { userId: string; payload: string }) => {
      const params = JSON.parse(data.payload);

      switch (params.code) {
        case 'start_sharing_screen':
          changeMeetingPropertiesHandler('userInFocusId', data.userId);
          break;
        case 'stop_sharing_screen':
          setMeetingProperties((oldState) => {
            if (oldState.userInFocusId === data.userId) {
              return {
                ...oldState,
                userInFocusId: undefined,
              };
            }

            return { ...oldState };
          });
      }
    },
    [changeMeetingPropertiesHandler]
  );

  useEffect(() => {
    const localUserName = localStorage.getItem('name');
    const audioDevice = localStorage.getItem('audioDevice') ?? 'default';
    const videoDevice = localStorage.getItem('videoDevice') ?? 'default';

    setUserName(localUserName);
    setUserProperties((prevState) => ({
      ...prevState,
      audioDevice,
      videoDevice,
    }));
  }, []);

  useEffect(() => appSubscribe(onDataAppReceived), [appSubscribe, onDataAppReceived]);

  return (
    <MeetingContext.Provider
      value={{
        userName,
        userProperties,
        meetingProperties,
        setUserName,
        setUserProperties: changeUserPropertiesHandler,
        setMeetingProperties: changeMeetingPropertiesHandler,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};
