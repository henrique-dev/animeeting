import { SharedSelection } from '@nextui-org/react';
import { useContext } from 'react';
import { ConnectionContext } from '../ConnectionProvider';
import { MediaContext } from '../MediaProvider';
import { MeetingContext } from '../MeetingProvider';

export const useVideoOptions = () => {
  const { userProperties, setUserProperties } = useContext(MeetingContext);
  const { updateLocalStream } = useContext(ConnectionContext);
  const { localStreamRef } = useContext(MediaContext);

  const enableVideoHandler = (enabled: boolean) => {
    localStreamRef.current?.getTracks().forEach((track) => {
      if (track.kind === 'video') {
        track.enabled = enabled;
      }
    });

    setUserProperties('video', enabled);
  };

  const changeVideoDeviceHandler = (selection: SharedSelection) => {
    const deviceId = selection.currentKey;

    if (!deviceId) return;

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

  return {
    enableVideoHandler,
    changeVideoDeviceHandler,
  };
};
