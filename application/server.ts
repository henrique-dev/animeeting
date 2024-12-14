import fs from 'fs';
import next from 'next';
import { createServer } from 'node:https';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const key = fs.readFileSync('certificates/cert.key');
const cert = fs.readFileSync('certificates/cert.crt');

type PairType = {
  role: 'offer' | 'answer';
  state: 'idle' | 'created';
};

type MeetingType = {
  connectionPairs: Map<string, Map<string, PairType>>;
  users: Map<
    string,
    {
      id: string;
      name: string;
      socketId: string;
    }
  >;
};

const meetings = new Map<string, MeetingType>();

app.prepare().then(() => {
  const httpServer = createServer(
    {
      key,
      cert,
    },
    handler
  );

  const io = new Server(httpServer, {});

  const getMeeting = (meetingId: string) => {
    if (!meetings.has(meetingId)) {
      meetings.set(meetingId, {
        users: new Map(),
        connectionPairs: new Map(),
      });
    }

    return meetings.get(meetingId);
  };

  const getConnectionPair = (meeting: MeetingType, id: string, anotherId: string) => {
    const connectionPairs = meeting.connectionPairs;

    if (!connectionPairs) return undefined;

    const connectionPair = connectionPairs.get(id);

    if (connectionPair) {
      const anotherPair = connectionPair.get(anotherId);

      if (!anotherPair) {
        connectionPair.set(anotherId, {
          role: 'answer',
          state: 'idle',
        });
      }
    } else {
      connectionPairs.set(id, new Map([[anotherId, { role: 'answer', state: 'idle', offers: [], answers: [] }]]));
    }

    return connectionPairs.get(id)?.get(anotherId);
  };

  const setConnectionPair = (meeting: MeetingType, id: string, anotherId: string, pairData: PairType) => {
    const connectionPairs = meeting.connectionPairs;

    if (!connectionPairs) return undefined;

    connectionPairs.get(id)?.set(anotherId, pairData);
  };

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId as string;

    socket.on('init-meeting', (data) => {
      const { meetingId, userName } = data;

      const meeting = getMeeting(meetingId);

      if (!meeting) return;

      meeting.users.set(userId, {
        id: userId,
        name: userName,
        socketId: socket.id,
      });

      meeting.users.forEach((user) => {
        io.to(user.socketId).emit('user-enter', { users: Array.from(meeting.users.values()) });
      });
    });

    socket.on('decide-offer-answer', (data) => {
      const { meetingId, anotherUserId } = data;

      const meeting = getMeeting(meetingId);

      if (!meeting) return;

      const userPair = getConnectionPair(meeting, userId, anotherUserId);
      const anotherUserPair = getConnectionPair(meeting, anotherUserId, userId);

      if (!userPair || !anotherUserPair) return;

      if (userPair.state === 'idle' && anotherUserPair.state === 'idle') {
        const offer = Math.random() < 0.5;

        userPair.role = offer ? 'offer' : 'answer';
        userPair.state = 'created';
        setConnectionPair(meeting, userId, anotherUserId, userPair);

        anotherUserPair.role = offer ? 'answer' : 'offer';
        anotherUserPair.state = 'created';
        setConnectionPair(meeting, anotherUserId, userId, anotherUserPair);
      }

      const anotherUser = meeting.users.get(anotherUserId);
      const user = meeting.users.get(userId);

      if (!anotherUser || !user) return;

      if (userPair.role === 'offer') {
        io.to(user.socketId).emit('create-offer', { peerId: anotherUser.id });
      } else {
        io.to(anotherUser.socketId).emit('create-offer', { peerId: user.id });
      }
    });

    socket.on('offer', (data) => {
      const { meetingId, fromId, toId, offer } = data;

      const meeting = getMeeting(meetingId);

      if (!meeting) return;

      const userPair = getConnectionPair(meeting, fromId, toId);
      const anotherUserPair = getConnectionPair(meeting, toId, fromId);

      if (!userPair || !anotherUserPair) return;

      const anotherUser = meeting.users.get(toId);
      const user = meeting.users.get(userId);

      if (!anotherUser || !user) return;

      if (userPair.role === 'answer') {
        io.to(user.socketId).emit('create-answer', { peerId: anotherUser.id, offer });
      } else {
        io.to(anotherUser.socketId).emit('create-answer', { peerId: user.id, offer });
      }
    });

    socket.on('answer', (data) => {
      const { meetingId, fromId, toId, answer } = data;

      const meeting = getMeeting(meetingId);

      if (!meeting) return;

      const userPair = getConnectionPair(meeting, fromId, toId);
      const anotherUserPair = getConnectionPair(meeting, toId, fromId);

      if (!userPair || !anotherUserPair) return;

      const anotherUser = meeting.users.get(toId);
      const user = meeting.users.get(userId);

      if (!anotherUser || !user) return;

      if (userPair.role === 'offer') {
        io.to(user.socketId).emit('answer-found', { peerId: anotherUser.id, answer });
      } else {
        io.to(anotherUser.socketId).emit('answer-found', { peerId: user.id, answer });
      }
    });

    socket.on('offer-candidates', (data) => {
      const { meetingId, fromId, toId, candidate } = data;

      const meeting = getMeeting(meetingId);

      if (!meeting) return;

      const userPair = getConnectionPair(meeting, fromId, toId);
      const anotherUserPair = getConnectionPair(meeting, toId, fromId);

      if (!userPair || !anotherUserPair) return;

      const anotherUser = meeting.users.get(toId);
      const user = meeting.users.get(userId);

      if (!anotherUser || !user) return;

      if (userPair.role === 'answer') {
        io.to(user.socketId).emit('offer-candidate', { peerId: anotherUser.id, candidate });
      } else {
        io.to(anotherUser.socketId).emit('offer-candidate', { peerId: user.id, candidate });
      }
    });

    socket.on('answer-candidates', (data) => {
      const { meetingId, fromId, toId, candidate } = data;

      const meeting = getMeeting(meetingId);

      if (!meeting) return;

      const userPair = getConnectionPair(meeting, fromId, toId);
      const anotherUserPair = getConnectionPair(meeting, toId, fromId);

      if (!userPair || !anotherUserPair) return;

      const anotherUser = meeting.users.get(toId);
      const user = meeting.users.get(userId);

      if (!anotherUser || !user) return;

      if (userPair.role === 'offer') {
        io.to(user.socketId).emit('answer-candidate', { peerId: anotherUser.id, candidate });
      } else {
        io.to(anotherUser.socketId).emit('answer-candidate', { peerId: user.id, candidate });
      }
    });

    socket.on('disconnect', () => {
      for (const meeting of meetings.values()) {
        if (meeting.users.has(userId)) {
          const connectionPairs = meeting.connectionPairs;

          if (connectionPairs) {
            connectionPairs.delete(userId);
          }

          for (const connectionPair of connectionPairs.values()) {
            connectionPair.delete(userId);
          }
        }
        meeting.users.forEach((user) => {
          io.to(user.socketId).emit('user-leave', { user: { id: userId } });
        });

        meeting.users.delete(userId);
      }
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on https://${hostname}:${port}`);
    });
});
