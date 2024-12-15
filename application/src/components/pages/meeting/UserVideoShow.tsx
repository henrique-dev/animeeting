import { useContext } from 'react';
import { MeetingContext } from './MeetingProvider';
import { UserType } from './use-connections';

type UserVideoShowProps = {
  users: UserType[];
  localVideoElementRefHandler: (videoElement: HTMLVideoElement | null) => void;
  localVideoElementMediaStreamRefHandler: (videoElement: HTMLVideoElement | null) => void;
  remoteVideoElementRefHandler: (userId: string, videoElement: HTMLVideoElement | null) => undefined;
};

export const UserVideoShow = ({
  users,
  localVideoElementRefHandler,
  localVideoElementMediaStreamRefHandler,
  remoteVideoElementRefHandler,
}: UserVideoShowProps) => {
  const { properties } = useContext(MeetingContext);

  if (!properties.selectedUserId && !properties.shareScreen) return undefined;

  const user = users.find((userToFInd) => userToFInd.id === properties.selectedUserId);

  const videoToShowRefHandler = (videoElement: HTMLVideoElement | null) => {
    if (properties.shareScreen) {
      localVideoElementMediaStreamRefHandler(videoElement);
    } else if (properties.selectedUserId) {
      remoteVideoElementRefHandler(properties.selectedUserId, videoElement);
    }
  };

  return (
    <>
      <div className="absolute right-0 top-0 z-10 flex w-full justify-end p-4">
        <div className="overflow-hidden rounded-lg bg-zinc-700 p-1">
          <div className="overflow-hidden rounded-md">
            <video ref={localVideoElementRefHandler} width={200} autoPlay playsInline />
          </div>
        </div>
      </div>
      <div className="flex h-full w-full p-16">
        <div className="relative h-full w-full">
          <video ref={videoToShowRefHandler} width={200} autoPlay playsInline className="h-full w-full p-2 pb-10" />
          <div className="absolute bottom-0 flex w-full justify-center text-white">{user?.name}</div>
        </div>
      </div>
    </>
  );
};
