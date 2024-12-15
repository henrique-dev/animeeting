import { SocketIoContext } from '@/providers/SocketIoProvider';
import { ChatBubbleOvalLeftEllipsisIcon, ComputerDesktopIcon, MicrophoneIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { ChatContext } from './ChatProvider';
import { MeetingContext } from './MeetingProvider';
import { useMedia } from './use-media';

export const MeetingBar = () => {
  const { socket } = useContext(SocketIoContext);
  const { setIsChatVisible } = useContext(ChatContext);
  const { userProperties, setUserProperties } = useContext(MeetingContext);
  const { disableShareScreen } = useMedia();
  const router = useRouter();

  const disconnectUserHandler = () => {
    socket?.emit('exit-meeting');
    router.push('/meetings');
  };

  return (
    <div className="grid grid-cols-1 gap-y-4 border-t border-zinc-900 bg-top px-4 py-2 text-white sm:flex">
      <div className="flex space-x-4">
        <div className="flex w-1/2 justify-center">
          <button
            className="flex flex-col items-center justify-center space-y-1"
            onClick={setUserProperties.bind(null, 'audio', !userProperties.audio)}
          >
            {userProperties.audio && (
              <>
                <MicrophoneIcon className="h-8 w-8 text-green-500" />
                <div className="text-nowrap">Mute Audio</div>
              </>
            )}
            {!userProperties.audio && (
              <>
                <MicrophoneIcon className="h-8 w-8 text-red-500" />
                <div className="text-nowrap">Join Audio</div>
              </>
            )}
          </button>
        </div>
        <div className="flex w-1/2 justify-center">
          <button
            className="flex flex-col items-center justify-center space-y-1"
            onClick={setUserProperties.bind(null, 'video', !userProperties.video)}
          >
            {userProperties.video && (
              <>
                <VideoCameraIcon className="h-8 w-8 text-green-500" />
                <div className="text-nowrap">Stop Video</div>
              </>
            )}
            {!userProperties.video && (
              <>
                <VideoCameraIcon className="h-8 w-8 text-red-500" />
                <div className="text-nowrap">Start Video</div>
              </>
            )}
          </button>
        </div>
      </div>
      <div className="flex flex-1 justify-center space-x-4">
        <div className="flex w-1/2 justify-center sm:w-auto">
          <button className="flex flex-col items-center justify-center space-y-1" onClick={setIsChatVisible.bind(null, true)}>
            <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
            <span>Chat</span>
          </button>
        </div>
        {!disableShareScreen && (
          <div className="flex w-1/2 justify-center sm:w-auto">
            <button
              className="flex flex-col items-center justify-center space-y-1"
              onClick={setUserProperties.bind(null, 'shareScreen', !userProperties.shareScreen)}
            >
              {userProperties.shareScreen && (
                <>
                  <ComputerDesktopIcon className="h-8 w-8 text-green-500" />
                  <div className="text-nowrap">Stop Share</div>
                </>
              )}
              {!userProperties.shareScreen && (
                <>
                  <ComputerDesktopIcon className="h-8 w-8" />
                  <div className="text-nowrap">Share Screen</div>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center">
        <Button color="danger" onPress={disconnectUserHandler}>
          Leave
        </Button>
      </div>
    </div>
  );
};
