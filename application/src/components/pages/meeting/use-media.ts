import { useCallback, useEffect, useState } from 'react';

export const useMedia = () => {
  const [disableShareScreen, setDisableShareScreen] = useState(false);

  const getUserMedia = useCallback(() => {
    if (!navigator.mediaDevices.getUserMedia) return Promise.reject();

    return navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  }, []);

  const getDisplayMedia = useCallback(() => {
    if (!navigator.mediaDevices.getDisplayMedia) return Promise.reject();

    return navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
      // @ts-ignore
      surfaceSwitching: 'exclude',
    });
  }, []);

  useEffect(() => {
    setDisableShareScreen(navigator.mediaDevices.getDisplayMedia === undefined);
  }, [setDisableShareScreen]);

  return { disableShareScreen, getUserMedia, getDisplayMedia };
};
