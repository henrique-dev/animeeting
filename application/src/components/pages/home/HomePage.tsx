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
    <div className="relative flex h-full flex-col justify-center overflow-hidden">
      <img alt="Background" src="/image/background.avif" className="absolute inset-0 -z-10 size-full object-cover" />
      <div className="absolute inset-0 flex w-full justify-center p-4">
        <LanguageSelect />
      </div>
      <div className="mx-0 lg:container lg:mx-auto">
        <div className="flex flex-1 items-center">
          <div className="flex-1 space-y-8 px-10 sm:min-w-[36rem]">
            <h1 className="text-center text-4xl sm:text-left md:text-8xl">AniMeet</h1>
            <h2 className="text-center text-3xl sm:text-left sm:text-7xl">{t('pages.home.home_page.title')}</h2>
            <p className="text-center text-lg sm:text-left">{t('pages.home.home_page.description')}</p>
            <div className="flex justify-center sm:justify-start">
              <Button onPress={router.push.bind(null, '/meetings/new', {})} color="primary">
                {t('pages.home.home_page.new_meeting')}
              </Button>
            </div>
          </div>
          <div className="-mr-[34rem] hidden md:block lg:-mr-[26rem] 2xl:mr-0">
            <img
              alt="App screenshot"
              src="/image/app.png"
              width={2432}
              height={1442}
              className="w-[58rem] rounded-md shadow-2xl 2xl:w-[46rem]"
            />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 flex w-full justify-center">
        <Footer />
      </div>
    </div>
  );
};
