'use client';

import { socket } from '@/socket';
import { useCallback, useEffect, useState } from 'react';

const Page = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState('N/A');

  const onConnect = useCallback(() => {
    setIsConnected(true);
    setTransport(socket.io.engine.transport.name);

    socket.io.engine.on('upgrade', (upgradeTransport) => {
      setTransport(upgradeTransport.name);
    });
  }, [setIsConnected, setTransport]);

  const onDisconnect = useCallback(() => {
    setIsConnected(false);
    setTransport('N/A');
  }, [setIsConnected, setTransport]);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [onConnect, onDisconnect]);

  return (
    <div>
      <p>Status: {isConnected ? 'connected' : 'disconnected'}</p>
      <p>Transport: {transport}</p>
    </div>
  );
};

export default Page;
