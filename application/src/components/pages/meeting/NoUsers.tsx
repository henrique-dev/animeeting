import { Chip } from '@nextui-org/react';
import { useTranslations } from 'next-intl';

export const NoUsers = () => {
  const t = useTranslations();

  return (
    <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
      <Chip>{t('pages.meeting.no_users.message')}</Chip>
    </div>
  );
};
