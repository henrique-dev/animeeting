'use client';

import Link from 'next/link';

export const ClassicModePage = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-10">
        <h1 className="text-4xl">AniMeeting</h1>
        <div className="flex flex-col space-y-2">
          <Link href="/meetings/new" className="flex h-12 w-48 items-center justify-center bg-blue-500">
            Create new meeting
          </Link>
          <Link href="/" className="flex h-12 w-48 items-center justify-center bg-green-500">
            Back
          </Link>
        </div>
      </div>
    </div>
  );
};
