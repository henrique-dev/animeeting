import Link from 'next/link';

export const SelectModePage = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-10">
        <h1 className="text-4xl">AniMeeting</h1>
        <div className="flex space-x-2">
          <Link href="/meetings" className="flex h-12 w-48 items-center justify-center bg-blue-500">
            Classic Mode
          </Link>
          <Link href="/adventure" className="flex h-12 w-48 items-center justify-center bg-green-500">
            Adventure Mode
          </Link>
        </div>
      </div>
    </div>
  );
};
