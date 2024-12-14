import { socket } from '@/socket';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { MeetingContext } from './MeetingProvider';
import { useAlertModal } from './use-alert-modal';
import { useConnections } from './use-connections';
import { useMedia } from './use-media';

type UseMeetingProps = {
  meetingId: string;
};

export const useMeeting = ({ meetingId }: UseMeetingProps) => {
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const { userName, properties, setProperties, setUserName } = useContext(MeetingContext);
  const { currentUsers, localStreamRef, userConnectionsMapRef, sendAppData, sendChatData } = useConnections({
    meetingId,
  });
  const localMediaStreamRef = useRef<MediaStream>(null);
  const isSharingScreenRef = useRef(false);
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

        socket.emit('init-meeting', { meetingId, userName });
      })
      .catch((err) => {
        setIsModalRequireCameraNameOpen(true);
        console.warn('cannot start the camera');
        console.warn(err);
      });
  }, [localStreamRef, userName, meetingId, getUserMedia, setUserName, setIsModalAlertNameOpen, setIsModalRequireCameraNameOpen]);

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

  const remoteVideoElementRefHandler = (userId: string, videoElement: HTMLVideoElement | null) => {
    const userConnection = userConnectionsMapRef.current.get(userId);

    if (!userConnection) return undefined;

    if (videoElement) {
      if (!videoElement.srcObject && localStreamRef.current) {
        videoElement.srcObject = userConnection.stream;
      }
    }
  };

  useEffect(() => {
    initMeeting();

    return () => {
      finishMeeting();
    };
  }, [initMeeting, finishMeeting]);

  const stopShareScreen = useCallback(() => {
    if (!isSharingScreenRef.current) return;

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

      localMediaStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      sendAppData('stop_sharing_screen');

      isSharingScreenRef.current = false;

      localMediaStreamRef.current = null;
    });
  }, [userConnectionsMapRef, localStreamRef, sendAppData]);

  const startShareScreen = useCallback(() => {
    if (isSharingScreenRef.current) return;

    getDisplayMedia()
      .then((mediaStream) => {
        userConnectionsMapRef.current.forEach((userConnection) => {
          const senders = userConnection.peerConnection.getSenders();
          const videoSender = senders.find((sender) => sender.track?.kind === 'video');

          if (!videoSender) return;

          mediaStream.getTracks().forEach((track) => {
            if (track.kind !== 'video') return;

            track.onended = () => {
              stopShareScreen();
              setProperties('shareScreen', false);
            };

            if (videoSender) {
              videoSender.replaceTrack(track);
            }
          });

          sendAppData('start_sharing_screen');

          isSharingScreenRef.current = true;

          localMediaStreamRef.current = mediaStream;
        });
      })
      .catch((err) => {
        console.warn('cannot share the screen');
        console.warn(err);

        setProperties('shareScreen', false);
      });
  }, [userConnectionsMapRef, getDisplayMedia, setProperties, stopShareScreen, sendAppData]);

  useEffect(() => {
    localStreamRef.current?.getTracks().forEach((track) => {
      if (track.kind === 'audio') {
        track.enabled = !properties.audio;
      }
      if (track.kind === 'video') {
        track.enabled = !properties.video;
      }
    });
    if (properties.shareScreen) {
      startShareScreen();
    } else {
      stopShareScreen();
    }
  }, [localStreamRef, properties, setProperties, getDisplayMedia, startShareScreen, stopShareScreen]);

  return {
    isModalAlertNameOpen,
    isModalRequireCameraNameOpen,
    currentUsers,
    localVideoElementRefHandler,
    remoteVideoElementRefHandler,
    sendChatData,
  };
};
