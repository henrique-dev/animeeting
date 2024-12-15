'use client';

import { SocketIoContext } from '@/providers/SocketIoProvider';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';

export const useNewMeeting = () => {
  const { socket } = useContext(SocketIoContext);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream>(null);
  const [mediaAllowed, setMediaAllowed] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const router = useRouter();

  const createNewMeetingHandler = () => {
    localStorage.setItem('name', name);

    socket?.on('meeting-created', ({ id }) => {
      router.push(`/meetings/${id}`);
    });

    socket?.emit('create-meeting');
    setIsSubmitting(true);
  };

  const registerVideoRef = (videoElement: HTMLVideoElement | null) => {
    if (videoElement) {
      if (!videoElement.srcObject && mediaStreamRef.current) {
        videoElement.srcObject = mediaStreamRef.current;
      }

      videoElementRef.current = videoElement;
    }
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        mediaStreamRef.current = stream;
        setMediaAllowed(true);
        setName(localStorage.getItem('name') ?? '');
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
  }, [setMediaAllowed]);

  return { isSubmitting, mediaAllowed, name, setName, createNewMeetingHandler, registerVideoRef };
};
