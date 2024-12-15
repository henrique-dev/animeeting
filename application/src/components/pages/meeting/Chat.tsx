import { SocketIoContext } from '@/providers/SocketIoProvider';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button, Textarea } from '@nextui-org/react';
import { useContext, useState } from 'react';
import { MeetingContext } from './MeetingProvider';

type ChatProps = {
  sendChatData: (data: string) => void;
};

export const Chat = ({ sendChatData }: ChatProps) => {
  const { userId } = useContext(SocketIoContext);
  const { userName, properties, messages, setMessages, setProperties } = useContext(MeetingContext);
  const [messageToSend, setMessageToSend] = useState('');

  const sendMessage = () => {
    sendChatData(JSON.stringify({ from: userName, message: messageToSend, userId }));
    setMessages((oldMessages) => [...oldMessages, { from: '', message: messageToSend, userId }]);
    setMessageToSend('');
  };

  const onKeyDownHandler = (event: React.KeyboardEvent) => {
    if (event.code === 'Enter' && !event.shiftKey && messageToSend.trim() !== '') {
      event.preventDefault();

      sendMessage();
    }
  };

  if (!properties.chat) return undefined;

  const disableSendMessage = messageToSend.trim() === '';

  return (
    <div className="absolute z-20 flex h-full w-full flex-col bg-zinc-900 sm:static sm:z-0 sm:w-96">
      <div className="flex justify-end p-2">
        <Button isIconOnly color="danger" onPress={setProperties.bind(null, 'chat', false)}>
          <XMarkIcon className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 flex-col space-y-4 overflow-auto p-2">
        {messages.map((message, index) => {
          if (message.userId === userId) {
            return (
              <div key={index} className="space-y-1">
                <p className="mr-4 rounded-lg bg-zinc-700 p-2">{message.message}</p>
                <div className="px-2 text-xs">You</div>
              </div>
            );
          } else {
            return (
              <div key={index} className="space-y-1">
                <p className="ml-4 rounded-lg bg-zinc-700 p-2">{message.message}</p>
                <div className="px-2 text-right text-xs">{message.from}</div>
              </div>
            );
          }
        })}
      </div>
      <div className="p-2">
        <div className="relative">
          <Textarea value={messageToSend} onValueChange={setMessageToSend} label={'Message'} onKeyDown={onKeyDownHandler} />
          <Button className="absolute bottom-0 right-0 mb-1 mr-1" isDisabled={disableSendMessage} onPress={sendMessage}>
            <PaperAirplaneIcon className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};
