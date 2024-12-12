'use client';

import { api } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export const useNewMeeting = () => {
  const [localStream, setLocalStream] = useState<MediaStream>();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const createNewMeetingHandler = () => {
    api
      .post('/api/meetings')
      .then(async (response) => {
        const data = await response.json();

        router.push(`/meetings/${data.id}`);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        setLocalStream(stream);

        const videoEl = localVideoRef.current;

        if (!videoEl) return;

        if ('srcObject' in videoEl) {
          videoEl.srcObject = stream;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [setLocalStream]);

  return { localVideoRef, createNewMeetingHandler };
};
