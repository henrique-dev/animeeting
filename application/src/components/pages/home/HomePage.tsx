'use client';

import { Footer } from '@/components/layout/Footer';
import { Button } from '@nextui-org/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { LanguageSelect } from './LanguageSelect';

export const HomePage = () => {
  const router = useRouter();
  const t = useTranslations();

  return (
    <div className="flex h-full flex-col">
      <img alt="Background" src="/image/background.avif" className="absolute inset-0 -z-10 size-full object-cover" />
      <div className="relative flex w-full justify-center p-4">
        <LanguageSelect />
      </div>
      <div className="flex flex-1 items-center overflow-hidden">
        <div className="z-10 flex-1 space-y-8 px-10">
          <h1 className="text-8xl">AniMeet</h1>
          <h2 className="text-7xl">{t('pages.home.home_page.title')}</h2>
          <p className="text-lg">{t('pages.home.home_page.description')}</p>
          <Button onPress={router.push.bind(null, '/meetings/new', {})} color="primary">
            {t('pages.home.home_page.new_meeting')}
          </Button>
        </div>
        <div className="z-10 -mr-[34rem]">
          <img alt="App screenshot" src="/image/app.png" width={2432} height={1442} className="w-[76rem] rounded-md shadow-2xl" />
        </div>
      </div>
      <div className="flex justify-center">
        <Footer />
      </div>
    </div>
  );
};
