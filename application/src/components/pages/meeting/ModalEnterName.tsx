import { Button, Input, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@nextui-org/react';
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
              <ModalHeader className="flex flex-col gap-1">Enter your name</ModalHeader>
              <ModalBody className="py-4">
                <p>Do you need give a name to enter in the meeting</p>
                <div className="flex w-full flex-col space-y-2">
                  <Input label="Name" value={name} onValueChange={setName} />
                  <Button color="primary" onPress={submitHandler} isDisabled={disableSubmit}>
                    Enter meeting
                  </Button>
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
