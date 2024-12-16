import { SocketIoContext } from '@/providers/SocketIoProvider';
import { useContext } from 'react';
import { twJoin, twMerge } from 'tailwind-merge';
import { MeetingContext } from './MeetingProvider';
import { UserType } from './use-connections';

type UsersVideoShowProps = {
  users: UserType[];
  localVideoElementRefHandler: (videoElement: HTMLVideoElement | null) => void;
  localVideoElementMediaStreamRefHandler: (videoElement: HTMLVideoElement | null) => void;
  remoteVideoElementRefHandler: (userId: string, videoElement: HTMLVideoElement | null) => undefined;
};

export const UsersVideoShow = ({
  users,
  localVideoElementRefHandler,
  localVideoElementMediaStreamRefHandler,
  remoteVideoElementRefHandler,
}: UsersVideoShowProps) => {
  const { userId } = useContext(SocketIoContext);
  const { userProperties, meetingProperties } = useContext(MeetingContext);

  const localVideoRefHandler = (videoElement: HTMLVideoElement | null) => {
    if (userProperties.shareScreen) {
      localVideoElementMediaStreamRefHandler(videoElement);
    } else {
      localVideoElementRefHandler(videoElement);
    }
  };

  const userInFocus = users.find((user) => user.id === meetingProperties.userInFocusId);
  const selfInFocus = !userInFocus && meetingProperties.userInFocusId === userId;

  const videoInFocusRefHandler = (videoElement: HTMLVideoElement | null) => {
    if (userInFocus) {
      remoteVideoElementRefHandler(userInFocus.id, videoElement);
    } else {
      localVideoRefHandler(videoElement);
    }
  };

  const screenInFocus = userInFocus || selfInFocus;

  return (
    <>
      <div
        className={twJoin('absolute bottom-0 right-0 z-10 flex w-full justify-end p-4 sm:bottom-auto sm:top-0', screenInFocus && 'mr-56')}
      >
        <div className="overflow-hidden rounded-lg bg-zinc-700 p-1">
          <div className="overflow-hidden rounded-md">
            <video ref={localVideoRefHandler} autoPlay playsInline className="w-32 sm:w-48" />
          </div>
        </div>
      </div>
      {screenInFocus && (
        <div className="flex h-full w-full">
          <div className="flex-1 p-16">
            <video ref={videoInFocusRefHandler} autoPlay playsInline className="h-full w-full" />
            <div className="bottom-0 flex w-full justify-center text-white">{userInFocus?.name}</div>
          </div>
          <div className="z-10 flex-col space-y-2 overflow-auto p-4">
            {users.map((user) => (
              <div key={user.id} className="relative w-48 overflow-hidden rounded-lg bg-zinc-700 p-1">
                <div className="mb-10 overflow-hidden rounded-md">
                  <video ref={remoteVideoElementRefHandler.bind(null, user.id)} autoPlay playsInline className="h-full w-full" />
                </div>
                <div className="absolute bottom-0 flex w-full justify-center text-white">{user.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!screenInFocus && (
        <div className={twMerge('h-full w-full p-4 pb-28', users.length <= 3 && 'flex', users.length >= 4 && 'grid grid-cols-2')}>
          {users.map((user) => (
            <div
              key={user.id}
              className={twMerge(
                'relative',
                users.length === 1 && 'h-full w-full',
                users.length === 2 && 'h-full w-1/2',
                users.length === 3 && 'h-full w-1/3',
                users.length > 3 && 'flex flex-col items-center justify-end'
              )}
            >
              <video
                ref={remoteVideoElementRefHandler.bind(null, user.id)}
                autoPlay
                playsInline
                className={twMerge('w-full p-2 pb-10', users.length <= 3 ? 'h-full' : 'absolute h-full')}
              />
              <div className="flex w-full justify-center text-white">{user.name}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
