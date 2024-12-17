import { ChevronUpIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';
import { MediaContext } from '../MediaProvider';
import { MeetingContext } from '../MeetingProvider';
import { useAudioOptions } from './use-audio-options';

export const AudioButton = () => {
  const { userProperties } = useContext(MeetingContext);
  const { audioDevices } = useContext(MediaContext);
  const { enableAudioHandler, changeAudioDeviceHandler } = useAudioOptions();
  const t = useTranslations();

  return (
    <div className="relative col-span-6 flex w-auto items-center justify-center space-x-2 md:col-span-3 md:w-40">
      <button
        className="flex flex-col items-center justify-center space-y-1"
        onClick={enableAudioHandler.bind(null, !userProperties.audio)}
      >
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
        <DropdownMenu selectedKeys={[userProperties.audioDevice]} selectionMode="single" onSelectionChange={changeAudioDeviceHandler}>
          {audioDevices.map((device) => (
            <DropdownItem key={device.id}>{device.name}</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
