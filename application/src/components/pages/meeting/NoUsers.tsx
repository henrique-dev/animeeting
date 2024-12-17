import { Chip } from '@nextui-org/react';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';
import { ApplicationContext } from './ApplicationProvider';

export const NoUsers = () => {
  const { currentUsers } = useContext(ApplicationContext);
  const t = useTranslations();

  if (currentUsers.length > 0) return undefined;

  return (
    <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
      <Chip>{t('pages.meeting.no_users.message')}</Chip>
    </div>
  );
};
