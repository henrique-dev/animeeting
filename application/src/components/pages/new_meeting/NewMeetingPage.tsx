'use client';

import { SocketIoContext } from '@/providers/SocketIoProvider';
import { Alert, Button, Chip, Input, Spinner } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { useNewMeeting } from './use-new-meeting';

export const NewMeetingPage = () => {
  const { isConnected } = useContext(SocketIoContext);
  const { isSubmitting, mediaAllowed, name, setName, registerVideoRef, createNewMeetingHandler } = useNewMeeting();
  const router = useRouter();

  const disableSubmit = name.trim() === '' || !mediaAllowed || !isConnected || isSubmitting;

  return (
    <div className="flex h-full w-full items-center justify-center p-2">
      <div className="flex w-full max-w-96 flex-col items-center justify-center space-y-4">
        {mediaAllowed === null && (
          <div className="flex h-64 w-full items-center justify-center rounded-lg bg-zinc-800">
            <Spinner className="h-5 w-5" />
          </div>
        )}
        {mediaAllowed === false && (
          <div className="flex h-64 w-full items-center justify-center rounded-lg bg-zinc-800">
            <Chip>You need to allow the use of camera</Chip>
          </div>
        )}
        {mediaAllowed && (
          <div className="w-full overflow-hidden rounded-lg">
            <video ref={registerVideoRef} autoPlay playsInline />
          </div>
        )}
        <div className="flex w-full flex-col space-y-2">
          <Input label="Name" value={name} onValueChange={setName} isDisabled={isSubmitting} />
          <Button onPress={createNewMeetingHandler} color="primary" isDisabled={disableSubmit} isLoading={isSubmitting}>
            Start meeting
          </Button>
          <Button onPress={router.push.bind(null, '/meetings', {})} color="secondary" isDisabled={isSubmitting}>
            Back
          </Button>
        </div>
        {!isConnected && <Alert description={'Cannot connect to server at the moment'} title={'Disconnected'} color="danger" />}
      </div>
    </div>
  );
};
