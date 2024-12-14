import { twJoin } from 'tailwind-merge';
import { Chat } from './Chat';
import { MeetingBar } from './MeetingBar';
import { ModalEnterName } from './ModalEnterName';
import { ModalRequireMedia } from './ModalRequireMedia';
import { NoUsers } from './NoUsers';
import { useMeeting } from './use-meeting';
import { UsersVideoShow } from './UsersVideoShow';
import { UserVideoShow } from './UserVideoShow';

type MeetingProps = {
  meetingId: string;
};

export const Meeting = ({ meetingId }: MeetingProps) => {
  const {
    currentUsers,
    isModalAlertNameOpen,
    isModalRequireCameraNameOpen,
    remoteVideoElementRefHandler,
    localVideoElementRefHandler,
    sendChatData,
  } = useMeeting({
    meetingId,
  });

  return (
    <div className="flex h-full w-full flex-col bg-zinc-800">
      <div className="flex flex-1 overflow-hidden">
        <div
          className={twJoin(
            'relative max-h-screen flex-1 items-center justify-center',
            'bg-gradient-to-t from-zinc-900 to-zinc-800 to-10%'
          )}
        >
          <UsersVideoShow
            users={currentUsers}
            localVideoElementRefHandler={localVideoElementRefHandler}
            remoteVideoElementRefHandler={remoteVideoElementRefHandler}
          />
          <UserVideoShow
            users={currentUsers}
            localVideoElementRefHandler={localVideoElementRefHandler}
            remoteVideoElementRefHandler={remoteVideoElementRefHandler}
          />
          {currentUsers.length === 0 && <NoUsers />}
        </div>
        <Chat sendChatData={sendChatData} />
      </div>
      <MeetingBar />
      <ModalEnterName isOpen={isModalAlertNameOpen} />
      <ModalRequireMedia isOpen={isModalRequireCameraNameOpen} />
    </div>
  );
};
