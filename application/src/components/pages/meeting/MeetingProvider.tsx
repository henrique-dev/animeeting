import { SocketIoContext } from '@/providers/SocketIoProvider';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ApplicationContext } from './ApplicationProvider';
import { ConnectionContext } from './ConnectionProvider';
import { MediaContext } from './MediaProvider';

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
  isModalConfigureMeetingOpen: boolean;
  isModalRequireMediaOpen: boolean;
  setUserName: React.Dispatch<React.SetStateAction<string | null>>;
  setUserProperties: (key: keyof UserPropertiesType, value: string | boolean) => void;
  setMeetingProperties: (key: keyof MeetingPropertiesType, value: string | boolean | undefined) => void;
  setIsModalConfigureMeetingOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsModalRequireMediaOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
  isModalConfigureMeetingOpen: false,
  isModalRequireMediaOpen: false,
  setUserName: () => undefined,
  setUserProperties: () => undefined,
  setMeetingProperties: () => undefined,
  setIsModalConfigureMeetingOpen: () => undefined,
  setIsModalRequireMediaOpen: () => undefined,
});

type MeetingProviderProps = {
  children: React.ReactNode;
};

export const MeetingProvider = ({ children }: MeetingProviderProps) => {
  const { appSubscribe } = useContext(ConnectionContext);
  const [userName, setUserName] = useState<string | null>(null);
  const [isModalConfigureMeetingOpen, setIsModalConfigureMeetingOpen] = useState(false);
  const [isModalRequireMediaOpen, setIsModalRequireMediaOpen] = useState(false);
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
  const { meetingId } = useContext(ApplicationContext);
  const { socket, userId, isConnected } = useContext(SocketIoContext);
  const { closeAllConnections } = useContext(ConnectionContext);
  const {
    localStreamRef,
    selectedAudioDevice,
    selectedVideoDevice,
    getUserMedia,
    retrieveMediaDevices,
    closeAllLocalStreams,
    setSelectedAudioDevice,
    setSelectedVideoDevice,
  } = useContext(MediaContext);

  const startMeeting = useCallback(() => {
    if (!isConnected || userId === '') return;

    if (!userName || userName === '' || selectedAudioDevice === '' || selectedVideoDevice === '') {
      setIsModalConfigureMeetingOpen(true);
      setUserName('');
      return;
    }

    setIsModalConfigureMeetingOpen(false);
    setUserProperties((prevState) => ({
      ...prevState,
      audioDevice: selectedAudioDevice,
      videoDevice: selectedVideoDevice,
    }));

    getUserMedia({
      audio: { deviceId: { exact: selectedAudioDevice } },
      video: { deviceId: { exact: selectedVideoDevice } },
    })
      .then((stream) => {
        localStreamRef.current = stream;

        socket?.emit('init-meeting', { meetingId, userName });

        retrieveMediaDevices().catch((err) => {
          setIsModalRequireMediaOpen(true);
          console.warn('cannot get the devices');
          console.warn(err);
        });
      })
      .catch((err) => {
        setIsModalRequireMediaOpen(true);
        console.warn('cannot start the media');
        console.warn(err);
      });
  }, [
    userName,
    selectedAudioDevice,
    selectedVideoDevice,
    isConnected,
    socket,
    userId,
    localStreamRef,
    meetingId,
    getUserMedia,
    setUserName,
    setIsModalConfigureMeetingOpen,
    setIsModalRequireMediaOpen,
    retrieveMediaDevices,
  ]);

  const finishMeeting = useCallback(() => {
    closeAllConnections();
    closeAllLocalStreams();
  }, [closeAllConnections, closeAllLocalStreams]);

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
    startMeeting();

    return () => {
      finishMeeting();
    };
  }, [startMeeting, finishMeeting]);

  useEffect(() => {
    const name = sessionStorage.getItem('name');
    const audioDevice = sessionStorage.getItem('audioDevice');
    const videoDevice = sessionStorage.getItem('videoDevice');

    setUserName(name);
    setSelectedAudioDevice(audioDevice ?? '');
    setSelectedVideoDevice(videoDevice ?? '');
  }, [setIsModalConfigureMeetingOpen, setUserName, setSelectedAudioDevice, setSelectedVideoDevice]);

  useEffect(() => appSubscribe(onDataAppReceived), [appSubscribe, onDataAppReceived]);

  return (
    <MeetingContext.Provider
      value={{
        userName,
        userProperties,
        meetingProperties,
        isModalConfigureMeetingOpen,
        isModalRequireMediaOpen,
        setUserName,
        setUserProperties: changeUserPropertiesHandler,
        setMeetingProperties: changeMeetingPropertiesHandler,
        setIsModalConfigureMeetingOpen,
        setIsModalRequireMediaOpen,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};
