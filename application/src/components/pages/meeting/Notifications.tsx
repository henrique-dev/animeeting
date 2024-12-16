import { SocketIoContext } from '@/providers/SocketIoProvider';
import { Alert } from '@nextui-org/react';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';
import { MeetingContext } from './MeetingProvider';

export const Notifications = () => {
  const { isConnected } = useContext(SocketIoContext);
  const { userProperties } = useContext(MeetingContext);
  const t = useTranslations();

  return (
    <div className="absolute bottom-0 flex w-full p-2">
      <div className="mx-auto flex flex-col space-y-2">
        {!isConnected && (
          <Alert
            title={t('pages.meeting.notifications.disconnected')}
            description={t('pages.meeting.notifications.cannot_connect_to_server')}
            color="danger"
          />
        )}
        <div className="flex flex-col gap-x-2 gap-y-2 sm:text-nowrap md:flex-row">
          {!userProperties.audio && <Alert title={t('pages.meeting.notifications.audio_disabled')} color="danger" />}
          {!userProperties.video && <Alert title={t('pages.meeting.notifications.video_disabled')} color="danger" />}
          {userProperties.shareScreen && <Alert title={t('pages.meeting.notifications.sharing_screen')} color="secondary" />}
        </div>
      </div>
    </div>
  );
};
