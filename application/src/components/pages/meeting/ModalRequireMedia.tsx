import { Button, Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import { useRouter } from 'next/navigation';

type ModalRequireMediaProps = {
  isOpen: boolean;
};

export const ModalRequireMedia = ({ isOpen }: ModalRequireMediaProps) => {
  const router = useRouter();

  return (
    <>
      <Modal isOpen={isOpen} hideCloseButton>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Cannot access the camera</ModalHeader>
              <ModalBody className="py-4">
                <p>Do you need give permission to access the camera to enter in the meeting</p>
                <div className="flex w-full flex-col space-y-2">
                  <Button onPress={router.push.bind(null, '/meetings', {})} color="secondary">
                    Exit
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
