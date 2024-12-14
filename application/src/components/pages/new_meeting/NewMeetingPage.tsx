'use client';

import { Button, Chip, Input, Spinner } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useNewMeeting } from './use-new-meeting';

export const NewMeetingPage = () => {
  const { mediaAllowed, name, setName, registerVideoRef, createNewMeetingHandler } = useNewMeeting();
  const router = useRouter();

  const disableSubmit = name.trim() === '' || !mediaAllowed;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex max-w-96 flex-col items-center justify-center space-y-4">
        {mediaAllowed === null && (
          <div className="flex h-64 w-96 items-center justify-center rounded-lg bg-zinc-800">
            <Spinner className="h-5 w-5" />
          </div>
        )}
        {mediaAllowed === false && (
          <div className="flex h-64 w-96 items-center justify-center rounded-lg bg-zinc-800">
            <Chip>You need to allow the use of camera</Chip>
          </div>
        )}
        {mediaAllowed && (
          <div className="w-96 overflow-hidden rounded-lg">
            <video ref={registerVideoRef} autoPlay playsInline />
          </div>
        )}
        <div className="flex w-full flex-col space-y-2">
          <Input label="Name" value={name} onValueChange={setName} />
          <Button onPress={createNewMeetingHandler} color="primary" isDisabled={disableSubmit}>
            Start meeting
          </Button>
          <Button onPress={router.push.bind(null, '/meetings', {})} color="secondary">
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};
