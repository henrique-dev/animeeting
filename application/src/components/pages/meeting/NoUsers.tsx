import { Chip } from '@nextui-org/react';

export const NoUsers = () => {
  return (
    <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
      <Chip>Only you are connected at the moment</Chip>
    </div>
  );
};
