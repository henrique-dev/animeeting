import { Button } from '@nextui-org/react';
import { useTranslations } from 'next-intl';
import { AudioButton } from './AudioButton';
import { ChatButton } from './ChatButton';
import { ShareScreenButton } from './ShareScreenButton';
import { VideoButton } from './VideoButton';
import { useMeetingOptions } from './use-meeting-options';

export const MeetingBar = () => {
  const { disconnectUserHandler } = useMeetingOptions();
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-y-4 border-t border-zinc-900 bg-top px-4 py-2 text-white md:flex-row">
      <div className="flex flex-1 justify-start">
        <div className="grid w-full grid-cols-12 gap-y-2 divide-zinc-900 md:flex md:w-auto md:divide-x">
          <AudioButton />
          <VideoButton />
          <ChatButton />
          <ShareScreenButton />
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
