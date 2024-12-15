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
  const { userProperties, meetingProperties } = useContext(MeetingContext);

  if (!meetingProperties.userInFocusId && !userProperties.shareScreen) return undefined;

  const user = users.find((userToFInd) => userToFInd.id === meetingProperties.userInFocusId);

  const videoToShowRefHandler = (videoElement: HTMLVideoElement | null) => {
    if (userProperties.shareScreen) {
      localVideoElementMediaStreamRefHandler(videoElement);
    } else if (meetingProperties.userInFocusId) {
      remoteVideoElementRefHandler(meetingProperties.userInFocusId, videoElement);
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
