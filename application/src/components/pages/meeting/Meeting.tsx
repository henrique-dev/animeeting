import { twJoin } from 'tailwind-merge';
import { Chat } from './Chat';
import { LinkCopy } from './LinkCopy';
import { MeetingBar } from './MeetingBar';
import { ModalEnterName } from './ModalEnterName';
import { ModalRequireMedia } from './ModalRequireMedia';
import { Notifications } from './Notifications';
import { NoUsers } from './NoUsers';
import { useMeeting } from './use-meeting';
import { UsersVideoShow } from './UsersVideoShow';

type MeetingProps = {
  meetingId: string;
};

export const Meeting = ({ meetingId }: MeetingProps) => {
  const {
    currentUsers,
    isModalAlertNameOpen,
    isModalRequireCameraNameOpen,
    audioDevices,
    videoDevices,
    localVideoElementRefHandler,
    localVideoElementMediaStreamRefHandler,
    remoteVideoElementRefHandler,
    toggleShareScreen,
    enableVideo,
    enableAudio,
    changeAudioDevice,
    changeVideoDevice,
  } = useMeeting({
    meetingId,
  });

  return (
    <div className="flex h-full w-full flex-col bg-zinc-800">
      <div className="relative flex flex-1 overflow-hidden">
        <div
          className={twJoin(
            'relative max-h-screen flex-1 items-center justify-center',
            'bg-gradient-to-t from-zinc-900 to-zinc-800 to-10%'
          )}
        >
          {currentUsers.length === 0 && <NoUsers />}
          <UsersVideoShow
            users={currentUsers}
            localVideoElementRefHandler={localVideoElementRefHandler}
            localVideoElementMediaStreamRefHandler={localVideoElementMediaStreamRefHandler}
            remoteVideoElementRefHandler={remoteVideoElementRefHandler}
          />
          <Notifications />
        </div>
        <Chat />
      </div>
      <LinkCopy />
      <ModalEnterName isOpen={isModalAlertNameOpen} />
      <ModalRequireMedia isOpen={isModalRequireCameraNameOpen} />
      <MeetingBar
        audioDevices={audioDevices}
        videoDevices={videoDevices}
        toggleShareScreen={toggleShareScreen}
        enableVideo={enableVideo}
        enableAudio={enableAudio}
        changeAudioDevice={changeAudioDevice}
        changeVideoDevice={changeVideoDevice}
      />
    </div>
  );
};
