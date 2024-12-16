'use client';

import { SocketIoContext } from '@/providers/SocketIoProvider';
import { useRouter } from 'next/navigation';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useMedia } from '../use-media';

type DeviceType = {
  id: string;
  name: string;
};

export const useNewMeeting = () => {
  const { socket } = useContext(SocketIoContext);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream>(null);
  const [mediaAllowed, setMediaAllowed] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoDevices, setVideoDevices] = useState<DeviceType[]>([]);
  const [audioDevices, setAudioDevices] = useState<DeviceType[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
  const { getUserMedia, getDevices } = useMedia();
  const [name, setName] = useState('');
  const router = useRouter();

  const createNewMeetingHandler = () => {
    localStorage.setItem('name', name);
    localStorage.setItem('audioDevice', selectedAudioDevice);
    localStorage.setItem('videoDevice', selectedVideoDevice);

    socket?.on('meeting-created', ({ id }) => {
      router.push(`/meetings/${id}`);
    });

    socket?.emit('create-meeting');
    setIsSubmitting(true);
  };

  const registerVideoRef = (videoElement: HTMLVideoElement | null) => {
    if (videoElement) {
      if (videoElement.srcObject !== mediaStreamRef.current) {
        videoElement.srcObject = mediaStreamRef.current;
      }

      videoElementRef.current = videoElement;
    }
  };

  const selectedAudioDeviceHandler = (event: React.ChangeEvent<HTMLSelectElement>) => {
    getUserMedia({
      video: true,
      audio: { deviceId: { exact: event.target.value } },
    })
      .then((stream) => {
        mediaStreamRef.current = stream;
        setMediaAllowed(true);
        setSelectedAudioDevice(event.target.value);
      })
      .catch((err) => {
        console.warn('cannot get the user media');
        console.warn(err);
      });
  };

  const selectedVideoDeviceHandler = (event: React.ChangeEvent<HTMLSelectElement>) => {
    getUserMedia({
      video: { deviceId: { exact: event.target.value } },
      audio: true,
    })
      .then((stream) => {
        mediaStreamRef.current = stream;
        setMediaAllowed(true);
        setSelectedVideoDevice(event.target.value);
      })
      .catch((err) => {
        console.warn('cannot get the user media');
        console.warn(err);
      });
  };

  const getMediaDevices = useCallback(() => {
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

        if (audioDevicesFound.find((device) => device.id === 'default')) {
          setSelectedAudioDevice('default');
        } else if (audioDevicesFound.length > 0) {
          setSelectedAudioDevice(audioDevicesFound[0].id);
        }

        if (videoDevicesFound.find((device) => device.id === 'default')) {
          setSelectedVideoDevice('default');
        } else if (videoDevicesFound.length > 0) {
          setSelectedVideoDevice(videoDevicesFound[0].id);
        }

        setAudioDevices(audioDevicesFound);
        setVideoDevices(videoDevicesFound);
      })
      .catch((err) => {
        console.warn('cannot get the devices');
        console.warn(err);
        setMediaAllowed(false);
      });
  }, [getDevices]);

  useEffect(() => {
    getUserMedia({
      video: true,
      audio: true,
    })
      .then((stream) => {
        mediaStreamRef.current = stream;
        setMediaAllowed(true);
        setName(localStorage.getItem('name') ?? '');
        getMediaDevices();
      })
      .catch((err) => {
        setMediaAllowed(false);
        console.warn('cannot get the user media');
        console.warn(err);
      });

    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });

      mediaStreamRef.current = null;

      const videoElement = videoElementRef.current;

      if (!videoElement) return;

      const mediaStream = videoElement.srcObject as MediaStream;

      mediaStream?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, [setMediaAllowed, getMediaDevices]);

  return {
    isSubmitting,
    mediaAllowed,
    name,
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    selectedVideoDevice,
    setSelectedAudioDevice: selectedAudioDeviceHandler,
    setSelectedVideoDevice: selectedVideoDeviceHandler,
    setName,
    createNewMeetingHandler,
    registerVideoRef,
  };
};
