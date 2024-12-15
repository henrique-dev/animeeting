import React, { useCallback, useRef } from 'react';

type UserConnectionMapType = {
  peerConnection: RTCPeerConnection;
  stream: MediaStream;
  appDataChannel: RTCDataChannel;
  chatDataChannel: RTCDataChannel;
  state: 'idle' | 'created';
};

type ConnectionContextProps = {
  userConnectionsMapRef: React.RefObject<Map<string, UserConnectionMapType>>;
  sendAppData: (data: string) => void;
  sendChatData: (data: string) => void;
};

export const ConnectionContext = React.createContext<ConnectionContextProps>({
  userConnectionsMapRef: { current: new Map() },
  sendAppData: () => undefined,
  sendChatData: () => undefined,
});

type ConnectionProviderProps = {
  children: React.ReactNode;
};

export const ConnectionProvider = ({ children }: ConnectionProviderProps) => {
  const userConnectionsMapRef = useRef<Map<string, UserConnectionMapType>>(new Map());

  const sendAppData = useCallback(
    (data: string) => {
      userConnectionsMapRef.current.forEach((connection) => {
        connection.appDataChannel.send(data);
      });
    },
    [userConnectionsMapRef]
  );

  const sendChatData = useCallback(
    (data: string) => {
      userConnectionsMapRef.current.forEach((connection) => {
        connection.chatDataChannel.send(data);
      });
    },
    [userConnectionsMapRef]
  );

  return (
    <ConnectionContext.Provider
      value={{
        userConnectionsMapRef,
        sendAppData,
        sendChatData,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
