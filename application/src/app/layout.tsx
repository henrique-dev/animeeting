import { Layout } from '@/components/layout';
import ThemeProvider from '@/providers/ThemeProvider';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTimeZone } from 'next-intl/server';
import localFont from 'next/font/local';
import { twJoin } from 'tailwind-merge';
import { CustomDocument } from './CustomDocument';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'AniMeeting',
  description: 'AniMeeting',
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const locale = await getLocale();
  const timezone = await getTimeZone();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <ThemeProvider>
      <CustomDocument locale={locale}>
        <body className={twJoin(geistSans.variable, geistMono.variable, 'h-full bg-gray-900 antialiased')}>
          <NextIntlClientProvider timeZone={timezone} locale={locale} messages={messages}>
            <Layout>{children}</Layout>
          </NextIntlClientProvider>
        </body>
      </CustomDocument>
    </ThemeProvider>
  );
};

export default RootLayout;
