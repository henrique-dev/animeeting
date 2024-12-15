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

type UserType = {
  id: string;
  name: string;
};

type MeetingType = {
  id: string;
  ownerId: string;
  roomId: string;
  connectionPairs: Map<string, Map<string, PairType>>;
  users: Map<string, UserType>;
};

const meetings = new Map<string, MeetingType>();
const connectedUsers = new Map<string, UserType>();

const createUser = (id: string) => {
  const user = {
    id,
    name: '',
  };

  connectedUsers.set(id, user);

  return user;
};

const deleteUser = (id: string) => {
  connectedUsers.delete(id);
};

const createMeeting = (userId: string) => {
  let newId = crypto.randomUUID();

  while (meetings.has(newId)) {
    newId = crypto.randomUUID();
  }

  const meeting = {
    id: newId,
    ownerId: userId,
    roomId: `meeting_${newId}`,
    users: new Map(),
    connectionPairs: new Map(),
  };

  meetings.set(newId, meeting);

  return meeting;
};

const deleteMeeting = (_id: string) => {
  // meetings.delete(id);
};

app.prepare().then(() => {
  const httpServer = createServer(
    {
      key,
      cert,
    },
    handler
  );

  const io = new Server(httpServer, {});

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
      connectionPairs.set(id, new Map([[anotherId, { role: 'answer', state: 'idle' }]]));
    }

    return connectionPairs.get(id)?.get(anotherId);
  };

  const setConnectionPair = (meeting: MeetingType, id: string, anotherId: string, pairData: PairType) => {
    const connectionPairs = meeting.connectionPairs;

    if (!connectionPairs) return undefined;

    connectionPairs.get(id)?.set(anotherId, pairData);
  };

  const remoteUserFromMeeting = (userId: string) => {
    meetings.forEach((meeting) => {
      if (meeting.users.has(userId)) {
        const connectionPairs = meeting.connectionPairs;

        if (connectionPairs) {
          connectionPairs.delete(userId);
        }

        for (const connectionPair of connectionPairs.values()) {
          connectionPair.delete(userId);
        }

        io.to(meeting.roomId).emit('user-leave', { id: userId });
      }

      meeting.users.delete(userId);

      if (meeting.users.size === 0) {
        deleteMeeting(meeting.id);
      }
    });
  };

  io.on('connection', (socket) => {
    createUser(socket.id);

    const getMeeting = (meetingId: string) => {
      const meeting = meetings.get(meetingId);

      if (meeting) return meeting;

      socket.emit('invalid-meeting');

      return undefined;
    };

    const getUser = (userId: string) => {
      const user = connectedUsers.get(userId);

      if (user) return user;

      socket.emit('invalid-meeting');

      return undefined;
    };

    socket.on('register', () => {
      const user = getUser(socket.id);

      if (!user) return;

      socket.emit('register-created', user);
    });

    socket.on('create-meeting', () => {
      const meeting = createMeeting(socket.id);

      socket.emit('meeting-created', { id: meeting.id });
    });

    socket.on('init-meeting', (data) => {
      const { meetingId, userName } = data;

      const user = getUser(socket.id);

      if (!user) return;

      const meeting = getMeeting(meetingId);

      if (!meeting) return;

      socket.join(meeting.roomId);

      meeting.users.set(user.id, {
        id: user.id,
        name: userName,
      });

      io.to(meeting.roomId).emit('user-enter', { users: Array.from(meeting.users.values()) });
    });

    socket.on('exit-meeting', () => {
      const user = getUser(socket.id);

      if (!user) return;

      remoteUserFromMeeting(user.id);
    });

    socket.on('decide-offer-answer', (data) => {
      const { meetingId, anotherUserId } = data;

      const meeting = getMeeting(meetingId);

      if (!meeting) return;

      const userPair = getConnectionPair(meeting, socket.id, anotherUserId);
      const anotherUserPair = getConnectionPair(meeting, anotherUserId, socket.id);

      if (!userPair || !anotherUserPair) return;

      if (userPair.state === 'idle' && anotherUserPair.state === 'idle') {
        const offer = Math.random() < 0.5;

        userPair.role = offer ? 'offer' : 'answer';
        userPair.state = 'created';
        setConnectionPair(meeting, socket.id, anotherUserId, userPair);

        anotherUserPair.role = offer ? 'answer' : 'offer';
        anotherUserPair.state = 'created';
        setConnectionPair(meeting, anotherUserId, socket.id, anotherUserPair);
      }

      if (userPair.role === 'offer') {
        socket.emit('create-offer', { peerId: anotherUserId });
      } else {
        io.to(anotherUserId).emit('create-offer', { peerId: socket.id });
      }
    });

    socket.on('offer', (data) => {
      const { meetingId, toId, offer } = data;

      const meeting = getMeeting(meetingId);

      if (!meeting) return;

      const userPair = getConnectionPair(meeting, socket.id, toId);
      const anotherUserPair = getConnectionPair(meeting, toId, socket.id);

      if (!userPair || !anotherUserPair) return;

      const anotherUser = meeting.users.get(toId);
      const userMeeting = meeting.users.get(socket.id);

      if (!anotherUser || !userMeeting) return;

      if (userPair.role === 'answer') {
        socket.emit('create-answer', { peerId: toId, offer });
      } else {
        io.to(toId).emit('create-answer', { peerId: socket.id, offer });
      }
    });

    socket.on('answer', (data) => {
      const { meetingId, toId, answer } = data;

      const meeting = getMeeting(meetingId);

      if (!meeting) return;

      const userPair = getConnectionPair(meeting, socket.id, toId);
      const anotherUserPair = getConnectionPair(meeting, toId, socket.id);

      if (!userPair || !anotherUserPair) return;

      const anotherUser = meeting.users.get(toId);
      const userMeeting = meeting.users.get(socket.id);

      if (!anotherUser || !userMeeting) return;

      if (userPair.role === 'offer') {
        socket.emit('answer-found', { peerId: toId, answer });
      } else {
        io.to(toId).emit('answer-found', { peerId: socket.id, answer });
      }
    });

    socket.on('offer-candidates', (data) => {
      const { meetingId, toId, candidate } = data;

      const meeting = getMeeting(meetingId);

      if (!meeting) return;

      const userPair = getConnectionPair(meeting, socket.id, toId);
      const anotherUserPair = getConnectionPair(meeting, toId, socket.id);

      if (!userPair || !anotherUserPair) return;

      const anotherUser = meeting.users.get(toId);
      const userMeeting = meeting.users.get(socket.id);

      if (!anotherUser || !userMeeting) return;

      if (userPair.role === 'answer') {
        socket.emit('offer-candidate', { peerId: toId, candidate });
      } else {
        io.to(toId).emit('offer-candidate', { peerId: socket.id, candidate });
      }
    });

    socket.on('answer-candidates', (data) => {
      const { meetingId, toId, candidate } = data;

      const meeting = getMeeting(meetingId);

      if (!meeting) return;

      const userPair = getConnectionPair(meeting, socket.id, toId);
      const anotherUserPair = getConnectionPair(meeting, toId, socket.id);

      if (!userPair || !anotherUserPair) return;

      const anotherUser = meeting.users.get(toId);
      const userMeeting = meeting.users.get(socket.id);

      if (!anotherUser || !userMeeting) return;

      if (userPair.role === 'offer') {
        socket.emit('answer-candidate', { peerId: toId, candidate });
      } else {
        io.to(toId).emit('answer-candidate', { peerId: socket.id, candidate });
      }
    });

    socket.on('disconnect', () => {
      const user = getUser(socket.id);

      if (!user) return;

      remoteUserFromMeeting(user.id);

      deleteUser(socket.id);
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
