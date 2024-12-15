import { useContext } from 'react';
import { twMerge } from 'tailwind-merge';
import { MeetingContext } from './MeetingProvider';
import { UserType } from './use-connections';

type UsersVideoShowProps = {
  users: UserType[];
  localVideoElementRefHandler: (videoElement: HTMLVideoElement | null) => void;
  remoteVideoElementRefHandler: (userId: string, videoElement: HTMLVideoElement | null) => undefined;
};

export const UsersVideoShow = ({ localVideoElementRefHandler, users, remoteVideoElementRefHandler }: UsersVideoShowProps) => {
  const { userProperties, meetingProperties } = useContext(MeetingContext);

  if (meetingProperties.userInFocusId || userProperties.shareScreen) return undefined;

  return (
    <>
      <div className="absolute bottom-0 right-0 z-10 flex w-full justify-end p-4 sm:bottom-auto sm:top-0">
        <div className="overflow-hidden rounded-lg bg-zinc-700 p-1">
          <div className="overflow-hidden rounded-md">
            <video ref={localVideoElementRefHandler} autoPlay playsInline className="w-32 sm:w-48" />
          </div>
        </div>
      </div>
      <div className={twMerge('h-full w-full p-16', users.length <= 3 && 'flex', users.length >= 4 && 'grid grid-cols-2')}>
        {users.map((user) => (
          <div
            key={user.id}
            className={twMerge(
              'relative',
              users.length === 1 && 'h-full w-full',
              users.length === 2 && 'h-full w-1/2',
              users.length === 3 && 'h-full w-1/3',
              users.length > 3 && 'flex flex-col items-center justify-center'
            )}
          >
            <video
              ref={remoteVideoElementRefHandler.bind(null, user.id)}
              autoPlay
              playsInline
              className={twMerge('w-full p-2 pb-10', users.length <= 3 ? 'h-full' : 'absolute h-full')}
            />
            <div className="absolute bottom-0 flex w-full justify-center text-white">{user.name}</div>
          </div>
        ))}
      </div>
    </>
  );
};
