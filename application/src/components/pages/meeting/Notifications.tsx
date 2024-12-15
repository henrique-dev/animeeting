import { SocketIoContext } from '@/providers/SocketIoProvider';
import { Alert } from '@nextui-org/react';
import { useContext } from 'react';
import { MeetingContext } from './MeetingProvider';

export const Notifications = () => {
  const { isConnected } = useContext(SocketIoContext);
  const { userProperties } = useContext(MeetingContext);

  return (
    <div className="absolute bottom-0 flex w-full p-2">
      <div className="mx-auto flex flex-col space-y-2">
        {!isConnected && <Alert description={'Cannot connect to server at the moment'} title={'Disconnected'} color="danger" />}
        <div className="flex flex-col gap-x-2 gap-y-2 sm:text-nowrap md:flex-row">
          {!userProperties.audio && <Alert title={'Your audio is disabled'} color="danger" />}
          {!userProperties.video && <Alert title={'Your video is disabled'} color="danger" />}
          {userProperties.shareScreen && <Alert title={'You are sharing your screen'} color="secondary" />}
        </div>
      </div>
    </div>
  );
};
