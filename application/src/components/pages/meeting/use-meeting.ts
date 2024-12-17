import { SocketIoContext } from '@/providers/SocketIoProvider';
import { useCallback, useContext, useEffect } from 'react';
import { ApplicationContext } from './ApplicationProvider';
import { ConnectionContext } from './ConnectionProvider';
import { MediaContext } from './MediaProvider';
import { MeetingContext } from './MeetingProvider';
import { useAlertModal } from './use-alert-modal';

export const useMeeting = () => {
  const { meetingId } = useContext(ApplicationContext);
  const { socket } = useContext(SocketIoContext);
  const { userName, setUserName } = useContext(MeetingContext);
  const { closeAllConnections } = useContext(ConnectionContext);
  const { localStreamRef, getUserMedia, retrieveMediaDevices, closeAllLocalStreams } = useContext(MediaContext);
  const { isModalAlertNameOpen, isModalRequireCameraNameOpen, setIsModalAlertNameOpen, setIsModalRequireCameraNameOpen } = useAlertModal();

  const startMeeting = useCallback(() => {
    if (!userName || userName.trim() === '') {
      setIsModalAlertNameOpen(true);
      return;
    }

    setIsModalAlertNameOpen(false);
    setUserName(userName);

    const audioDevice = localStorage.getItem('audioDevice') ?? 'default';
    const videoDevice = localStorage.getItem('videoDevice') ?? 'default';

    getUserMedia({
      audio: { deviceId: { exact: audioDevice } },
      video: { deviceId: { exact: videoDevice } },
    })
      .then((stream) => {
        localStreamRef.current = stream;

        socket?.emit('init-meeting', { meetingId, userName });

        retrieveMediaDevices().catch((err) => {
          setIsModalRequireCameraNameOpen(true);
          console.warn('cannot get the devices');
          console.warn(err);
        });
      })
      .catch((err) => {
        setIsModalRequireCameraNameOpen(true);
        console.warn('cannot start the media');
        console.warn(err);
      });
  }, [
    socket,
    localStreamRef,
    userName,
    meetingId,
    getUserMedia,
    setUserName,
    setIsModalAlertNameOpen,
    setIsModalRequireCameraNameOpen,
    retrieveMediaDevices,
  ]);

  const finishMeeting = useCallback(() => {
    closeAllConnections();
    closeAllLocalStreams();
  }, [closeAllConnections, closeAllLocalStreams]);

  useEffect(() => {
    startMeeting();

    return () => {
      finishMeeting();
    };
  }, [startMeeting, finishMeeting]);

  return {
    isModalAlertNameOpen,
    isModalRequireCameraNameOpen,
  };
};
