import { useCallback } from 'react';

export const useMedia = () => {
  const getUserMedia = useCallback(() => {
    return navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  }, []);

  const getDisplayMedia = useCallback(() => {
    return navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
      // @ts-ignore
      surfaceSwitching: 'exclude',
    });
  }, []);

  return { getUserMedia, getDisplayMedia };
};
