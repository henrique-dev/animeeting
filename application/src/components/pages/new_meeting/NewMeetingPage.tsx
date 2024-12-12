'use client';

import { useNewMeeting } from './use-new-meeting';

export const NewMeetingPage = () => {
  const { localVideoRef, createNewMeetingHandler } = useNewMeeting();

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center justify-center space-y-2">
        <video ref={localVideoRef} width={384} height={384} autoPlay playsInline />
        <button className="flex h-12 w-48 items-center justify-center bg-blue-500" onClick={createNewMeetingHandler}>
          Start meeting
        </button>
      </div>
    </div>
  );
};
