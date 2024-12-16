import { SocketIoContext } from '@/providers/SocketIoProvider';
import {
  ChatBubbleOvalLeftEllipsisIcon,
  ChevronUpIcon,
  ComputerDesktopIcon,
  MicrophoneIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { twJoin } from 'tailwind-merge';
import { ChatContext } from './ChatProvider';
import { MeetingContext } from './MeetingProvider';
import { useMedia } from '../use-media';
import { DeviceType } from './use-meeting';

type MeetingBarProps = {
  audioDevices: DeviceType[];
  videoDevices: DeviceType[];
  toggleShareScreen: () => void;
  enableVideo: (enabled: boolean) => void;
  enableAudio: (enabled: boolean) => void;
  changeAudioDevice: (deviceId: string) => void;
  changeVideoDevice: (deviceId: string) => void;
};

export const MeetingBar = ({
  audioDevices,
  videoDevices,
  toggleShareScreen,
  enableVideo,
  enableAudio,
  changeAudioDevice,
  changeVideoDevice,
}: MeetingBarProps) => {
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
    <div className="flex flex-col gap-y-4 border-t border-zinc-900 bg-top px-4 py-2 text-white md:flex-row">
      <div className="flex flex-1 justify-start">
        <div className="grid w-full grid-cols-12 gap-y-2 divide-zinc-900 md:flex md:w-auto md:divide-x">
          <div className="relative col-span-6 flex w-auto items-center justify-center space-x-2 md:col-span-3 md:w-40">
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
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" isIconOnly>
                  <ChevronUpIcon className="h-5 w-5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[userProperties.audioDevice]}
                selectionMode="single"
                onSelectionChange={(selection) => {
                  selection.currentKey && changeAudioDevice(selection.currentKey);
                }}
              >
                {audioDevices.map((device) => {
                  return <DropdownItem key={device.id}>{device.name}</DropdownItem>;
                })}
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className="col-span-6 flex w-auto items-center justify-center space-x-2 md:col-span-3 md:w-40">
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
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" isIconOnly>
                  <ChevronUpIcon className="h-5 w-5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[userProperties.videoDevice]}
                selectionMode="single"
                onSelectionChange={(selection) => {
                  selection.currentKey && changeVideoDevice(selection.currentKey);
                }}
              >
                {videoDevices.map((device) => (
                  <DropdownItem key={device.id}>{device.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className="col-span-6 flex w-auto justify-center md:col-span-3 md:w-40">
            <button className="relative flex flex-col items-center justify-center space-y-1" onClick={setIsChatVisible.bind(null, true)}>
              <ChatBubbleOvalLeftEllipsisIcon className={twJoin('h-8 w-8', haveUnreadMessages && 'text-green-500')} />
              {haveUnreadMessages && <ChatBubbleOvalLeftEllipsisIcon className="absolute top-0 h-6 w-6 animate-ping text-green-500" />}
              <span>{t('pages.meeting.meeting_bar.chat')}</span>
            </button>
          </div>
          {!disableShareScreen && (
            <div className="col-span-6 flex w-auto justify-center md:col-span-3 md:w-40">
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
      </div>
      <div className="flex items-center justify-center">
        <Button color="danger" onPress={disconnectUserHandler}>
          {t('pages.meeting.meeting_bar.leave')}
        </Button>
      </div>
    </div>
  );
};
