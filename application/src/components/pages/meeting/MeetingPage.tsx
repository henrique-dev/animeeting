'use client';

import { ChatProvider } from './ChatProvider';
import { ConnectionProvider } from './ConnectionProvider';
import { Meeting } from './Meeting';
import { MeetingProvider } from './MeetingProvider';

type MeetingPageProps = {
  meetingId: string;
};

export const MeetingPage = ({ meetingId }: MeetingPageProps) => {
  return (
    <ConnectionProvider>
      <MeetingProvider>
        <ChatProvider>
          <Meeting meetingId={meetingId} />
        </ChatProvider>
      </MeetingProvider>
    </ConnectionProvider>
  );
};
