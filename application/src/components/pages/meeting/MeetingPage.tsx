'use client';

import { ApplicationProvider } from './ApplicationProvider';
import { ChatProvider } from './ChatProvider';
import { ConnectionProvider } from './ConnectionProvider';
import { MediaProvider } from './MediaProvider';
import { Meeting } from './Meeting';
import { MeetingProvider } from './MeetingProvider';
import { SocketListenersProvider } from './SocketListenersProvider';

type MeetingPageProps = {
  meetingId: string;
};

export const MeetingPage = ({ meetingId }: MeetingPageProps) => {
  return (
    <ApplicationProvider meetingId={meetingId}>
      <MediaProvider>
        <ConnectionProvider>
          <MeetingProvider>
            <ChatProvider>
              <SocketListenersProvider>
                <Meeting />
              </SocketListenersProvider>
            </ChatProvider>
          </MeetingProvider>
        </ConnectionProvider>
      </MediaProvider>
    </ApplicationProvider>
  );
};
