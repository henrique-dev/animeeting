'use client';

import Image from 'next/image';
import { LanguageSelect } from '../pages/home/LanguageSelect';
import { Footer } from './Footer';

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <Image
        alt="Background"
        src="/image/background.avif"
        className="absolute inset-0 -z-10 size-full object-cover"
        fill
        style={{ objectFit: 'fill' }}
        priority
      />
      <div className="absolute inset-0 flex w-full justify-center p-4">
        <LanguageSelect />
      </div>
      {children}
      <div className="absolute bottom-0 flex w-full justify-center">
        <Footer />
      </div>
    </div>
  );
};
