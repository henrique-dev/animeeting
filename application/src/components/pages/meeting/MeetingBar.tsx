import { SocketIoContext } from '@/providers/SocketIoProvider';
import { ChatBubbleOvalLeftEllipsisIcon, ComputerDesktopIcon, MicrophoneIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { Button } from '@nextui-org/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { twJoin } from 'tailwind-merge';
import { ChatContext } from './ChatProvider';
import { MeetingContext } from './MeetingProvider';
import { useMedia } from './use-media';

type MeetingBarProps = {
  toggleShareScreen: () => void;
  enableVideo: (enabled: boolean) => void;
  enableAudio: (enabled: boolean) => void;
};

export const MeetingBar = ({ toggleShareScreen, enableVideo, enableAudio }: MeetingBarProps) => {
  const { socket } = useContext(SocketIoContext);
  const { haveUnreadMessages, setIsChatVisible } = useContext(ChatContext);
  const { userProperties } = useContext(MeetingContext);
  const { disableShareScreen } = useMedia();
  const router = useRouter();
  const t = useTranslations();

  const disconnectUserHandler = () => {
    socket?.emit('exit-meeting');
    router.push('/meetings');
  };

  return (
    <div className="grid grid-cols-1 gap-y-4 border-t border-zinc-900 bg-top px-4 py-2 text-white sm:flex">
      <div className="flex space-x-4">
        <div className="flex w-1/2 justify-center">
          <button className="flex flex-col items-center justify-center space-y-1" onClick={enableAudio.bind(null, !userProperties.audio)}>
            {userProperties.audio && (
              <>
                <MicrophoneIcon className="h-8 w-8 text-green-500" />
                <div className="text-nowrap">{t('pages.meeting.meeting_bar.stop_audio')}</div>
              </>
            )}
            {!userProperties.audio && (
              <>
                <MicrophoneIcon className="h-8 w-8 text-red-500" />
                <div className="text-nowrap">{t('pages.meeting.meeting_bar.start_audio')}</div>
              </>
            )}
          </button>
        </div>
        <div className="flex w-1/2 justify-center">
          <button className="flex flex-col items-center justify-center space-y-1" onClick={enableVideo.bind(null, !userProperties.video)}>
            {userProperties.video && (
              <>
                <VideoCameraIcon className="h-8 w-8 text-green-500" />
                <div className="text-nowrap">{t('pages.meeting.meeting_bar.stop_video')}</div>
              </>
            )}
            {!userProperties.video && (
              <>
                <VideoCameraIcon className="h-8 w-8 text-red-500" />
                <div className="text-nowrap">{t('pages.meeting.meeting_bar.start_video')}</div>
              </>
            )}
          </button>
        </div>
      </div>
      <div className="flex flex-1 justify-center space-x-4">
        <div className="flex w-1/2 justify-center sm:w-auto">
          <button className="relative flex flex-col items-center justify-center space-y-1" onClick={setIsChatVisible.bind(null, true)}>
            <ChatBubbleOvalLeftEllipsisIcon className={twJoin('h-8 w-8', haveUnreadMessages && 'text-green-500')} />
            {haveUnreadMessages && <ChatBubbleOvalLeftEllipsisIcon className="absolute top-0 h-6 w-6 animate-ping text-green-500" />}
            <span>{t('pages.meeting.meeting_bar.chat')}</span>
          </button>
        </div>
        {!disableShareScreen && (
          <div className="flex w-1/2 justify-center sm:w-auto">
            <button className="flex flex-col items-center justify-center space-y-1" onClick={toggleShareScreen}>
              {userProperties.shareScreen && (
                <>
                  <ComputerDesktopIcon className="h-8 w-8 text-green-500" />
                  <div className="text-nowrap">{t('pages.meeting.meeting_bar.stop_share_screen')}</div>
                </>
              )}
              {!userProperties.shareScreen && (
                <>
                  <ComputerDesktopIcon className="h-8 w-8" />
                  <div className="text-nowrap">{t('pages.meeting.meeting_bar.start_share_Screen')}</div>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center">
        <Button color="danger" onPress={disconnectUserHandler}>
          {t('pages.meeting.meeting_bar.leave')}
        </Button>
      </div>
    </div>
  );
};
