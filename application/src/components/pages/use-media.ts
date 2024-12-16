import { useCallback, useEffect, useState } from 'react';

export const useMedia = () => {
  const [disableShareScreen, setDisableShareScreen] = useState(false);

  const getUserMedia = useCallback(
    (props?: { video: boolean | MediaTrackConstraints | undefined; audio: boolean | MediaTrackConstraints | undefined }) => {
      if (!navigator.mediaDevices.getUserMedia) return Promise.reject();

      return navigator.mediaDevices.getUserMedia({
        video: props?.video ?? true,
        audio: props?.audio ?? true,
      });
    },
    []
  );

  const getDisplayMedia = useCallback(() => {
    if (!navigator.mediaDevices.getDisplayMedia) return Promise.reject();

    return navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
      // @ts-ignore
      surfaceSwitching: 'exclude',
    });
  }, []);

  const getDevices = useCallback(() => {
    if (!navigator.mediaDevices.enumerateDevices) return Promise.reject();

    return navigator.mediaDevices.enumerateDevices();
  }, []);

  useEffect(() => {
    setDisableShareScreen(navigator.mediaDevices.getDisplayMedia === undefined);
  }, [setDisableShareScreen]);

  return { disableShareScreen, getUserMedia, getDisplayMedia, getDevices };
};
