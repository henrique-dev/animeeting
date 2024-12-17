import { twJoin } from 'tailwind-merge';
import { MeetingBar } from './appbar/MeetingBar';
import { Chat } from './Chat';
import { LinkCopy } from './LinkCopy';
import { ModalConfigureMeeting } from './ModalConfigureMeeting';
import { ModalRequireMedia } from './ModalRequireMedia';
import { Notifications } from './Notifications';
import { NoUsers } from './NoUsers';
import { UsersVideoShow } from './UsersVideoShow';

export const Meeting = () => {
  return (
    <div className="flex h-full w-full flex-col bg-zinc-800">
      <div className="relative flex flex-1 overflow-hidden">
        <div
          className={twJoin(
            'relative max-h-screen flex-1 items-center justify-center',
            'bg-gradient-to-t from-zinc-900 to-zinc-800 to-10%'
          )}
        >
          <NoUsers />
          <UsersVideoShow />
          <Notifications />
        </div>
        <Chat />
      </div>
      <LinkCopy />
      <ModalConfigureMeeting />
      <ModalRequireMedia />
      <MeetingBar />
    </div>
  );
};
