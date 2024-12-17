import { Button, Chip, Input, Modal, ModalBody, ModalContent, Select, SelectItem, Spinner } from '@nextui-org/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { MeetingContext } from './MeetingProvider';
import { useUpdateMeetingProperties } from './use-update-meeting-properties';

export const ModalConfigureMeeting = () => {
  const { isModalConfigureMeetingOpen } = useContext(MeetingContext);
  const {
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    selectedVideoDevice,
    name,
    mediaAllowed,
    registerVideoRef,
    setSelectedAudioDevice,
    setSelectedVideoDevice,
    setName,
    submitHandler,
  } = useUpdateMeetingProperties();
  const router = useRouter();
  const t = useTranslations();

  const disableSubmit = name.trim() === '' || !mediaAllowed || selectedAudioDevice.trim() === '' || selectedVideoDevice.trim() === '';

  return (
    <>
      <Modal isOpen={isModalConfigureMeetingOpen} hideCloseButton>
        <ModalContent>
          {() => (
            <>
              <ModalBody className="py-4">
                {mediaAllowed === null && (
                  <div className="flex h-64 w-full items-center justify-center rounded-lg bg-zinc-800">
                    <Spinner size="lg" />
                  </div>
                )}
                {mediaAllowed === false && (
                  <div className="flex h-64 w-full items-center justify-center rounded-lg bg-zinc-800">
                    <Chip>{t('pages.meeting.modal_enter_name.need_to_allow_media')}</Chip>
                  </div>
                )}
                {mediaAllowed && (
                  <div className="w-full overflow-hidden rounded-lg bg-zinc-600">
                    <video ref={registerVideoRef} autoPlay playsInline />
                  </div>
                )}
                <div className="flex w-full flex-col space-y-2">
                  <Input label={t('pages.meeting.modal_enter_name.name')} value={name} onValueChange={setName} isDisabled={!mediaAllowed} />
                  <Select
                    label={t('pages.meeting.modal_enter_name.select_audio_device')}
                    disallowEmptySelection
                    selectedKeys={[selectedAudioDevice]}
                    onChange={setSelectedAudioDevice}
                    isDisabled={!mediaAllowed}
                  >
                    {audioDevices.map((device) => (
                      <SelectItem key={device.id}>{device.name}</SelectItem>
                    ))}
                  </Select>
                  <Select
                    label={t('pages.meeting.modal_enter_name.select_video_device')}
                    disallowEmptySelection
                    selectedKeys={[selectedVideoDevice]}
                    onChange={setSelectedVideoDevice}
                    isDisabled={!mediaAllowed}
                  >
                    {videoDevices.map((device) => (
                      <SelectItem key={device.id}>{device.name}</SelectItem>
                    ))}
                  </Select>
                  <Button color="primary" onPress={submitHandler} isDisabled={disableSubmit}>
                    {t('pages.meeting.modal_enter_name.start_meeting')}
                  </Button>
                  <Button onPress={router.push.bind(null, '/meetings', {})} color="secondary">
                    {t('pages.meeting.modal_enter_name.exit')}
                  </Button>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
