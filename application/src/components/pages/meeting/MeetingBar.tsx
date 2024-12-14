import { ChatBubbleOvalLeftEllipsisIcon, ComputerDesktopIcon, MicrophoneIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { MeetingContext } from './MeetingProvider';
import { useMedia } from './use-media';

export const MeetingBar = () => {
  const { properties, setProperties } = useContext(MeetingContext);
  const { disableShareScreen } = useMedia();
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 gap-y-4 border-t border-zinc-900 bg-top px-4 py-2 text-white sm:flex">
      <div className="flex space-x-4">
        <div className="flex w-1/2 justify-center">
          <button
            className="flex flex-col items-center justify-center space-y-1"
            onClick={setProperties.bind(null, 'audio', !properties.audio)}
          >
            {!properties.audio && (
              <>
                <MicrophoneIcon className="h-8 w-8 text-green-500" />
                <div className="text-nowrap">Mute Audio</div>
              </>
            )}
            {properties.audio && (
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
            onClick={setProperties.bind(null, 'video', !properties.video)}
          >
            {!properties.video && (
              <>
                <VideoCameraIcon className="h-8 w-8 text-green-500" />
                <div className="text-nowrap">Stop Video</div>
              </>
            )}
            {properties.video && (
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
          <button className="flex flex-col items-center justify-center space-y-1" onClick={setProperties.bind(null, 'chat', true)}>
            <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
            <span>Chat</span>
          </button>
        </div>
        {!disableShareScreen && (
          <div className="flex w-1/2 justify-center sm:w-auto">
            <button
              className="flex flex-col items-center justify-center space-y-1"
              onClick={setProperties.bind(null, 'shareScreen', !properties.shareScreen)}
            >
              {properties.shareScreen && (
                <>
                  <ComputerDesktopIcon className="h-8 w-8 text-green-500" />
                  <div className="text-nowrap">Stop Share</div>
                </>
              )}
              {!properties.shareScreen && (
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
        <Button color="danger" onPress={router.push.bind(null, '/meetings', {})}>
          Leave
        </Button>
      </div>
    </div>
  );
};
