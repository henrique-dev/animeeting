import { SocketIoContext } from '@/providers/SocketIoProvider';
import { ArrowDownTrayIcon, PaperAirplaneIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button, Spinner, Textarea } from '@nextui-org/react';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';
import { twJoin } from 'tailwind-merge';
import { ChatContext } from './ChatProvider';
import { useChat } from './use-chat';

export const Chat = () => {
  const { userId } = useContext(SocketIoContext);
  const { messages, isChatVisible, setIsChatVisible } = useContext(ChatContext);
  const {
    messageToSend,
    attachmentInputRef,
    file,
    fileToSend,
    setFile,
    setMessageToSend,
    sendMessage,
    onKeyDownHandler,
    onAttachmentButtonClickHandler,
  } = useChat();
  const t = useTranslations();

  if (!isChatVisible) return undefined;

  const disableSendMessage = messageToSend.trim() === '' && !fileToSend;

  return (
    <div className="absolute z-20 flex h-full w-full flex-col bg-zinc-900 sm:static sm:z-0 sm:w-96">
      <div className="flex justify-end p-2">
        <Button isIconOnly color="danger" onPress={setIsChatVisible.bind(null, false)}>
          <XMarkIcon className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 flex-col space-y-4 overflow-auto p-2">
        {messages.map((message, index) => {
          const sellMessage = message.userId === userId;
          const isFile = message.kind === 'file';
          const isPending = !message.delivered;
          const isDownloadable = isFile && !isPending && !sellMessage;

          return (
            <div key={index} className="space-y-1">
              <div className={twJoin('flex rounded-lg bg-zinc-700 p-2', sellMessage ? 'mr-4' : 'ml-4')}>
                {!isDownloadable && (
                  <div className="flex w-full items-center space-x-2">
                    {isFile && <PaperClipIcon className="h-5 w-5" />}
                    <div className="flex-1">{message.message}</div>
                    {isFile && isPending && <Spinner size="sm" color="white" />}
                  </div>
                )}
                {isDownloadable && (
                  <>
                    <a href={message.url} className="flex w-full items-center space-x-2" download={message.message}>
                      <PaperClipIcon className="h-5 w-5" />
                      <div className="flex-1 overflow-hidden text-ellipsis">{message.message}</div>
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </a>
                  </>
                )}
              </div>
              <div className={twJoin('px-2 text-xs', !sellMessage && 'text-right')}>
                {sellMessage ? t('pages.meeting.chat.you') : message.from}
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-2">
        <div className="relative">
          <div className="p-1 text-center">{fileToSend?.name}</div>
          <Textarea value={messageToSend} onValueChange={setMessageToSend} label={'Message'} onKeyDown={onKeyDownHandler} />
          <input ref={attachmentInputRef} value={file} onChange={setFile} type="file" className="hidden" />
          <div className="absolute bottom-0 right-0 mb-1 mr-1 flex space-x-1">
            <Button onPress={onAttachmentButtonClickHandler}>
              <PaperClipIcon className="h-5 w-5 text-white" />
            </Button>
            <Button className="" isDisabled={disableSendMessage} onPress={sendMessage}>
              <PaperAirplaneIcon className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
