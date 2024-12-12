'use client';

import { Meeting } from './Meeting';
import { MeetingProvider } from './MeetingProvider';

type MeetingPageProps = {
  meetingId: string;
};

export const MeetingPage = ({ meetingId }: MeetingPageProps) => {
  return (
    <MeetingProvider>
      <Meeting meetingId={meetingId} />
    </MeetingProvider>
  );
};
