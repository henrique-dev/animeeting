'use client';

import { SocketIoContext } from '@/providers/SocketIoProvider';
import { Alert, Button, Chip, Input, Select, SelectItem, Spinner } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { useTranslations } from 'use-intl';
import { useNewMeeting } from './use-new-meeting';

export const NewMeetingPage = () => {
  const { isConnected } = useContext(SocketIoContext);
  const {
    isSubmitting,
    mediaAllowed,
    name,
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    selectedVideoDevice,
    setSelectedAudioDevice,
    setSelectedVideoDevice,
    setName,
    registerVideoRef,
    createNewMeetingHandler,
  } = useNewMeeting();
  const router = useRouter();
  const t = useTranslations();

  const configuredMedia = selectedAudioDevice.trim() !== '' && selectedVideoDevice.trim() !== '';

  const disableSubmit = name.trim() === '' || !mediaAllowed || !isConnected || isSubmitting || !configuredMedia;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-4 rounded-lg bg-zinc-900 p-2 sm:h-min sm:max-w-96">
      <h1 className="text-3xl text-white">AniMeet</h1>
      {mediaAllowed === null && (
        <div className="flex h-64 w-full items-center justify-center rounded-lg bg-zinc-800">
          <Spinner size="lg" />
        </div>
      )}
      {mediaAllowed === false && (
        <div className="flex h-64 w-full items-center justify-center rounded-lg bg-zinc-800">
          <Chip>{t('pages.new_meeting.new_meeting_page.need_to_allow_media')}</Chip>
        </div>
      )}
      {mediaAllowed && (
        <div className="w-full overflow-hidden rounded-lg bg-zinc-600">
          <video ref={registerVideoRef} autoPlay playsInline />
        </div>
      )}
      <div className="flex w-full flex-col space-y-2">
        <Input label={t('pages.new_meeting.new_meeting_page.name')} value={name} onValueChange={setName} isDisabled={isSubmitting} />
        <Select
          label={t('pages.new_meeting.new_meeting_page.select_audio_device')}
          disallowEmptySelection
          selectedKeys={[selectedAudioDevice]}
          onChange={setSelectedAudioDevice}
          isDisabled={isSubmitting}
        >
          {audioDevices.map((device) => (
            <SelectItem key={device.id}>{device.name}</SelectItem>
          ))}
        </Select>
        <Select
          label={t('pages.new_meeting.new_meeting_page.select_video_device')}
          disallowEmptySelection
          selectedKeys={[selectedVideoDevice]}
          onChange={setSelectedVideoDevice}
          isDisabled={isSubmitting}
        >
          {videoDevices.map((device) => (
            <SelectItem key={device.id}>{device.name}</SelectItem>
          ))}
        </Select>
        <Button onPress={createNewMeetingHandler} color="primary" isDisabled={disableSubmit} isLoading={isSubmitting}>
          {t('pages.new_meeting.new_meeting_page.start_meeting')}
        </Button>
        <Button onPress={router.push.bind(null, '/meetings', {})} color="secondary" isDisabled={isSubmitting}>
          {t('pages.new_meeting.new_meeting_page.back')}
        </Button>
      </div>
      {isConnected === false && <Alert description={'Cannot connect to server at the moment'} title={'Disconnected'} color="danger" />}
    </div>
  );
};
