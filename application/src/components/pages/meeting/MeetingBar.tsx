import { ChatBubbleOvalLeftEllipsisIcon, ComputerDesktopIcon, MicrophoneIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { MeetingContext } from './MeetingProvider';

export const MeetingBar = () => {
  const { properties, setProperties } = useContext(MeetingContext);
  const router = useRouter();

  return (
    <div className="flex border-t border-zinc-900 bg-top px-4 py-2 text-white">
      <div className="flex">
        <button
          className="flex w-24 flex-col items-center justify-center space-y-1"
          onClick={setProperties.bind(null, 'audio', !properties.audio)}
        >
          {!properties.audio && (
            <>
              <MicrophoneIcon className="h-8 w-8 text-green-500" />
              <span>Mute Audio</span>
            </>
          )}
          {properties.audio && (
            <>
              <MicrophoneIcon className="h-8 w-8 text-red-500" />
              <span>Join Audio</span>
            </>
          )}
        </button>
        <button
          className="flex w-24 flex-col items-center justify-center space-y-1"
          onClick={setProperties.bind(null, 'video', !properties.video)}
        >
          {!properties.video && (
            <>
              <VideoCameraIcon className="h-8 w-8 text-green-500" />
              <span>Stop Video</span>
            </>
          )}
          {properties.video && (
            <>
              <VideoCameraIcon className="h-8 w-8 text-red-500" />
              <span>Start Video</span>
            </>
          )}
        </button>
      </div>
      <div className="flex flex-1 justify-center">
        <button className="flex w-24 flex-col items-center justify-center space-y-1" onClick={setProperties.bind(null, 'chat', true)}>
          <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
          <span>Chat</span>
        </button>
        <button
          className="flex w-24 flex-col items-center justify-center space-y-1"
          onClick={setProperties.bind(null, 'shareScreen', !properties.shareScreen)}
        >
          {properties.shareScreen && (
            <>
              <ComputerDesktopIcon className="h-8 w-8 text-green-500" />
              <span>Stop Share</span>
            </>
          )}
          {!properties.shareScreen && (
            <>
              <ComputerDesktopIcon className="h-8 w-8" />
              <span>Share Screen</span>
            </>
          )}
        </button>
      </div>
      <div className="flex items-center justify-center">
        <Button color="danger" onPress={router.push.bind(null, '/meetings', {})}>
          Leave
        </Button>
      </div>
    </div>
  );
};
