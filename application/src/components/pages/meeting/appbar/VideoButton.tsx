import { ChevronUpIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';
import { MediaContext } from '../MediaProvider';
import { MeetingContext } from '../MeetingProvider';
import { useVideoOptions } from './use-video-options';

export const VideoButton = () => {
  const { userProperties } = useContext(MeetingContext);
  const { videoDevices } = useContext(MediaContext);
  const { enableVideoHandler, changeVideoDeviceHandler } = useVideoOptions();
  const t = useTranslations();

  return (
    <div className="col-span-6 flex w-auto items-center justify-center space-x-2 md:col-span-3 md:w-40">
      <button
        className="flex flex-col items-center justify-center space-y-1"
        onClick={enableVideoHandler.bind(null, !userProperties.video)}
      >
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
        <DropdownMenu selectedKeys={[userProperties.videoDevice]} selectionMode="single" onSelectionChange={changeVideoDeviceHandler}>
          {videoDevices.map((device) => (
            <DropdownItem key={device.id}>{device.name}</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
