import { socketUserId } from '@/socket';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button, Textarea } from '@nextui-org/react';
import { useContext, useState } from 'react';
import { MeetingContext } from './MeetingProvider';

type ChatProps = {
  sendChatData: (data: string) => void;
};

export const Chat = ({ sendChatData }: ChatProps) => {
  const { userName, properties, messages, setMessages, setProperties } = useContext(MeetingContext);
  const [messageToSend, setMessageToSend] = useState('');

  const onKeyDownHandler = (event: React.KeyboardEvent) => {
    if (event.code === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      sendChatData(JSON.stringify({ from: userName, message: messageToSend, userId: socketUserId }));
      setMessages((oldMessages) => [...oldMessages, { from: '', message: messageToSend, userId: socketUserId }]);
      setMessageToSend('');
    }
  };

  if (!properties.chat) return undefined;

  return (
    <div className="flex h-full w-96 flex-col bg-zinc-900">
      <div className="flex justify-end p-2">
        <Button isIconOnly color="danger" onPress={setProperties.bind(null, 'chat', false)}>
          <XMarkIcon className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 flex-col space-y-4 overflow-auto p-2">
        {messages.map((message, index) => {
          if (message.userId === socketUserId) {
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
        <Textarea value={messageToSend} onValueChange={setMessageToSend} label={'Message'} onKeyDown={onKeyDownHandler} />
      </div>
    </div>
  );
};
