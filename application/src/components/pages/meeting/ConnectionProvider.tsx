import React, { useCallback, useRef } from 'react';

type UserConnectionMapType = {
  peerConnection: RTCPeerConnection;
  stream: MediaStream;
  appDataChannel: RTCDataChannel;
  chatDataChannel: RTCDataChannel;
  fileDataChannel: RTCDataChannel;
  state: 'idle' | 'created';
};

type ConnectionContextProps = {
  userConnectionsMapRef: React.RefObject<Map<string, UserConnectionMapType>>;
  sendAppData: (data: {}) => void;
  sendChatData: (data: string) => void;
  sendFileData: (data: {}) => void;
  createSenderFileChannel: (name: string, { onOpen }: { onOpen: (channel: RTCDataChannel) => void }) => void;
  createReceiverFileChannel: (userId: string, name: string, { onOpen }: { onOpen: (channel: RTCDataChannel) => void }) => void;
};

export const ConnectionContext = React.createContext<ConnectionContextProps>({
  userConnectionsMapRef: { current: new Map() },
  sendAppData: () => undefined,
  sendChatData: () => undefined,
  sendFileData: () => undefined,
  createSenderFileChannel: () => undefined,
  createReceiverFileChannel: () => undefined,
});

type ConnectionProviderProps = {
  children: React.ReactNode;
};

export const ConnectionProvider = ({ children }: ConnectionProviderProps) => {
  const userConnectionsMapRef = useRef<Map<string, UserConnectionMapType>>(new Map());

  const sendAppData = useCallback(
    (data: {}) => {
      userConnectionsMapRef.current.forEach((connection) => {
        connection.appDataChannel.send(JSON.stringify(data));
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

  const sendFileData = useCallback(
    (data: {}) => {
      userConnectionsMapRef.current.forEach((connection) => {
        connection.fileDataChannel.send(JSON.stringify(data));
      });
    },
    [userConnectionsMapRef]
  );

  const createSenderFileChannel = useCallback((name: string, { onOpen }: { onOpen: (channel: RTCDataChannel) => void }) => {
    userConnectionsMapRef.current.forEach((userConnection) => {
      userConnection.peerConnection.ondatachannel = (event) => {
        const channel = event.channel;

        if (channel.label === name) {
          channel.onopen = () => {
            onOpen(channel);
          };
        }
      };
    });
  }, []);

  const createReceiverFileChannel = useCallback(
    (userId: string, name: string, { onOpen }: { onOpen: (channel: RTCDataChannel) => void }) => {
      const userConnection = userConnectionsMapRef.current.get(userId);

      if (!userConnection) return;

      const fileTransferChannel = userConnection.peerConnection.createDataChannel(name);

      fileTransferChannel.onopen = () => {
        onOpen(fileTransferChannel);
      };
    },
    []
  );

  return (
    <ConnectionContext.Provider
      value={{
        userConnectionsMapRef,
        sendAppData,
        sendChatData,
        sendFileData,
        createReceiverFileChannel,
        createSenderFileChannel,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
