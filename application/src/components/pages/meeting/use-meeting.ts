import { SocketIoContext } from '@/providers/SocketIoProvider';
import { SharedSelection } from '@nextui-org/react';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { useMedia } from '../use-media';
import { ConnectionContext } from './ConnectionProvider';
import { MediaContext } from './MediaProvider';
import { MeetingContext } from './MeetingProvider';
import { useAlertModal } from './use-alert-modal';
import { useConnections } from './use-connections';

type UseMeetingProps = {
  meetingId: string;
};

export const useMeeting = ({ meetingId }: UseMeetingProps) => {
  const { socket, userId } = useContext(SocketIoContext);
  const { userName, userProperties, meetingProperties, setUserProperties, setMeetingProperties, setUserName } = useContext(MeetingContext);
  const { sendAppData } = useContext(ConnectionContext);
  const { localStreamRef, localScreenStreamRef } = useContext(MediaContext);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const { currentUsers, userConnectionsMapRef, updateLocalStream } = useConnections({
    meetingId,
  });

  const { audioDevices, videoDevices, getUserMedia, getDisplayMedia, retrieveMediaDevices } = useMedia();
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
    for (const connections of userConnectionsMapRef.current.values()) {
      connections.peerConnection.close();
    }

    localStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    localScreenStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    const videoElement = videoElementRef.current;

    if (!videoElement) return;

    const mediaStream = videoElement.srcObject as MediaStream;

    mediaStream?.getTracks().forEach((track) => {
      track.stop();
    });
  }, [localScreenStreamRef, userConnectionsMapRef, localStreamRef]);

  const localVideoElementRefHandler = (videoElement: HTMLVideoElement | null) => {
    if (videoElement) {
      if (videoElement.srcObject !== localStreamRef.current) {
        videoElement.srcObject = localStreamRef.current;
      }

      videoElementRef.current = videoElement;
    }
  };

  const localVideoElementMediaStreamRefHandler = (videoElement: HTMLVideoElement | null) => {
    if (videoElement) {
      if (videoElement.srcObject !== localScreenStreamRef.current) {
        videoElement.srcObject = localScreenStreamRef.current;
      }
    }
  };

  const remoteVideoElementRefHandler = (remoteUserId: string, videoElement: HTMLVideoElement | null) => {
    const userConnection = userConnectionsMapRef.current.get(remoteUserId);

    if (!userConnection) return undefined;

    if (videoElement) {
      if (!videoElement.srcObject && localStreamRef.current) {
        videoElement.srcObject = userConnection.stream;
      }
    }
  };

  const enableVideo = (enabled: boolean) => {
    localStreamRef.current?.getTracks().forEach((track) => {
      if (track.kind === 'video') {
        track.enabled = enabled;
      }
    });

    setUserProperties('video', enabled);
  };

  const enableAudio = (enabled: boolean) => {
    localStreamRef.current?.getTracks().forEach((track) => {
      if (track.kind === 'audio') {
        track.enabled = enabled;
      }
    });

    setUserProperties('audio', enabled);
  };

  const stopShareScreen = useCallback(() => {
    userConnectionsMapRef.current.forEach((userConnection) => {
      const senders = userConnection.peerConnection.getSenders();
      const videoSender = senders.find((sender) => sender.track?.kind === 'video');

      if (!videoSender) return;

      localStreamRef.current?.getTracks().forEach((track) => {
        if (track.kind !== 'video') return;

        if (videoSender) {
          videoSender.replaceTrack(track);
        }
      });
    });

    localScreenStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    localScreenStreamRef.current = null;
    sendAppData({ code: 'stop_sharing_screen' });
    setUserProperties('shareScreen', false);
  }, [localScreenStreamRef, userConnectionsMapRef, localStreamRef, sendAppData, setUserProperties]);

  const startShareScreen = useCallback(() => {
    getDisplayMedia()
      .then((mediaStream) => {
        userConnectionsMapRef.current.forEach((userConnection) => {
          const senders = userConnection.peerConnection.getSenders();
          const videoSender = senders.find((sender) => sender.track?.kind === 'video');

          if (!videoSender) return;

          mediaStream.getTracks().forEach((track) => {
            if (track.kind !== 'video') return;

            if (videoSender) {
              videoSender.replaceTrack(track);
            }
          });
        });

        mediaStream.getTracks().forEach((track) => {
          if (track.kind !== 'video') return;

          track.onended = () => {
            stopShareScreen();
            setUserProperties('shareScreen', false);
          };
        });

        localScreenStreamRef.current = mediaStream;
        sendAppData({ code: 'start_sharing_screen' });
        setUserProperties('shareScreen', true);
        setMeetingProperties('userInFocusId', userId);
      })
      .catch((err) => {
        console.warn('cannot share the screen');
        console.warn(err);

        setUserProperties('shareScreen', false);
      });
  }, [
    localScreenStreamRef,
    userConnectionsMapRef,
    userId,
    getDisplayMedia,
    setUserProperties,
    setMeetingProperties,
    stopShareScreen,
    sendAppData,
  ]);

  const toggleShareScreen = () => {
    if (userProperties.shareScreen) {
      stopShareScreen();
      if (meetingProperties.userInFocusId === userId) {
        setMeetingProperties('userInFocusId', undefined);
      }
    } else {
      startShareScreen();
    }
  };

  const changeAudioDevice = async (selection: SharedSelection) => {
    const deviceId = selection.currentKey;

    if (!deviceId) return;

    updateLocalStream({
      audio: { deviceId: { exact: deviceId } },
      video: { deviceId: { exact: userProperties.videoDevice } },
    })
      .then(() => {
        setUserProperties('audioDevice', deviceId);
      })
      .catch((err) => {
        console.warn('cannot change the media');
        console.warn(err);
      });
  };

  const changeVideoDevice = (selection: SharedSelection) => {
    const deviceId = selection.currentKey;

    if (!deviceId) return;

    updateLocalStream({
      audio: { deviceId: { exact: userProperties.audioDevice } },
      video: { deviceId: { exact: deviceId } },
    })
      .then(() => {
        setUserProperties('videoDevice', deviceId);
      })
      .catch((err) => {
        console.warn('cannot change the media');
        console.warn(err);
      });
  };

  useEffect(() => {
    startMeeting();

    return () => {
      finishMeeting();
    };
  }, [startMeeting, finishMeeting]);

  return {
    isModalAlertNameOpen,
    isModalRequireCameraNameOpen,
    currentUsers,
    audioDevices,
    videoDevices,
    localVideoElementRefHandler,
    localVideoElementMediaStreamRefHandler,
    remoteVideoElementRefHandler,
    toggleShareScreen,
    enableVideo,
    enableAudio,
    changeAudioDevice,
    changeVideoDevice,
  };
};
