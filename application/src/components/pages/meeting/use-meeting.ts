import { SocketIoContext } from '@/providers/SocketIoProvider';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ConnectionContext } from './ConnectionProvider';
import { MeetingContext } from './MeetingProvider';
import { useAlertModal } from './use-alert-modal';
import { useConnections } from './use-connections';
import { useMedia } from '../use-media';

export type DeviceType = {
  id: string;
  name: string;
};

type UseMeetingProps = {
  meetingId: string;
};

export const useMeeting = ({ meetingId }: UseMeetingProps) => {
  const { socket, userId } = useContext(SocketIoContext);
  const { userName, userProperties, meetingProperties, setUserProperties, setMeetingProperties, setUserName } = useContext(MeetingContext);
  const { sendAppData } = useContext(ConnectionContext);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const { currentUsers, localStreamRef, userConnectionsMapRef, updateLocalStream } = useConnections({
    meetingId,
  });
  const localMediaStreamRef = useRef<MediaStream>(null);
  const [videoDevices, setVideoDevices] = useState<DeviceType[]>([]);
  const [audioDevices, setAudioDevices] = useState<DeviceType[]>([]);
  const { getUserMedia, getDisplayMedia, getDevices } = useMedia();
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
      audio: { deviceId: audioDevice },
      video: { deviceId: videoDevice },
    })
      .then((stream) => {
        localStreamRef.current = stream;

        socket?.emit('init-meeting', { meetingId, userName });
      })
      .catch((err) => {
        setIsModalRequireCameraNameOpen(true);
        console.warn('cannot start the media');
        console.warn(err);
      });

    getDevices()
      .then((devices) => {
        const audioDevicesFound = devices
          .filter((device) => device.kind === 'audioinput')
          .map((device) => ({
            id: device.deviceId,
            name: device.label,
          }));

        const videoDevicesFound = devices
          .filter((device) => device.kind === 'videoinput')
          .map((device) => ({
            id: device.deviceId,
            name: device.label,
          }));

        setAudioDevices(audioDevicesFound);
        setVideoDevices(videoDevicesFound);
      })
      .catch((err) => {
        setIsModalRequireCameraNameOpen(true);
        console.warn('cannot get the devices');
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
    getDevices,
  ]);

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
      if (videoElement.srcObject !== localStreamRef.current) {
        videoElement.srcObject = localStreamRef.current;
      }

      videoElementRef.current = videoElement;
    }
  };

  const localVideoElementMediaStreamRefHandler = (videoElement: HTMLVideoElement | null) => {
    if (videoElement) {
      if (videoElement.srcObject !== localMediaStreamRef.current) {
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

    localMediaStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    localMediaStreamRef.current = null;
    sendAppData({ code: 'stop_sharing_screen' });
    setUserProperties('shareScreen', false);
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

        localMediaStreamRef.current = mediaStream;
        sendAppData({ code: 'start_sharing_screen' });
        setUserProperties('shareScreen', true);
        setMeetingProperties('userInFocusId', userId);
      })
      .catch((err) => {
        console.warn('cannot share the screen');
        console.warn(err);

        setUserProperties('shareScreen', false);
      });
  }, [userConnectionsMapRef, userId, getDisplayMedia, setUserProperties, setMeetingProperties, stopShareScreen, sendAppData]);

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

  const changeAudioDevice = async (deviceId: string) => {
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

  const changeVideoDevice = (deviceId: string) => {
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
