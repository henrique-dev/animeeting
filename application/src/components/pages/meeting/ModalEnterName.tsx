import { Button, Input, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@nextui-org/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import { MeetingContext } from './MeetingProvider';

type ModalEnterNameProps = {
  isOpen: boolean;
};

export const ModalEnterName = ({ isOpen: isOpenDefault }: ModalEnterNameProps) => {
  const { setUserName } = useContext(MeetingContext);
  const [name, setName] = useState('');
  const { isOpen, onOpenChange } = useDisclosure({
    isOpen: isOpenDefault,
  });
  const router = useRouter();
  const t = useTranslations();

  const submitHandler = () => {
    localStorage.setItem('name', name);
    setUserName(name);
  };

  const disableSubmit = name.trim() === '';

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">{t('pages.meeting.modal_enter_name.enter_your_name')}</ModalHeader>
              <ModalBody className="py-4">
                <div>{t('pages.meeting.modal_enter_name.need_name')}</div>
                <div className="flex w-full flex-col space-y-2">
                  <Input label={t('pages.meeting.modal_enter_name.name')} value={name} onValueChange={setName} />
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
