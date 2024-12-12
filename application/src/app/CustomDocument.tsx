'use client';

import { ThemeContext } from '@/providers/ThemeProvider';
import { useContext } from 'react';
import { twJoin } from 'tailwind-merge';

type CustomDocumentProps = {
  children: React.ReactNode;
  locale: string;
};

export const CustomDocument = ({ locale, children }: CustomDocumentProps) => {
  const themeContext = useContext(ThemeContext);

  return (
    <html lang={locale} className={twJoin('h-full', themeContext.mode)}>
      {children}
    </html>
  );
};
