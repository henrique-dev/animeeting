import { ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';
import { MediaContext } from '../MediaProvider';
import { MeetingContext } from '../MeetingProvider';
import { useShareScreen } from './use-share-screen';

export const ShareScreenButton = () => {
  const { userProperties } = useContext(MeetingContext);
  const { disableShareScreen } = useContext(MediaContext);
  const { toggleShareScreen } = useShareScreen();
  const t = useTranslations();

  if (disableShareScreen) return undefined;

  return (
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
  );
};
