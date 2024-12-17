import { SocketIoContext } from '@/providers/SocketIoProvider';
import { Spinner } from '@nextui-org/react';
import { useContext } from 'react';
import { twJoin, twMerge } from 'tailwind-merge';
import { ApplicationContext } from './ApplicationProvider';
import { useVideoElementRefs } from './use-video-element-refs';

export const UsersVideoShow = () => {
  const { currentUsers } = useContext(ApplicationContext);
  const { userId } = useContext(SocketIoContext);
  const {
    screenInFocus,
    userInFocus,
    videoInFocusRefHandler,
    localVideoRefHandler,
    remoteVideoElementRefHandler,
    changeUserInFocusHandler,
  } = useVideoElementRefs();

  return (
    <>
      <div
        className={twJoin('absolute bottom-0 right-0 z-10 flex w-full justify-end p-4 sm:bottom-auto sm:top-0', screenInFocus && 'mr-56')}
      >
        <div className="overflow-hidden rounded-lg bg-zinc-700 p-1">
          <div className="overflow-hidden rounded-md">
            <video
              ref={localVideoRefHandler}
              autoPlay
              playsInline
              className="w-32 hover:cursor-pointer sm:w-48"
              onClick={changeUserInFocusHandler.bind(null, userId)}
            />
          </div>
        </div>
      </div>
      {screenInFocus && (
        <div className="flex h-full w-full">
          <div className="flex-1 p-16">
            <video
              ref={videoInFocusRefHandler}
              autoPlay
              playsInline
              className="h-full w-full hover:cursor-pointer"
              onClick={changeUserInFocusHandler.bind(null, userId)}
            />
            <div className="bottom-0 flex w-full justify-center text-white">{userInFocus?.name}</div>
          </div>
          <div className="z-10 flex-col space-y-2 overflow-auto p-4">
            {currentUsers.map((user) => (
              <div key={user.id} className="relative w-48 overflow-hidden rounded-lg bg-zinc-700 p-1">
                <div className="mb-10 overflow-hidden rounded-md">
                  {user.state === 'connected' && (
                    <video
                      ref={remoteVideoElementRefHandler.bind(null, user.id)}
                      className="h-full w-full hover:cursor-pointer"
                      autoPlay
                      playsInline
                      onClick={changeUserInFocusHandler.bind(null, user.id)}
                    />
                  )}
                  {user.state === 'connecting' && (
                    <div className="flex h-full min-h-24 w-full justify-center bg-zinc-900">
                      <Spinner color="white" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 flex w-full justify-center text-white">{user.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!screenInFocus && (
        <div
          className={twMerge('h-full w-full p-4 pb-28', currentUsers.length <= 3 && 'flex', currentUsers.length >= 4 && 'grid grid-cols-2')}
        >
          {currentUsers.map((user) => (
            <div
              key={user.id}
              className={twMerge(
                'relative',
                currentUsers.length === 1 && 'h-full w-full',
                currentUsers.length === 2 && 'h-full w-1/2',
                currentUsers.length === 3 && 'h-full w-1/3',
                currentUsers.length > 3 && 'flex flex-col items-center justify-end'
              )}
            >
              {user.state === 'connected' && (
                <video
                  ref={remoteVideoElementRefHandler.bind(null, user.id)}
                  className={twMerge('w-full p-2 pb-10 hover:cursor-pointer', currentUsers.length <= 3 ? 'h-full' : 'absolute h-full')}
                  autoPlay
                  playsInline
                  onClick={changeUserInFocusHandler.bind(null, user.id)}
                />
              )}
              {user.state === 'connecting' && (
                <div
                  className={twMerge(
                    'flex w-full justify-center bg-zinc-900 p-2 pb-10',
                    currentUsers.length <= 3 ? 'h-full' : 'absolute h-full'
                  )}
                >
                  <Spinner color="white" size="lg" />
                </div>
              )}
              <div className="flex w-full justify-center text-white">{user.name}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
