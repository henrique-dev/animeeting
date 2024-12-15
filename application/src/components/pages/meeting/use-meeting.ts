import { SocketIoContext } from '@/providers/SocketIoProvider';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { ConnectionContext } from './ConnectionProvider';
import { MeetingContext } from './MeetingProvider';
import { useAlertModal } from './use-alert-modal';
import { useConnections } from './use-connections';
import { useMedia } from './use-media';

type UseMeetingProps = {
  meetingId: string;
};

export const useMeeting = ({ meetingId }: UseMeetingProps) => {
  const { socket } = useContext(SocketIoContext);
  const { userName, userProperties, setUserProperties, setUserName } = useContext(MeetingContext);
  const { sendAppData } = useContext(ConnectionContext);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const { currentUsers, localStreamRef, userConnectionsMapRef } = useConnections({
    meetingId,
  });
  const localMediaStreamRef = useRef<MediaStream>(null);
  const { getUserMedia, getDisplayMedia } = useMedia();
  const { isModalAlertNameOpen, isModalRequireCameraNameOpen, setIsModalAlertNameOpen, setIsModalRequireCameraNameOpen } = useAlertModal();

  const initMeeting = useCallback(() => {
    if (!userName || userName.trim() === '') {
      setIsModalAlertNameOpen(true);
      return;
    }

    setIsModalAlertNameOpen(false);
    setUserName(userName);

    getUserMedia()
      .then((stream) => {
        localStreamRef.current = stream;

        socket?.emit('init-meeting', { meetingId, userName });
      })
      .catch((err) => {
        setIsModalRequireCameraNameOpen(true);
        console.warn('cannot start the camera');
        console.warn(err);
      });
  }, [socket, localStreamRef, userName, meetingId, getUserMedia, setUserName, setIsModalAlertNameOpen, setIsModalRequireCameraNameOpen]);

  const finishMeeting = useCallback(() => {
    for (const connections of userConnectionsMapRef.current.values()) {
      connections.peerConnection.close();
    }

    localStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    localMediaStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    const videoElement = videoElementRef.current;

    if (!videoElement) return;

    const mediaStream = videoElement.srcObject as MediaStream;

    mediaStream?.getTracks().forEach((track) => {
      track.stop();
    });
  }, [userConnectionsMapRef, localStreamRef]);

  const localVideoElementRefHandler = (videoElement: HTMLVideoElement | null) => {
    if (videoElement) {
      if (!videoElement.srcObject && localStreamRef.current) {
        videoElement.srcObject = localStreamRef.current;
      }

      videoElementRef.current = videoElement;
    }
  };

  const localVideoElementMediaStreamRefHandler = (videoElement: HTMLVideoElement | null) => {
    if (videoElement) {
      if (!videoElement.srcObject && localMediaStreamRef.current) {
        videoElement.srcObject = localMediaStreamRef.current;
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

    localMediaStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    sendAppData('stop_sharing_screen');
    setUserProperties('shareScreen', false);
    localMediaStreamRef.current = null;
  }, [userConnectionsMapRef, localStreamRef, sendAppData, setUserProperties]);

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

        sendAppData('start_sharing_screen');
        setUserProperties('shareScreen', true);
        localMediaStreamRef.current = mediaStream;
      })
      .catch((err) => {
        console.warn('cannot share the screen');
        console.warn(err);

        setUserProperties('shareScreen', false);
      });
  }, [userConnectionsMapRef, getDisplayMedia, setUserProperties, stopShareScreen, sendAppData]);

  const toggleShareScreen = () => {
    if (userProperties.shareScreen) {
      stopShareScreen();
    } else {
      startShareScreen();
    }
  };

  const toggleVideo = () => {
    localStreamRef.current?.getTracks().forEach((track) => {
      if (track.kind === 'video') {
        track.enabled = !userProperties.video;
      }
    });

    setUserProperties('video', !userProperties.video);
  };

  const toggleAudio = () => {
    localStreamRef.current?.getTracks().forEach((track) => {
      if (track.kind === 'audio') {
        track.enabled = !userProperties.audio;
      }
    });

    setUserProperties('audio', !userProperties.audio);
  };

  useEffect(() => {
    initMeeting();

    return () => {
      finishMeeting();
    };
  }, [initMeeting, finishMeeting]);

  return {
    isModalAlertNameOpen,
    isModalRequireCameraNameOpen,
    currentUsers,
    localVideoElementRefHandler,
    localVideoElementMediaStreamRefHandler,
    remoteVideoElementRefHandler,
    toggleShareScreen,
    toggleVideo,
    toggleAudio,
  };
};
