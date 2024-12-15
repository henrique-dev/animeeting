import { SocketIoContext } from '@/providers/SocketIoProvider';
import { Alert } from '@nextui-org/react';
import { useContext } from 'react';
import { MeetingContext } from './MeetingProvider';

export const Notifications = () => {
  const { isConnected } = useContext(SocketIoContext);
  const { properties } = useContext(MeetingContext);

  return (
    <div className="absolute bottom-0 flex w-full p-2">
      <div className="mx-auto flex flex-col space-y-2">
        {!isConnected && <Alert description={'Cannot connect to server at the moment'} title={'Disconnected'} color="danger" />}
        <div className="flex gap-y-2 gap-x-2 sm:text-nowrap flex-col md:flex-row">
          {!properties.audio && <Alert title={'Your audio is disabled'} color="danger" />}
          {!properties.video && <Alert title={'Your video is disabled'} color="danger" />}
          {properties.shareScreen && <Alert title={'You are sharing your screen'} color="secondary" />}
        </div>
      </div>
    </div>
  );
};
