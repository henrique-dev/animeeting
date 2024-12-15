import React, { useRef } from 'react';

type UserConnectionMapType = {
  peerConnection: RTCPeerConnection;
  stream: MediaStream;
  appDataChannel: RTCDataChannel;
  chatDataChannel: RTCDataChannel;
  state: 'idle' | 'created';
};

type ConnectionContextProps = {
  userConnectionsMapRef: React.RefObject<Map<string, UserConnectionMapType>>;
};

export const ConnectionContext = React.createContext<ConnectionContextProps>({
  userConnectionsMapRef: { current: new Map() },
});

type ConnectionProviderProps = {
  children: React.ReactNode;
};

export const ConnectionProvider = ({ children }: ConnectionProviderProps) => {
  const userConnectionsMapRef = useRef<Map<string, UserConnectionMapType>>(new Map());

  return (
    <ConnectionContext.Provider
      value={{
        userConnectionsMapRef,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
