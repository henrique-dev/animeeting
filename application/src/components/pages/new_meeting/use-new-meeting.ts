'use client';

import { api } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export const useNewMeeting = () => {
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream>(null);
  const [mediaAllowed, setMediaAllowed] = useState<boolean | null>(null);
  const [name, setName] = useState('');
  const router = useRouter();

  const createNewMeetingHandler = () => {
    localStorage.setItem('name', name);

    api
      .post('/api/meetings')
      .then(async (response) => {
        const data = await response.json();

        router.push(`/meetings/${data.id}`);
      })
      .catch((err) => {
        console.error(err);
      });
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

  return { mediaAllowed, name, setName, createNewMeetingHandler, registerVideoRef };
};
