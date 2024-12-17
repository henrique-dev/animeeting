import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';
import { twJoin } from 'tailwind-merge';
import { ChatContext } from '../ChatProvider';

export const ChatButton = () => {
  const { haveUnreadMessages, setIsChatVisible } = useContext(ChatContext);
  const t = useTranslations();

  return (
    <div className="col-span-6 flex w-auto justify-center md:col-span-3 md:w-40">
      <button className="relative flex flex-col items-center justify-center space-y-1" onClick={setIsChatVisible.bind(null, true)}>
        <ChatBubbleOvalLeftEllipsisIcon className={twJoin('h-8 w-8', haveUnreadMessages && 'text-orange-500')} />
        {haveUnreadMessages && <ChatBubbleOvalLeftEllipsisIcon className="absolute top-0 h-6 w-6 animate-ping text-orange-500" />}
        <span>{t('pages.meeting.meeting_bar.chat')}</span>
      </button>
    </div>
  );
};
