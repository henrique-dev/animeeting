'use client';

import { io } from 'socket.io-client';

export const socketUserId = crypto.randomUUID();

export const socket = io({
  auth: {
    userId: socketUserId,
  },
});
