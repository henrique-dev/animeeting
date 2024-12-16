import { Button, Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

type ModalRequireMediaProps = {
  isOpen: boolean;
};

export const ModalRequireMedia = ({ isOpen }: ModalRequireMediaProps) => {
  const router = useRouter();
  const t = useTranslations();

  return (
    <>
      <Modal isOpen={isOpen} hideCloseButton>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">{t('pages.meeting.modal_require_media.cannot_access_media')}</ModalHeader>
              <ModalBody className="py-4">
                <div>{t('pages.meeting.modal_require_media.need_permission')}</div>
                <div className="flex w-full flex-col space-y-2">
                  <Button onPress={router.push.bind(null, '/meetings', {})} color="secondary">
                    {t('pages.meeting.modal_require_media.exit')}
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
