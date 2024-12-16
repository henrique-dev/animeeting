'use client';

import { ChatProvider } from './ChatProvider';
import { ConnectionProvider } from './ConnectionProvider';
import { MediaProvider } from './MediaProvider';
import { Meeting } from './Meeting';
import { MeetingProvider } from './MeetingProvider';

type MeetingPageProps = {
  meetingId: string;
};

export const MeetingPage = ({ meetingId }: MeetingPageProps) => {
  return (
    <MediaProvider>
      <ConnectionProvider>
        <MeetingProvider>
          <ChatProvider>
            <Meeting meetingId={meetingId} />
          </ChatProvider>
        </MeetingProvider>
      </ConnectionProvider>
    </MediaProvider>
  );
};
