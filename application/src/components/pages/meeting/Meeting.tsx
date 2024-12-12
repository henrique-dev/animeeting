import { ChatBubbleOvalLeftEllipsisIcon, ComputerDesktopIcon, MicrophoneIcon, UsersIcon, VideoCameraIcon } from '@heroicons/react/16/solid';
import { useMeeting } from './use-meeting';

type MeetingProps = {
  meetingId: string;
};

export const Meeting = ({ meetingId }: MeetingProps) => {
  const { localVideoRef, remoteVideoRef } = useMeeting({ meetingId });

  return (
    <div className="flex h-full w-full flex-col bg-zinc-800">
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-2">
          <video ref={localVideoRef} width={384} height={384} autoPlay playsInline />
          <video ref={remoteVideoRef} width={384} height={384} autoPlay playsInline />
        </div>
      </div>
      <div className="flex bg-top px-4 py-2 text-white border-t border-zinc-900">
        <div className="flex space-x-4">
          <button className="flex flex-col items-center justify-center space-y-1">
            <MicrophoneIcon className="h-8 w-8" />
            <span>Join Audio</span>
          </button>
          <button className="flex flex-col items-center justify-center space-y-1">
            <VideoCameraIcon className="h-8 w-8" />
            <span>Start Video</span>
          </button>
        </div>
        <div className="flex flex-1 justify-center space-x-4">
          <button className="flex flex-col items-center justify-center space-y-1">
            <UsersIcon className="h-8 w-8" />
            <span>Participants</span>
          </button>
          <button className="flex flex-col items-center justify-center space-y-1">
            <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
            <span>Chat</span>
          </button>
          <button className="flex flex-col items-center justify-center space-y-1">
            <ComputerDesktopIcon className="h-8 w-8" />
            <span>Share Screen</span>
          </button>
        </div>
        <div>
          <button>Hang Up</button>
        </div>
      </div>
    </div>
  );
};
